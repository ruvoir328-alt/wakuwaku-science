/* わくわく化学基礎 ストーリーモード
   化学 第7話「氷がとけている間、温度は？」（東京書籍 化学基礎 1編1章 物質の成分と構成元素：物質の三態と状態変化）

   書き方は物理の各話（ep03.js・ep09.js など）と同じ。脚本の原本は docs/chem-story-ch1.md。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
*/
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
let uid = 0;

/* ---- 絵を描くための道具（物理の各話と同じ） ---- */
function svg(inner, bg){
  return '<svg class="scene" viewBox="0 0 400 300" aria-hidden="true"><rect width="400" height="300" fill="' + (bg || '#fff') + '"/>' + inner + '</svg>';
}
function T(x, y, s, size, fill, anchor, extra){
  return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || '#1f2638') + '" text-anchor="' + (anchor || 'middle') + '"' + F + (extra || '') + '>' + s + '</text>';
}
// アニメ：dur 秒かけて draw(root, t) をくり返し呼ぶ。「もう一度見る」ボタンつき
function anim(html, dur, draw, label){
  const id = 'chem07a' + (++uid);
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
// 止まった絵（アニメの最後の形を、ボタンなしで描く）
function still(html, t, draw){
  const id = 'chem07s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, t); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
const SKY = '<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky1)"/>';
// 化学の色（4人でそろえる）：水＝空色、ガラスのふち＝うすい文字の色、炎＝赤とレモン、黒いもの＝文字の色
const C = { water: '#bfe2f6', waterLine: '#22305a', glass: '#6b7488', fire: '#d93a3f', fire2: '#ffe14a', black: '#1f2638', dia: '#e9f6fc', ink: '#1f2638', muted: '#6b7488', wood: '#b47a44', woodDark: '#7e5129', coat: '#22305a', cream: '#fff7e9', creamLine: '#e9c48f', gray: '#eef2f7', gray2: '#d6dce6' };
// 炎色反応の色（例外。シミュとも同じ）
const FLAME = { Li: '#d93a3f', Na: '#ffe14a', K: '#b05cc4', Ca: '#f07a3a', Sr: '#c8243c', Ba: '#a8d04a', Cu: '#2fb5a0' };
// バーナーと炎（x, y はバーナーの口。color は炎の外側の色）
function burner(x, y, color, h){
  h = h || 46;
  return '<rect x="' + (x - 12) + '" y="' + y + '" width="24" height="44" fill="' + C.glass + '"/><rect x="' + (x - 22) + '" y="' + (y + 44) + '" width="44" height="8" rx="3" fill="' + C.ink + '"/>' +
    '<path d="M' + (x - 13) + ' ' + y + ' Q' + (x - 15) + ' ' + (y - h * 0.5) + ' ' + x + ' ' + (y - h) + ' Q' + (x + 15) + ' ' + (y - h * 0.5) + ' ' + (x + 13) + ' ' + y + ' Z" fill="' + color + '" opacity=".9"/>' +
    '<path d="M' + (x - 6) + ' ' + y + ' Q' + (x - 7) + ' ' + (y - h * 0.3) + ' ' + x + ' ' + (y - h * 0.55) + ' Q' + (x + 7) + ' ' + (y - h * 0.3) + ' ' + (x + 6) + ' ' + y + ' Z" fill="#fff" opacity=".55"/>';
}

/* ---- この話の絵 ---- */
// ビーカーの氷を同じ強さで熱し続ける（温度計つき）
function beaker(x, y, state){
  const inside = state === 'ice'
    ? '<rect x="' + (x - 26) + '" y="' + (y + 22) + '" width="18" height="16" rx="3" fill="#fff" stroke="' + C.glass + '"/><rect x="' + (x - 4) + '" y="' + (y + 18) + '" width="18" height="16" rx="3" fill="#fff" stroke="' + C.glass + '"/><rect x="' + (x + 12) + '" y="' + (y + 26) + '" width="16" height="14" rx="3" fill="#fff" stroke="' + C.glass + '"/>'
    : '<rect x="' + (x - 30) + '" y="' + (y + (state === 'water' ? 16 : 30)) + '" width="60" height="' + (state === 'water' ? 28 : 14) + '" fill="' + C.water + '"/>' +
      (state === 'boil' ? '<circle cx="' + (x - 10) + '" cy="' + (y + 34) + '" r="3" fill="#fff"/><circle cx="' + (x + 8) + '" cy="' + (y + 38) + '" r="2.5" fill="#fff"/><path d="M' + (x - 12) + ' ' + (y - 6) + ' q6 -10 0 -20 M' + (x + 10) + ' ' + (y - 6) + ' q6 -10 0 -20" stroke="' + C.gray2 + '" stroke-width="3" fill="none"/>' : '');
  return inside +
    '<path d="M' + (x - 32) + ' ' + y + ' V' + (y + 46) + ' H' + (x + 32) + ' V' + y + '" fill="none" stroke="' + C.glass + '" stroke-width="2.5"/>' +
    '<rect x="' + (x + 18) + '" y="' + (y - 40) + '" width="5" height="78" rx="2.5" fill="#fff" stroke="' + C.glass + '"/><circle cx="' + (x + 20.5) + '" cy="' + (y + 38) + '" r="4" fill="' + C.fire + '"/>';
}
SCENES['c7-ice'] = () => svg(
  '<rect y="270" width="400" height="30" fill="' + C.gray2 + '"/>' +
  beaker(200, 150, 'ice') + '<rect x="160" y="196" width="80" height="6" fill="' + C.glass + '"/>' +
  burner(200, 220, C.fire, 18) + T(200, 70, '同じ強さで、熱し続ける', 13, C.ink), C.gray);

// 加熱曲線：−20 ℃ → 0 ℃ で平ら（融解）→ 100 ℃ で平ら（沸騰）
const GX = 150, GY = 250, GW = 220, GH = 190;   // グラフの左下と大きさ（温度 −20〜120 ℃、時間 0〜10）
const gx = s => GX + GW * s / 10, gy = c => GY - GH * (c + 20) / 140;
const tempAt = s => s < 1 ? -20 + 20 * s : s < 3 ? 0 : s < 6 ? (s - 3) * 100 / 3 : s < 9 ? 100 : 100 + (s - 9) * 10;
const stateAt = s => s < 1 ? 'ice' : s < 3 ? 'melt' : s < 6 ? 'water' : 'boil';
function curveAxes(){
  return '<rect x="' + (GX - 36) + '" y="40" width="' + (GW + 52) + '" height="' + (GY - 22) + '" rx="8" fill="#fff" stroke="' + C.gray2 + '" stroke-width="2"/>' +
    '<path d="M' + GX + ' ' + (GY - GH - 6) + ' V' + GY + ' H' + (GX + GW + 6) + '" fill="none" stroke="' + C.ink + '" stroke-width="2"/>' +
    [0, 100].map(c => '<line x1="' + GX + '" x2="' + (GX + GW) + '" y1="' + gy(c) + '" y2="' + gy(c) + '" stroke="' + C.gray2 + '" stroke-dasharray="4 4"/>' + T(GX - 4, gy(c) + 4, c, 11, C.muted, 'end')).join('') +
    T(GX - 4, 58, '温度〔℃〕', 11, C.muted, 'start') + T(GX + GW, GY + 16, '熱した時間 →', 11, C.muted, 'end');
}
function curvePath(s){
  let d = 'M' + gx(0) + ' ' + gy(-20);
  for (let u = 0.05; u <= s + 1e-9; u += 0.05) d += ' L' + gx(u).toFixed(1) + ' ' + gy(tempAt(u)).toFixed(1);
  return d;
}
function curveDraw(root, t){
  const s = Math.min(10, t * 10 / 4);
  root.querySelector('[data-c]').setAttribute('d', curvePath(s));
  root.querySelector('[data-dot]').setAttribute('cx', gx(s)); root.querySelector('[data-dot]').setAttribute('cy', gy(tempAt(s)));
  root.querySelector('[data-l1]').setAttribute('opacity', s >= 3 ? 1 : 0);
  root.querySelector('[data-l2]').setAttribute('opacity', s >= 9 ? 1 : 0);
  const st = stateAt(s);
  root.querySelector('[data-b]').innerHTML = beaker(0, 0, st === 'melt' ? 'ice' : st);
  root.querySelector('[data-t]').textContent = Math.round(tempAt(s)) + ' ℃';
}
function curveScene(){
  return svg(curveAxes() +
    '<path data-c d="" fill="none" stroke="' + C.fire + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<circle data-dot r="5" fill="' + C.fire + '"/>' +
    T(gx(2), gy(0) - 8, '0 ℃ で平ら（とけている）', 11, C.coat, 'middle', ' data-l1 opacity="0"') +
    T(gx(7.5), gy(100) - 8, '100 ℃ で平ら（沸騰）', 11, C.coat, 'middle', ' data-l2 opacity="0"') +
    '<g transform="translate(330 196) scale(.6)"><g data-b></g></g>' +
    T(306, 182, '', 14, C.fire, 'middle', ' data-t'), C.gray);
}
SCENES['c7-curve'] = () => anim(curveScene(), 4, curveDraw, 'もう一度熱する');
SCENES['c7-curve-still'] = () => still(curveScene(), 4, curveDraw);

SCENES['c7-answer'] = answerCard('止まる！', 'とちゅうの 0 ℃ と 100 ℃ で、温度が止まる', 'clamp(26px,8.5vw,40px)');

// 粒のようす：固体はならんで小さくゆれる、液体は動き回る、気体は飛び回る
SCENES['c7-particles'] = () => {
  const box = (x, label) => '<rect x="' + x + '" y="70" width="74" height="120" rx="6" fill="#fff" stroke="' + C.glass + '" stroke-width="2"/>' + T(x + 37, 212, label, 13, C.ink);
  return anim(svg(box(150, '固体') + box(232, '液体') + box(314, '気体') + '<g data-p></g>' +
    T(273, 248, '粒の大きさは同じ。動き方がちがう', 12, C.muted), C.gray),
    6, (root, t) => {
      let s = '';
      const dot = (x, y) => '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="' + C.water + '" stroke="' + C.waterLine + '" stroke-width="1.5"/>';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)       // 固体：ならんで小さくゆれる
        s += dot(163 + i * 16 + Math.sin(t * 9 + i + j * 2) * 1.5, 132 + j * 15 + Math.cos(t * 8 + i * 3 + j) * 1.5);
      for (let k = 0; k < 14; k++) {                                 // 液体：くっついたまま動き回る
        const a = t * 1.2 + k * 0.9;
        s += dot(244 + ((k * 13 + Math.sin(a) * 8) % 50 + 50) % 50, 128 + ((k * 7) % 4) * 14 + Math.cos(a * 1.3) * 4);
      }
      for (let k = 0; k < 5; k++) {                                  // 気体：飛び回る
        const px = 326 + Math.abs(((k * 37 + t * 60) % 100) - 50), py = 82 + Math.abs(((k * 53 + t * 45) % 196) - 98);
        s += dot(px, py);
      }
      root.querySelector('[data-p]').innerHTML = s;
    }, 'もう一度見る');
};

// 三態の図と、矢印の名前
SCENES['c7-states'] = () => {
  const P = { s: [180, 236], l: [360, 236], g: [270, 72] };
  const node = (k, label) => '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="30" fill="' + C.cream + '" stroke="' + C.creamLine + '" stroke-width="2"/>' + T(P[k][0], P[k][1] + 5, label, 14, C.ink);
  const arr = (a, b, off, label, lx, ly) => {
    const [x1, y1] = P[a], [x2, y2] = P[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy * off, ny = ux * off;
    const sx = x1 + ux * 36 + nx, sy = y1 + uy * 36 + ny, ex = x2 - ux * 38 + nx, ey = y2 - uy * 38 + ny;
    return '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="' + C.fire + '" stroke-width="2.5" marker-end="url(#c7ar)"/>' + T(lx, ly, label, 12, C.fire);
  };
  return svg('<defs><marker id="c7ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="' + C.fire + '"/></marker></defs>' +
    node('s', '固体') + node('l', '液体') + node('g', '気体') +
    arr('s', 'l', -8, '融解 →', 270, 222) + arr('l', 's', -8, '← 凝固', 270, 266) +
    arr('l', 'g', -8, '蒸発', 344, 150) + arr('g', 'l', -8, '凝縮', 290, 168) +
    arr('s', 'g', 8, '昇華', 196, 150) + arr('g', 's', 8, '凝華', 250, 168), C.gray);
};

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '07',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: '物質の三態と状態変化',
  title: '氷がとけている間、温度は？',
  simUrl: '../sim/chem-heating-curve.html',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c7-ice', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'ビーカーの氷を、ずっと同じ強さで熱しておる。温度はどうなるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'up',   label: 'ずっと同じように上がる' },
          { key: 'stop', label: 'とちゅうで止まるところがある' },
          { key: 'down', label: 'だんだん下がる' }
        ],
        answer: 'stop'
      } },

    { bg: 'c7-ice', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        up:   { face: 'confident', text: '熱し続けてるんだから、ずっと上がるに決まってるよ。' },
        stop: { face: 'question',  text: '氷がとけるときに、何か起きそうな気がする…' },
        down: { face: 'confused',  text: '氷がとけると、冷たい水になって下がるのかな？' }
      } } },

    { bg: 'c7-ice', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        up:   { face: 'proud',    text: 'ふむ、よい問いじゃ。温度計の目もりを、グラフにしてみよう。' },
        stop: { face: 'question', text: 'ほう。では、温度計の目もりをグラフにして確かめよう。' },
        down: { face: 'think',    text: '下がるかどうか、温度計の目もりをグラフにしてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c7-curve', chars: [{ who: 'rika', face: 'surprise', side: 'left' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        up:   { face: 'surprise', text: 'え、そうなの？ 熱してるのに、温度が止まってる！' },
        stop: { face: 'happy',    text: 'やっぱり！ 0 ℃ と 100 ℃ で、温度が止まった！' },
        down: { face: 'surprise', text: 'え、そうなの？ 下がらない。とちゅうで止まってる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'c7-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 0 ℃ と 100 ℃ で、温度が止まる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「とちゅうで止まるところがある」。0 ℃ と 100 ℃ じゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c7-curve-still', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '0 ℃ では氷と水がまざっておる。100 ℃ では沸騰しておる。' },

    { bg: 'c7-particles', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '固体の粒はならんでゆれ、液体は動き回り、気体は飛び回る。' },

    { bg: 'c7-particles', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton', text: '止まっている間、熱は、粒どうしのつながりを切るのに使われておる。だから温度が上がらんのじゃ。' },

    { bg: 'c7-states', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '状態が変わることには、それぞれ名前があるぞ。' },

    { bg: 'c7-states', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '1気圧なら、水は 0 ℃ でとけ、100 ℃ で沸騰する。この温度を、融点・沸点というのじゃ。' },

    { bg: 'c7-states', chars: [{ who: 'rika', face: 'question', side: 'left' }],
      speaker: 'rika', text: '金を熱してとかしたら、別のものになる？' },

    { bg: 'c7-states', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'とけても、固まれば金にもどる。状態が変わるだけで、物質は金のままじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '熱する強さを変えて、グラフの平らなところを見てみよう。',
      points: [
        '物質には、固体・液体・気体の3つの状態（三態）がある',
        '状態が変わっている間は、温度は変わらない（水は 0 ℃ と 100 ℃）',
        '融解・凝固・蒸発・凝縮・昇華・凝華'
      ] }
  ]
};
})();
