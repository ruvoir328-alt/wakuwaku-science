/* わくわく物理基礎 ストーリーモード
   第12話「押すのをやめたら、止まる？」（新編物理基礎 1編2章 慣性の法則）

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
  const id = 'ep12a' + (++uid);
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
const SKY = '<defs><linearGradient id="sky12" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky12)"/>';
// 矢印（x1,y1 → x2,y2）
function arrow(x1, y1, x2, y2, color, w, extra){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 3) return '';
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(11, L * 0.6);
  return '<g' + (extra || '') + '><line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * h * 0.8).toFixed(1) + '" y2="' + (y2 - uy * h * 0.8).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>' +
    '<path d="M' + x2 + ' ' + y2 + ' L' + (x2 - ux * h - uy * h * 0.55).toFixed(1) + ' ' + (y2 - uy * h + ux * h * 0.55).toFixed(1) + ' L' + (x2 - ux * h + uy * h * 0.55).toFixed(1) + ' ' + (y2 - uy * h - ux * h * 0.55).toFixed(1) + 'z" fill="' + color + '"/></g>';
}

/* ---- この話の絵 ---- */
// そり（左はしを x、そりの底を y に）
function sled(x, y, s){
  s = s || 1;
  return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
    '<rect x="0" y="-22" width="54" height="14" rx="4" fill="#b47a44" stroke="#7e5129" stroke-width="2"/>' +
    '<path d="M-4 -2 H52 q8 0 8 -8" fill="none" stroke="#7e5129" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="10" y1="-8" x2="10" y2="-2" stroke="#7e5129" stroke-width="3"/><line x1="44" y1="-8" x2="44" y2="-2" stroke="#7e5129" stroke-width="3"/></g>';
}
// 氷の床（y0 から下）
function ice(y0){
  let s = '<rect x="0" y="' + y0 + '" width="400" height="' + (300 - y0) + '" fill="#e9f6fc"/><line x1="0" x2="400" y1="' + y0 + '" y2="' + y0 + '" stroke="#bfe2f6" stroke-width="3"/>';
  for (let k = 0; k < 8; k++) s += '<path d="M' + (20 + k * 52) + ' ' + (y0 + 12 + (k % 3) * 9) + ' l18 -6" stroke="#bfe2f6" stroke-width="2" stroke-linecap="round"/>';
  return s;
}

// 場面1：つるつるの氷の上で、秒速 2.0 m で手をはなす
SCENES['e12-ice'] = () => svg(SKY + ice(118) +
  '<image href="img/rika_normal.webp" x="132" y="40" width="44" height="80"/>' +
  sled(186, 118) +
  arrow(250, 74, 318, 74, '#6b7488', 4) + T(284, 64, '秒速 2.0 m', 13, '#1f2638') +
  T(220, 146, 'まさつのない氷', 14, '#22305a') + T(220, 166, 'ここで手をはなす', 12, '#6b7488'));

// 場面3：床・じゅうたん・氷で、同じ秒速 2.0 m で手をはなす（5秒間）
// 床：1秒に 0.50 m/s ずつ遅くなる → 4.0 秒・4.0 m で止まる
// じゅうたん：1秒に 1.0 m/s ずつ → 2.0 秒・2.0 m。氷：まさつ 0 → 5秒で 10 m（止まらない）
const LX = 34, PM = 22;                // 0 m の位置と 1 m の長さ（10 m で 220 px）
const LANES = [
  { name: '床',         y: 96,  a: 0.5, fill: '#d6dce6' },
  { name: 'じゅうたん', y: 142, a: 1.0, fill: '#e9c48f' },
  { name: '氷',         y: 188, a: 0,   fill: '#e9f6fc' }
];
const posAt = (a, t) => { if (!a) return 2.0 * t; const ts = Math.min(t, 2.0 / a); return 2.0 * ts - a * ts * ts / 2; };
SCENES['e12-compare'] = () => {
  let s = '';
  LANES.forEach((L, k) => {
    s += '<rect x="0" y="' + L.y + '" width="400" height="16" fill="' + L.fill + '"/><line x1="0" x2="400" y1="' + L.y + '" y2="' + L.y + '" stroke="#b47a44" stroke-width="2"/>' +
      T(6, L.y - 30, L.name, 12, '#7e5129', 'start') +
      '<g data-s' + k + '>' + sled(0, L.y, 0.5) + '</g>' +
      T(0, L.y - 30, '', 12, '#d93a3f', 'middle', ' data-l' + k);
  });
  for (let m = 0; m <= 10; m += 2) s += T(LX + m * PM, 236, m + (m === 10 ? ' m' : ''), 11, '#6b7488') + '<line x1="' + (LX + m * PM) + '" x2="' + (LX + m * PM) + '" y1="222" y2="227" stroke="#6b7488" stroke-width="1.5"/>';
  s += '<line x1="' + LX + '" x2="' + (LX + 10 * PM) + '" y1="222" y2="222" stroke="#6b7488" stroke-width="1.5"/>' +
    T(150, 266, '0.0秒', 18, '#1f2638', 'middle', ' data-time') + T(150, 286, 'どれも秒速 2.0 m で手をはなす', 11, '#6b7488');
  return anim(svg(s, '#eef2f7'), 5, (root, t) => {
    LANES.forEach((L, k) => {
      const x = posAt(L.a, t);
      root.querySelector('[data-s' + k + ']').setAttribute('transform', 'translate(' + (LX + x * PM - 14).toFixed(1) + ',0)');
      const lab = root.querySelector('[data-l' + k + ']');
      const stopped = L.a && t >= 2.0 / L.a;
      lab.textContent = stopped ? x.toFixed(1) + ' m で止まった' : (!L.a && t >= 5 ? '止まらない →' : '');
      lab.setAttribute('x', Math.min(220, LX + x * PM + 30));
    });
    root.querySelector('[data-time]').textContent = t.toFixed(1) + '秒';
  }, 'もう一度すべらせる');
};

// 場面4：まさつ 0 の氷。1秒ごとの位置が等間隔、v-tグラフは 2.0 m/s で水平
const G = { x: 168, y: 150, w: 200, h: 100 };   // v-tグラフ（0〜5 s、0〜3 m/s）
SCENES['e12-ice-vt'] = () => {
  let s = ice(80) + '<rect x="0" y="0" width="400" height="80" fill="#e9f6fc"/>';
  for (let n = 0; n <= 5; n++) s += '<circle cx="' + (40 + n * 64) + '" cy="72" r="6" fill="#ffe14a" stroke="#7e5129" stroke-width="1.5"/>' + T(40 + n * 64, 58, n + '秒', 10, '#6b7488');
  s += sled(330, 80, 0.55) + T(200, 104, '●は1秒ごとの位置（2.0 m ずつ・等間隔）', 11, '#6b7488');
  // v-tグラフ
  s += '<rect x="' + (G.x - 34) + '" y="' + (G.y - 24) + '" width="' + (G.w + 52) + '" height="' + (G.h + 58) + '" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
    '<path d="M' + G.x + ' ' + (G.y - 6) + ' V' + (G.y + G.h) + ' H' + (G.x + G.w + 6) + '" fill="none" stroke="#1f2638" stroke-width="2"/>';
  for (let k = 1; k <= 5; k++) s += T(G.x + G.w * k / 5, G.y + G.h + 14, k, 10, '#6b7488');
  [1, 2, 3].forEach(v => s += T(G.x - 4, G.y + G.h - G.h * v / 3 + 4, v, 10, '#6b7488', 'end'));
  s += T(G.x - 4, G.y + G.h + 14, '0', 10, '#6b7488', 'end') + T(G.x + 4, G.y - 10, '速度 v〔m/s〕', 11, '#6b7488', 'start') + T(G.x + G.w, G.y + G.h + 28, 't〔s〕', 10, '#6b7488', 'end') +
    '<line x1="' + G.x + '" x2="' + (G.x + G.w) + '" y1="' + (G.y + G.h / 3) + '" y2="' + (G.y + G.h / 3) + '" stroke="#d93a3f" stroke-width="4"/>' +
    T(G.x + G.w / 2, G.y + G.h / 3 - 8, '2.0 m/s のまま（水平）', 12, '#d93a3f');
  return svg(s, '#eef2f7');
};

// 場面5：電車が急ブレーキ。立っているリカが前へよろける
SCENES['e12-train'] = () => svg(
  '<rect x="128" y="24" width="262" height="196" rx="14" fill="#fff" stroke="#22305a" stroke-width="4"/>' +
  '<rect x="146" y="44" width="70" height="52" rx="6" fill="#bfe2f6"/><rect x="232" y="44" width="70" height="52" rx="6" fill="#bfe2f6"/><rect x="318" y="44" width="56" height="52" rx="6" fill="#bfe2f6"/>' +
  '<line x1="128" x2="390" y1="200" y2="200" stroke="#b47a44" stroke-width="5"/>' +
  '<g transform="rotate(14 236 200)"><image href="img/rika_surprise.webp" x="200" y="74" width="70" height="126"/></g>' +
  arrow(296, 150, 370, 150, '#6b7488', 4) + T(333, 126, 'からだは', 11, '#1f2638') + T(333, 140, '進み続けようとする', 11, '#1f2638') +
  arrow(250, 248, 170, 248, '#22305a', 4) + T(260, 270, '電車は急ブレーキで止まる', 12, '#22305a'), '#eef2f7');

SCENES['e12-answer'] = answerCard('進み続ける！', 'まさつ 0 なら 秒速 2.0 m のまま', 'clamp(26px,8.5vw,40px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '12',
  chapter: '2章 力と運動の法則',
  topic: '慣性の法則',
  title: '押すのをやめたら、止まる？',
  simUrl: '../sim/inertia.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e12-ice', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'まさつのない氷の上で、秒速 2.0 m で手をはなした。そりは、このあとどうなるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'stop',   label: 'だんだん遅くなって止まる' },
          { key: 'same',   label: '同じ速さで進み続ける' },
          { key: 'faster', label: 'だんだん速くなる' }
        ],
        answer: 'same'
      } },

    { bg: 'e12-ice', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        stop:   { face: 'confident', text: '押すのをやめたら、いつかは止まるでしょ？' },
        same:   { face: 'question',  text: '止めるものがなければ、そのまま進む…かな？' },
        faster: { face: 'confused',  text: 'すべり出したら、どんどん速くなりそう！' }
      } } },

    { bg: 'e12-ice', chars: [{ who: 'newton', face: 'think', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        stop:   { face: 'think',    text: 'ふだんはそう見えるな。では、止める犯人はだれじゃ？ 床を変えてくらべてみよう。' },
        same:   { face: 'proud',    text: 'ほう、よいところに目をつけたな。床を変えて、くらべてみよう。' },
        faster: { face: 'question', text: '押す力は、もうはたらいておらんぞ？ 床を変えて、くらべてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e12-compare', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        stop:   { face: 'surprise', text: 'つるつるになるほど、遠くまで行く…！ 氷だと止まらないよ！' },
        same:   { face: 'happy',    text: 'つるつるになるほど、遠くまで行く！ 氷だと止まらない！' },
        faster: { face: 'surprise', text: '速くはならないけど…つるつるになるほど、遠くまで行く！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e12-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ まさつがなければ、そりは秒速 2.0 m のまま進み続ける。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「同じ速さで進み続ける」。止めていたのは、床のまさつだったのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e12-ice-vt', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '止める力がなければ、同じ速さで進み続ける。これが『慣性の法則』。わしの第一法則じゃ！' },

    { bg: 'e12-train', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '止まっているものは止まり続け、動いているものは動き続けようとする。この性質を『慣性』という。' },

    { bg: 'e12-train', chars: [{ who: 'rika', face: 'idea', side: 'left' }],
      speaker: 'rika', text: 'え、そうなの？ 急ブレーキで前によろけるのも、慣性なんだ！' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '床のまさつを変えて、すべらせてみよう。',
      points: [
        '動き続けるのに、力はいらない（慣性の法則）',
        '止めたり、速さを変えたりするのに、力がいる',
        '力がはたらかなければ、動いているものは等速直線運動を続ける'
      ] }
  ]
};
})();
