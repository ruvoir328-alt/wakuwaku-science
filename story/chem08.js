/* わくわく化学基礎 ストーリーモード
   化学 第8話「水が水蒸気になると、粒は大きくなる？」（東京書籍 化学基礎 1編1章 物質の成分と構成元素：熱運動と絶対温度）

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
  const id = 'chem08a' + (++uid);
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
  const id = 'chem08s' + (++uid);
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
const dot = (x, y, r) => '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r || 6) + '" fill="' + C.water + '" stroke="' + C.waterLine + '" stroke-width="1.5"/>';
// やかんの水蒸気を風船にとじこめると、ふくらむ
SCENES['c8-kettle'] = () => anim(svg(
  '<rect y="250" width="400" height="50" fill="' + C.gray2 + '"/>' +
  '<path d="M150 250 q0 -56 46 -56 q46 0 46 56 z" fill="' + C.glass + '"/><rect x="180" y="184" width="32" height="10" rx="4" fill="' + C.ink + '"/>' +
  '<path d="M232 222 l20 -24" stroke="' + C.glass + '" stroke-width="10" stroke-linecap="round"/>' +
  '<ellipse data-bl cx="254" cy="186" rx="8" ry="10" fill="' + C.fire + '" opacity=".85"/>' +
  T(200, 282, '水を熱して、水蒸気を風船へ', 13, C.ink), C.gray),
  3, (root, t) => {
    const k = Math.min(1, t / 2.8), b = root.querySelector('[data-bl]');
    b.setAttribute('rx', (8 + 22 * k).toFixed(1)); b.setAttribute('ry', (10 + 28 * k).toFixed(1));
    b.setAttribute('cx', '254'); b.setAttribute('cy', (186 - 38 * k).toFixed(1));
  }, 'もう一度ふくらませる');

// 粒の目で見る：水（液体）と水蒸気（気体）。粒の大きさも数も同じ、すきまが広がる
function modelDraw(root, t){
  let s = '';
  for (let i = 0; i < 12; i++) {                       // 水：つまっている
    s += dot(176 + (i % 4) * 13 + Math.sin(t * 5 + i) * 1.2, 196 + Math.floor(i / 4) * 13 + Math.cos(t * 4 + i) * 1.2);
  }
  for (let i = 0; i < 12; i++) {                       // 水蒸気：すきまが広く、飛び回る
    const px = 270 + Math.abs(((i * 41 + t * 70) % 200) - 100), py = 66 + Math.abs(((i * 67 + t * 55) % 300) - 150);
    s += dot(px, py);
  }
  root.querySelector('[data-p]').innerHTML = s;
}
SCENES['c8-model'] = () => anim(svg(
  '<rect x="160" y="180" width="70" height="60" rx="4" fill="#fff" stroke="' + C.glass + '" stroke-width="2"/>' +
  '<rect x="258" y="54" width="124" height="186" rx="6" fill="#fff" stroke="' + C.glass + '" stroke-width="2"/>' +
  '<g data-p></g>' + T(195, 262, '水（12こ）', 12, C.ink) + T(320, 262, '水蒸気（12こ）', 12, C.ink) +
  T(270, 288, '粒の大きさも数も同じ', 13, C.coat), C.gray), 4, modelDraw, 'もう一度見る');

SCENES['c8-answer'] = answerCard('粒は同じ！', '粒の大きさも数も同じ。すきまが広がる', 'clamp(22px,7vw,30px)');

// 水 1 g（約 1 mL）→ 100 ℃ の水蒸気 約 1.7 L
SCENES['c8-volume'] = () => svg(
  '<rect x="164" y="214" width="10" height="10" fill="' + C.water + '" stroke="' + C.waterLine + '"/>' + T(169, 246, '水 1 g', 12, C.ink) + T(169, 262, '約 1 mL', 12, C.muted) +
  '<path d="M190 219 h30" stroke="' + C.fire + '" stroke-width="3" marker-end="url(#c8ar)"/>' +
  '<defs><marker id="c8ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="' + C.fire + '"/></marker></defs>' +
  '<rect x="236" y="104" width="120" height="120" fill="#fff" stroke="' + C.waterLine + '" stroke-width="2" stroke-dasharray="6 4"/>' +
  T(296, 160, '水蒸気', 13, C.ink) + T(296, 180, '（100 ℃）', 11, C.muted) +
  T(296, 246, '約 1.7 L', 14, C.fire) + T(296, 262, '体積は千倍以上', 12, C.muted), C.gray);

// 熱運動：温度で粒の速さが変わる（高温→速い、低温→おそい、−273 ℃ で止まる）
function thermo(root, t, temps){
  // temps：[はじめの温度, 終わりの温度]（℃）。粒の速さは絶対温度に比例させる
  const k = Math.min(1, t / 3.5), tc = temps[0] + (temps[1] - temps[0]) * k, TK = tc + 273;
  const v = Math.sqrt(Math.max(0, TK) / 373);
  let s = '';
  for (let i = 0; i < 10; i++) {
    const amp = 26 * v;                                 // 動くはば（止まると 0）
    const x = 290 + Math.sin(t * 6 * v + i * 2.3) * amp * 1.4 + ((i % 5) - 2) * 18, y = 150 + Math.cos(t * 5 * v + i * 1.7) * amp + (Math.floor(i / 5) - 0.5) * 50;
    s += dot(x, y);
  }
  root.querySelector('[data-p]').innerHTML = s;
  const bar = root.querySelector('[data-bar]'), h = 150 * (TK) / 400;
  bar.setAttribute('y', (234 - h).toFixed(1)); bar.setAttribute('height', h.toFixed(1));
  root.querySelector('[data-tc]').textContent = Math.round(tc) + ' ℃';
  root.querySelector('[data-tk]').textContent = '= ' + Math.round(TK) + ' K';
}
function thermoScene(msg){
  return svg(
    '<rect x="214" y="70" width="160" height="160" rx="6" fill="#fff" stroke="' + C.glass + '" stroke-width="2"/>' +
    '<rect x="160" y="80" width="12" height="154" rx="6" fill="#fff" stroke="' + C.glass + '"/><rect data-bar x="162" y="160" width="8" height="74" fill="' + C.fire + '"/>' +
    '<circle cx="166" cy="240" r="9" fill="' + C.fire + '"/>' +
    T(166, 268, '', 13, C.ink, 'middle', ' data-tc') + T(166, 284, '', 12, C.muted, 'middle', ' data-tk') +
    '<g data-p></g>' + T(294, 256, msg, 13, C.coat), C.gray);
}
SCENES['c8-hot'] = () => anim(thermoScene('温度を上げると…'), 3.5, (r, t) => thermo(r, t, [0, 100]), 'もう一度見る');
SCENES['c8-cold'] = () => anim(thermoScene('温度を下げていくと…'), 3.5, (r, t) => thermo(r, t, [100, -273]), 'もう一度見る');
SCENES['c8-cold-still'] = () => still(thermoScene('−273 ℃ で、粒は止まる'), 3.5, (r, t) => thermo(r, t, [100, -273]));

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '08',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: '熱運動と絶対温度',
  title: '水が水蒸気になると、粒は大きくなる？',
  simUrl: '../sim/chem-particles.html',
  drillUrl: '../chemistry/drill.html?unit=化1-7',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c8-kettle', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: '水が水蒸気になると、体積はとても大きくなる。では、水の粒が大きくなったのかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'big',  label: '粒が大きくなった' },
          { key: 'more', label: '粒の数がふえた' },
          { key: 'gap',  label: '粒の大きさは同じで、すきまが広がった' }
        ],
        answer: 'gap'
      } },

    { bg: 'c8-kettle', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        big:  { face: 'confident', text: '風船がふくらむんだから、粒がふくらんだんでしょ？' },
        more: { face: 'question',  text: '粒がふえたから、体積が大きくなったのかな？' },
        gap:  { face: 'idea',      text: '粒はそのままで、あいだが広がったのかも…？' }
      } } },

    { bg: 'c8-kettle', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        big:  { face: 'proud',    text: 'ふむ、よい問いじゃ。では、粒の目で見てみよう。' },
        more: { face: 'think',    text: '水を足していないのに、ふえるかの？ 粒の目で見てみよう。' },
        gap:  { face: 'question', text: 'ほう、するどいの。粒の目で確かめてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'c8-model', chars: [{ who: 'rika', face: 'surprise', side: 'left' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        big:  { face: 'surprise', text: 'え、そうなの？ 粒の大きさは、水のときと同じだ！' },
        more: { face: 'surprise', text: 'え、そうなの？ 粒の数は 12 こで、同じまま！' },
        gap:  { face: 'happy',    text: 'やっぱり！ 粒は同じで、すきまが広がってる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'c8-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 粒の大きさは同じで、すきまが広がったのじゃ。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「すきまが広がった」。粒の大きさも数も同じじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c8-volume', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '水 1 g（約 1 mL）が、100 ℃ の水蒸気になると約 1.7 L。' },

    { bg: 'c8-volume', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '体積は千倍以上。でも、粒の数も大きさも変わらん。' },

    { bg: 'c8-hot', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '粒はいつも動いておる。これが『熱運動』じゃ。温度が高いほど、はげしく動く。' },

    { bg: 'c8-cold', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton', text: '温度を下げると、動きはだんだんおそくなり、−273 ℃ で止まる。' },

    { bg: 'c8-cold-still', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'この −273 ℃ を 0 とした温度が『絶対温度』。T = t + 273、単位は K じゃ。' },

    { bg: 'c8-cold-still', chars: [{ who: 'rika', face: 'surprise', side: 'left' }],
      speaker: 'rika', text: 'え、そうなの？ じゃあ 0 ℃ は 273 K なんだ！' },

    { bg: 'c8-model', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton', text: '熱しても、とかしても、粒の大きさも数も変わらん。では、金と鉛のちがいは、どこにあるのか…' },

    { bg: 'c8-model', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '次の章では、この粒の中をのぞくぞ。金が作れるかどうか、いよいよわかるはずじゃ！' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '温度を変えて、粒の動きを見てみよう。',
      points: [
        '物質をつくる粒は、いつも熱運動をしている',
        '温度が高いほど、はげしく動く。粒の大きさは変わらない',
        '絶対温度 T = t + 273（単位 K）。−273 ℃ ＝ 0 K'
      ] }
  ]
};
})();
