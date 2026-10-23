/* わくわく物理基礎 ストーリーモード
   第11話「止まっているのは、力がないから？」（新編物理基礎 1編2章 力のつりあい）

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
  const id = 'ep11a' + (++uid);
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
const SKY = '<defs><linearGradient id="sky11" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky11)"/>';
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
// 綱引き：左へ 200 N、右へ 200 N（右向きを正とする）→ 合力 200 − 200 = 0 N
const RY = 74;                                   // ロープの高さ
function person(x, color, dir){
  // dir = −1 なら左を向いて引く（左チーム）、+1 なら右（右チーム）
  return '<circle cx="' + x + '" cy="' + (RY - 26) + '" r="9" fill="#e9c48f" stroke="' + color + '" stroke-width="2"/>' +
    '<circle cx="' + (x - 4) + '" cy="' + (RY - 24) + '" r="2" fill="#d93a3f" opacity=".7"/><circle cx="' + (x + 4) + '" cy="' + (RY - 24) + '" r="2" fill="#d93a3f" opacity=".7"/>' +
    '<path d="M' + x + ' ' + (RY - 17) + ' l' + (dir * 8) + ' 26 M' + (x + dir * 8) + ' ' + (RY + 9) + ' l' + (dir * 8) + ' 16 M' + (x + dir * 8) + ' ' + (RY + 9) + ' l' + (-dir * 6) + ' 16" stroke="' + color + '" stroke-width="5" stroke-linecap="round" fill="none"/>';
}
function tug(){
  let g = SKY + '<rect y="210" width="400" height="90" fill="#86bb66"/>' +
    '<line x1="40" x2="360" y1="' + RY + '" y2="' + RY + '" stroke="#b47a44" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M200 ' + (RY - 2) + ' l-7 22 h14z" fill="#d93a3f"/>' +
    '<line x1="200" x2="200" y1="' + (RY + 26) + '" y2="200" stroke="#6b7488" stroke-width="2" stroke-dasharray="4 4"/>';
  [52, 82, 112].forEach(x => { g += person(x, '#22305a', -1); });
  [288, 318, 348].forEach(x => { g += person(x, '#d93a3f', 1); });
  return g;
}
SCENES['e11-tug'] = () => svg(tug() + T(200, 24, 'ロープの印が、ぴたりと止まっている', 15, '#1f2638'));

// 力の矢印（1 N = 0.5 px）。左右に 200 N ずつ
const K = 0.4;
function tugArrows(k){
  return arrow(200, 140, 200 - 200 * K * k, 140, RED, 6) + arrow(200, 140, 200 + 200 * K * k, 140, RED, 6) +
    '<circle cx="200" cy="140" r="4" fill="#1f2638"/>';
}
SCENES['e11-arrows'] = () => anim(svg(tug() + '<g data-a></g>' +
  T(160, 166, '左へ 200 N', 14, RED, 'middle', ' data-l opacity="0"') + T(240, 166, '右へ 200 N', 14, RED, 'middle', ' data-r opacity="0"') +
  T(200, 196, '右向きを正とする', 13, '#1f2638', 'middle', ' data-s opacity="0"') +
  T(200, 230, '合力 = 200 − 200 = 0 N', 16, '#1f2638', 'middle', ' data-s opacity="0"')),
  2.2, (root, t) => {
    const k = Math.min(1, t / 1.2);
    root.querySelector('[data-a]').innerHTML = tugArrows(k);
    root.querySelector('[data-l]').setAttribute('opacity', t >= 1.2 ? 1 : 0);
    root.querySelector('[data-r]').setAttribute('opacity', t >= 1.2 ? 1 : 0);
    root.querySelectorAll('[data-s]').forEach(n => n.setAttribute('opacity', t >= 1.8 ? 1 : 0));
  }, 'もう一度見る');
SCENES['e11-arrows-still'] = () => svg(tug() + tugArrows(1) +
  T(160, 166, '左へ 200 N', 14, RED) + T(240, 166, '右へ 200 N', 14, RED) +
  T(200, 196, '右向きを正とする', 13, '#1f2638') + T(200, 230, '合力 = 200 − 200 = 0 N', 16, '#1f2638'));

// 植木鉢（重さ 49 N）を2本のひもでつるす：T₁ = 20 N、T₂ = 49 − 20 = 29 N（1 N = 1.6 px）
const P = 1.6, POT = 150;
SCENES['e11-pot'] = () => svg('<rect width="400" height="300" fill="#eef2f7"/>' +
  '<rect x="140" y="30" width="140" height="10" fill="#7e5129"/>' +
  '<line x1="170" x2="170" y1="40" y2="' + POT + '" stroke="#1f2638" stroke-width="2"/><line x1="250" x2="250" y1="40" y2="' + POT + '" stroke="#1f2638" stroke-width="2"/>' +
  '<path d="M196 ' + POT + ' q-14 -34 -2 -48 q10 22 2 48z M214 ' + POT + ' q14 -34 2 -48 q-10 22 -2 48z" fill="#86bb66"/>' +
  '<path d="M156 ' + POT + ' h108 l-12 50 h-84z" fill="#b47a44" stroke="#7e5129" stroke-width="2"/>' +
  arrow(170, POT, 170, POT - 20 * P, WOOD) + T(176, 98, 'T₁ 20 N', 15, WOOD, 'start') +
  arrow(250, POT, 250, POT - 29 * P, WOOD) + T(258, POT - 22, 'T₂ 29 N', 15, WOOD, 'start') +
  arrow(210, POT + 25, 210, POT + 25 + 49 * P, NAVY) + T(220, POT + 25 + 49 * P - 6, 'W 49 N', 15, NAVY, 'start') +
  T(336, 196, '上向きを正とする', 12, '#6b7488') +
  T(336, 222, '上向き 20 + 29', 14, '#1f2638') + T(336, 244, '= 下向き 49 N', 14, '#1f2638'));

// 第9話の机の上のかご：重力 19.6 N と垂直抗力 19.6 N がつりあう（1 N = 3 px）
function basket(cx, top){
  let g = '';
  [-18, 0, 18, -9, 9].forEach((dx, k) => { g += '<circle cx="' + (cx + dx) + '" cy="' + (top - (k < 3 ? 4 : 13)) + '" r="9" fill="#d93a3f"/>'; });
  return g + '<path d="M' + (cx - 32) + ' ' + top + ' h64 l-8 30 h-48z" fill="#e9c48f" stroke="#7e5129" stroke-width="2"/>';
}
SCENES['e11-basket'] = () => svg('<rect width="400" height="250" fill="#eef2f7"/><rect y="250" width="400" height="50" fill="#d6dce6"/>' +
  '<rect x="125" y="190" width="150" height="10" rx="2" fill="#b47a44"/><rect x="133" y="200" width="8" height="50" fill="#7e5129"/><rect x="259" y="200" width="8" height="50" fill="#7e5129"/>' +
  basket(200, 160) +
  arrow(192, 175, 192, 175 + 19.6 * 3, NAVY) + T(184, 232, 'W 19.6 N', 13, NAVY, 'end') +
  arrow(208, 190, 208, 190 - 19.6 * 3, WOOD) + T(216, 140, 'N 19.6 N', 13, WOOD, 'start') +
  T(200, 46, '重力と垂直抗力がつりあう', 15, '#1f2638') + T(200, 70, '19.6 − 19.6 = 0 N', 14, '#6b7488'));

SCENES['e11-answer'] = answerCard('同じ大きさの力', '反対向きに引き合う（合力 0 N）', 'clamp(24px,8vw,40px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '11',
  chapter: '2章 力と運動の法則',
  topic: '力のつりあい',
  title: '止まっているのは、力がないから？',
  simUrl: '../sim/force-balance.html',
  drillUrl: '../physics/drill.html?unit=2-2',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e11-tug', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'ロープが動かない。さて、両チームはどうしているのかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'rest', label: 'どちらも力を出していない' },
          { key: 'same', label: '同じ大きさの力で引き合っている' },
          { key: 'win',  label: '勝っているほうが少し大きい' }
        ],
        answer: 'same'
      } },

    { bg: 'e11-tug', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        rest: { face: 'confident', text: '止まってるなら、どっちも休んでるのかな？' },
        same: { face: 'idea',      text: '同じ力で、引っぱり合ってるんじゃない？' },
        win:  { face: 'question',  text: 'どっちかが、少しだけ強いんじゃない？' }
      } } },

    { bg: 'e11-tug', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        rest: { face: 'proud',    text: '顔を見てごらん。真っ赤じゃぞ。力の矢印をかいてみよう。' },
        same: { face: 'question', text: 'ほう。では、力の矢印をかいて確かめてみよう。' },
        win:  { face: 'think',    text: 'ふむ、よい問いじゃ。少しでも強ければどうなるか。矢印をかいてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e11-arrows', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        rest: { face: 'surprise', text: 'え、そうなの？ 力いっぱいでも、止まってるんだ！' },
        same: { face: 'happy',    text: '200 N と 200 N で、反対向き。だから止まってるんだ！' },
        win:  { face: 'surprise', text: 'え、そうなの？ どっちも 200 N。差があったら動いちゃうんだ。' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e11-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 同じ大きさの力で、反対向きに引き合っておる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「同じ大きさの力で引き合っている」。合力が 0 だから動かんのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e11-arrows-still', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '同じ大きさで、反対向き。合力が 0 になると、力は『つりあっている』という。' },

    { bg: 'e11-pot', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '重さ 49 N の植木鉢を、2本のひもでつるす。片方のひもは 20 N じゃ。' },

    { bg: 'e11-pot', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '上向きの力の合計と、下向きの重力が同じになる。もう一方は 49 − 20 = 29 N じゃ。' },

    { bg: 'e11-basket', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '机の上のかごも同じじゃ。止まっているのは、力がないからではない。つりあっているからじゃ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'ひもの張力を変えて、つりあいを作ってみよう。',
      points: [
        'つりあい：1つの物体にはたらく力の合力が 0',
        '上向きの力の合計 ＝ 下向きの力の合計',
        '止まっているのは、力がつりあっているから'
      ] }
  ]
};
})();
