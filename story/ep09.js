/* わくわく物理基礎 ストーリーモード
   第9話「机の上のかごに、力ははたらいている？」（新編物理基礎 1編2章 力の表し方・いろいろな力）

   書き方は第6話（ep06.js）・1章の各話と同じ。脚本の原本は docs/story-ch2.md。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（第1章の各話と同じ） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'ep09a' + (++uid);
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
const SKY = '<defs><linearGradient id="sky09" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky09)"/>';
// 力の矢印（x1,y1 → x2,y2）。色：重力＝紺、人が加える力＝赤、支える力＝木、合力＝赤の点線（dash）
function arrow(x1, y1, x2, y2, color, w, dash){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 3) return '';
  w = w || 5;
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(14, L * 0.6), hw = h * 0.6;
  const bx = x2 - ux * h, by = y2 - uy * h;
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + bx.toFixed(1) + '" y2="' + by.toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="7 5"' : ' stroke-linecap="round"') + '/>' +
    '<path d="M' + x2 + ' ' + y2 + ' L' + (bx - uy * hw).toFixed(1) + ' ' + (by + ux * hw).toFixed(1) + ' L' + (bx + uy * hw).toFixed(1) + ' ' + (by - ux * hw).toFixed(1) + 'z" fill="' + color + '"/>';
}
const NAVY = '#22305a', RED = '#d93a3f', WOOD = '#7e5129';

/* ---- この話の絵 ---- */
// リンゴのかご（質量 2.0 kg → 重力 W = 2.0 × 9.8 = 19.6 N）。(cx, top) はかごの上のはしの真ん中
function basket(cx, top, s){
  s = s || 1;
  const w = 64 * s, h = 30 * s, a = 8 * s;
  let g = '';
  [-18, 0, 18, -9, 9].forEach((dx, k) => {
    const ax = cx + dx * s, ay = top - (k < 3 ? 4 : 13) * s;
    g += '<circle cx="' + ax + '" cy="' + ay + '" r="' + (9 * s) + '" fill="#d93a3f"/>';
  });
  g += '<path d="M' + (cx - w / 2) + ' ' + top + ' h' + w + ' l' + (-a) + ' ' + h + ' h' + (-(w - 2 * a)) + 'z" fill="#e9c48f" stroke="#7e5129" stroke-width="2"/>' +
    '<path d="M' + (cx - w / 2 + 6 * s) + ' ' + (top + h / 3) + ' h' + (w - 12 * s) + ' M' + (cx - w / 2 + 10 * s) + ' ' + (top + 2 * h / 3) + ' h' + (w - 20 * s) + '" stroke="#b47a44" stroke-width="1.5"/>';
  return g;
}
// 机（天板の上の面が y）
function desk(cx, y, w){
  return '<rect x="' + (cx - w / 2) + '" y="' + y + '" width="' + w + '" height="10" rx="2" fill="#b47a44"/>' +
    '<rect x="' + (cx - w / 2 + 8) + '" y="' + (y + 10) + '" width="8" height="' + (250 - y - 10) + '" fill="#7e5129"/>' +
    '<rect x="' + (cx + w / 2 - 16) + '" y="' + (y + 10) + '" width="8" height="' + (250 - y - 10) + '" fill="#7e5129"/>';
}
const ROOM = '<rect width="400" height="250" fill="#eef2f7"/><rect y="250" width="400" height="50" fill="#d6dce6"/>';
const DESK_Y = 190;           // 机の天板

// 謎：机の上のかご（止まっている）
SCENES['e9-basket'] = () => svg(ROOM + desk(200, DESK_Y, 150) + basket(200, DESK_Y - 30) +
  T(200, 50, '2.0 kg', 16, NAVY) + T(200, 70, 'じっと止まっている', 12, '#6b7488'));

// 机を引きぬくと、かごが落ちる
SCENES['e9-drop'] = () => anim(svg(ROOM + '<g data-desk>' + desk(200, DESK_Y, 150) + '</g><g data-bk>' + basket(200, DESK_Y - 30) + '</g>' +
  '<g data-w opacity="0">' + arrow(200, 175, 200, 232, NAVY) + T(212, 222, 'W', 15, NAVY, 'start') + '</g>' +
  T(200, 84, '机を、そっと引きぬくと…', 15, '#1f2638', 'middle', ' data-cap')),
  1.8, (root, t) => {
    const dx = Math.min(1, t / 0.6) * 260;                       // 0.6 秒で机を右へ
    root.querySelector('[data-desk]').setAttribute('transform', 'translate(' + dx.toFixed(1) + ',0)');
    const tf = Math.max(0, t - 0.6);
    const dy = Math.min(60 - 2, 0.5 * 9.8 * 40 * tf * tf);      // 1 m = 40 px で落ちる（床まで 58 px）
    root.querySelector('[data-bk]').setAttribute('transform', 'translate(0,' + dy.toFixed(1) + ')');
    root.querySelector('[data-w]').setAttribute('opacity', tf > 0 ? 1 : 0);
    root.querySelector('[data-w]').setAttribute('transform', 'translate(0,' + dy.toFixed(1) + ')');
    root.querySelector('[data-cap]').textContent = t < 0.6 ? '机を、そっと引きぬくと…' : 'ストン！ 下に引っぱられていた';
  }, 'もう一度引きぬく');

// 重力 W = mg = 19.6 N（矢印 1 N = 3 px）
const PX = 3;
SCENES['e9-weight'] = () => svg(ROOM + desk(200, DESK_Y, 150) + basket(200, DESK_Y - 30) +
  '<circle cx="200" cy="' + (DESK_Y - 15) + '" r="4" fill="' + NAVY + '"/>' +
  arrow(200, DESK_Y - 15, 200, DESK_Y - 15 + 19.6 * PX, NAVY) +
  T(208, DESK_Y + 40, 'W 19.6 N', 15, NAVY, 'start') +
  T(200, 52, 'W = mg = 2.0 × 9.8 = 19.6 N', 16, NAVY));

// 力の矢印の3つの要素：作用点・大きさ（長さ）・向き
SCENES['e9-arrow'] = () => svg(ROOM + desk(200, DESK_Y, 150) + basket(200, DESK_Y - 30) +
  '<circle cx="200" cy="' + (DESK_Y - 15) + '" r="6" fill="#ffe14a" stroke="' + NAVY + '" stroke-width="2"/>' +
  arrow(200, DESK_Y - 15, 200, DESK_Y - 15 + 19.6 * PX, NAVY) +
  '<line x1="207" y1="' + (DESK_Y - 18) + '" x2="288" y2="' + (DESK_Y - 40) + '" stroke="#7e5129" stroke-width="1.5"/>' +
  T(292, DESK_Y - 36, '作用点', 15, '#7e5129', 'start') +
  '<path d="M290 ' + (DESK_Y - 15) + ' h8 v' + (19.6 * PX) + ' h-8" fill="none" stroke="#7e5129" stroke-width="2"/>' +
  T(304, DESK_Y + 8, '大きさ', 15, '#7e5129', 'start') + T(304, DESK_Y + 26, '（長さ）', 13, '#7e5129', 'start') +
  T(212, DESK_Y + 58, '向き', 15, '#7e5129', 'start') +
  T(200, 46, '力は矢印で表す', 17, NAVY) + T(200, 72, '単位は N（ニュートン）', 15, '#6b7488'));

// 支える力：机・ひも・ばね（どれも上向き 19.6 N）
function holder(cx, kind){
  let g = '', top;
  if (kind === 'desk'){ top = 170; g += desk(cx, 200, 92); }
  else {
    top = 150;
    g += '<rect x="' + (cx - 40) + '" y="34" width="80" height="8" fill="#7e5129"/>';
    if (kind === 'rope') g += '<line x1="' + cx + '" y1="42" x2="' + cx + '" y2="' + (top - 16) + '" stroke="#1f2638" stroke-width="2"/>';
    else {
      let d = 'M' + cx + ' 42 v8';
      for (let k = 0; k < 9; k++) d += ' l' + (k % 2 ? 9 : -9) + ' 9';
      g += '<path d="' + d + ' L' + cx + ' ' + (top - 16) + '" fill="none" stroke="#6b7488" stroke-width="2"/>';
    }
  }
  const name = { desk: '垂直抗力', rope: '張力', spring: '弾性力' }[kind];
  const by = kind === 'desk' ? top + 30 : top - 16;              // 支える力の作用点（机はかごの底、ひも・ばねはつけね）
  g += basket(cx, top, 0.8) +
    arrow(cx + 9, by, cx + 9, by - 19.6 * 2.4, WOOD, 4) +
    arrow(cx - 9, top + 12, cx - 9, top + 12 + 19.6 * 2.4, NAVY, 4) +
    T(cx, 268, name, 16, WOOD) + T(cx, 288, '19.6 N', 15, WOOD) +
    T(cx - 14, top + 58, 'W', 14, NAVY, 'end');
  return g;
}
SCENES['e9-three'] = () => svg('<rect width="400" height="300" fill="#eef2f7"/>' +
  holder(72, 'desk') + holder(200, 'rope') + holder(328, 'spring') +
  T(200, 22, '上向きの力は、どれも 19.6 N', 15, '#1f2638'), '#eef2f7');

// ばね：ばね定数 49 N/m、のび 0.40 m → 49 × 0.40 = 19.6 N
SCENES['e9-spring'] = () => anim(svg('<rect width="400" height="300" fill="#eef2f7"/>' +
  '<rect x="150" y="20" width="100" height="10" fill="#7e5129"/>' +
  '<path data-sp fill="none" stroke="#6b7488" stroke-width="2.5"/><g data-bk></g>' +
  '<line x1="300" x2="300" y1="120" y2="120" stroke="#7e5129" stroke-width="2" data-ext/>' +
  T(300, 84, 'k = 49 N/m', 15, '#1f2638', 'start') +
  T(308, 150, '', 14, WOOD, 'start', ' data-x') +
  T(296, 262, '', 14, '#1f2638', 'middle', ' data-f')),
  1.5, (root, t) => {
    const x = 0.40 * Math.min(1, t / 1.2);                      // のび 0〜0.40 m（1 m = 200 px）
    const L0 = 70, L = L0 + x * 200, top = 30;
    let d = 'M200 ' + top + ' v6';
    const n = 10, step = (L - 12) / n;
    for (let k = 0; k < n; k++) d += ' l' + (k % 2 ? 10 : -10) + ' ' + (step / 2).toFixed(1) + ' l' + (k % 2 ? -10 : 10) + ' ' + (step / 2).toFixed(1);
    d += ' v6';
    root.querySelector('[data-sp]').setAttribute('d', d);
    const bt = top + L + 16;
    root.querySelector('[data-bk]').innerHTML = basket(200, bt, 0.8) +
      (x > 0.399 ? arrow(209, top + L, 209, top + L - 19.6 * 2.4, WOOD, 4) + T(218, top + L - 40, 'F 19.6 N', 14, WOOD, 'start') : '');
    const e = root.querySelector('[data-ext]');
    e.setAttribute('y1', top + L0); e.setAttribute('y2', top + L);
    root.querySelector('[data-x]').textContent = 'のび ' + x.toFixed(2) + ' m';
    root.querySelector('[data-f]').textContent = 'F = kx = 49 × ' + x.toFixed(2) + ' = ' + (49 * x).toFixed(1) + ' N';
  }, 'もう一度のばす');

SCENES['e9-answer'] = answerCard('重力と垂直抗力', '止まっていても、力ははたらいている', 'clamp(22px,7vw,34px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '09',
  chapter: '2章 力と運動の法則',
  topic: '力の表し方・いろいろな力',
  title: '机の上のかごに、力ははたらいている？',
  simUrl: '../sim/force-arrows.html',
  drillUrls: [
    { url: '../physics/drill.html?unit=2-6', label: '弾性力' },
    { url: '../physics/drill.html?unit=2-2', label: '力のつりあい' },
  ],
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e9-basket', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'このかごは、じっと止まっておる。さて、かごに力ははたらいているかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'none', label: '力ははたらいていない' },
          { key: 'grav', label: '重力だけ' },
          { key: 'both', label: '重力と、机が押し上げる力' }
        ],
        answer: 'both'
      } },

    { bg: 'e9-basket', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        none: { face: 'confident', text: '止まってるんだから、力なんてはたらいてないでしょ？' },
        grav: { face: 'question',  text: '地球に引っぱられてるから、重力だけかな？' },
        both: { face: 'idea',      text: '下に引っぱる力と、机が押す力。両方かな？' }
      } } },

    { bg: 'e9-basket', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        none: { face: 'proud',    text: 'ふむ、よい問いじゃ。では机を、そっと引きぬいてみよう。' },
        grav: { face: 'think',    text: '重力はあたりじゃ。では、なぜ落ちないのか。机を引きぬいてみよう。' },
        both: { face: 'question', text: 'ほう、するどいの。では机を、そっと引きぬいてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e9-drop', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        none: { face: 'surprise', text: 'え、そうなの？ 落ちた！ ずっと下に引っぱられてたんだ。' },
        grav: { face: 'idea',     text: '落ちた！ 机があるときは、机が支えてたんだ。' },
        both: { face: 'happy',    text: '落ちた！ やっぱり机が、重力を支えてたんだね。' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e9-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 重力と、机が押し上げる力がはたらいておる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「重力と、机が押し上げる力」。止まっていても、力ははたらいておるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e9-weight', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '地球がものを引く力、これが『重力』じゃ。重さ W = mg。' },

    { bg: 'e9-weight', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '2.0 kg なら、2.0 × 9.8 = 19.6 N じゃ。' },

    { bg: 'e9-arrow', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '力は矢印で表す。根もとが作用点、長さが大きさ、そして向きじゃ。' },

    { bg: 'e9-arrow', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '単位は N、ニュートンと読む。…わしの名前じゃ。' },

    { bg: 'e9-arrow', chars: [{ who: 'rika', face: 'surprise', side: 'left' }],
      speaker: 'rika', text: 'え、そうなの？ ニュートンくんの名前が単位なんだ！' },

    { bg: 'e9-three',
      speaker: 'newton', text: '机が押し上げる力が『垂直抗力』、ひもが引く力が『張力』、ばねが引く力が『弾性力』じゃ。' },

    { bg: 'e9-spring', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'ばね定数 49 N/m のばねなら、0.40 m のびて 19.6 N になる。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'ばねをのばして、力を目で見てみよう。',
      points: [
        '止まっていても、力ははたらいている',
        '力は矢印（大きさ・向き・作用点）で表す。単位は N',
        '重力 W = mg。支える力は、垂直抗力・張力・弾性力'
      ] }
  ]
};
})();
