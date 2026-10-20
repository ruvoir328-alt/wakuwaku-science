// お助けニュートンくん 中継サーバー
// - APIキーはシークレット（env.ANTHROPIC_API_KEY）に置き、ブラウザには渡さない
// - 会話や画像はどこにも保存しない（KV に入れるのは「今日の質問回数」だけ）
import Anthropic from "@anthropic-ai/sdk";
import NEWTON_PROMPT from "../newton-prompt.md";

const MODEL = "claude-haiku-5-5";

const MAX_MESSAGES = 30;
const MAX_TEXT_CHARS = 1000;
const MAX_IMAGE_BASE64_CHARS = 2_000_000; // 縮小後の写真なら十分（約1.5MB）
const MAX_BODY_BYTES = 3_000_000;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEVICE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// ヒントの段階ごとに、その回で出してよい内容
const HINT_GUIDE = {
  1: "ヒント1：何がわかっていて、何を求める問題かを生徒に整理させる。法則や公式の名前はまだ出さない。",
  2: "ヒント2：使えそうな法則・公式・定理・考え方を生徒に考えさせる。名前や公式を示してよいが、数値を代入した式はまだ書かない。",
  3: "ヒント3：式の立て方を示す。数値を代入した式までは書いてよいが、計算結果と最終的な答えは言わず、計算は生徒にやらせる。",
};

// モード・操作に応じて、システムプロンプトの後ろに足す指示
function turnInstruction({ mode, action, hintLevel }) {
  if (mode !== "photo") {
    const kind = mode === "term" ? "用語の質問" : "「なんで？」の質問";
    return `【今のモード】${kind}。考え方をしっかり説明してよい。`;
  }
  const stage = hintLevel === 0
    ? "まだヒントは出していない。"
    : `今はヒント${hintLevel}まで進んでいる。`;
  const limit = `ヒント${Math.min(hintLevel + 1, 3)}以降の内容（${hintLevel >= 3 ? "最終的な答え" : "次の段階のヒントや答え"}）は出さない。`;
  switch (action) {
    case "start":
      return "【今のモード】問題の写真。写真から問題文を読み取って短くまとめ、「ふむ、この問題で合っておるかな？」と確認するだけにする。ヒントや解き方はまだ言わない。写真が理科や数学の問題でなければ、そのことをやさしく伝える。";
    case "hint":
      return `【今のモード】問題の写真。生徒が「もうちょっとヒント」を押した。今回は次のヒントだけを出す。\n${HINT_GUIDE[hintLevel]}\n${hintLevel >= 3 ? "これが最後のヒント。答えは言わず、「あと一歩じゃ、一緒にやってみよう！」と励ます。" : "それより先の内容は出さない。"}`;
    case "answer":
      return `【今のモード】問題の写真。生徒が自分の答えを送ってきた。${stage}合っていればしっかりほめる。間違っていれば否定せず、どこで間違えたかをヒントで示す。正しい答えの数値は言わない。`;
    default:
      return `【今のモード】問題の写真。${stage}${limit}「わからない」と言われたら、今の段階の内容を言いかえて説明し、次に進みたいときは「もうちょっとヒント」ボタンを押すよう伝えてよい。`;
  }
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Newton-Code",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors },
  });
}

// 合言葉（シークレット ACCESS_CODES にカンマ区切りで登録）。未登録ならだれでも使える
function normalizeCode(s) {
  return String(s || "").normalize("NFKC").trim().toLowerCase();
}
function codeOk(request, env) {
  const codes = String(env.ACCESS_CODES || "").split(",").map(normalizeCode).filter(Boolean);
  if (codes.length === 0) return true;
  let given = request.headers.get("X-Newton-Code") || "";
  try { given = decodeURIComponent(given); } catch {}
  return codes.includes(normalizeCode(given));
}

// 日本時間の日付（0時にリセット）
function todayJST() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

// 端末IDはそのまま保存せず、ハッシュにしてから使う
async function quotaKey(deviceId) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(deviceId));
  const hex = [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `q:${todayJST()}:${hex}`;
}

async function getUsed(env, key) {
  return parseInt((await env.QUOTA.get(key)) || "0", 10) || 0;
}

// ブラウザから来た会話を確かめて、Claude API の形に変える
function buildMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const messages = [];
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
    const text = typeof m.text === "string" ? m.text.slice(0, MAX_TEXT_CHARS * 2) : "";
    if (m.role === "user" && text.length > MAX_TEXT_CHARS) return null;
    const content = [];
    if (m.image) {
      if (m.role !== "user") return null;
      const { media_type, data } = m.image;
      if (!IMAGE_TYPES.includes(media_type) || typeof data !== "string" || data.length > MAX_IMAGE_BASE64_CHARS) return null;
      content.push({ type: "image", source: { type: "base64", media_type, data } });
    }
    if (text.trim()) content.push({ type: "text", text });
    if (content.length === 0) content.push({ type: "text", text: m.image ? "この問題を見てほしい。" : "（空のメッセージ）" });
    const prev = messages[messages.length - 1];
    if (prev && prev.role === m.role) prev.content.push(...content);
    else messages.push({ role: m.role, content });
  }
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

async function handleChat(request, env, cors) {
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY_BYTES) {
    return json({ error: "too_large", message: "写真が大きすぎるようじゃ。" }, 413, cors);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400, cors);
  }
  const { deviceId, mode, action } = body || {};
  const hintLevel = Math.max(0, Math.min(3, parseInt(body?.hintLevel, 10) || 0));
  if (!DEVICE_ID_RE.test(deviceId || "") || !["photo", "term", "why"].includes(mode)) {
    return json({ error: "bad_request" }, 400, cors);
  }
  const messages = buildMessages(body.messages);
  if (!messages) return json({ error: "bad_request" }, 400, cors);

  const limit = parseInt(env.DAILY_LIMIT || "20", 10);
  const key = await quotaKey(deviceId);
  const used = await getUsed(env, key);
  if (used >= limit) {
    return json({ error: "limit", remaining: 0, message: "今日の質問はここまでじゃ。また明日おいで！" }, 429, cors);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: mode === "photo" ? "medium" : "low" },
      system: [
        { type: "text", text: NEWTON_PROMPT },
        { type: "text", text: turnInstruction({ mode, action, hintLevel }) },
      ],
      messages,
    });
  } catch (err) {
    // 会話の中身はログに出さない。エラーの種類だけ返す
    if (err instanceof Anthropic.RateLimitError) {
      return json({ error: "busy", message: "いまニュートンくんが混みあっておる。少し待ってからもう一度送っておくれ。" }, 503, cors);
    }
    if (err instanceof Anthropic.APIError) {
      return json({ error: "upstream", message: "うまく考えられなかったようじゃ。もう一度送っておくれ。" }, 502, cors);
    }
    throw err;
  }

  // 返事が届いたときだけ1回分数える
  const nowUsed = used + 1;
  await env.QUOTA.put(key, String(nowUsed), { expirationTtl: 2 * 24 * 3600 });
  const remaining = Math.max(0, limit - nowUsed);

  if (response.stop_reason === "refusal") {
    return json({ reply: "ふむ、それはわしには答えられんのう。理科や数学のことなら何でも聞いておくれ。", remaining }, 200, cors);
  }
  const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return json({ reply: reply || "ふむ……うまく言葉にできんかった。もう一度聞いてくれるかな？", remaining }, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get("Origin"), env);
    if (!cors) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!codeOk(request, env)) {
      return json({ error: "code", message: "合言葉がちがうようじゃ。先生に聞いてみておくれ。" }, 401, cors);
    }

    if (url.pathname === "/quota" && request.method === "GET") {
      const deviceId = url.searchParams.get("deviceId") || "";
      if (!DEVICE_ID_RE.test(deviceId)) return json({ error: "bad_request" }, 400, cors);
      const limit = parseInt(env.DAILY_LIMIT || "20", 10);
      const used = await getUsed(env, await quotaKey(deviceId));
      return json({ remaining: Math.max(0, limit - used), limit }, 200, cors);
    }
    if (url.pathname === "/chat" && request.method === "POST") {
      return handleChat(request, env, cors);
    }
    return json({ error: "not_found" }, 404, cors);
  },
};
