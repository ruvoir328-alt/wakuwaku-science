/* わくわく化学基礎 ストーリーモード
   化学 第1話「透明な水は、純粋？」（化学基礎 1編1章 物質の成分と構成元素：純物質と混合物）

   書き方は物理の各話（ep03.js など）と同じ。脚本の原本は docs/chem-story-ch1.md。
   subject: '化学基礎' で、舞台の名札が「わくわく化学基礎」になる。
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
  const id = 'chem01a' + (++uid);
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

/* ---- 化学の実験の道具（化学1章の各話で同じ。色：水＝空 #bfe2f6、白い固体＝#fff、砂＝木 #b47a44、ガラスのふち＝#6b7488、炎＝赤とレモン） ---- */
const NAVY = '#22305a', RED = '#d93a3f', INK = '#1f2638', MUTED = '#6b7488', WOOD = '#b47a44', WOODD = '#7e5129';
const WATER = '#bfe2f6', GLASS = '#6b7488', LEMON = '#ffe14a', CREAM = '#fff7e9', CREAML = '#e9c48f';
// 理科室（壁と机）
const LAB = '<rect width="400" height="300" fill="#eef2f7"/><rect y="236" width="400" height="64" fill="#d6dce6"/><rect y="230" width="400" height="8" fill="' + WOOD + '"/>';
// ビーカー（左下 x, 底 y、はば w、高さ h、液の高さ lh、液の色）
function beaker(x, y, w, h, lh, liquid, extra){
  return (lh > 0 ? '<rect x="' + (x + 2) + '" y="' + (y - lh) + '" width="' + (w - 4) + '" height="' + lh + '" fill="' + (liquid || WATER) + '" opacity=".9"/>' : '') +
    (extra || '') +
    '<path d="M' + (x - 4) + ' ' + (y - h) + ' h6 M' + x + ' ' + (y - h) + ' V' + y + ' H' + (x + w) + ' V' + (y - h) + '" fill="none" stroke="' + GLASS + '" stroke-width="2.5" stroke-linejoin="round"/>';
}
// ガスバーナーの炎（中心 cx、上のはし y）
function flame(cx, y, s){
  s = s || 1;
  return '<path d="M' + cx + ' ' + y + ' q' + (10 * s) + ' ' + (14 * s) + ' 0 ' + (24 * s) + ' q' + (-10 * s) + ' ' + (-10 * s) + ' 0 ' + (-24 * s) + 'z" fill="' + RED + '"/>' +
    '<path d="M' + cx + ' ' + (y + 8 * s) + ' q' + (5 * s) + ' ' + (8 * s) + ' 0 ' + (16 * s) + ' q' + (-5 * s) + ' ' + (-6 * s) + ' 0 ' + (-16 * s) + 'z" fill="' + LEMON + '"/>';
}
function burner(cx, y){       // y：炎の上のはし
  return flame(cx, y) + '<rect x="' + (cx - 6) + '" y="' + (y + 24) + '" width="12" height="' + (230 - y - 30) + '" fill="' + MUTED + '"/><rect x="' + (cx - 16) + '" y="224" width="32" height="6" rx="2" fill="' + NAVY + '"/>';
}
// 表（見出しと、左右2列）
function sortTable(x, y, w, leftHead, rightHead, left, right){
  const half = w / 2, rows = Math.max(left.length, right.length), rh = 26;
  let s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (34 + rows * rh) + '" rx="8" fill="#fff" stroke="' + CREAML + '" stroke-width="2"/>' +
    '<rect x="' + x + '" y="' + y + '" width="' + half + '" height="30" rx="8" fill="' + NAVY + '"/><rect x="' + (x + half) + '" y="' + y + '" width="' + half + '" height="30" rx="8" fill="' + RED + '"/>' +
    T(x + half / 2, y + 20, leftHead, 14, '#fff') + T(x + half * 1.5, y + 20, rightHead, 14, '#fff') +
    '<line x1="' + (x + half) + '" x2="' + (x + half) + '" y1="' + (y + 30) + '" y2="' + (y + 34 + rows * rh) + '" stroke="' + CREAML + '" stroke-width="1.5"/>';
  left.forEach((s2, i) => { s += T(x + half / 2, y + 52 + i * rh, s2, 13, INK); });
  right.forEach((s2, i) => { s += T(x + half * 1.5, y + 52 + i * rh, s2, 13, INK); });
  return s;
}

/* ---- この話の絵 ---- */
// 場面1：同じ形のビーカーが2つ。どちらも透明
function twoBeakers(labelA, labelB){
  return LAB + beaker(50, 230, 70, 90, 62) + beaker(160, 230, 70, 90, 62) +
    T(85, 128, labelA, 15, NAVY) + T(195, 128, labelB, 15, NAVY) +
    T(140, 40, 'どちらも、とうめいな液体', 14, INK);
}
SCENES['c1-beakers'] = () => svg(twoBeakers('A', 'B'));
SCENES['c1-which'] = () => svg(twoBeakers('水？', '海の水？'));

// 場面3：2つのビーカーを熱して、温度のグラフをくらべる（10分間）
// 水（純水）：20 ℃ → 4分で 100 ℃、そのあと 100 ℃ で一定（沸点が決まっている）
// 海の水：沸騰が始まるのは 100 ℃ より少し上（約 101 ℃）。水が減って濃くなるので、上がり続ける（上がり方は絵のための形）
const GX = 40, GW = 220, GY0 = 250, GH = 170, TMIN = 20, TMAX = 110;
const gx = m => GX + GW * m / 10, gy = c => GY0 - GH * (c - TMIN) / (TMAX - TMIN);
const pure = m => m < 4 ? 20 + 20 * m : 100;
const sea = m => m < 4.05 ? 20 + 20 * m : 101 + 0.9 * (m - 4.05);
function curve(f, m1){
  let d = '';
  for (let k = 0; k <= 100; k++){ const m = m1 * k / 100; d += (k ? ' L' : 'M') + gx(m).toFixed(1) + ' ' + gy(f(m)).toFixed(1); }
  return d;
}
SCENES['c1-heat'] = () => {
  let grid = '';
  [20, 40, 60, 80, 100].forEach(c => { grid += '<line x1="' + GX + '" x2="' + (GX + GW) + '" y1="' + gy(c) + '" y2="' + gy(c) + '" stroke="#dfe4ee"/>' + T(GX - 4, gy(c) + 4, c, 10, MUTED, 'end'); });
  for (let m = 2; m <= 10; m += 2) grid += T(gx(m), GY0 + 14, m, 10, MUTED);
  return anim(svg(
    '<rect x="' + GX + '" y="' + (GY0 - GH) + '" width="' + GW + '" height="' + GH + '" fill="#fff"/>' + grid +
    '<line x1="' + GX + '" x2="' + (GX + GW) + '" y1="' + gy(100) + '" y2="' + gy(100) + '" stroke="' + MUTED + '" stroke-dasharray="4 3"/>' +
    '<path d="M' + GX + ' ' + (GY0 - GH - 6) + ' V' + GY0 + ' H' + (GX + GW + 6) + '" fill="none" stroke="' + INK + '" stroke-width="1.5"/>' +
    T(GX + 2, GY0 - GH - 10, '温度〔℃〕', 11, MUTED, 'start') + T(GX + GW, GY0 + 28, '熱した時間〔分〕', 11, MUTED, 'end') +
    '<path data-p d="" fill="none" stroke="' + NAVY + '" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path data-s d="" fill="none" stroke="' + RED + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="7 4"/>' +
    T(GX + GW - 4, gy(100) + 16, '水：100 ℃ で一定', 12, NAVY, 'end', ' data-kp opacity="0"') +
    T(GX + GW - 4, gy(107) - 6, '海の水：まだ上がる', 12, RED, 'end', ' data-ks opacity="0"') +
    T(GX + 4, 40, '0 分', 18, INK, 'start', ' data-time'), '#eef2f7'),
    4, (root, t) => {
      const m = 10 * t / 4;
      root.querySelector('[data-p]').setAttribute('d', m > 0 ? curve(pure, m) : '');
      root.querySelector('[data-s]').setAttribute('d', m > 0 ? curve(sea, m) : '');
      root.querySelector('[data-kp]').setAttribute('opacity', m >= 6 ? 1 : 0);
      root.querySelector('[data-ks]').setAttribute('opacity', m >= 8 ? 1 : 0);
      root.querySelector('[data-time]').textContent = Math.floor(m) + ' 分';
    }, 'もう一度熱する');
};

// 場面4：海の水を熱し続けると、底に白い粒（塩）が残る
SCENES['c1-salt'] = () => {
  let grains = '';
  for (let i = 0; i < 26; i++){ const x = 104 + (i * 37) % 64, y = 224 - (i % 3) * 5 - (i * 7) % 4; grains += '<rect x="' + x + '" y="' + y + '" width="5" height="5" fill="#fff" stroke="' + MUTED + '" stroke-width="1"/>'; }
  return svg(LAB + beaker(96, 230, 84, 100, 0, null, grains) + T(138, 70, '海の水を熱し続けると…', 13, INK) + T(138, 94, '白い粒（塩）が残った', 15, RED));
};

// 場面5：仕分けの表
SCENES['c1-table'] = () => svg(sortTable(12, 40, 270, '純物質', '混合物', ['水', '酸素', '塩化ナトリウム'], ['海水', '空気', '牛乳']) +
  T(147, 196, '純物質：1種類の物質だけ', 13, NAVY) + T(147, 218, '混合物：2種類以上がまざったもの', 13, RED), CREAM);

SCENES['c1-answer'] = answerCard('海の水だけ！', 'ほかのものがまざっている', 'clamp(24px,8vw,38px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '01',
  subject: '化学基礎',
  chapter: '1章 物質の成分と構成元素',
  topic: '純物質と混合物',
  title: '透明な水は、純粋？',
  simUrl: '../sim/chem-boiling.html',
  drillUrl: '../chemistry/drill.html?unit=化1-1',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'c1-beakers', chars: [{ who: 'newton', face: 'question', side: 'right' }],
      speaker: 'newton', text: '片方は水、もう片方は海の水じゃ。見た目では、わからんじゃろう？',
      choice: {
        id: 'q1',
        options: [
          { key: 'pure', label: 'どちらも純粋な水' },
          { key: 'sea',  label: '海の水だけ、ほかのものがまざっている' },
          { key: 'both', label: 'どちらもまざっている' }
        ],
        answer: 'sea'
      } },

    { bg: 'c1-which', chars: [{ who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        pure: { face: 'confident', text: '透明だから、どっちもただの水でしょ？' },
        sea:  { face: 'idea',      text: '海の水はしょっぱいから、何かまざってると思う！' },
        both: { face: 'question',  text: '水道の水だって、何か入ってそう。どっちもかな？' }
      } } },

    { bg: 'c1-which', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        pure: { face: 'think',    text: 'ふむ、見た目は同じじゃな。じゃが、見た目だけでは決められん。' },
        sea:  { face: 'proud',    text: 'ほう、よいところに気づいたの。では、確かめ方を考えよう。' },
        both: { face: 'question', text: 'ふむ、よい問いじゃ。では、どうやって見分けるかな？' }
      } } },

    { bg: 'c1-which', chars: [{ who: 'newton', face: 'think', side: 'right' }],
      speaker: 'newton', text: '実はな、わしはむかし、鉛から金を作ろうとしておった。『錬金術』じゃ。' },

    { bg: 'c1-which', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika', text: 'え、そうなの？ ニュートンくん、金を作れたの？' },

    { bg: 'c1-which', chars: [{ who: 'newton', face: 'oops', side: 'right' }],
      speaker: 'newton', text: '…その話は、あとでじゃ。まずは物質を見分けること。熱してみるのが一番じゃ。' },

    /* ---- アニメで確かめる ---- */
    { bg: 'c1-heat', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        pure: { face: 'surprise', text: 'え、そうなの？ 2本のグラフが、とちゅうから分かれた！' },
        sea:  { face: 'happy',    text: 'やっぱり！ 海の水のほうだけ、温度が上がり続けてる！' },
        both: { face: 'surprise', text: 'あれ？ 水のほうは、100 ℃ でぴたっと止まってる！' }
      } } },

    { bg: 'c1-heat', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '水は 100 ℃ になると、そこで温度が止まる。' },

    { bg: 'c1-heat', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '海の水は、100 ℃ をこえても、少しずつ上がり続けるのじゃ。' },

    { bg: 'c1-salt', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika', text: 'え、そうなの？ 透明なのに、塩がとけてたんだ！' },

    /* ---- 答え合わせ ---- */
    { bg: 'c1-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 海の水には、塩などがとけてまざっておる。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「海の水だけ」。透明でも、塩などがまざっておるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'c1-table', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '1種類の物質だけのものが『純物質』。2種類以上がまざったものが『混合物』じゃ。' },

    { bg: 'c1-heat', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '純物質は、沸点や融点が決まっておる。だから温度のグラフで見分けられるのじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '熱し方を変えて、温度のグラフをくらべてみよう。',
      points: [
        '純物質：1種類の物質だけでできたもの（水・酸素など）',
        '混合物：2種類以上の物質がまざったもの（海水・空気など）',
        '純物質は沸点・融点が決まっている。混合物は決まっていない'
      ] }
  ]
};
})();
