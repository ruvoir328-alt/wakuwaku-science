/* わくわく物理基礎 ストーリーモード
   第1話「どっちが速い？」（新編物理基礎 1編1章 1 運動の表し方）

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
  const id = 'ep01a' + (++uid);
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
function bike(x, y, s){
  s = s || 1;
  return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
    '<circle cx="-11" cy="0" r="8" fill="none" stroke="#22305a" stroke-width="2.5"/><circle cx="11" cy="0" r="8" fill="none" stroke="#22305a" stroke-width="2.5"/>' +
    '<path d="M-11 0 L-3 -12 L9 -12 L11 0 M-3 -12 L0 0 L-11 0 M9 -12 L7 -17 M-5 -15 h6" fill="none" stroke="#d93a3f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
}

/* ---- この話の絵 ---- */
// 校庭：問題の条件
SCENES['e1-ground'] = () => svg(SKY +
  '<rect y="214" width="400" height="86" fill="#e9c48f"/><path d="M0 238 h400 M0 266 h400" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>' +
  '<rect x="14" y="12" width="182" height="84" rx="12" fill="#fff" stroke="#d93a3f" stroke-width="3"/>' +
  bike(105, 40, 1.1) + T(105, 66, 'リカ（自転車）', 13, '#d93a3f') + T(105, 87, '400 m を 80 秒', 16) +
  '<rect x="204" y="12" width="182" height="84" rx="12" fill="#fff" stroke="#22305a" stroke-width="3"/>' +
  '<circle cx="295" cy="36" r="13" fill="#eef2f7" stroke="#22305a" stroke-width="2.5"/><path d="M295 36 V27 M295 36 L302 40" stroke="#22305a" stroke-width="2.5" stroke-linecap="round"/><rect x="291" y="19" width="8" height="4" rx="2" fill="#22305a"/>' +
  T(295, 66, '先生（走る）', 13, '#22305a') + T(295, 87, '100 m を 16 秒', 16));

// 1秒ごとのコマ送り（リカ 5 m/s、先生 6.25 m/s を4秒間）
const RX0 = 34, PX = 13.6;           // 0 m の位置と、1 m あたりの px（25 m → 340 px）
SCENES['e1-race'] = (sc) => {
  let lanes = '';
  [['r', 52, '#d93a3f', 'リカ'], ['t', 90, '#22305a', '先生']].forEach(([k, y, c, name]) => {
    lanes += '<rect x="0" y="' + (y - 17) + '" width="400" height="34" fill="#e9c48f"/>' +
      '<line x1="0" x2="400" y1="' + (y + 18) + '" y2="' + (y + 18) + '" stroke="#fff" stroke-width="2"/>' +
      T(4, y + 5, name, 12, c, 'start') +
      '<g data-ghost="' + k + '"></g><circle data-dot="' + k + '" cx="' + RX0 + '" cy="' + y + '" r="9" fill="' + c + '"/>';
  });
  return anim(svg(
    lanes + '<line x1="' + RX0 + '" x2="' + RX0 + '" y1="35" y2="107" stroke="#7e5129" stroke-width="2"/>' +
    T(140, 140, '0.0秒', 20, '#1f2638', 'middle', ' data-time') + T(140, 162, '｜は1秒ごとの位置', 12, '#6b7488') +
    '<g data-table opacity="0"><rect x="60" y="176" width="160" height="80" rx="10" fill="#fff" stroke="#cfd7ee" stroke-width="2"/>' + T(140, 198, '1秒で進む距離', 13, '#6b7488') +
      T(140, 222, 'リカ 5 m', 16, '#d93a3f') + T(140, 246, '先生 6.25 m', 16, '#22305a') + '</g>',
    '#eef2f7'), 4, (root, t) => {
      const v = { r: 5, t: 6.25 };
      Object.keys(v).forEach(k => {
        const x = RX0 + v[k] * t * PX;
        root.querySelector('[data-dot="' + k + '"]').setAttribute('cx', x.toFixed(1));
        let g = '';
        for (let n = 1; n <= Math.floor(t + 1e-9); n++){
          const gx = RX0 + v[k] * n * PX, y = k === 'r' ? 52 : 90;
          g += '<line x1="' + gx + '" x2="' + gx + '" y1="' + (y - 13) + '" y2="' + (y + 13) + '" stroke="#7e5129" stroke-width="2.5"/>';
        }
        root.querySelector('[data-ghost="' + k + '"]').innerHTML = g;
      });
      root.querySelector('[data-time]').textContent = t.toFixed(1) + '秒';
      root.querySelector('[data-table]').setAttribute('opacity', t >= 1 ? 1 : 0);
    }, 'もう一度走る');
};

// 1秒あたりにそろえる計算
function board(lines){
  let s = '<rect x="140" y="30" width="246" height="190" rx="8" fill="#2f5b4e" stroke="#7e5129" stroke-width="8"/>';
  lines.forEach(([y, str, size, fill]) => { s += T(263, y, str, size || 18, fill || '#fff'); });
  return svg(s + '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');
}
SCENES['e1-calc'] = () => board([
  [64, '1秒あたりに進む距離', 15, '#ffd6d7'],
  [110, 'リカ　400 ÷ 80 = 5 m', 19],
  [150, '先生　100 ÷ 16 = 6.25 m', 19],
  [196, '先生のほうが、1秒で長く進む', 13, '#cfd7ee']
]);
SCENES['e1-unit'] = () => board([
  [64, '速さ ＝ 移動距離 ÷ かかった時間', 14, '#ffd6d7'],
  [110, 'リカ　5 m/s', 21],
  [150, '先生　6.25 m/s', 21],
  [196, 'm/s ＝ メートル毎秒', 15, '#cfd7ee']
]);

// 上り坂でゆっくり、下り坂でスピードアップ（400 m を 80 秒：上り 120 m を 40 秒、下り 280 m を 40 秒）
const HILL = { a: [20, 116], b: [124, 60], c: [380, 116] };
SCENES['e1-hill'] = () => anim(svg(SKY +
  '<path d="M0 300 V116 L' + HILL.a + ' L' + HILL.b + ' L' + HILL.c + ' L400 116 V300z" fill="#86bb66"/>' +
  '<path d="M' + HILL.a + ' L' + HILL.b + ' L' + HILL.c + '" fill="none" stroke="#7e5129" stroke-width="4"/>' +
  T(54, 76, '上り', 13, '#7e5129') + T(272, 76, '下り', 13, '#7e5129') +
  '<g data-bike>' + bike(0, -10) + '</g>' +
  '<rect x="132" y="150" width="136" height="96" rx="12" fill="#fff" stroke="#22305a" stroke-width="3"/>' +
  T(200, 172, 'スピードメーター', 12, '#6b7488') + T(200, 204, '0 m/s', 24, '#d93a3f', 'middle', ' data-speed') +
  T(200, 230, '0秒', 13, '#6b7488', 'middle', ' data-time') +
  '<g data-avg opacity="0"><rect x="96" y="252" width="208" height="30" rx="15" fill="#fff7e9" stroke="#e9c48f" stroke-width="2"/>' +
  T(200, 272, '平均の速さ 400 ÷ 80 = 5 m/s', 13, '#7e5129') + '</g>', '#fff'),
  5, (root, t) => {
    const s = t / 5 * 80;                       // 実際の時間（秒）
    let p, v, x, y, ang;
    if (s <= 40){ v = 3; p = s / 40; x = HILL.a[0] + (HILL.b[0] - HILL.a[0]) * p; y = HILL.a[1] + (HILL.b[1] - HILL.a[1]) * p; ang = Math.atan2(HILL.b[1] - HILL.a[1], HILL.b[0] - HILL.a[0]); }
    else { v = 7; p = (s - 40) / 40; x = HILL.b[0] + (HILL.c[0] - HILL.b[0]) * p; y = HILL.b[1] + (HILL.c[1] - HILL.b[1]) * p; ang = Math.atan2(HILL.c[1] - HILL.b[1], HILL.c[0] - HILL.b[0]); }
    if (t <= 0) v = 0;
    root.querySelector('[data-bike]').setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + (ang * 180 / Math.PI).toFixed(1) + ')');
    root.querySelector('[data-speed]').textContent = (t >= 5 ? 0 : v) + ' m/s';
    root.querySelector('[data-time]').textContent = Math.round(s) + '秒';
    root.querySelector('[data-avg]').setAttribute('opacity', t >= 5 ? 1 : 0);
  }, 'もう一度走る');

SCENES['e1-answer'] = answerCard('先生！', '先生 6.25 m/s ＞ リカ 5 m/s');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '01',
  chapter: '1章 直線運動の世界',
  topic: '運動の表し方',
  title: 'どっちが速い？',
  simUrl: '../sim/speed-race.html',
  drillUrl: '../physics/drill.html?unit=1-1',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e1-ground', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'リカくんは自転車で400 mを80秒。先生は100 mを16秒。さて、どっちが速い？',
      choice: {
        id: 'q1',
        options: [
          { key: 'rika', label: 'リカのほうが速い' },
          { key: 'teacher', label: '先生のほうが速い' },
          { key: 'same', label: '同じ' }
        ],
        answer: 'teacher'
      } },

    { bg: 'e1-ground', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        rika:    { face: 'confident', text: 'わたしでしょ！ 400 mも走ったんだもん。' },
        teacher: { face: 'question',  text: '先生かなあ…。でも、距離も時間もバラバラだから、比べにくいよ。' },
        same:    { face: 'confused',  text: '同じくらい？ 距離も時間もバラバラだから、比べられないよ。' }
      } } },

    { bg: 'e1-ground', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        rika:    { face: 'think',    text: 'ふむ、長く走ったほうが速いとは限らんぞ。では『1秒あたり』にそろえてみよう。' },
        teacher: { face: 'question', text: 'ふむ、よい問いだ。では『1秒あたり』にそろえてみよう。' },
        same:    { face: 'proud',    text: 'ふむ、よい問いだ。では『1秒あたり』にそろえてみよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e1-race', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        rika:    { face: 'surprise', text: 'え、そうなの？ 1秒ごとに見ると、先生のほうが先に行ってる…！' },
        teacher: { face: 'happy',    text: 'やっぱり先生だ！ 1秒ごとに、差がどんどん開いてく！' },
        same:    { face: 'surprise', text: 'え、そうなの？ 同じじゃない。先生のほうが先に行ってる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e1-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 1秒あたりにそろえると、先生のほうが速い。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「先生」。1秒あたりにそろえると、先生のほうが速いのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e1-calc', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'リカくんは 400 ÷ 80 = 5 m、先生は 100 ÷ 16 = 6.25 m。1秒で進む距離を比べたのじゃ。' },

    { bg: 'e1-unit', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '1秒で進む距離、これが『速さ』じゃ。単位は m/s、メートル毎秒と読む。' },

    { bg: 'e1-hill', chars: [{ who: 'rika', face: 'question', side: 'right' }],
      speaker: 'rika', text: 'でも私、ずっと秒速5 mじゃなかったよ？ 上り坂はゆっくりで、下り坂はスピードアップ！' },

    { bg: 'e1-hill', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton', text: 'そのとおり。全体をまとめたのが『平均の速さ』じゃ。' },

    { bg: 'e1-hill', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'idea', side: 'right' }],
      speaker: 'newton', text: 'その瞬間の速さは『瞬間の速さ』じゃ。スピードメーターが示すのはこっちじゃな。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '速さの計算、チャレンジモードで試してみるかね？',
      points: [
        '速さ ＝ 移動距離 ÷ かかった時間',
        '速さの単位は m/s（メートル毎秒）',
        '「平均の速さ」と「瞬間の速さ」がある'
      ] }
  ]
};
})();
