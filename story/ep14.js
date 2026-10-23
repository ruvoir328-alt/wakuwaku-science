/* わくわく物理基礎 ストーリーモード
   第14話「同じ力で押し続けると？」（新編物理基礎 1編2章 運動の法則・運動方程式）

   書き方は第6話（ep06.js）と同じ。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（各話で共通） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'ep14a' + (++uid);
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
const SKY = '<defs><linearGradient id="sky14" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky14)"/>';
// 矢印（x1,y1 → x2,y2）
function arrow(x1, y1, x2, y2, color, w, extra){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 3) return '';
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(11, L * 0.6);
  return '<g' + (extra || '') + '><line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * h * 0.8).toFixed(1) + '" y2="' + (y2 - uy * h * 0.8).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>' +
    '<path d="M' + x2 + ' ' + y2 + ' L' + (x2 - ux * h - uy * h * 0.55).toFixed(1) + ' ' + (y2 - uy * h + ux * h * 0.55).toFixed(1) + ' L' + (x2 - ux * h + uy * h * 0.55).toFixed(1) + ' ' + (y2 - uy * h - ux * h * 0.55).toFixed(1) + 'z" fill="' + color + '"/></g>';
}

/* ---- この話の絵 ---- */
// 台車 2.0 kg を、まさつのない床で 4.0 N で押し続ける。右向きを正とする
// a = F ÷ m = 4.0 ÷ 2.0 = 2.0 m/s²、v = at（3秒後 6.0 m/s）、x = ½at² = t²（1秒で 1.0 m）
const M = 2.0, FP = 4.0, A = FP / M;
// 台車（左はし x、床 y、幅 w）
function cart(x, y, w, label){
  w = w || 60;
  return '<rect x="' + x + '" y="' + (y - 34) + '" width="' + w + '" height="26" rx="4" fill="#b47a44" stroke="#7e5129" stroke-width="2"/>' +
    '<circle cx="' + (x + 12) + '" cy="' + (y - 6) + '" r="6" fill="#22305a"/><circle cx="' + (x + w - 12) + '" cy="' + (y - 6) + '" r="6" fill="#22305a"/>' +
    (label ? T(x + w / 2, y - 17, label, 11, '#fff') : '');
}

// 場面1：リカが台車を 4.0 N で押し続ける
SCENES['e14-cart'] = () => svg(
  '<rect y="170" width="400" height="130" fill="#d6dce6"/><line x1="0" x2="400" y1="170" y2="170" stroke="#b47a44" stroke-width="4"/>' +
  '<image href="img/rika_normal.webp" x="170" y="70" width="55" height="100"/>' +
  cart(228, 170, 64, '2.0 kg') +
  arrow(292, 150, 352, 150, '#d93a3f', 5) + T(326, 136, 'F 4.0 N', 13, '#d93a3f') +
  T(262, 196, 'まさつのない床', 13, '#22305a') + T(262, 216, '同じ力で押し続ける', 12, '#6b7488'), '#eef2f7');

// 場面3：0.1秒ごとの記録テープ（はじめの 1.0 秒）と、v-tグラフ（3秒まで）
const TX = 40, TW = 300;                         // テープ：0〜100 cm を 300 px
const GX = { x: 48, y: 142, w: 200, h: 104 };    // v-tグラフ：0〜3 s、0〜6 m/s
SCENES['e14-tape'] = () => {
  let s = '<rect x="' + (TX - 10) + '" y="52" width="' + (TW + 20) + '" height="22" fill="#fff7e9" stroke="#e9c48f" stroke-width="2"/>' +
    '<g data-dots></g>' + T(TX - 10, 90, '0.1秒ごとの記録テープ（はじめの 1.0 秒）', 11, '#6b7488', 'start') +
    T(TX - 10, 106, '間隔：1, 3, 5, 7, 9 … cm（2 cm ずつ広がる）', 11, '#7e5129', 'start', ' data-gap opacity="0"');
  s += '<rect x="' + (GX.x - 36) + '" y="' + (GX.y - 18) + '" width="' + (GX.w + 56) + '" height="' + (GX.h + 52) + '" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
    '<path d="M' + GX.x + ' ' + (GX.y - 6) + ' V' + (GX.y + GX.h) + ' H' + (GX.x + GX.w + 6) + '" fill="none" stroke="#1f2638" stroke-width="2"/>';
  for (let k = 1; k <= 3; k++) s += T(GX.x + GX.w * k / 3, GX.y + GX.h + 14, k, 10, '#6b7488') + '<line x1="' + (GX.x + GX.w * k / 3) + '" x2="' + (GX.x + GX.w * k / 3) + '" y1="' + GX.y + '" y2="' + (GX.y + GX.h) + '" stroke="#eef2f7" stroke-width="1.5"/>';
  [2, 4, 6].forEach(v => s += T(GX.x - 4, GX.y + GX.h - GX.h * v / 6 + 4, v, 10, '#6b7488', 'end') + '<line x1="' + GX.x + '" x2="' + (GX.x + GX.w) + '" y1="' + (GX.y + GX.h - GX.h * v / 6) + '" y2="' + (GX.y + GX.h - GX.h * v / 6) + '" stroke="#eef2f7" stroke-width="1.5"/>');
  s += T(GX.x - 4, GX.y + GX.h + 14, '0', 10, '#6b7488', 'end') + T(GX.x + 4, GX.y - 4, '速度 v〔m/s〕', 10, '#6b7488', 'start') + T(GX.x + GX.w + 4, GX.y + GX.h + 28, 't〔s〕', 10, '#6b7488', 'end') +
    '<line data-v x1="' + GX.x + '" y1="' + (GX.y + GX.h) + '" x2="' + GX.x + '" y2="' + (GX.y + GX.h) + '" stroke="#d93a3f" stroke-width="4" stroke-linecap="round"/>' +
    T(GX.x + GX.w - 4, GX.y + 14, '3秒後 6.0 m/s', 12, '#d93a3f', 'end', ' data-k opacity="0"') +
    T(352, 92, '0.0秒', 15, '#1f2638', 'middle', ' data-time');
  return anim(svg(s, '#eef2f7'), 3, (root, t) => {
    let d = '';
    for (let n = 0; n <= 10 && n / 10 <= t + 1e-9; n++){
      const xcm = 100 * A / 2 * (n / 10) * (n / 10);      // x = ½at²（cm）
      d += '<circle cx="' + (TX + TW * xcm / 100).toFixed(1) + '" cy="63" r="3.5" fill="#22305a"/>';
    }
    root.querySelector('[data-dots]').innerHTML = d;
    root.querySelector('[data-gap]').setAttribute('opacity', t >= 1 ? 1 : 0);
    const l = root.querySelector('[data-v]');
    l.setAttribute('x2', (GX.x + GX.w * t / 3).toFixed(1));
    l.setAttribute('y2', (GX.y + GX.h - GX.h * (A * t) / 6).toFixed(1));
    root.querySelector('[data-k]').setAttribute('opacity', t >= 3 ? 1 : 0);
    root.querySelector('[data-time]').textContent = t.toFixed(1) + '秒';
  }, 'もう一度押す');
};

// 場面4：力を2倍 → 加速度2倍、質量を2倍 → 加速度半分（加速度の矢印は灰色）
SCENES['e14-ratio'] = () => {
  const rows = [
    { y: 70,  F: 4.0, m: 2.0, note: 'もとの台車', col: '#22305a' },
    { y: 150, F: 8.0, m: 2.0, note: '力を2倍 → 加速度も2倍', col: '#d93a3f' },
    { y: 230, F: 4.0, m: 4.0, note: '質量を2倍 → 加速度は半分', col: '#7e5129' }
  ];
  let s = '';
  rows.forEach(r => {
    const w = r.m === 4.0 ? 76 : 52, a = r.F / r.m;
    s += '<line x1="128" x2="392" y1="' + r.y + '" y2="' + r.y + '" stroke="#b47a44" stroke-width="3"/>' +
      cart(140, r.y, w, r.m.toFixed(1) + ' kg') +
      arrow(140 + w, r.y - 21, 140 + w + r.F * 10, r.y - 21, '#d93a3f', 4) + T(140 + w + r.F * 5, r.y - 28, 'F ' + r.F.toFixed(1) + ' N', 10, '#d93a3f') +
      arrow(150, r.y - 46, 150 + a * 20, r.y - 46, '#6b7488', 3) + T(154 + a * 20, r.y - 42, 'a ' + a.toFixed(1) + ' m/s²', 10, '#6b7488', 'start') +
      T(388, r.y + 18, r.note, 11, r.col, 'end');
  });
  return svg(s, '#eef2f7');
};

// 黒板（文字は白とレモン）
function board(lines){
  let s = '<rect x="128" y="18" width="262" height="230" rx="10" fill="#22305a" stroke="#b47a44" stroke-width="6"/>';
  lines.forEach(([y, str, size, col]) => s += T(259, y, str, size || 14, col || '#fff'));
  return svg(s, '#eef2f7');
}
// 場面5：ma = F。2.0 × a = 4.0 → a = 2.0 m/s²、3秒後 6.0 m/s
SCENES['e14-board'] = () => board([
  [52, '運動方程式', 13, '#cfd7ee'],
  [92, 'ma = F', 30, '#ffe14a'],
  [134, '2.0 × a = 4.0'],
  [164, 'a = 4.0 ÷ 2.0 = 2.0 m/s²'],
  [200, '3秒後：v = at = 2.0 × 3.0 = 6.0 m/s', 12],
  [232, '1 N：1 kg に 1 m/s² の加速度を生じさせる力', 10, '#cfd7ee']
]);
// 第13話のふり返り：同じ 100 N でも、軽いほど加速度が大きい
SCENES['e14-recall'] = () => board([
  [52, '第13話のふり返り（100 N で押し合い）', 12, '#cfd7ee'],
  [100, 'リカ：a = 100 ÷ 50 = 2.0 m/s²', 12],
  [140, 'ニュートンくん：a = 100 ÷ 25 = 4.0 m/s²', 12],
  [190, '軽いほど、加速度が大きい！', 16, '#ffe14a']
]);

SCENES['e14-answer'] = answerCard('だんだん速くなる！', '加速度 2.0 m/s²（3秒後に 6.0 m/s）', 'clamp(24px,7.5vw,36px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '14',
  chapter: '2章 力と運動の法則',
  topic: '運動の法則・運動方程式',
  title: '同じ力で押し続けると？',
  simUrl: '../sim/motion-equation.html',
  drillUrl: '../physics/drill.html?unit=2-3',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e14-cart', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'まさつのない床の上で、2.0 kg の台車を 4.0 N で押し続ける。台車の速さはどうなるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'same',   label: '同じ速さで進む' },
          { key: 'faster', label: 'だんだん速くなる' },
          { key: 'slower', label: 'だんだん遅くなる' }
        ],
        answer: 'faster'
      } },

    { bg: 'e14-cart', chars: [{ who: 'rika', face: 'confident', side: 'left' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        same:   { face: 'confident', text: '同じ力なら、同じ速さでしょ？' },
        faster: { face: 'idea',      text: '押し続けたら、どんどん速くなりそう！' },
        slower: { face: 'question',  text: 'だんだん押しにくくなって、遅くなるんじゃない？' }
      } } },

    { bg: 'e14-cart', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        same:   { face: 'think',    text: '第12話を思い出してごらん。同じ速さで進むのに、力はいらなかったな。記録テープで確かめよう。' },
        faster: { face: 'proud',    text: 'ほう。では、0.1秒ごとの記録テープで確かめよう。' },
        slower: { face: 'question', text: '押す力は 4.0 N のまま、ずっと同じじゃぞ。記録テープで確かめよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e14-tape', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        same:   { face: 'surprise', text: 'え、そうなの？ 間隔が広がってる！ 第5話の台車と同じ、加速度が一定の運動だ！' },
        faster: { face: 'happy',    text: 'やっぱり速くなってる！ 第5話の台車と同じ、加速度が一定の運動だ！' },
        slower: { face: 'surprise', text: 'え、そうなの？ 遅くならない！ 第5話と同じ、加速度が一定の運動だ！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e14-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 同じ力で押し続けると、速さは一定の割合で増えていく。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「だんだん速くなる」。力がはたらき続けると、加速度が生じるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e14-ratio', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '加速度は力に比例し、質量に反比例する。これが『運動の法則』。わしの第二法則じゃ！' },

    { bg: 'e14-board', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '式にすると ma = F。この台車なら a = 4.0 ÷ 2.0 = 2.0 m/s²、3秒後には 6.0 m/s じゃ。' },

    { bg: 'e14-recall', chars: [{ who: 'newton', face: 'happy', side: 'left' }],
      speaker: 'newton', text: '第13話で、軽いわしのほうが速くすべったのも、このためじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '力と質量を変えて、加速度を調べよう。',
      points: [
        '力がはたらくと、力の向きに加速度が生じる',
        '加速度は力に比例し、質量に反比例する（運動の法則）',
        '運動方程式 ma = F（1 N は 1 kg に 1 m/s² を生じさせる力）'
      ] }
  ]
};
})();
