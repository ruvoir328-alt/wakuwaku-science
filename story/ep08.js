/* わくわく物理基礎 ストーリーモード
   第8話「横に投げたら、遅く落ちる？」（新編物理基礎 1編1章 8 水平投射）

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
  const id = 'ep08a' + (++uid);
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
// 高さ 4.9 m の台から、A を秒速3 m で真横に投げ、B をそっと手放す
// 縦：y = ½gt²（下向きを正）、横：x = 3t。4.9 = ½ × 9.8 × t² → t = 1秒
const g = 9.8, H = 4.9, VX = 3, PM = 36;        // 1 m = 36 px（4.9 m → 176 px）
function apple(x, y, label){
  return '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#d93a3f"/><path d="M' + x + ' ' + (y - 8) + ' q2 -5 6 -6" stroke="#7e5129" stroke-width="2" fill="none"/>' +
    (label ? T(x, y + 4, label, 9, '#fff') : '');
}
// X：手元（台の端）の位置。床は y = 254
function scene8(X){
  const FY = 254, TOP = FY - H * PM;
  const s = SKY + '<rect y="' + FY + '" width="400" height="' + (300 - FY) + '" fill="#86bb66"/>' +
    '<rect x="' + (X - 60) + '" y="' + TOP + '" width="60" height="' + (FY - TOP) + '" fill="#b47a44" stroke="#7e5129" stroke-width="3"/>' +
    T(X - 30, (TOP + FY) / 2, '4.9 m', 13, '#fff');
  return s;
}
// 0.1秒ごとのコマ送り（A と B の高さを横線で結ぶ）
function strobe(X, mode){
  const FY = 254, TOP = FY - H * PM;
  const html = svg(scene8(X) + '<g data-g></g><g data-now></g>' +
    T(X + 70, TOP - 16, 'A：真横に投げる', 12, '#d93a3f', 'start') + T(X + 70, TOP, 'B：そっと手放す', 12, '#22305a', 'start'));
  const draw = (root, t) => {
    let s = '';
    for (let n = 0; n <= Math.floor(t * 10 + 1e-6); n++){
      const tt = n / 10, y = TOP + g * tt * tt / 2 * PM, xa = X + 22 + VX * tt * PM;
      s += '<line x1="' + (X + 6) + '" x2="' + xa + '" y1="' + y + '" y2="' + y + '" stroke="#6b7488" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<circle cx="' + xa + '" cy="' + y + '" r="6" fill="#d93a3f" opacity=".45"/><circle cx="' + (X + 6) + '" cy="' + y + '" r="6" fill="#22305a" opacity=".45"/>';
    }
    const tt = Math.min(1, t), y = TOP + g * tt * tt / 2 * PM;
    root.querySelector('[data-g]').innerHTML = s;
    root.querySelector('[data-now]').innerHTML = apple(X + 22 + VX * tt * PM, y, 'A') +
      '<circle cx="' + (X + 6) + '" cy="' + y + '" r="8" fill="#22305a"/>' + T(X + 6, y + 4, 'B', 9, '#fff') +
      (t >= 1 ? T(X + 60, FY + 24, '1秒で同時に着地', 13, '#7e5129') : '');
  };
  if (mode === 'anim') return anim(html, 3, (root, t) => draw(root, t / 3), 'もう一度投げる');   // 3倍ゆっくり
  const id = 'ep08s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, mode === 'start' ? 0 : 1); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e8-table'] = () => strobe(200, 'start');
SCENES['e8-strobe'] = () => strobe(80, 'anim');

// 真上から見た A：横には 0.1秒ごとに 0.3 m ずつ、等間隔に進む
SCENES['e8-top'] = () => {
  let s = '<rect x="140" y="40" width="250" height="150" rx="8" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
    T(265, 64, '真上から見た A（0.1秒ごと、単位 m）', 13, '#6b7488');
  for (let n = 0; n <= 10; n++){
    const x = 160 + VX * n / 10 * 70;          // 1 m = 70 px
    s += '<circle cx="' + x + '" cy="112" r="7" fill="#d93a3f" opacity="' + (0.4 + n * 0.06).toFixed(2) + '"/>';
    if (n % 2 === 0) s += '<line x1="' + x + '" x2="' + x + '" y1="128" y2="136" stroke="#6b7488" stroke-width="1.5"/>' + T(x, 150, (VX * n / 10).toFixed(1), 11, '#6b7488');
  }
  s += '<line x1="160" x2="370" y1="128" y2="128" stroke="#6b7488" stroke-width="1.5"/>' +
    T(265, 178, '横は等速（秒速3 m）', 14, '#d93a3f');
  return svg(s + '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');
};

// 計算：4.9 = ½ × 9.8 × t² → t = 1秒、横は 3 × 1 = 3 m
SCENES['e8-calc'] = () => svg(
  '<rect x="140" y="30" width="246" height="196" rx="8" fill="#2f5b4e" stroke="#7e5129" stroke-width="8"/>' +
  T(263, 62, '縦：自由落下', 14, '#ffd6d7') +
  '<text x="263" y="98" text-anchor="middle" font-size="21" fill="#fff" font-family="Times New Roman" font-style="italic">4.9 = ½ × 9.8 × t²</text>' +
  T(263, 130, 't = 1 秒', 19, '#fff') +
  '<line x1="176" x2="350" y1="148" y2="148" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>' +
  T(263, 174, '横：等速直線運動', 14, '#ffd6d7') +
  '<text x="263" y="208" text-anchor="middle" font-size="21" fill="#fff" font-family="Times New Roman" font-style="italic">x = 3 × 1 = 3 m</text>' +
  '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');

SCENES['e8-answer'] = answerCard('同時！', 'どちらも1秒で床に着く');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '08',
  chapter: '1章 直線運動の世界',
  topic: '水平投射',
  title: '横に投げたら、遅く落ちる？',
  simUrl: '../sim/horizontal-throw.html',
  drillUrl: '../physics/drill.html?unit=1-8',
  scenes: [
    { bg: 'title' },

    { bg: 'e8-table', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '高さ4.9 mの台の上から、リンゴAを真横に投げ、同時にリンゴBをそっと手放すぞ。' },

    /* ---- 謎と予想 ---- */
    { bg: 'e8-table', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: '床に先に着くのは、どっちのリンゴかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'a', label: '真横に投げたA' },
          { key: 'b', label: '手放したB' },
          { key: 'same', label: '同時' }
        ],
        answer: 'same'
      } },

    { bg: 'e8-table', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        a:    { face: 'question',  text: 'Aかな？ 勢いよく投げたから、先に着きそう。' },
        b:    { face: 'confident', text: 'Bでしょ！ Aは遠くまで飛ぶから、遅くなるんじゃない？' },
        same: { face: 'question',  text: '同時…？ でも、Aは遠くまで飛ぶよね？' }
      } } },

    { bg: 'e8-table', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        a:    { face: 'think',    text: 'ふむ、では縦と横を分けて観察じゃ。' },
        b:    { face: 'proud',    text: 'なるほど。では、縦と横を分けて観察じゃ。' },
        same: { face: 'question', text: 'ほう、自信がありそうじゃな。では、縦と横を分けて観察じゃ。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e8-strobe', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        a:    { face: 'surprise', text: 'え、そうなの？ AとBの高さが、ずっと同じだ…！' },
        b:    { face: 'surprise', text: 'え、そうなの？ 高さがずっと同じだ…！ Aも遅くならない！' },
        same: { face: 'happy',    text: 'やっぱり同時！ 高さがずっと同じだ！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e8-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ AもBも、同時に床に着く。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「同時」。横に投げても、落ち方は変わらんのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e8-top', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'Aを真上から見ると、横には等間隔で進んでおる。' },

    { bg: 'e8-top', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '横は第3話の等速直線運動、縦は第6話の自由落下。横に投げても、落ち方は変わらんのじゃ。' },

    { bg: 'e8-calc', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '4.9 = ½ × 9.8 × t² より t = 1秒。秒速3 mで投げたら、Aは3 m先に落ちる。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'これで1章はおしまいじゃ。だが、なぜ物は加速するのか？ その答えは2章で。わしの出番じゃ！',
      points: [
        '水平投射：横は等速直線運動（x = v₀t）',
        '縦は自由落下（y = ½gt²）',
        '縦と横を分けて考えれば解ける'
      ] }
  ]
};
})();
