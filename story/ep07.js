/* わくわく物理基礎 ストーリーモード
   第7話「てっぺんで、リンゴは止まる？」（新編物理基礎 1編1章 7 鉛直投射）

   書き方は第6話（ep06.js）と同じ。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（第1章の各話で共通） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'ep07a' + (++uid);
  setTimeout(() => {
    const root = document.getElementById(id);
    if (!root) return;
    let raf = 0;
    const btn = document.createElement('button');
    btn.className = 'replay'; btn.textContent = label || 'もう一度見る';
    root.parentNode.appendChild(btn);
    function play(){
      cancelAnimationFrame(raf);
      if (reduce){ draw(root, dur); return; }
      const t0 = performance.now() + 450;
      draw(root, 0);
      const f = now => {
        if (!root.isConnected) return;
        const t = Math.min(dur, Math.max(0, (now - t0) / 1000));
        draw(root, t);
        if (t < dur) raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
    }
    btn.onclick = e => { e.stopPropagation(); play(); };
    play();
  }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
// 答え合わせの絵（第6話の answer と同じ形）
function answerCard(word, sub, size){
  return (sc, EP, answers) => {
    const ch = EP.scenes.find(x => x.choice && x.choice.id === sc.reveal).choice;
    const mine = ch.options.find(o => o.key === answers[sc.reveal]);
    return svg('') +
      '<div class="answer-word"' + (size ? ' style="font-size:' + size + '"' : '') + '>' + word + '</div>' +
      '<div class="answer-sub">' + sub + '</div>' +
      '<div class="your-guess">あなたの予想：' + (mine ? mine.label : '—') + '</div>';
  };
}
const SKY = '<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky1)"/>';
/* ---- この話の絵 ---- */
// 秒速19.6 m で真上に投げ上げる（上向きを正）。y = 19.6t − 4.9t²、v = 19.6 − 9.8t
const V0 = 19.6, g = 9.8;
const yAt = t => V0 * t - g * t * t / 2, vAt = t => V0 - g * t;
function apple(x, y, r){
  r = r || 9;
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#d93a3f"/><path d="M' + x + ' ' + (y - r) + ' q2 -5 6 -6" stroke="#7e5129" stroke-width="2" fill="none"/>';
}
function vArrow(x, y, len, color, w){         // len > 0 で上向き、< 0 で下向き
  if (Math.abs(len) < 4) return '';
  const d = len > 0 ? -1 : 1, y2 = y + d * Math.abs(len);
  return '<line x1="' + x + '" x2="' + x + '" y1="' + y + '" y2="' + (y2 - d * 8) + '" stroke="' + color + '" stroke-width="' + (w || 4) + '"/>' +
    '<path d="M' + x + ' ' + y2 + ' l-6 ' + (-d * 10) + ' h12z" fill="' + color + '"/>';
}

// 投げ上げのようす（高さ 1 m = 8 px、地面 y = 250）
SCENES['e7-throw'] = () => anim(svg(SKY + '<rect y="250" width="400" height="50" fill="#86bb66"/>' +
  '<line x1="156" x2="156" y1="' + (250 - 19.6 * 8) + '" y2="250" stroke="#fff" stroke-width="2" stroke-dasharray="4 5"/>' +
  T(170, 250 - 19.6 * 8 + 4, '← いちばん高いところ', 12, '#7e5129', 'start') +
  '<g data-ap>' + apple(156, 250) + '</g>'),
  4, (root, t) => {
    root.querySelector('[data-ap]').setAttribute('transform', 'translate(0,' + (-yAt(t) * 8).toFixed(1) + ')');
  }, 'もう一度投げる');

// 1秒ごとのコマ送り：速度（赤）と加速度（紺）の矢印。X0 は 0秒の位置
const GY = 232, HM = 6, AV = 2, DX = 54;       // 地面、高さ 1 m の px、速度 1 m/s の矢印の px、1秒ごとの横のずらし
function strobe(X0, animated){
  const html = svg('<rect y="' + GY + '" width="400" height="' + (300 - GY) + '" fill="#d6dce6"/>' +
    T(X0 - 6, 58, '赤：速度〔m/s〕', 12, '#d93a3f', 'start') + T(X0 - 6, 76, '紺：加速度（下向き 9.8 m/s²）', 12, '#22305a', 'start') +
    '<g data-ghost></g><g data-ap></g>', '#fff');
  const xAt = t => X0 + DX * t;
  const draw = (root, t) => {
    let s = '';
    for (let n = 0; n <= Math.floor(t + 1e-9); n++){
      const x = xAt(n), y = GY - yAt(n) * HM, v = vAt(n);
      s += '<g opacity=".9">' + apple(x, y) + vArrow(x + 14, y, v * AV, '#d93a3f') + vArrow(x - 14, y, -g * AV, '#22305a', 3) +
        (v === 0 ? T(x + 12, y + 4, '0', 12, '#d93a3f', 'start')
                 : T(x + 14, y - v * AV + (v > 0 ? -8 : 14), (v > 0 ? '+' : '−') + Math.abs(v).toFixed(1), 11, '#d93a3f')) +
        T(x, 252, n + '秒', 11, '#6b7488') + '</g>';
    }
    root.querySelector('[data-ghost]').innerHTML = s;
    root.querySelector('[data-ap]').innerHTML = t < 4 ? apple(xAt(t), GY - yAt(t) * HM) : '';
  };
  if (animated) return anim(html, 4, draw, 'もう一度投げる');
  const id = 'ep07s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, 4); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e7-strobe'] = () => strobe(30, true);
SCENES['e7-strobe-still'] = () => strobe(150, false);

// v-t グラフ：v = 19.6 − 9.8t（0〜4秒）
const G = { x: 178, y: 44, w: 192, h: 184 };
const gx = t => G.x + G.w * t / 4, gy = v => G.y + G.h / 2 - G.h / 2 * v / 19.6;
SCENES['e7-vt'] = () => {
  let s = '<rect x="' + (G.x - 40) + '" y="' + (G.y - 20) + '" width="' + (G.w + 64) + '" height="' + (G.h + 40) + '" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>';
  for (let k = 1; k <= 4; k++) s += '<line x1="' + gx(k) + '" x2="' + gx(k) + '" y1="' + G.y + '" y2="' + (G.y + G.h) + '" stroke="#eef2f7" stroke-width="1.5"/>' + T(gx(k), gy(0) + 15, k, 11, '#6b7488');
  [19.6, 9.8, -9.8, -19.6].forEach(v => {
    s += '<line x1="' + G.x + '" x2="' + (G.x + G.w) + '" y1="' + gy(v) + '" y2="' + gy(v) + '" stroke="#eef2f7" stroke-width="1.5"/>' +
      T(G.x - 4, gy(v) + 4, (v > 0 ? '' : '−') + Math.abs(v), 11, '#6b7488', 'end');
  });
  s += '<path d="M' + G.x + ' ' + (G.y - 4) + ' V' + (G.y + G.h) + '" stroke="#1f2638" stroke-width="2"/>' +
    '<path d="M' + G.x + ' ' + gy(0) + ' H' + (G.x + G.w + 8) + '" stroke="#1f2638" stroke-width="2"/>' +
    T(G.x + G.w + 12, gy(0) - 6, 't〔s〕', 11, '#6b7488', 'end') + T(G.x - 4, gy(0) + 4, '0', 11, '#6b7488', 'end') +
    T(G.x + 6, G.y - 7, 'v〔m/s〕', 11, '#6b7488', 'start') +
    '<line x1="' + gx(0) + '" y1="' + gy(19.6) + '" x2="' + gx(4) + '" y2="' + gy(-19.6) + '" stroke="#d93a3f" stroke-width="4"/>' +
    '<circle cx="' + gx(2) + '" cy="' + gy(0) + '" r="6" fill="#d93a3f"/>' + T(gx(2) - 8, gy(0) + 30, '最高点（2秒）', 12, '#d93a3f', 'end') +
    T(gx(1.7), gy(-14), '傾き −9.8 m/s²', 13, '#22305a');
  return svg(s, '#eef2f7');
};

SCENES['e7-answer'] = (sc, EP, answers) => {
  const ch = EP.scenes.find(x => x.choice && x.choice.id === sc.reveal).choice;
  const mine = ch.options.find(o => o.key === answers[sc.reveal]);
  return svg('') +
    '<div class="answer-word" style="font-size:clamp(28px,9vw,44px)">速度は0！</div>' +
    '<div class="answer-sub">加速度は 下向き 9.8 m/s²</div>' +
    '<div class="your-guess" style="white-space:normal">あなたの予想：' + (mine ? mine.label : '—') + '</div>';
};


/* ---- 脚本 ---- */
window.EPISODE = {
  id: '07',
  chapter: '1章 直線運動の世界',
  topic: '鉛直投射',
  title: 'てっぺんで、リンゴは止まる？',
  simUrl: '../sim/vertical-throw.html',
  // ドリルが2つ（1-5 投げ下ろし、1-6 投げ上げ）
  drillUrls: [
    { url: '../physics/drill.html?unit=1-5', label: '投げ下ろし' },
    { url: '../physics/drill.html?unit=1-6', label: '投げ上げ' },
  ],
  scenes: [
    { bg: 'title' },

    { bg: 'e7-throw', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'それっ！ リンゴを真上に投げ上げるぞ。' },

    /* ---- 謎と予想 ---- */
    { bg: 'e7-throw', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'リンゴがいちばん高いところに来た瞬間。そのときの『速度』と『加速度』はどうなっている？',
      choice: {
        id: 'q1',
        options: [
          { key: 'zero', label: '速度も加速度も0' },
          { key: 'down', label: '速度は0、加速度は下向き9.8 m/s²' },
          { key: 'up', label: '速度は上向き、加速度は0' }
        ],
        answer: 'down'
      } },

    { bg: 'e7-throw', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        zero: { face: 'confident', text: 'てっぺんで止まってるから、全部0じゃない？' },
        down: { face: 'question',  text: '止まるから速度は0…。でも、下向きの何かは残ってそう。' },
        up:   { face: 'question',  text: 'まだ上に行こうとしてるから、速度は上向きかな？' }
      } } },

    { bg: 'e7-throw', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        zero: { face: 'think',    text: '半分正解じゃ。秒速19.6 mで投げ上げたときのコマ送りを見てみよう。' },
        down: { face: 'proud',    text: 'ほう、自信がありそうじゃな。秒速19.6 mで投げ上げたときのコマ送りを見てみよう。' },
        up:   { face: 'question', text: 'ふむ、よい問いじゃ。秒速19.6 mで投げ上げたときのコマ送りを見てみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e7-strobe', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        zero: { face: 'surprise', text: 'え、そうなの？ てっぺんでも、紺の矢印（加速度）が消えてない！' },
        down: { face: 'happy',    text: 'やっぱり！ てっぺんで速度は0。でも紺の矢印（加速度）はずっとある！' },
        up:   { face: 'surprise', text: 'え、そうなの？ てっぺんでは、赤の矢印（速度）がなくなってる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e7-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 最高点で速度は0。だが加速度は、ずっと下向き9.8 m/s²じゃ。' },
      wrong: { face: 'oops', text: 'おしい！ 最高点で速度は0。だが加速度は0ではなく、下向き9.8 m/s²のままじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e7-strobe-still', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '1秒ごとに速度が9.8ずつ減り、2秒後に0。ここが最高点じゃ。' },

    { bg: 'e7-strobe-still', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'だが重力は、ずっと下向きにはたらき続けている。' },

    { bg: 'e7-strobe-still', chars: [{ who: 'rika', face: 'idea', side: 'left' }],
      speaker: 'rika', text: '加速度が0だったら、そこで浮いたままになっちゃうのか！' },

    { bg: 'e7-strobe-still', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'そのとおり。上向きを正にすると v = v₀ − gt。上りに2秒、下りにも2秒。最高点は19.6 mじゃ。' },

    { bg: 'e7-vt', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'v-tグラフは右下がりの直線。t軸を横切る2秒が最高点で、傾きはどこでも −9.8 じゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '投げ下ろしと投げ上げ、両方の計算に挑戦じゃ！',
      points: [
        '加速度はいつも下向き g = 9.8 m/s²',
        '最高点で速度は0。止まるのは一瞬だけ',
        '上向きを正にすると v = v₀ − gt'
      ] }
  ]
};
})();
