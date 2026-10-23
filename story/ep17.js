/* わくわく物理基礎 ストーリーモード
   第17話「水の中で、軽くなる？」（新編物理基礎 1編2章 圧力と浮力）2章のしめくくり

   書き方は第6話（ep06.js）と同じ。
   この話だけの絵（bg）は、下の「この話の絵」で SCENES に足している（プレイヤーは変えない）。
   数値は sim/buoyancy.html とそろえる：石 0.20 kg（1.96 N）、V = 1.0 × 10⁻⁴ m³、浮力 0.98 N、圧力 24500 Pa・1960 Pa
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
  const id = 'ep17a' + (++uid);
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
// 矢印（x1,y1 → x2,y2）。力の色：重力＝紺、浮力＝木
function arrow(x1, y1, x2, y2, color, w, extra){
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2) return '';
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(12, L * 0.6);
  const bx = x2 - ux * h, by = y2 - uy * h;
  return '<g' + (extra || '') + '><line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - ux * h * 0.8).toFixed(1) + '" y2="' + (y2 - uy * h * 0.8).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 5) + '" stroke-linecap="round"/>' +
    '<path d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + (bx - uy * h * 0.6).toFixed(1) + ' ' + (by + ux * h * 0.6).toFixed(1) + ' L' + (bx + uy * h * 0.6).toFixed(1) + ' ' + (by - ux * h * 0.6).toFixed(1) + 'z" fill="' + color + '"/></g>';
}

const SKY = '<defs><linearGradient id="sky17" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#e9f6fc"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky17)"/>';

/* ---- この話の絵 ---- */
// ばねばかりにつるした石：0.20 kg → W = 0.20 × 9.8 = 1.96 N。体積 V = 1.0 × 10⁻⁴ m³
// 全部沈めると浮力 F = ρVg = 1000 × 1.0 × 10⁻⁴ × 9.8 = 0.98 N → 目盛り 1.96 − 0.98 = 0.98 N
// 力の矢印は 0.98 N = 20 px（重力＝紺、浮力＝木）
const W = 1.96, B = 0.98, PX = 20 / 0.98;
const WS = 186;                    // 水面の高さ（y）
const SH = 24;                     // 石の高さ（px）
function stand(){
  return '<rect x="136" y="18" width="8" height="244" fill="#7e5129"/><rect x="136" y="18" width="92" height="8" fill="#7e5129"/>' +
    '<rect x="118" y="258" width="44" height="8" rx="3" fill="#7e5129"/>';
}
function tank(){
  return '<rect x="160" y="' + WS + '" width="112" height="' + (262 - WS) + '" fill="#bfe2f6" opacity=".85"/>' +
    '<path d="M160 160 V262 H272 V160" fill="none" stroke="#6b7488" stroke-width="3"/>' +
    '<line x1="160" x2="272" y1="' + WS + '" y2="' + WS + '" stroke="#86aac4" stroke-width="2"/>';
}
// 石（上のはしが y）と、ばねばかり。frac：水に沈んだ割合（0〜1）
function scaleAndStone(y, frac, arrows){
  const read = W - B * frac;
  let s = '<line x1="215" x2="215" y1="26" y2="34" stroke="#4b5568" stroke-width="2"/>' +
    '<rect x="200" y="34" width="30" height="62" rx="6" fill="#fff" stroke="#4b5568" stroke-width="2"/>' +
    '<line x1="206" x2="224" y1="' + (44 + 40 * read / 2) + '" y2="' + (44 + 40 * read / 2) + '" stroke="#d93a3f" stroke-width="3"/>' +
    T(196, 58, 'ばねばかり', 10, '#6b7488', 'end') + T(196, 80, read.toFixed(2) + ' N', 16, '#d93a3f', 'end') +
    '<line x1="215" x2="215" y1="96" y2="' + y + '" stroke="#4b5568" stroke-width="1.5"/>' +
    '<rect x="201" y="' + y + '" width="28" height="' + SH + '" rx="5" fill="#9aa9b8" stroke="#6b7488" stroke-width="2"/>' + T(215, y + 16, '石', 11, '#fff');
  if (arrows){
    const c = y + SH / 2;
    s += arrow(215, c, 215, c + W * PX, '#22305a', 4) + T(236, c + W * PX - 4, 'W 1.96 N', 11, '#22305a', 'start');
    if (frac > 0.02) s += arrow(185, c, 185, c - B * frac * PX, '#7e5129', 4) + T(181, c - 4, '浮力', 11, '#7e5129', 'end') + T(181, c + 10, (B * frac).toFixed(2) + ' N', 11, '#7e5129', 'end');
  }
  return s;
}
const fracAt = y => Math.max(0, Math.min(1, (y + SH - WS) / SH));

// 謎：水に沈める前。目盛り 1.96 N
SCENES['e17-scale'] = () => svg(stand() + tank() + scaleAndStone(118, 0, false) +
  T(216, 150, '0.20 kg・体積 1.0 × 10⁻⁴ m³', 10, '#4b5568'), '#eef2f7');

// 沈めていく：目盛りが 1.96 N → 0.98 N
function sink(animated){
  const html = svg(stand() + tank() + '<g data-s></g>' + T(200, 290, '', 12, '#7e5129', 'middle', ' data-msg'), '#eef2f7');
  const draw = (root, t) => {
    const p = Math.min(1, t / 2.2), y = 118 + (192 - 118) * p * p * (3 - 2 * p);
    const fr = fracAt(y);
    root.querySelector('[data-s]').innerHTML = scaleAndStone(y, fr, true);
    root.querySelector('[data-msg]').textContent = '';
  };
  if (animated) return anim(html, 2.6, draw, 'もう一度沈める');
  const id = 'ep17s' + (++uid);
  setTimeout(() => { const r = document.getElementById(id); if (r) draw(r, 2.6); }, 0);
  return html.replace('<svg class="scene"', '<svg id="' + id + '" class="scene"');
}
SCENES['e17-sink'] = () => sink(true);
SCENES['e17-sink-still'] = () => sink(false);

// 黒板：F = ρVg
SCENES['e17-board'] = () => svg(
  '<rect x="150" y="30" width="236" height="206" rx="8" fill="#2f5b4e" stroke="#7e5129" stroke-width="8"/>' +
  '<text x="268" y="74" text-anchor="middle" font-size="26" fill="#ffe14a" font-family="Times New Roman" font-style="italic">F = ρVg</text>' +
  T(268, 106, '= 1000 × 1.0 × 10⁻⁴ × 9.8', 13, '#fff') +
  T(268, 132, '= 0.98 N', 16, '#ffe14a') +
  '<line x1="176" x2="360" y1="150" y2="150" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>' +
  T(268, 176, '目盛り：1.96 − 0.98', 13, '#fff') + T(268, 202, '= 0.98 N', 16, '#ffe14a') +
  T(268, 226, 'ρ：水の密度 1000 kg/m³', 11, '#cfd7ee') +
  '<rect y="252" width="400" height="48" fill="#d6dce6"/>', '#eef2f7');

// 全部沈めたまま、深くしていく：目盛りは 0.98 N のまま
SCENES['e17-depth'] = () => anim(svg(stand() + tank() + '<g data-s></g>' + T(200, 290, '', 12, '#7e5129', 'middle', ' data-msg'), '#eef2f7'),
  3, (root, t) => {
    const p = Math.min(1, t / 2.4), y = 192 + (212 - 192) * (0.5 - 0.5 * Math.cos(Math.PI * p));
    root.querySelector('[data-s]').innerHTML = scaleAndStone(y, 1, true);
    root.querySelector('[data-msg]').textContent = '';
  }, 'もう一度動かす');

// 雪の上：重さ 490 N のリカ。くつ 0.020 m² → 24500 Pa、スキー 0.25 m² → 1960 Pa
// 沈み方は圧力に比例した絵（24500 Pa で 30 px）
function snowPerson(cx, label, area, pa, ski){
  const sinkPx = 36 * pa / 24500, top = 64 + sinkPx;
  return '<image href="img/rika_normal.webp" x="' + (cx - 40) + '" y="' + top + '" width="80" height="146"/>' +
    '<rect x="' + (cx - 64) + '" y="206" width="128" height="94" fill="#fff"/>' +
    '<path d="M' + (cx - 64) + ' 206 h128" stroke="#d6dce6" stroke-width="2"/>' +
    (ski ? '<rect x="' + (cx - 58) + '" y="202" width="116" height="7" rx="3" fill="#d93a3f"/>' : '') +
    T(cx, 228, label + ' ' + area + ' m²', 12, '#1f2638') +
    T(cx, 248, 'P = 490 ÷ ' + area, 11, '#6b7488') + T(cx, 268, '= ' + pa + ' Pa', 14, '#d93a3f') +
    T(cx, top - 6, ski ? 'ほとんど しずまない' : 'ずぶっと しずむ', 11, '#7e5129');
}
SCENES['e17-snow'] = () => svg(SKY +
  snowPerson(196, 'くつ', '0.020', 24500, false) + snowPerson(330, 'スキー', '0.25', 1960, true) +
  T(263, 26, 'リカの重さ 490 N　圧力 P = F ÷ S', 12, '#22305a'), '#e9f6fc');

SCENES['e17-answer'] = answerCard('小さくなる！', '1.96 N → 0.98 N', 'clamp(24px,8vw,38px)');

/* ---- 脚本 ---- */
window.EPISODE = {
  id: '17',
  chapter: '2章 力と運動の法則',
  topic: '圧力と浮力',
  title: '水の中で、軽くなる？',
  simUrl: '../sim/buoyancy.html',
  drillUrl: '../physics/drill.html?unit=2-5',
  scenes: [
    { bg: 'title' },

    /* ---- 謎と予想 ---- */
    { bg: 'e17-scale', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'この石を、水の中にすっぽり沈める。ばねばかりの目盛りは、どうなるかな？',
      choice: {
        id: 'q1',
        options: [
          { key: 'same', label: '変わらない' },
          { key: 'small', label: '小さくなる' },
          { key: 'big', label: '大きくなる' }
        ],
        answer: 'small'
      } },

    { bg: 'e17-scale', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        same:  { face: 'confident', text: '石の重さは変わらないから、目盛りも変わらないでしょ？' },
        small: { face: 'question',  text: '水の中だと、なんだか軽くなる気がする…。' },
        big:   { face: 'confused',  text: '水がのっかって、重くなるんじゃない？' }
      } } },

    { bg: 'e17-scale', chars: [{ who: 'newton', face: 'question', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        same:  { face: 'question', text: 'プールの中で、体が軽く感じたことはないかな？ 沈めて確かめよう。' },
        small: { face: 'proud',    text: 'ほう、プールの中で体が軽く感じるのと同じじゃな。沈めて確かめよう。' },
        big:   { face: 'think',    text: 'ふむ、よい問いじゃ。プールの中では、体はどう感じるかな？ 沈めて確かめよう。' }
      } } },

    /* ---- アニメで確かめる ---- */
    { bg: 'e17-sink', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        same:  { face: 'surprise', text: 'え、そうなの？ 1.96 N が 0.98 N に。半分になった！' },
        small: { face: 'happy',    text: 'やっぱり小さくなった！ 1.96 N が 0.98 N、半分だ！' },
        big:   { face: 'surprise', text: 'え、そうなの？ 重くなるどころか、半分の 0.98 N に！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'e17-answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 目盛りは 1.96 N から 0.98 N に小さくなる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「小さくなる」。水が石を、下から押し上げるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'e17-sink-still', chars: [{ who: 'newton', face: 'normal', side: 'right' }],
      speaker: 'newton', text: '水が下から押し上げる力、『浮力』じゃ。押しのけた水の重さと同じ大きさになる。' },

    { bg: 'e17-board', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: '浮力 F = ρVg。水の密度 1000 kg/m³ に、沈んだ体積と g をかけるのじゃ。' },

    { bg: 'e17-board', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '1.96 − 0.98 = 0.98 N が、ばねばかりの目盛りじゃ。' },

    { bg: 'e17-depth', chars: [{ who: 'rika', face: 'question', side: 'right' }],
      speaker: 'rika', text: '深くしても、目盛りが変わらない…。' },

    { bg: 'e17-depth', chars: [{ who: 'newton', face: 'proud', side: 'right' }],
      speaker: 'newton', text: '全部沈めたら、押しのける水の体積は同じ。だから浮力も同じなのじゃ。' },

    { bg: 'e17-snow', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: '力がはたらく面積で割ったものが『圧力』P = F ÷ S じゃ。単位は Pa（パスカル）。' },

    { bg: 'e17-snow', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'くつなら 24500 Pa、スキーなら 1960 Pa。だからスキーはしずまないのじゃ。' },

    /* ---- まとめ（2章の結び） ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: 'これで、わしの運動の法則は全部じゃ。次の3章では、力が『仕事』をすると、何がたまるのかを調べるぞ！',
      points: [
        '浮力 F = ρVg は、押しのけた水の重さ',
        '全部沈めれば、浮力は深さによらない',
        '圧力 P = F ÷ S（単位 Pa）。面積が広いほど小さい'
      ] }
  ]
};
})();
