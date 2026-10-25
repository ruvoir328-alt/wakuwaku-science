/* わくわく物理基礎 ストーリーモード
   第13話「押したら、押し返される？」（新編物理基礎 1編2章 作用・反作用の法則）

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
  const id = 'ep13a' + (++uid);
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
const SKY = '<defs><linearGradient id="sky13" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky13)"/>';
// 矢印（x1,y1 → x2,y2）
function arrow(x1, y1, x2, y2, color, w, extra){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 3) return '';
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(11, L * 0.6);
  return '<g' + (extra || '') + '><line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * h * 0.8).toFixed(1) + '" y2="' + (y2 - uy * h * 0.8).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>' +
    '<path d="M' + x2 + ' ' + y2 + ' L' + (x2 - ux * h - uy * h * 0.55).toFixed(1) + ' ' + (y2 - uy * h + ux * h * 0.55).toFixed(1) + ' L' + (x2 - ux * h + uy * h * 0.55).toFixed(1) + ' ' + (y2 - uy * h - ux * h * 0.55).toFixed(1) + 'z" fill="' + color + '"/></g>';
}

/* ---- この話の絵 ---- */
// スケートリンク。リカ（50 kg）とニュートンくん（25 kg）。右向きを正とする
// リカが 100 N で 0.50 秒押す → ニュートンくん +2.0 m/s、リカ −1.0 m/s（同じ 100 N で押し返される）
const RX = 150, NX = 214, PM = 16;     // リカ・ニュートンくんの左はし（押す前）と 1 m の長さ
const FP = 100, MR = 50, MN = 25, TP = 0.5;
const offN = t => t < TP ? FP / MN * t * t / 2 : FP / MN * TP * TP / 2 + FP / MN * TP * (t - TP);
const offR = t => -(t < TP ? FP / MR * t * t / 2 : FP / MR * TP * TP / 2 + FP / MR * TP * (t - TP));
function rink(){
  let s = '<rect width="400" height="300" fill="#e9f6fc"/><rect y="200" width="400" height="100" fill="#d6dce6"/><line x1="0" x2="400" y1="200" y2="200" stroke="#bfe2f6" stroke-width="3"/>';
  for (let k = 0; k < 7; k++) s += '<path d="M' + (24 + k * 58) + ' ' + (214 + (k % 3) * 12) + ' l20 -6" stroke="#bfe2f6" stroke-width="2" stroke-linecap="round"/>';
  return s;
}
function rika(x){ return '<image href="img/rika_normal.webp" x="' + x + '" y="90" width="61" height="110"/>'; }
function newton(x, face){ return '<image href="img/newton_' + (face || 'normal') + '.webp" x="' + x + '" y="90" width="73" height="110"/>'; }
function names(xr, xn){
  return T(xr + 30, 222, 'リカ 50 kg', 12, '#1f2638') + T(xn + 36, 240, 'ニュートンくん 25 kg', 12, '#1f2638');
}

// 場面1：リカがニュートンくんを 100 N で押す。押し返す力は？
SCENES['e13-rink'] = () => svg(rink() + rika(RX) + newton(NX) + names(RX, NX) +
  arrow(NX + 36, 76, NX + 106, 76, '#d93a3f', 5) + T(NX + 76, 62, 'F 100 N', 13, '#d93a3f') + T(NX + 76, 96, 'リカが押す力', 10, '#6b7488', 'start') +
  T(RX + 10, 62, '押し返す力は？', 13, '#d93a3f') + T(RX + 10, 84, '？', 20, '#d93a3f'));

// 場面2〜3：押すと、2人ともすべっていく（スロー）
function glide(animated){
  const html = svg(rink() +
    '<g data-r>' + rika(RX) + '</g><g data-n>' + newton(NX) + '</g>' +
    '<g data-f></g>' +
    T(RX + 30, 222, 'リカ 50 kg', 12, '#1f2638', 'middle', ' data-lr') + T(NX + 36, 240, 'ニュートンくん 25 kg', 12, '#1f2638', 'middle', ' data-ln') +
    '<g data-v></g>' +
    T(360, 290, '0.00秒', 16, '#1f2638', 'middle', ' data-time') + T(8, 292, '右向きを正とする', 10, '#6b7488', 'start'));
  const draw = (root, t) => {
    const xr = RX + offR(t) * PM, xn = NX + offN(t) * PM;
    root.querySelector('[data-r]').setAttribute('transform', 'translate(' + (xr - RX).toFixed(1) + ',0)');
    root.querySelector('[data-n]').setAttribute('transform', 'translate(' + (xn - NX).toFixed(1) + ',0)');
    root.querySelector('[data-lr]').setAttribute('x', (xr + 30).toFixed(1));
    root.querySelector('[data-ln]').setAttribute('x', Math.min(330, xn + 36).toFixed(1));
    let f = '';
    if (t < TP){                       // 押している間：同じ大きさ・反対向き
      f = arrow(xn + 36, 76, xn + 106, 76, '#d93a3f', 5) + T(xn + 76, 64, '100 N', 13, '#d93a3f') +
          arrow(xr + 30, 76, xr - 40, 76, '#d93a3f', 5) + T(xr - 10, 64, '100 N', 13, '#d93a3f');
    } else {                           // はなれたあと：押していた間の力をうすく残す
      f = '<g opacity=".35">' + arrow(214, 70, 270, 70, '#d93a3f', 4) + arrow(206, 70, 150, 70, '#d93a3f', 4) + '</g>' +
          T(210, 58, '押していた間の力：どちらも 100 N', 11, '#d93a3f');
    }
    root.querySelector('[data-f]').innerHTML = f;
    root.querySelector('[data-v]').innerHTML = t >= TP
      ? arrow(Math.min(330, xn + 36), 262, Math.min(330, xn + 36) + 34, 262, '#6b7488', 3) + T(Math.min(330, xn + 36) - 4, 266, '2.0 m/s', 11, '#1f2638', 'end') +
        arrow(xr + 50, 262, xr + 16, 262, '#6b7488', 3) + T(xr + 54, 266, '1.0 m/s', 11, '#1f2638', 'start')
      : '';
    root.querySelector('[data-time]').textContent = t.toFixed(2) + '秒';
  };
  if (animated) return anim(html, 3.5, draw, 'もう一度押す');
  const id = 'ep13s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, 3.5); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e13-push'] = () => glide(true);
SCENES['e13-glide'] = () => glide(false);

// 押した瞬間：作用と反作用（同じ大きさ・反対向き・別々の人に）
SCENES['e13-arrows'] = () => svg(rink() + rika(RX) + newton(NX) + names(RX, NX) +
  arrow(NX + 36, 76, NX + 106, 76, '#d93a3f', 5) + T(NX + 76, 64, '作用 100 N', 13, '#d93a3f') + T(NX + 80, 98, 'リカ → ニュートンくん', 10, '#6b7488', 'start') +
  arrow(RX + 30, 76, RX - 40, 76, '#d93a3f', 5) + T(RX - 10, 64, '反作用 100 N', 13, '#d93a3f') + T(RX - 6, 98, 'ニュートンくん → リカ', 10, '#6b7488', 'end') +
  T(200, 40, '作用と反作用：同じ大きさ・反対向き', 14, '#22305a'));

// つりあい（1つの物体に2つの力）と、作用・反作用（2つの物体に1つずつ）
SCENES['e13-compare'] = () => svg(
  '<rect x="8" y="10" width="186" height="232" rx="10" fill="#fff" stroke="#d6dce6" stroke-width="2"/>' +
  '<rect x="206" y="10" width="186" height="232" rx="10" fill="#fff" stroke="#d6dce6" stroke-width="2"/>' +
  T(101, 36, 'つりあい', 15, '#22305a') + T(299, 36, '作用・反作用', 15, '#22305a') +
  // つりあい：机の上のかご（第9話）
  '<rect x="20" y="168" width="162" height="10" fill="#b47a44"/><rect x="72" y="134" width="58" height="34" rx="4" fill="#e9c48f" stroke="#7e5129" stroke-width="2"/>' +
  arrow(101, 151, 101, 76, '#7e5129', 4) + T(124, 92, 'N 19.6 N', 11, '#7e5129', 'start') +
  arrow(101, 151, 101, 226, '#22305a', 4) + T(124, 222, 'W 19.6 N', 11, '#22305a', 'start') +
  T(101, 262, '1つの物体に、2つの力', 12, '#1f2638') +
  // 作用・反作用：A（リカ）と B（ニュートンくん）
  '<rect x="236" y="120" width="56" height="56" rx="6" fill="#ffd6d7" stroke="#d93a3f" stroke-width="2"/>' + T(264, 153, 'リカ', 12, '#1f2638') +
  '<rect x="292" y="120" width="56" height="56" rx="6" fill="#cfd7ee" stroke="#22305a" stroke-width="2"/>' + T(320, 153, 'ニュ', 12, '#1f2638') +
  arrow(320, 106, 380, 106, '#d93a3f', 4) + T(350, 96, '100 N', 11, '#d93a3f') +
  arrow(264, 194, 214, 194, '#d93a3f', 4) + T(244, 214, '100 N', 11, '#d93a3f') +
  T(299, 262, '2つの物体に、1つずつ', 12, '#1f2638'), '#eef2f7');

SCENES['e13-answer'] = answerCard('100 N！', '同じ大きさ・反対向き', 'clamp(30px,10vw,48px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '13',
  chapter: '2章 力と運動の法則',
  topic: '作用・反作用の法則',
  title: '押したら、押し返される？',
  simUrl: '../sim/action-reaction.html',
  drillUrl: '../physics/drill.html?unit=2-7',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e13-rink',
      speaker: 'newton', text: 'スケートリンクで、リカくんがわしを 100 N で押す。そのとき、わしがリカくんを押し返す力は？',
      choice: {
        id: 'q1',
        options: [
          { key: 'zero', label: '0 N（押していない）' },
          { key: 'less', label: '100 N より小さい' },
          { key: 'same', label: 'ちょうど 100 N' }
        ],
        answer: 'same'
      } },

    { bg: 'e13-rink', chars: [{ who: 'rika', face: 'confident', side: 'left' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        zero: { face: 'confident', text: '押してるのはわたしだけだから、ニュートンくんの力は 0 N でしょ？' },
        less: { face: 'question',  text: 'ニュートンくんは軽いから、押し返す力は小さいんじゃない？' },
        same: { face: 'idea',      text: '押すと、手が押し返される感じがする…。同じくらいかな？' }
      } } },

    { bg: 'e13-rink', chars: [{ who: 'newton', face: 'think', side: 'left' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        zero: { face: 'think',    text: 'では、なぜリカくんまで後ろへすべっていくのかな？ 押すところを、スローで見てみよう。' },
        less: { face: 'question', text: 'ふむ、軽いと力も小さいのかな？ 押すところを、スローで見てみよう。' },
        same: { face: 'proud',    text: 'ほう、手ごたえに気づいたか。押すところを、スローで見てみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e13-push',
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        zero: { face: 'surprise', text: 'え、そうなの？ わたしまで後ろにすべってる！ 押し返されてるんだ！' },
        less: { face: 'surprise', text: '矢印が同じ長さ！ 軽いニュートンくんも、100 N で押し返してる！' },
        same: { face: 'happy',    text: 'やっぱり！ 2つの矢印が同じ長さで、反対向きだ！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e13-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ わしも、ちょうど 100 N でリカくんを押し返しておる。' },
      wrong: { face: 'oops',  text: 'おしい！ 答えは「ちょうど 100 N」。押すと、同じ大きさで押し返されるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e13-arrows',
      speaker: 'newton', text: '押すと、同じ大きさで押し返される。これが『作用・反作用の法則』。わしの第三法則じゃ！' },

    { bg: 'e13-glide',
      speaker: 'rika', text: 'でも、ニュートンくんのほうが、ずっと速くすべっていくよ？' },

    { bg: 'e13-glide',
      speaker: 'newton', text: 'ふむ、よい問いじゃ。力は同じでも、軽いほうが動きやすい。そのわけは、第14話のお楽しみじゃ。' },

    { bg: 'e13-compare',
      speaker: 'newton', text: 'つりあいとまちがえやすいが、作用・反作用は、別々の物体にはたらく2つの力じゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '重さを変えて、押し合ってみよう。',
      points: [
        '押すと、同じ大きさで押し返される（作用・反作用の法則）',
        '作用と反作用は、同じ大きさ・反対向き',
        '2つの力は、別々の物体にはたらく（つりあいとはちがう）'
      ] }
  ]
};
})();
