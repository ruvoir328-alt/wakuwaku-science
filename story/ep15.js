/* わくわく物理基礎 ストーリーモード
   第15話「重いほうが、強く引っぱられるのに？」（新編物理基礎 1編2章 運動方程式と落下運動）

   書き方は第6話（ep06.js）と同じ。第6話の「その謎は2章で」の答え合わせの回。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
   数値は sim/fall-force.html とそろえる：鉄球 2.0 kg → W = 19.6 N、a = 9.8 m/s²。羽根 0.0050 kg → W = 0.049 N
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
  const id = 'ep15a' + (++uid);
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
// 矢印（x1,y1 → x2,y2）。力の色：重力＝紺、空気の抵抗＝#b47a44
function arrow(x1, y1, x2, y2, color, w, extra){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2) return '';
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(12, L * 0.6);
  const bx = x2 - ux * h, by = y2 - uy * h;
  return '<g' + (extra || '') + '><line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * h * 0.8).toFixed(1) + '" y2="' + (y2 - uy * h * 0.8).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 5) + '" stroke-linecap="round"/>' +
    '<path d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + (bx - uy * h * 0.6).toFixed(1) + ' ' + (by + ux * h * 0.6).toFixed(1) + ' L' + (bx + uy * h * 0.6).toFixed(1) + ' ' + (by - ux * h * 0.6).toFixed(1) + 'z" fill="' + color + '"/></g>';
}
function feather(x, y){
  return '<g transform="translate(' + x + ',' + y + ') rotate(-20)"><ellipse rx="16" ry="6" fill="#fff7e9" stroke="#e9c48f" stroke-width="2"/><line x1="-18" x2="16" y1="0" y2="0" stroke="#b47a44" stroke-width="1.5"/></g>';
}
const BALL = '#4b5568';

/* ---- この話の絵 ---- */
// 真空の筒で、鉄球（2.0 kg）と羽根を同時に落とす。重力の矢印はちがうが、加速度の矢印は同じ
// 筒の高さ 1.225 m を 0.50 秒で落ちる（y = ½gt²）。アニメは4倍ゆっくり（2.0 秒）
const TUBE = { x: 50, y: 30, w: 170, h: 190 }, Y0 = 62, Y1 = 204;
SCENES['e15-fall'] = () => anim(svg(
  '<rect y="222" width="400" height="78" fill="#d6dce6"/>' +
  '<rect x="' + TUBE.x + '" y="' + TUBE.y + '" width="' + TUBE.w + '" height="' + TUBE.h + '" rx="14" fill="rgba(190,225,250,.45)" stroke="#86aac4" stroke-width="3"/>' +
  '<rect x="' + (TUBE.x - 6) + '" y="' + (TUBE.y - 6) + '" width="' + (TUBE.w + 12) + '" height="12" rx="4" fill="#9aa9b8"/>' +
  T(135, 240, '真空（空気なし）　下向きを正とする', 11, '#4b5568') +
  '<g data-ball></g><g data-fea></g>' +
  T(135, 262, '', 13, '#d93a3f', 'middle', ' data-t'), '#eef2f7'),
  2.4, (root, t) => {
    const tt = Math.min(0.5, t / 4);                      // 本当の時間（0〜0.50 s）
    const y = Y0 + (Y1 - Y0) * (0.5 * 9.8 * tt * tt) / 1.225;
    root.querySelector('[data-ball]').innerHTML =
      '<circle cx="95" cy="' + y.toFixed(1) + '" r="13" fill="' + BALL + '"/>' +
      (t < 2 ? arrow(95, y + 14, 95, y + 64, '#22305a', 5) + T(80, y + 50, 'W', 12, '#22305a', 'end') + T(80, y + 64, '19.6 N', 11, '#22305a', 'end') : '');
    root.querySelector('[data-fea]').innerHTML = feather(170, y) +
      (t < 2 ? arrow(170, y + 8, 170, y + 13, '#22305a', 3) + T(150, y + 26, 'W 0.049 N', 10, '#22305a', 'start') : '');
    root.querySelector('[data-t]').textContent = t >= 2 ? '0.50秒で、同時に底へ！' : (tt.toFixed(2) + '秒');
  }, 'もう一度落とす');

// 重力の矢印をくらべる（鉄球は長く、羽根は小さくて見えないほど）
SCENES['e15-weight'] = () => svg(
  '<rect y="252" width="400" height="48" fill="#d6dce6"/>' +
  '<circle cx="220" cy="64" r="20" fill="' + BALL + '"/>' + T(220, 34, '鉄球 2.0 kg', 13) +
  arrow(220, 86, 220, 226, '#22305a', 6) + T(234, 170, 'W 19.6 N', 15, '#22305a', 'start') +
  T(234, 190, '2.0 × 9.8', 12, '#6b7488', 'start') +
  feather(340, 64) + T(340, 34, '羽根 0.0050 kg', 12) +
  arrow(340, 74, 340, 80, '#22305a', 3) + T(340, 104, 'W 0.049 N', 12, '#22305a') + T(340, 122, '（小さくて', 11, '#6b7488') + T(340, 138, '　ほぼ見えない）', 11, '#6b7488'),
  '#eef2f7');

// 黒板：ma = mg → a = g（第6話の formula と同じ黒板）
SCENES['e15-board'] = () => svg(
  '<rect x="150" y="30" width="236" height="206" rx="8" fill="#2f5b4e" stroke="#7e5129" stroke-width="8"/>' +
  '<text x="268" y="72" text-anchor="middle" font-size="24" fill="#fff" font-family="Times New Roman" font-style="italic">ma = mg</text>' +
  T(268, 98, '両辺を m で割ると', 12, '#cfd7ee') +
  '<text x="268" y="132" text-anchor="middle" font-size="28" fill="#ffe14a" font-family="Times New Roman" font-style="italic">a = g</text>' +
  '<line x1="176" x2="360" y1="150" y2="150" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>' +
  T(268, 178, '鉄球 2.0 kg：2.0 × a = 19.6', 13, '#fff') +
  T(268, 204, '→ a = 9.8 m/s²', 15, '#ffe14a') +
  T(268, 226, '（羽根も 9.8 m/s²）', 11, '#cfd7ee') +
  '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');

// 空気の中の羽根：速くなるほど抵抗 R が大きくなり、重力 W とつりあうと速さが一定（終端速度）
// 形だけ：v = VT(1 − e^(−t/τ))、R = W × v / VT（数値の計算はしない）
SCENES['e15-air'] = () => anim(svg(
  '<rect x="150" y="30" width="80" height="222" rx="12" fill="#e9f6fc" stroke="#bfe2f6" stroke-width="3"/>' +
  T(190, 270, '空気の中', 12, '#4b5568') +
  '<g data-fea></g>' +
  // v-t グラフ（右）
  '<rect x="246" y="40" width="144" height="150" rx="6" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' +
  '<path d="M262 56 V172 H380" fill="none" stroke="#1f2638" stroke-width="1.5"/>' +
  T(266, 56, 'v', 12, '#6b7488', 'start', ' font-style="italic"') + T(380, 186, 't', 12, '#6b7488', 'end', ' font-style="italic"') +
  '<path data-curve d="" fill="none" stroke="#b47a44" stroke-width="3"/>' +
  T(318, 214, '', 12, '#7e5129', 'middle', ' data-msg') + T(318, 232, '', 12, '#7e5129', 'middle', ' data-msg2') +
  '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7'),
  4, (root, t) => {
    const tau = 0.7, k = 1 - Math.exp(-t / tau);           // v ÷ 終端速度（0 → 1）
    const pos = s => s - tau * (1 - Math.exp(-s / tau));    // 進んだきょり（形だけ）
    const fy = 66 + 110 * pos(t) / pos(4);
    root.querySelector('[data-fea]').innerHTML = feather(190, fy) +
      arrow(190, fy + 8, 190, fy + 54, '#22305a', 4) + T(204, fy + 50, 'W', 12, '#22305a', 'start') +
      (k > 0.05 ? arrow(190, fy - 8, 190, fy - 8 - 46 * k, '#b47a44', 4) + T(176, fy - 20, 'R', 12, '#b47a44', 'end') : '');
    let d = '';
    for (let s = 0; s <= t + 1e-9; s += 0.05){
      const px = 262 + 112 * s / 4, py = 172 - 96 * (1 - Math.exp(-s / tau));
      d += (d ? ' L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
    }
    root.querySelector('[data-curve]').setAttribute('d', d);
    root.querySelector('[data-msg]').textContent = k > 0.95 ? '抵抗 R ＝ 重力 W' : '速くなると、抵抗 R も大きく';
    root.querySelector('[data-msg2]').textContent = k > 0.95 ? '→ 速さが一定（終端速度）' : '';
  }, 'もう一度落とす');

SCENES['e15-answer'] = answerCard('9.8 m/s²！', '鉄球も羽根も、加速度は g', 'clamp(22px,7.5vw,34px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '15',
  chapter: '2章 力と運動の法則',
  topic: '運動方程式と落下運動',
  title: '重いほうが、強く引っぱられるのに？',
  simUrl: '../sim/fall-force.html',
  drillUrls: [
    { url: '../physics/drill.html?unit=2-3', label: '運動方程式' },
    { url: '../physics/drill.html?unit=1-4', label: '自由落下' }
  ],
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'tube-vacuum', chars: [{ who: 'rika', face: 'question', side: 'right' }],
      speaker: 'rika', text: '鉄球のほうが、ずっと強く地球に引っぱられてるはずなのに…。' },

    { bg: 'tube', chars: [{ who: 'newton', face: 'question', side: 'left' }, { who: 'rika', face: 'question', side: 'right' }],
      speaker: 'newton', text: '第6話でやくそくした謎じゃな。2.0 kg の鉄球の加速度は、いくつになるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'big', label: '羽根より大きい' },
          { key: 'same', label: '羽根と同じ 9.8 m/s²' },
          { key: 'small', label: '羽根より小さい' }
        ],
        answer: 'same'
      } },

    { bg: 'tube', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        big:   { face: 'confident', text: '重力が大きいんだから、加速度も大きいはず！' },
        same:  { face: 'question',  text: '第6話で同時に落ちたから、同じ…だよね？ でも、なんでだろう。' },
        small: { face: 'confused',  text: '重いと動きにくいから、小さくなる…のかな？' }
      } } },

    { bg: 'tube', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        big:   { face: 'proud',    text: 'ふむ、よい問いじゃ。わしの運動方程式に聞いてみよう。' },
        same:  { face: 'question', text: 'ほう。その「なんで」を、わしの運動方程式に聞いてみよう。' },
        small: { face: 'think',    text: '動きにくさに目をつけたか。わしの運動方程式に聞いてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e15-fall', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        big:   { face: 'surprise', text: 'え、そうなの？ 重力の矢印はぜんぜんちがうのに、同時に落ちた…！' },
        same:  { face: 'happy',    text: 'やっぱり同時！ 重力の矢印は、こんなにちがうのにね。' },
        small: { face: 'surprise', text: 'あれ？ 鉄球も遅れない。羽根と同時に落ちた！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e15-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 鉄球の加速度も、羽根と同じ 9.8 m/s²。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「羽根と同じ 9.8 m/s²」。重さによらず、加速度は g なのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e15-weight', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'たしかに、鉄球の重力は 2.0 × 9.8 = 19.6 N。羽根よりずっと大きい。' },

    { bg: 'e15-board', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'だが、重いものは動かしにくい。ma = mg の両辺を m で割ると、a = g。質量が消えるのじゃ。' },

    { bg: 'e15-board', chars: [{ who: 'rika', face: 'idea', side: 'left' }],
      speaker: 'rika', text: 'え、そうなの？ 重いほど強く引かれるけど、そのぶん動きにくいから、おあいこなんだ！' },

    { bg: 'e15-air', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton', text: '空気の中では、速くなるほど抵抗が大きくなる。' },

    { bg: 'e15-air', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '重力とつりあうと、速さは一定になる。これが『終端速度』じゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '質量を変えて落とし、力と加速度の矢印をくらべよう。',
      points: [
        '重力 W = mg は、質量に比例する',
        'でも加速度は、質量によらず g（ma = mg → a = g）',
        'だから重さによらず、同じように落ちる（第6話の謎の答え）'
      ] }
  ]
};
})();
