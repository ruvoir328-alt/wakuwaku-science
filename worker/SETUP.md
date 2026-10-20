# お助けニュートンくん セットアップ手順（はじめての人向け）

この手順で「中継サーバー（Cloudflare Workers）」を作って、サイトとつなぎます。
パソコン（Windows / Mac）で作業してください。全部で30分〜1時間くらいです。

```
生徒のスマホ → Cloudflare Workers（APIキーを隠し持つ） → Claude
                      └ KV：今日の質問回数だけメモする
```

---

## 手順1　Anthropic の APIキーを作る

1. https://console.anthropic.com を開いて、アカウントを作る（ログインする）
2. 左のメニューの **Billing（請求）** でクレジットを購入する（最初は $5 くらいで十分）
3. **Limits（上限）** で、月の利用上限（Spend limit）を設定する
   → 使いすぎを防ぐため、必ず設定してね（例：$10）
4. **API Keys** → **Create Key** を押して、名前を `newton-worker` にして作る
5. 表示された `sk-ant-…` で始まるキーをコピーして、メモ帳に一時的に貼っておく

> ⚠️ このキーは**パスワードと同じ**です。サイトのファイルやGitHubには絶対に書かないでね。
> 手順6で Cloudflare に登録したら、メモ帳からは消してOK。

**うまくいったら：** `sk-ant-` で始まる長い文字列が手元にある

---

## 手順2　Cloudflare のアカウントを作る

1. https://dash.cloudflare.com/sign-up を開く
2. メールアドレスとパスワードで登録（無料プランでOK）
3. 届いたメールのリンクを押して、メールアドレスを確認する

**うまくいったら：** Cloudflare のダッシュボード（管理画面）が開ける

---

## 手順3　パソコンの準備

1. **Node.js** を入れる：https://nodejs.org を開いて「LTS」と書かれた方をダウンロード → インストール
2. **ターミナル**を開く
   - Windows：スタートメニューで「PowerShell」と検索して開く
   - Mac：「ターミナル」アプリを開く
3. ちゃんと入ったか確かめる。次の1行を打って Enter：
   ```
   node -v
   ```
   `v22.…` のような数字が出ればOK
4. このリポジトリの `worker` フォルダに移動して、必要な道具を入れる：
   ```
   cd （wakuwaku-scienceのフォルダの場所）/worker
   npm install
   ```
   ヒント：`cd ` と打ってから、`worker` フォルダをターミナルの画面にドラッグすると、場所が自動で入るよ
5. Cloudflare にログインする：
   ```
   npx wrangler login
   ```
   ブラウザが開くので **Allow（許可）** を押す

**うまくいったら：** ターミナルに `Successfully logged in` と出る

---

## 手順4　回数カウンター（KV）を作る

1. ターミナルで：
   ```
   npx wrangler kv namespace create QUOTA
   ```
2. こんな表示が出るので、`id = "…"` の英数字（32文字くらい）をコピーする
   ```
   [[kv_namespaces]]
   binding = "QUOTA"
   id = "0123456789abcdef0123456789abcdef"
   ```
3. `worker/wrangler.toml` をメモ帳などで開いて、いちばん下の
   ```
   id = "ここにKVのidを貼る"
   ```
   を、コピーした id に書きかえて保存する

**うまくいったら：** `wrangler.toml` の最後の行が `id = "英数字"` になっている

---

## 手順5　サイトのURLを確認する

`worker/wrangler.toml` の `ALLOWED_ORIGINS` に、サイトのURLが入っています。

```
ALLOWED_ORIGINS = "https://ruvoir328-alt.github.io,http://localhost:8000"
```

- GitHub Pages で公開しているなら、このままでOK
- 別のURLで公開している場合は、`https://○○○` の部分（`/` より前まで）に書きかえる
- ここに書いていないサイトからは、ニュートンくんを使えないようになっています

---

## 手順6　APIキーを Cloudflare に登録する

1. ターミナルで：
   ```
   npx wrangler secret put ANTHROPIC_API_KEY
   ```
2. `Enter a secret value:` と出たら、手順1のキーを貼りつけて Enter
   （画面には何も表示されないけど、ちゃんと入っているよ）
3. 「Workerがまだないけど作る？」と聞かれたら `Y` を押す

**うまくいったら：** `✨ Success! Uploaded secret ANTHROPIC_API_KEY` と出る
→ メモ帳に貼ったキーは消してOK

---

## 手順7　デプロイ（公開）する

1. ターミナルで：
   ```
   npx wrangler deploy
   ```
2. 最後にこんなURLが出るので、コピーする
   ```
   https://newton-worker.○○○.workers.dev
   ```
3. ブラウザでそのURLのうしろに `/quota` をつけて開いてみる
   → `Forbidden` と出れば、ちゃんと動いています（知らないサイトからは使えない設定なので、これが正しい表示）

---

## 手順8　サイトとつなぐ

1. `newton/config.js` を開いて、手順7のURLを貼る（最後に `/` はつけない）
   ```js
   window.NEWTON_API = "https://newton-worker.○○○.workers.dev";
   ```
2. 保存して、GitHub に push する（いつもサイトを更新するのと同じやり方でOK）
3. 数分たってから、スマホで `https://ruvoir328-alt.github.io/wakuwaku-science/newton/` を開く

**うまくいったら：** ホームに「今日あと **20** 回 質問できるよ」と出て、質問すると返事がくる

---

## あとから直したいとき

| やりたいこと | 直すファイル | そのあと |
|---|---|---|
| ニュートンくんの話し方・ルールを変える | `worker/newton-prompt.md` | `npx wrangler deploy` |
| 1日の回数を変える | `worker/wrangler.toml` の `DAILY_LIMIT` | `npx wrangler deploy` |
| 使えるサイトのURLを変える | `worker/wrangler.toml` の `ALLOWED_ORIGINS` | `npx wrangler deploy` |
| 画面の見た目を変える | `newton/` の中のファイル | GitHub に push |

`newton-prompt.md` のいちばん下にある「安全のルール」は、生徒を守るための大事な部分なので、消さないでね。

---

## こまったときは

| こんなとき | たしかめること |
|---|---|
| ホームに「準備中」と出る | `newton/config.js` にURLを貼って push したか |
| 「通信がうまくいかなかった」と出る | `ALLOWED_ORIGINS` にサイトのURLが入っているか（`https://` から `.io` まで、最後の `/` なし） |
| 「うまく考えられなかった」と出る | APIキーが正しいか（手順6をやり直す）／Anthropic Console にクレジットが残っているか |
| 「混みあっておる」と出る | Anthropic の利用上限に近づいている。少し待つか、Console で上限を確認 |
| `wrangler deploy` でKVのエラーが出る | 手順4の id を `wrangler.toml` に貼ったか |

---

## お金のめやす

- **Cloudflare Workers・KV**：無料プランで使えます
  - KVの無料枠は「書きこみ1日1,000回」まで＝質問1,000回分（40人×20回＝800回くらいまでならOK）
  - もっと大人数で使うときは相談してね（D1という別の保存場所に切りかえられます）
- **Claude API（claude-haiku-5-5）**：質問1回あたり、だいたい0.1〜0.3円くらい
  - 40人が毎日20回ずつ使っても、1日あたり100〜250円くらい
  - 手順1で決めた利用上限をこえることはありません

---

## 未成年向けガイドラインとの対応

Anthropic の「[未成年向けサービスのガイドライン](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)」と、このしくみの対応です。

| ガイドラインの内容 | このしくみでの対応 |
|---|---|
| **AIであることを伝える（必須）** | ホーム・チャットの上部に「AI」バッジと「ニュートンくんはAIです」をずっと表示。人間か聞かれたらAIと答えるようプロンプトに指示 |
| **子どもの安全・個人情報の法令を守り、サイトで明示する（必須）** | 個人情報を集めない設計（会話・写真は保存しない、回数は変換した番号だけ）。`newton/about.html` に方針を掲載 |
| 内容のフィルタリング | `newton-prompt.md` の「安全のルール」で、不適切な話題・写真の中の指示・個人情報への対応を指定。Claude 自体の安全機能もはたらく |
| 年齢の確認 | 学校の授業・家庭学習で、先生の案内のもと使う前提。ストア公開などで不特定の人に広げる場合は、年齢確認を検討する |
| 見守りと報告 | 会話を残さない方針のため、サーバー側で内容を見守ることはしない。そのかわり「気になる返事は先生に知らせて」と画面で案内し、深刻な相談には大人や「24時間子供SOSダイヤル」につなぐよう指示 |
| 使い方の教育 | `newton/about.html` に「AIはまちがえる」「個人情報を書かない」「困ったときは」を掲載。授業で最初に一度紹介するのがおすすめ |

> 見守りについて：会話ログを残さないことと、問題に気づける仕組みはトレードオフです。もし校内で「どんな質問が多いか」などを知りたくなったら、内容は残さずに件数だけ数える方法もあるので、そのときに相談してね。
