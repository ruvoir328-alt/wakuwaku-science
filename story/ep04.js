/* わくわく物理基礎 ストーリーモード
   第4話「電車の中で走ると？」（新編物理基礎 1編1章 4 合成速度と相対速度）

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
  const id = 'ep04a' + (++uid);
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
// ドリルがまだないので、ドリルのボタンを「準備中」にする
function soonEnds(){
  const box = document.getElementById('choices');
  new MutationObserver(() => {
    const go = box.querySelector('.ends a[href="undefined"]');
    if (!go) return;
    const b = document.createElement('button');
    b.className = 'soon'; b.disabled = true; b.textContent = 'チャレンジモード（準備中）';
    go.replaceWith(b);
  }).observe(box, { childList: true });
}

/* ---- この話の絵 ---- */
function train(x, y, w, color, label){
  let win = '';
  for (let k = 0; k < Math.floor((w - 20) / 26); k++) win += '<rect x="' + (x + 12 + k * 26) + '" y="' + (y + 6) + '" width="18" height="12" rx="2" fill="#bfe2f6"/>';
  return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="30" rx="7" fill="' + color + '"/>' + win +
    '<circle cx="' + (x + 22) + '" cy="' + (y + 31) + '" r="4" fill="#59616f"/><circle cx="' + (x + w - 22) + '" cy="' + (y + 31) + '" r="4" fill="#59616f"/>' +
    (label ? T(x + w / 2, y + 27, label, 9, '#fff') : '') + '</g>';
}
function arrow(x1, x2, y, color, w){
  const d = x2 > x1 ? 1 : -1;
  if (Math.abs(x2 - x1) < 12) return '';
  return '<line x1="' + x1 + '" x2="' + (x2 - d * 10) + '" y1="' + y + '" y2="' + y + '" stroke="' + color + '" stroke-width="' + (w || 5) + '"/>' +
    '<path d="M' + x2 + ' ' + y + ' l' + (-d * 14) + ' -9 v18z" fill="' + color + '"/>';
}
const RAIL = y => '<rect x="0" y="' + y + '" width="400" height="5" fill="#9aa9b8"/>';

// 問題：東へ20 m/s の電車の中を、リカが2 m/s で歩く
SCENES['e4-train'] = () => svg(SKY +
  '<rect y="106" width="400" height="194" fill="#d6dce6"/>' + RAIL(101) +
  train(60, 66, 280, '#22305a') + '<circle cx="190" cy="78" r="7" fill="#d93a3f"/>' +
  arrow(150, 270, 50, '#22305a', 4) + T(210, 40, '電車　東へ 20 m/s', 13, '#22305a') +
  arrow(196, 226, 78, '#d93a3f', 3) +
  T(200, 136, 'ホーム', 13, '#6b7488') +
  T(200, 168, '車内でリカが', 13, '#d93a3f') + T(200, 188, '東へ 2 m/s で歩く', 13, '#d93a3f'));

// ホームから見ると：1秒で電車は20 m、リカは22 m 進む（1 m = 8 px、ゆっくり再生）
const PM = 8, TX = 12, RX = 40;
SCENES['e4-ground'] = () => anim(svg(SKY +
  '<rect y="106" width="400" height="194" fill="#d6dce6"/>' + RAIL(101) +
  '<g opacity=".25">' + train(TX, 66, 180, '#22305a') + '<circle cx="' + RX + '" cy="78" r="7" fill="#d93a3f"/></g>' +
  '<g data-tr>' + train(TX, 66, 180, '#22305a') + '</g><circle data-rk cx="' + RX + '" cy="78" r="7" fill="#d93a3f"/>' +
  T(110, 40, '0秒', 16, '#1f2638', 'middle', ' data-time') +
  '<g data-res opacity="0">' + arrow(TX, TX + 20 * PM, 124, '#22305a', 4) + T(TX + 10 * PM, 146, '電車 20 m', 13, '#22305a') +
    arrow(RX, RX + 22 * PM, 166, '#d93a3f', 4) + T(RX + 11 * PM, 188, 'リカ 22 m', 13, '#d93a3f') + '</g>'),
  3, (root, t) => {
    const s = t / 3;                           // 1秒間をゆっくり見せる
    root.querySelector('[data-tr]').setAttribute('transform', 'translate(' + (20 * s * PM).toFixed(1) + ',0)');
    root.querySelector('[data-rk]').setAttribute('cx', (RX + 22 * s * PM).toFixed(1));
    root.querySelector('[data-time]').textContent = s.toFixed(1) + '秒';
    root.querySelector('[data-res]').setAttribute('opacity', t >= 3 ? 1 : 0);
  }, 'もう一度見る');

// 矢印をつなぐ：20 + 2 = 22（1 m/s = 9 px）
SCENES['e4-add'] = () => svg(
  T(388, 34, '東（正の向き）→', 12, '#d93a3f', 'end') +
  arrow(150, 150 + 20 * 9, 70, '#22305a', 6) + T(150 + 10 * 9, 58, '電車 20', 14, '#22305a') +
  arrow(150 + 20 * 9, 150 + 22 * 9, 70, '#d93a3f', 6) + T(150 + 21 * 9 + 8, 96, 'リカ 2', 14, '#d93a3f') +
  arrow(150, 150 + 22 * 9, 134, '#7e5129', 8) + T(150 + 11 * 9, 160, '合成速度 22 m/s', 16, '#7e5129') +
  '<rect x="150" y="184" width="236" height="40" rx="10" fill="#fff7e9" stroke="#e9c48f" stroke-width="2"/>' +
  T(268, 210, '20 + 2 = 22 m/s', 17, '#7e5129'), '#fff');

// 隣の電車（25 m/s）を、20 m/s の電車の中から見る。景色は左へ20 m/s、隣の電車は右へ5 m/s（1 m = 6 px）
SCENES['e4-pass'] = () => anim(svg(SKY +
  '<g data-poles></g>' + RAIL(76) + RAIL(108) +
  '<g data-nb>' + train(0, 45, 150, '#7e5129', '隣の電車') + '</g>' +
  train(-20, 77, 440, '#22305a') +
  '<rect y="114" width="400" height="186" fill="#eef2f7"/>' + T(200, 132, '↑ わたしの電車', 12, '#22305a') +
  T(200, 160, 'わたしから見ると', 12, '#6b7488') + T(200, 182, '隣の電車 →5 m/s', 13, '#7e5129') +
  T(200, 204, '景色 ←20 m/s', 12, '#6b7488')),
  4, (root, t) => {
    root.querySelector('[data-nb]').setAttribute('transform', 'translate(' + (20 + 5 * t * 6).toFixed(1) + ',0)');
    let p = '';
    const off = (20 * t * 6) % 80;
    for (let x = 400 + 80; x > -80; x -= 80){
      const px = (x - off).toFixed(1);
      p += '<rect x="' + px + '" y="30" width="4" height="78" fill="#9aa9b8"/><rect x="' + (px - 6) + '" y="30" width="16" height="4" fill="#9aa9b8"/>';
    }
    root.querySelector('[data-poles]').innerHTML = p;
  }, 'もう一度見る');

function board(lines){
  let s = '<rect x="140" y="30" width="246" height="190" rx="8" fill="#2f5b4e" stroke="#7e5129" stroke-width="8"/>';
  lines.forEach(([y, str, size, fill]) => { s += T(263, y, str, size || 18, fill || '#fff'); });
  return svg(s + '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');
}
SCENES['e4-relative'] = () => board([
  [64, '自分から見た相手の速度', 14, '#ffd6d7'],
  [108, '相対速度 ＝ 相手 − 自分', 18],
  [152, '25 − 20 = 5 m/s', 22],
  [196, 'v<tspan font-size="11" dy="4">AB</tspan><tspan dy="-4"> = v</tspan><tspan font-size="11" dy="4">B</tspan><tspan dy="-4"> − v</tspan><tspan font-size="11" dy="4">A</tspan>', 16, '#cfd7ee']
]);

SCENES['e4-answer'] = answerCard('22 m/s！', 'ホームから見ると', 'clamp(28px,9vw,44px)');

soonEnds();

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '04',
  chapter: '1章 直線運動の世界',
  topic: '合成速度と相対速度',
  title: '電車の中で走ると？',
  simUrl: '../sim/relative-velocity.html',
  scenes: [
    { bg: 'title' },

    { bg: 'e4-train', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '電車が東へ秒速20 mで走っておる。車内では、リカくんが進行方向へ秒速2 mで歩いておる。' },

    /* ---- 謎と予想 ---- */
    { bg: 'e4-train', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'ホームで見ているわしには、リカくんの速さはいくつに見えるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'v2', label: '2 m/s' },
          { key: 'v20', label: '20 m/s' },
          { key: 'v22', label: '22 m/s' },
          { key: 'v18', label: '18 m/s' }
        ],
        answer: 'v22'
      } },

    { bg: 'e4-train', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        v2:  { face: 'confident', text: '2 m/sでしょ？ 私は秒速2 mでしか歩いてないよ？' },
        v20: { face: 'question',  text: '電車と同じ20 m/s…かな？' },
        v22: { face: 'idea',      text: '電車の20と、わたしの2で、22 m/s？' },
        v18: { face: 'question',  text: '電車の中だから、引き算して18 m/s…？' }
      } } },

    { bg: 'e4-train', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        v2:  { face: 'proud',    text: 'それは電車から見た速さじゃ。だが地面から見ると、電車ごと運ばれている。' },
        v20: { face: 'think',    text: '電車だけなら20 m/sじゃ。だがリカくんは、その中で歩いておるぞ。' },
        v22: { face: 'question', text: 'ほう、自信がありそうじゃな。ホームから見て、確かめてみよう。' },
        v18: { face: 'think',    text: 'ふむ、リカくんは進行方向へ歩いておるぞ。ホームから見て、確かめてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e4-ground', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        v2:  { face: 'surprise', text: 'え、そうなの？ ホームから見ると、1秒で22 mも進んでる！' },
        v20: { face: 'surprise', text: 'あれ？ 電車より、1秒で2 mだけ先に進んでる！' },
        v22: { face: 'happy',    text: 'やっぱり！ 電車の20 mより2 m先、1秒で22 m進んでる！' },
        v18: { face: 'surprise', text: 'え、そうなの？ 引き算じゃなくて、電車より先に進んでる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e4-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 電車の20 m/sに、歩く2 m/sが足されて22 m/sじゃ。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「22 m/s」。電車ごと運ばれるので、速度が足されるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e4-add', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '速度は足し算できる。20 + 2 = 22 m/s。これが『合成速度』じゃ。' },

    { bg: 'e4-pass', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'newton', text: '今度は、隣の線路を電車が同じ向きに秒速25 mで追い抜いていくぞ。' },

    { bg: 'e4-pass', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika', text: '隣の電車、ゆっくり追い抜いていくように見える！' },

    { bg: 'e4-relative', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '自分から見た相手の速度が『相対速度』。相手 − 自分 ＝ 25 − 20 = 5 m/s じゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '向きが逆のときも試してみるかね？',
      points: [
        '合成速度：速度は足し算できる',
        '相対速度：相手の速度 − 自分の速度',
        '正の向きを決めて、＋と−で計算する'
      ] }
  ]
};
})();
