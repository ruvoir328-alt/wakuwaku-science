/* わくわく化学基礎 チャレンジモード（化学1章〜）
   物理のドリル（physics/app.js）と同じ見た目・同じごほうび（メダル＝10問中4問以上、トロフィー＝全問正解）。
   化学は「選ぶ問題」が多いので、問題は2つの形：
     選ぶ問題  { badge, text, choices: ['…', …], answer: '…（choices のどれか）', explain, pic? }
     数の問題  { badge, text, number: true, answer: 273, unit: 'K', tol: 0, explain, pic? }
   記録は端末の中だけ（localStorage の wakuwakupub_progress_guest。単元の番号は「化1-1」など） */

const TOTAL = 10;
const MEDAL = 4;
const KEY = 'wakuwakupub_progress_guest';

let score = 0, count = 0, current = null, answered = false, picked = null;

const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickOne = a => a[Math.floor(Math.random() * a.length)];
// 選ぶ問題：正解1つ＋まちがい（ランダムに並べる）
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ========================================
// 問題（単元ごと）。どの問題も、化学1章の話の場面にそろえる（ニュートンくんの錬金術の筋も）
// ========================================

// ---- 問題の絵（400 × 150。色は CLAUDE.md の「化学の色」）----
const F = ' font-family="Zen Maru Gothic" font-weight="700"';
const T = (x, y, s, size, fill, anchor) => `<text x="${x}" y="${y}" font-size="${size || 12}" fill="${fill || '#1f2638'}" text-anchor="${anchor || 'middle'}"${F}>${s}</text>`;
const picBox = inner => `<svg class="pic" viewBox="0 0 400 150" role="img" aria-hidden="true"><rect width="400" height="150" rx="10" fill="#eef2f7"/>${inner}</svg>`;
const chara = (who, face, x) => `<image href="../story/img/${who}_${face}.webp" x="${x}" y="22" width="96" height="128"/>`;
// ビーカー（液の色・中身の点）
function beaker(x, label, liquid, dots) {
  let s = `<path d="M${x - 34} 40 v78 q0 8 8 8 h52 q8 0 8 -8 v-78" fill="none" stroke="#6b7488" stroke-width="3"/>` +
    `<rect x="${x - 31}" y="70" width="62" height="53" rx="4" fill="${liquid || '#bfe2f6'}" opacity=".9"/>`;
  (dots || []).forEach(([dx, dy, c]) => { s += `<circle cx="${x + dx}" cy="${dy}" r="3" fill="${c}" stroke="#6b7488" stroke-width=".8"/>`; });
  return s + T(x, 144, label, 12);
}
// バーナーと炎（色を変えられる）
function burner(x, color) {
  return `<rect x="${x - 10}" y="104" width="20" height="34" fill="#6b7488"/><rect x="${x - 22}" y="136" width="44" height="6" rx="2" fill="#6b7488"/>` +
    `<path d="M${x} 36 q-22 38 -10 66 h20 q12 -28 -10 -66z" fill="${color}" stroke="#22305a" stroke-width="1.2"/>` +
    `<path d="M${x} 66 q-9 18 -4 36 h8 q5 -18 -4 -36z" fill="#fff" opacity=".55"/>`;
}

/* ---- 化1-1（化学 第1話「透明な水は、純粋？」）：純物質と混合物 ---- */
const PURE = ['水（純水）', '酸素', '塩化ナトリウム', '鉄', '二酸化炭素', 'エタノール', 'ダイヤモンド', '銅'];
const MIX  = ['海水', '空気', '牛乳', '食塩水', '石油', 'しょうゆ', '花こう岩', '水道水'];
function qPureOrMix() {
  const pure = Math.random() < 0.5, name = pickOne(pure ? PURE : MIX);
  return {
    badge: '純物質と混合物',
    text: `ニュートンくんが、ビーカーに入れた「<b>${name}</b>」を見せた。<br>これは純物質？ それとも混合物？`,
    pic: picBox(beaker(150, name, '#bfe2f6') + chara('newton', 'question', 280)),
    choices: ['純物質', '混合物'], answer: pure ? '純物質' : '混合物',
    explain: pure ? `${name}は、1種類の物質だけでできている → <b>純物質</b>。` : `${name}は、2種類以上の物質がまざっている → <b>混合物</b>。`
  };
}
function qFindMix() {
  const mix = pickOne(MIX), pures = shuffle(PURE).slice(0, 3);
  return {
    badge: '純物質と混合物',
    text: `リカが4つのものをならべた。<br>この中で<b>混合物</b>はどれ？`,
    choices: shuffle([mix, ...pures]), answer: mix,
    explain: `${mix}は、いくつかの物質がまざった<b>混合物</b>。ほかの3つは、1種類の物質だけでできた純物質。`
  };
}
function qBoiling() {
  const pure = Math.random() < 0.5;
  const what = pure ? '純水' : '海の水';
  return {
    badge: '純物質と混合物',
    text: `ニュートンくんが、${what}を同じ強さで熱し続けた。沸騰が始まったあと、温度はどうなる？<br><small>（1気圧）</small>`,
    pic: picBox(beaker(150, what, '#bfe2f6', pure ? [] : [[-12, 100, '#fff'], [6, 92, '#fff'], [14, 108, '#fff']]) + T(150, 28, '同じ強さで熱し続ける', 12, '#d93a3f') + chara('newton', 'think', 280)),
    choices: ['100 ℃ で一定になる', '100 ℃ をこえて、少しずつ上がり続ける', 'だんだん下がる'],
    answer: pure ? '100 ℃ で一定になる' : '100 ℃ をこえて、少しずつ上がり続ける',
    explain: pure ? '純物質は沸点が決まっている。純水は 100 ℃ で温度が一定になる。'
                  : '海の水は混合物。沸点が決まっていない。水が減って濃くなると、沸騰する温度も上がっていく。'
  };
}

/* ---- 化1-2（化学 第2話・第3話）：分離・精製 ---- */
const METHODS = [
  ['砂がまざってにごった水から、砂を取りのぞく', 'ろ過', 'ろ紙で、液体と固体を分ける。'],
  ['海の水から、まじりけのない水だけを取り出す', '蒸留', '熱して出てきた水蒸気を冷やして集める。とけている食塩はフラスコに残る。'],
  ['黒い水性ペンのインクを、何色かの色素に分ける', 'クロマトグラフィー', 'ろ紙へのくっつきやすさのちがいで分ける。'],
  ['少し不純物がまざった硝酸カリウムから、純粋な結晶を取り出す', '再結晶', '温度によるとけ方のちがいを使う。冷やすと、とけきれなくなった硝酸カリウムが結晶になる。'],
  ['お茶の葉から、おいしい成分をお湯に取り出す（お茶をいれる）', '抽出', 'とけやすい液体（お湯）に、ほしい成分だけを移す。'],
  ['砂がまざったヨウ素から、ヨウ素だけを取り出す', '昇華法', 'ヨウ素は熱すると固体から直接気体になる（昇華）。冷やすとまた固体にもどる。']
];
function qMethod() {
  const [what, ans, why] = pickOne(METHODS);
  const others = shuffle(METHODS.map(m => m[1]).filter(m => m !== ans)).slice(0, 3);
  return {
    badge: '分離・精製',
    text: `リカ「${what}には、どの方法がいいかな？」`,
    choices: shuffle([ans, ...others]), answer: ans,
    explain: `<b>${ans}</b>：${why}`
  };
}
function qFiltrate() {
  return {
    badge: '分離・精製',
    text: '砂まじりの食塩水を、ろ紙でろ過した。ろ紙を<b>通りぬける</b>のはどれ？',
    pic: picBox(`<path d="M120 30 l40 50 l40 -50z" fill="#fff" stroke="#6b7488" stroke-width="2"/><rect x="157" y="80" width="6" height="24" fill="#6b7488"/>` +
      `<circle cx="150" cy="44" r="4" fill="#b47a44"/><circle cx="165" cy="50" r="4" fill="#b47a44"/><circle cx="175" cy="40" r="4" fill="#b47a44"/>` +
      beaker(160, '下にたまる液', '#bfe2f6').replace('y="70"', 'y="96"').replace('height="53"', 'height="27"') + chara('rika', 'question', 280)),
    choices: ['水と食塩', '水だけ', '砂と食塩', '水と砂'], answer: '水と食塩',
    explain: 'とけている食塩の粒は、ろ紙の穴より小さいので通りぬける。だから下にたまった液はしょっぱい。砂だけがろ紙に残る。'
  };
}
function qDistillPoint() {
  return pickOne([
    { badge: '分離・精製', text: '蒸留の装置で、温度計の球（下のはし）はどこに置く？',
      choices: ['枝付きフラスコの枝のつけね', '液の中', 'フラスコの底', '受け器の中'], answer: '枝付きフラスコの枝のつけね',
      explain: '出ていく蒸気の温度をはかるので、<b>枝のつけね</b>に置く。' },
    { badge: '分離・精製', text: '蒸留の装置で、冷却器（リービッヒ冷却器）の水は、どう流す？',
      choices: ['下から入れて、上から出す', '上から入れて、下から出す', '流さずにためておく'], answer: '下から入れて、上から出す',
      explain: '<b>下から上</b>へ流すと、冷却器の中が水で満たされて、よく冷える。' },
    { badge: '分離・精製', text: '蒸留で、液の中に沸騰石を入れるのはなぜ？',
      choices: ['急に激しく沸騰する（突沸）のを防ぐため', '液の色を変えるため', '温度を下げるため'], answer: '急に激しく沸騰する（突沸）のを防ぐため',
      explain: '沸騰石を入れると、おだやかに沸騰する。<b>突沸</b>を防ぐため。' },
    { badge: '分離・精製', text: 'ろ紙に黒インクの点をつけて水につけた。ろ紙に<b>くっつきにくい</b>色素は、どうなる？',
      choices: ['上のほうまで速く上がる', '点の場所から動かない', '下にしずむ'], answer: '上のほうまで速く上がる',
      explain: 'くっつきにくい色素ほど、水といっしょに上まで行く。くっつきやすさのちがいで分ける方法が<b>クロマトグラフィー</b>。' }
  ]);
}

/* ---- 化1-3（化学 第4話「骨の『カルシウム』は、金属のかたまり？」）：元素と単体 ---- */
const SENTENCES = [
  ['骨には<b>カルシウム</b>が多くふくまれる', '元素'], ['<b>カルシウム</b>は銀白色の金属で、水に入れるとあわを出す', '単体'],
  ['水は水素と<b>酸素</b>からできている', '元素'], ['わたしたちは、空気中の<b>酸素</b>を吸っている', '単体'],
  ['ほうれんそうには<b>鉄</b>がふくまれる', '元素'], ['<b>鉄</b>くぎを外に置いておくと、さびる', '単体'],
  ['タンパク質には<b>窒素</b>がふくまれる', '元素'], ['空気の約 78 % は<b>窒素</b>だ', '単体'],
  ['牛乳には<b>カルシウム</b>がたっぷり', '元素'], ['ボンベにつめた<b>酸素</b>を吸う', '単体']
];
function qElementOrSimple() {
  const [s, ans] = pickOne(SENTENCES);
  return {
    badge: '元素と単体',
    text: `リカ「${s}」<br>この文の太字は、<b>元素</b>の意味？ <b>単体</b>の意味？`,
    pic: picBox(`<rect x="20" y="30" width="250" height="90" rx="10" fill="#fff" stroke="#e9c48f" stroke-width="2"/>` + T(145, 70, '元素：物質をつくる成分', 13, '#7e5129') + T(145, 96, '単体：1種類の元素だけでできた物質', 13, '#22305a') + chara('rika', 'question', 290)),
    choices: ['元素', '単体'], answer: ans,
    explain: ans === '元素' ? '物質をつくっている<b>成分</b>としての名前 → <b>元素</b>。' : 'その元素だけでできた<b>物質そのもの</b> → <b>単体</b>。'
  };
}
const SIMPLE = ['酸素', '鉄', '銅', '水素', '窒素', 'カルシウム（金属）', 'ダイヤモンド', 'オゾン'];
const COMPOUND = ['水', '二酸化炭素', '塩化ナトリウム', 'アンモニア', 'メタン', 'エタノール', '酸化銅'];
function qSimpleOrCompound() {
  const simple = Math.random() < 0.5, name = pickOne(simple ? SIMPLE : COMPOUND);
  return {
    badge: '元素と単体',
    text: `「<b>${name}</b>」は、単体？ 化合物？`,
    choices: ['単体', '化合物'], answer: simple ? '単体' : '化合物',
    explain: simple ? `${name}は、1種類の元素だけでできている → <b>単体</b>。` : `${name}は、2種類以上の元素が結びついてできている → <b>化合物</b>。`
  };
}
function qGoldElement() {
  return {
    badge: '元素と単体',
    text: 'ニュートンくん「わしは、鉛から金を作ろうとしておった…」<br>金と鉛について、正しいのはどれ？',
    pic: picBox(chara('newton', 'think', 280) + T(130, 80, '鉛 → 金 ？', 24, '#7e5129')),
    choices: ['金も鉛も、それぞれ1つの元素', '金は鉛と何かの化合物', '金は混合物'], answer: '金も鉛も、それぞれ1つの元素',
    explain: '金（Au）も鉛（Pb）も、それぞれ<b>元素</b>。元素がちがうものを、ほかの元素に変えられるのか…その答えは2章で。'
  };
}

/* ---- 化1-4（化学 第5話「ダイヤモンドと鉛筆のしんは、同じもの？」）：同素体 ---- */
const ALLO = [['ダイヤモンド', '黒鉛', '炭素'], ['ダイヤモンド', 'フラーレン', '炭素'], ['酸素', 'オゾン', '酸素'], ['黄リン', '赤リン', 'リン'], ['斜方硫黄', '単斜硫黄', '硫黄'], ['斜方硫黄', 'ゴム状硫黄', '硫黄']];
const NOT_ALLO = ['水と氷', '一酸化炭素と二酸化炭素', '鉄と鉄さび', '金と真ちゅう', '水と水蒸気'];
function qAlloPair() {
  const [a, b] = pickOne(ALLO);
  const pair = `${a}と${b}`;
  return {
    badge: '同素体',
    text: 'この中で、<b>同素体</b>の組み合わせはどれ？',
    choices: shuffle([pair, ...shuffle(NOT_ALLO).slice(0, 3)]), answer: pair,
    explain: `${pair}は、同じ元素の単体で性質がちがう → <b>同素体</b>。水と氷は同じ物質の状態のちがい、一酸化炭素と二酸化炭素は化合物。`
  };
}
function qAlloElement() {
  const [a, b, el] = pickOne(ALLO);
  const others = shuffle(['炭素', '酸素', 'リン', '硫黄', '鉄', '水素'].filter(e => e !== el)).slice(0, 3);
  return {
    badge: '同素体',
    text: `「${a}」と「${b}」は、何という元素の同素体？`,
    choices: shuffle([el, ...others]), answer: el,
    explain: `どちらも<b>${el}</b>の単体。原子のつながり方などがちがうので、性質がちがう。同素体がある元素は S・C・O・P（スコップ）。`
  };
}
function qBurnDiamond() {
  return {
    badge: '同素体',
    text: 'ニュートンくんが、ダイヤモンドと黒鉛（鉛筆のしん）を、それぞれ燃やした。できるものは？',
    pic: picBox(burner(110, '#d93a3f') + burner(200, '#d93a3f') + T(110, 28, 'ダイヤモンド', 12) + T(200, 28, '黒鉛', 12) + chara('newton', 'proud', 290)),
    choices: ['どちらも二酸化炭素だけ', 'ダイヤモンドだけ二酸化炭素', 'どちらも金', 'どちらも何もできない'], answer: 'どちらも二酸化炭素だけ',
    explain: 'どちらも炭素だけでできているので、燃やすと<b>二酸化炭素（CO₂）だけ</b>ができる。炭からダイヤモンドは作れても、炭から金は作れない（元素がちがう）。'
  };
}

/* ---- 化1-5（化学 第6話「炎の色で、中身がわかる？」）：成分元素の検出 ---- */
// 炎色反応の色（CLAUDE.md の「化学の色」。この場面だけの例外）
const FLAME = [['リチウム（Li）', '赤', '#d93a3f'], ['ナトリウム（Na）', '黄', '#ffe14a'], ['カリウム（K）', '赤紫', '#b05cc4'], ['カルシウム（Ca）', '橙赤', '#f07a3a'], ['ストロンチウム（Sr）', '紅', '#c8243c'], ['バリウム（Ba）', '黄緑', '#a8d04a'], ['銅（Cu）', '青緑', '#2fb5a0']];
function qFlameColor() {
  const [el, color, hex] = pickOne(FLAME);
  const others = shuffle(FLAME.map(f => f[1]).filter(c => c !== color)).slice(0, 3);
  return {
    badge: '炎色反応',
    text: `${el}をふくむ水溶液を、白金線につけて炎に入れた。炎は何色になる？`,
    pic: picBox(burner(150, '#bfe2f6') + T(150, 20, '？', 18, '#22305a') + chara('rika', 'question', 280)),
    choices: shuffle([color, ...others]), answer: color,
    explain: `${el}の炎色反応は<b>${color}</b>。元素ごとに決まった色が出る。`
  };
}
function qFlameElement() {
  const [el, color, hex] = pickOne(FLAME);
  const others = shuffle(FLAME.map(f => f[0]).filter(e => e !== el)).slice(0, 3);
  return {
    badge: '炎色反応',
    text: `ある水溶液を炎に入れたら、<b>${color}</b>色になった。ふくまれている元素は？`,
    pic: picBox(burner(150, hex) + chara('rika', 'surprise', 280)),
    choices: shuffle([el, ...others]), answer: el,
    explain: `${color}の炎 → <b>${el}</b>。（Li 赤、Na 黄、K 赤紫、Ca 橙赤、Sr 紅、Ba 黄緑、Cu 青緑）`
  };
}
function qNewtonGold() {
  return {
    badge: '炎色反応',
    text: 'ニュートンくんが、むかし作った「金色の金属」を炎に入れたら、<b>青緑</b>色になった。この金属にふくまれている元素は？',
    pic: picBox(burner(150, '#2fb5a0') + chara('newton', 'oops', 280)),
    choices: ['銅', '金', 'ナトリウム', 'カルシウム'], answer: '銅',
    explain: '青緑は<b>銅（Cu）</b>の炎色反応。ニュートンくんの「金」は、銅に亜鉛をまぜた真ちゅうだった。'
  };
}
function qDetect() {
  return pickOne([
    { badge: '成分元素の検出', text: '物質を燃やして出た気体を石灰水に通したら、白くにごった。物質にふくまれていた元素は？',
      choices: ['炭素', '塩素', 'ナトリウム', '銅'], answer: '炭素',
      explain: '石灰水が白くにごる → 二酸化炭素ができた → もとの物質に<b>炭素</b>がふくまれていた。' },
    { badge: '成分元素の検出', text: '水溶液に硝酸銀水溶液を加えたら、白い沈殿ができた。ふくまれていた元素は？',
      choices: ['塩素', '炭素', '水素', 'カリウム'], answer: '塩素',
      explain: '白い沈殿（塩化銀）ができる → <b>塩素</b>がふくまれていた。' },
    { badge: '成分元素の検出', text: '物質を燃やしてできた液体を、青色の塩化コバルト紙につけたら、赤色（うすい赤）になった。もとの物質にふくまれていた元素は？',
      choices: ['水素', '塩素', '銅', 'カルシウム'], answer: '水素',
      explain: '塩化コバルト紙が青から赤に → 水ができた → もとの物質に<b>水素</b>がふくまれていた。' }
  ]);
}

/* ---- 化1-6（化学 第7話「氷がとけている間、温度は？」）：状態変化 ---- */
const CHANGES = [['固体', '液体', '融解'], ['液体', '固体', '凝固'], ['液体', '気体', '蒸発'], ['気体', '液体', '凝縮'], ['固体', '気体', '昇華'], ['気体', '固体', '凝華']];
function qChangeName() {
  const [a, b, name] = pickOne(CHANGES);
  const others = shuffle(CHANGES.map(c => c[2]).filter(n => n !== name)).slice(0, 3);
  return {
    badge: '状態変化',
    text: `物質が<b>${a}</b>から<b>${b}</b>に変わることを、何という？`,
    pic: picBox(T(90, 80, a, 22, '#22305a') + `<path d="M140 74 h60" stroke="#d93a3f" stroke-width="4"/><path d="M200 66 l14 8 -14 8z" fill="#d93a3f"/>` + T(250, 80, b, 22, '#22305a') + T(170, 110, '？', 20, '#d93a3f')),
    choices: shuffle([name, ...others]), answer: name,
    explain: `${a} → ${b}は<b>${name}</b>。（融解・凝固・蒸発・凝縮・昇華・凝華）`
  };
}
const EXAMPLES = [['ドライアイスが、だんだん小さくなっていく', '昇華'], ['冷たい飲み物のコップの外側に、水てきがつく', '凝縮'], ['冬の朝、地面に霜ができる', '凝華'],
  ['ろうそくのろうが、炎の熱でとける', '融解'], ['水を冷凍庫に入れたら、氷になった', '凝固'], ['ぬれたタオルが、ほしておくとかわく', '蒸発']];
function qChangeExample() {
  const [what, name] = pickOne(EXAMPLES);
  const others = shuffle(CHANGES.map(c => c[2]).filter(n => n !== name)).slice(0, 3);
  return {
    badge: '状態変化',
    text: `リカ「${what}」<br>これは、どの状態変化？`,
    choices: shuffle([name, ...others]), answer: name,
    explain: `${what} → <b>${name}</b>。`
  };
}
function qPlateau() {
  return pickOne([
    { badge: '状態変化', text: 'ニュートンくんが、−20 ℃ の氷を同じ強さで熱し続けた。氷がとけている間、温度はどうなる？<br><small>（1気圧）</small>',
      pic: picBox(`<path d="M40 130 L80 100 L150 100 L220 40 L330 40" fill="none" stroke="#d93a3f" stroke-width="3"/>` + T(115, 92, '？', 16, '#22305a') + T(275, 32, '？', 16, '#22305a') + T(200, 145, '熱した時間 →', 11, '#6b7488')),
      choices: ['0 ℃ で一定', 'ずっと上がり続ける', 'だんだん下がる'], answer: '0 ℃ で一定',
      explain: '氷と水がまざっている間（融解中）は、<b>0 ℃ で一定</b>。加えた熱は、粒どうしのつながりを切るのに使われる。' },
    { badge: '状態変化', text: '水が沸騰している間、加えた熱は何に使われている？',
      choices: ['粒どうしのつながりを切るのに使われる', '温度を上げるのに使われる', 'どこにも使われない'], answer: '粒どうしのつながりを切るのに使われる',
      explain: '状態が変わっている間は、熱が<b>粒どうしのつながりを切る</b>のに使われるので、温度は上がらない（100 ℃ で一定）。' },
    { badge: '状態変化', text: '1気圧で、水の<b>沸点</b>は何 ℃？', number: true, answer: 100, unit: '℃', tol: 0,
      explain: '1気圧で、水は <b>100 ℃</b> で沸騰する（沸点）。0 ℃ でとける（融点）。' },
    { badge: '状態変化', text: '1気圧で、氷の<b>融点</b>は何 ℃？', number: true, answer: 0, unit: '℃', tol: 0,
      explain: '1気圧で、氷は <b>0 ℃</b> でとける（融点）。' },
    { badge: '状態変化', text: 'ニュートンくん「金を熱してとかしたら、別のものになるかのう？」正しいのはどれ？',
      choices: ['とけても金のまま（状態が変わるだけ）', 'とけると別の元素になる', 'とけると金がなくなる'], answer: 'とけても金のまま（状態が変わるだけ）',
      explain: 'とけても、固まれば金にもどる。状態変化では、<b>物質は変わらない</b>。' }
  ]);
}

/* ---- 化1-7（化学 第8話「水が水蒸気になると、粒は大きくなる？」）：熱運動と絶対温度  T = t + 273 ---- */
function thermo(t) {
  const h = Math.max(4, Math.min(90, (t + 273) / 500 * 90));
  return `<rect x="60" y="20" width="18" height="110" rx="9" fill="#fff" stroke="#6b7488" stroke-width="2"/><rect x="64" y="${126 - h}" width="10" height="${h}" rx="5" fill="#d93a3f"/>`;
}
function qToKelvin() {
  const t = pickOne([-273, -73, -23, 0, 27, 37, 100, 127, 227]);
  return {
    badge: '絶対温度',
    text: `リカの温度計は <b>${t < 0 ? '−' + (-t) : t} ℃</b>。絶対温度では何 K？<br><small>（T = t + 273）</small>`,
    pic: picBox(thermo(t) + T(170, 80, (t < 0 ? '−' + (-t) : t) + ' ℃ → ？ K', 20, '#22305a') + chara('rika', 'question', 290)),
    number: true, answer: t + 273, unit: 'K', tol: 0,
    explain: `T = t + 273 = ${t < 0 ? '(−' + (-t) + ')' : t} + 273 = <b>${t + 273} K</b>`
  };
}
function qToCelsius() {
  const T0 = pickOne([0, 73, 200, 273, 300, 310, 373, 400]);
  return {
    badge: '絶対温度',
    text: `絶対温度 <b>${T0} K</b>は、セルシウス温度で何 ℃？<br><small>（t = T − 273。マイナスのときは − をつけて入力）</small>`,
    number: true, signed: true, answer: T0 - 273, unit: '℃', tol: 0,
    explain: `t = T − 273 = ${T0} − 273 = <b>${T0 - 273} ℃</b>`
  };
}
function qParticle() {
  return pickOne([
    { badge: '熱運動', text: 'ニュートンくん「水が水蒸気になると、体積はとても大きくなる」<br>このとき、水の粒はどうなっている？',
      pic: picBox(Array.from({ length: 8 }, (_, i) => `<circle cx="${40 + (i % 4) * 14}" cy="${80 + Math.floor(i / 4) * 14}" r="6" fill="#bfe2f6" stroke="#22305a"/>`).join('') +
        `<path d="M110 88 h40" stroke="#d93a3f" stroke-width="3"/><path d="M150 82 l10 6 -10 6z" fill="#d93a3f"/>` +
        Array.from({ length: 8 }, (_, i) => `<circle cx="${180 + (i % 4) * 30}" cy="${50 + Math.floor(i / 4) * 50 + (i % 2) * 14}" r="6" fill="#bfe2f6" stroke="#22305a"/>`).join('') + T(70, 130, '水', 12) + T(225, 140, '水蒸気', 12)),
      choices: ['粒の大きさは同じで、すきまが広がる', '粒そのものが大きくなる', '粒の数がふえる'],
      answer: '粒の大きさは同じで、すきまが広がる',
      explain: '粒の大きさも数も変わらない。粒がはげしく動いて、<b>すきまが広がる</b>ので体積が大きくなる。' },
    { badge: '熱運動', text: '温度が高くなると、物質をつくる粒の動き（熱運動）はどうなる？',
      choices: ['はげしくなる', 'おだやかになる', '変わらない'], answer: 'はげしくなる',
      explain: '温度が高いほど、粒は<b>はげしく</b>熱運動をする。' },
    { badge: '絶対温度', text: '粒の熱運動が止まる、いちばん低い温度は？',
      choices: ['−273 ℃（0 K）', '0 ℃（273 K）', '−100 ℃（173 K）'], answer: '−273 ℃（0 K）',
      explain: '<b>−273 ℃</b> で粒の動きが止まる。この温度を 0 とした温度が絶対温度（単位 K）。' }
  ]);
}

// 単元：名前・話の番号（📖 第◯話）・問題
const UNITS = {
  '化1-1': { name: '純物質と混合物',   ep: 1, title: '透明な水は、純粋？',                         gens: [qPureOrMix, qFindMix, qBoiling] },
  '化1-2': { name: '分離・精製',       ep: 2, title: 'にごった水を、きれいにするには？',           gens: [qMethod, qFiltrate, qDistillPoint] },
  '化1-3': { name: '元素と単体',       ep: 4, title: '骨の『カルシウム』は、金属のかたまり？',     gens: [qElementOrSimple, qSimpleOrCompound, qGoldElement] },
  '化1-4': { name: '同素体',           ep: 5, title: 'ダイヤモンドと鉛筆のしんは、同じもの？',     gens: [qAlloPair, qAlloElement, qBurnDiamond] },
  '化1-5': { name: '成分元素の検出',   ep: 6, title: '炎の色で、中身がわかる？',                   gens: [qFlameColor, qFlameElement, qNewtonGold, qDetect] },
  '化1-6': { name: '状態変化',         ep: 7, title: '氷がとけている間、温度は？',                 gens: [qChangeName, qChangeExample, qPlateau] },
  '化1-7': { name: '熱運動と絶対温度', ep: 8, title: '水が水蒸気になると、粒は大きくなる？',       gens: [qToKelvin, qToCelsius, qParticle] }
};
// シミュから来たときの「← 第◯話のシミュにもどる」
const SIM_EP = {
  'chem-boiling.html': 1, 'chem-separation.html': 2, 'chem-chromatography.html': 3, 'chem-element.html': 4,
  'chem-allotrope.html': 5, 'chem-flame.html': 6, 'chem-heating-curve.html': 7, 'chem-particles.html': 8
};

const unitId = new URLSearchParams(location.search).get('unit');
const unit = UNITS[unitId] || UNITS['化1-1'];
const unitKey = UNITS[unitId] ? unitId : '化1-1';

// ========================================
// 音（物理のドリルと同じ音）
// ========================================
let soundOn = true, audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playTone(freq, type, start, dur, vol, ctx) {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start); osc.stop(start + dur + 0.01);
}
function sound(fn) { if (!soundOn) return; try { fn(getAudioCtx()); } catch (e) { /* 音が出せない端末 */ } }
const playCorrect = () => sound(ctx => { const n = ctx.currentTime; playTone(523.25, 'sine', n, .15, .28, ctx); playTone(783.99, 'sine', n + .12, .25, .28, ctx); });
const playWrong = () => sound(ctx => { const n = ctx.currentTime; playTone(220, 'square', n, .18, .12, ctx); playTone(180, 'square', n + .14, .18, .10, ctx); });
const playFanfare = () => sound(ctx => { const n = ctx.currentTime; [[523.25, 0], [659.25, .14], [783.99, .28], [1046.5, .42]].forEach(([f, d]) => playTone(f, 'sine', n + d, .3, .22, ctx)); });
function awardJingle(kind) {
  sound(ctx => {
    const now = ctx.currentTime;
    const seq = kind === 'trophy'
      ? [[523.25, 0, .16], [659.25, .14, .16], [783.99, .28, .16], [1046.5, .42, .5], [783.99, .74, .14], [1046.5, .88, .14], [1318.5, 1.02, .7]]
      : [[783.99, 0, .14], [1046.5, .13, .14], [1318.5, .26, .45]];
    seq.forEach(([f, d, len]) => { playTone(f, 'triangle', now + d, len, .2, ctx); playTone(f * 2, 'sine', now + d, len * .8, .05, ctx); });
  });
}
function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('sound-btn').textContent = soundOn ? '🎵' : '🔇';
}

// ========================================
// リカ（いっしょに解くガイド役）
// ========================================
function rika(face, text) {
  document.getElementById('rika-img').src = `../story/img/rika_${face}.webp`;
  document.getElementById('rika-line').textContent = text;
}
['normal', 'confident', 'surprise', 'idea', 'question', 'happy', 'oops'].forEach(f => { new Image().src = `../story/img/rika_${f}.webp`; });

// ========================================
// 問題を出す・答え合わせ
// ========================================
function loadProblem() {
  answered = false; picked = null;
  if (count === 0) rika('normal', 'いっしょに解こう！ ニュートンくんの話を思い出してね。');
  else if (TOTAL - count <= 3) rika('confident', `あと ${TOTAL - count} 問！ ラストスパート！`);
  else rika('normal', '次の問題、いってみよう！');
  current = pickOne(unit.gens)();

  document.getElementById('badge').textContent = current.badge;
  document.getElementById('problem-text').innerHTML = current.text;
  document.getElementById('pic').innerHTML = current.pic || '';
  const area = document.getElementById('answer-area');
  if (current.number) {
    area.innerHTML = `<div class="input-row"><span class="input-label">答え =</span>
      <input type="number" class="answer-input" id="inp-result" placeholder="?" inputmode="${current.signed ? 'text' : 'decimal'}" step="any" autocomplete="off">
      <span class="unit">${current.unit}</span></div>`;
  } else {
    area.innerHTML = '<div class="choices" role="group" aria-label="答えをえらぶ"></div>';
    const box = area.firstChild;
    current.choices.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'choice-btn'; b.textContent = c; b.setAttribute('aria-pressed', 'false');
      b.onclick = () => { if (answered) return; picked = c; box.querySelectorAll('.choice-btn').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); };
      box.appendChild(b);
    });
  }
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('explain').style.display = 'none';
  document.getElementById('check-btn').style.display = 'block';
  document.getElementById('next-btn').style.display = 'none';
}

function checkAnswer() {
  if (answered) return;
  let ok;
  if (current.number) {
    const el = document.getElementById('inp-result');
    if (el.value === '') { rika('question', 'あれ、答えの欄がまだ空いてるよ？'); return; }
    const v = parseFloat(el.value.replace('−', '-'));
    ok = Math.abs(v - current.answer) <= (current.tol || 0) + 1e-9;
    el.classList.add(ok ? 'correct' : 'incorrect'); el.disabled = true;
  } else {
    if (picked === null) { rika('question', 'どれかひとつ、えらんでね。'); return; }
    ok = picked === current.answer;
    document.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
      if (b.textContent === current.answer) b.classList.add('correct');
      else if (b.textContent === picked) b.classList.add('incorrect');
    });
  }
  answered = true; count++;
  if (ok) score++;
  const fb = document.getElementById('feedback');
  fb.textContent = ok ? '✓ 正解！' : `✗ ざんねん。答えは「${current.answer}${current.number ? ' ' + current.unit : ''}」`;
  fb.className = 'feedback ' + (ok ? 'correct' : 'incorrect');
  const ex = document.getElementById('explain');
  ex.innerHTML = current.explain; ex.style.display = 'block';
  if (ok) { playCorrect(); rika('happy', pickOne(['やった、正解！', 'その調子！', 'ばっちりだね！'])); }
  else { playWrong(); rika('oops', 'わたしもまちがえた…。下の説明を読んでおこう！'); }
  document.getElementById('score').textContent = score;
  document.getElementById('total').textContent = count;
  document.getElementById('progress-fill').style.width = (count / TOTAL * 100) + '%';
  document.getElementById('progress-text').textContent = `${count} / ${TOTAL} 問`;
  document.getElementById('check-btn').style.display = 'none';
  const next = document.getElementById('next-btn');
  next.style.display = 'block';
  next.textContent = count >= TOTAL ? '結果を見る →' : '次の問題 →';
}

function nextProblem() {
  if (count >= TOTAL) { showResult(); return; }
  loadProblem();
}

// ========================================
// 結果とごほうび（物理のドリルと同じ）
// ========================================
function loadAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
function saveProgress() {
  const data = loadAll(), prev = data[unitKey] || { bestScore: 0, perfect: false };
  data[unitKey] = { bestScore: Math.max(prev.bestScore, score), perfect: prev.perfect || score === TOTAL };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 保存できない端末 */ }
}
function medalSVG(kind) {
  if (kind === 'trophy') return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M34 22 h52 v20 a26 26 0 0 1 -52 0z" fill="#ffe14a" stroke="#7e5129" stroke-width="3"/>
    <path d="M34 28 h-12 a12 12 0 0 0 14 18 M86 28 h12 a12 12 0 0 1 -14 18" fill="none" stroke="#7e5129" stroke-width="3"/>
    <rect x="54" y="66" width="12" height="16" fill="#e9c48f" stroke="#7e5129" stroke-width="3"/>
    <rect x="38" y="82" width="44" height="14" rx="3" fill="#22305a"/>
    <text x="60" y="93" text-anchor="middle" font-size="9" fill="#ffe14a" font-family="Zen Maru Gothic" font-weight="900">10 / 10</text>
    <path d="M50 34 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#fff" opacity=".8"/></svg>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M44 8 l-10 40 h18 l8 -22z M76 8 l10 40 h-18 l-8 -22z" fill="#d93a3f"/>
    <path d="M44 8 l-10 40 h18 l8 -22z" fill="#22305a" opacity=".85"/>
    <circle cx="60" cy="74" r="30" fill="#ffe14a" stroke="#7e5129" stroke-width="3"/>
    <circle cx="60" cy="74" r="22" fill="none" stroke="#e9c48f" stroke-width="3"/>
    <path d="M60 60 l4.5 9 10 1.4 -7.2 7 1.7 10 -9 -4.7 -9 4.7 1.7 -10 -7.2 -7 10 -1.4z" fill="#d93a3f"/></svg>`;
}
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(card) {
  if (REDUCE) return;
  const colors = ['#d93a3f', '#22305a', '#ffe14a', '#e9c48f', '#3f9a5c'];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};` +
      `animation-delay:${Math.random() * .5}s;animation-duration:${1.6 + Math.random()}s;--dx:${(Math.random() - .5) * 80}px;--r:${Math.random() * 720}deg`;
    card.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}
function showResult() {
  const prev = loadAll()[unitKey] || { bestScore: 0, perfect: false };
  saveProgress();
  document.getElementById('problem-view').style.display = 'none';
  document.getElementById('result-view').style.display = 'block';
  const pct = score / TOTAL;
  let title, msg;
  if      (pct >= .9) { title = '完璧！すごい！';   msg = `${score}問正解！この単元はバッチリですね！`;     rika('happy', 'すごすぎる！ わたしも見習わなきゃ！'); }
  else if (pct >= .7) { title = 'よくできました！'; msg = `${score}問正解！あと少しで満点です！`;         rika('confident', 'いい感じ！ 次は満点ねらっちゃおう！'); }
  else if (pct >= .5) { title = 'もう少し！';       msg = `${score}問正解。説明を読んで再挑戦！`;         rika('idea', '説明を読み直したら、きっとのびるよ！'); }
  else                { title = '頑張ろう！';        msg = `${score}問正解。くり返し練習しよう！`;       rika('oops', 'わたしも最初はまちがえてばっかりだったよ。もう一回やろう！'); }
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-score-num').textContent = score;
  document.getElementById('result-msg').textContent = msg;

  let kind = null, label = '', sub = '';
  const hadMedal = prev.bestScore >= MEDAL;
  if (score === TOTAL)     { kind = 'trophy'; label = prev.perfect ? 'トロフィー（もう持っている）' : 'トロフィー ゲット！'; sub = '全問正解のしるし'; }
  else if (score >= MEDAL) { kind = 'medal';  label = !hadMedal ? 'メダル ゲット！' : score > prev.bestScore ? 'ベスト記録 更新！' : 'メダル（もう持っている）'; sub = 'ベスト ' + Math.max(score, prev.bestScore) + ' / 10'; }
  const isNew = kind === 'trophy' ? !prev.perfect : kind === 'medal' ? (!hadMedal || score > prev.bestScore) : false;
  const card = document.querySelector('.result-card');
  card.querySelectorAll('.award, .award-hint').forEach(e => e.remove());
  const box = document.createElement('div');
  if (kind) {
    box.className = 'award ' + kind + (isNew ? ' new' : '');
    box.innerHTML = `<div class="award-badge">${medalSVG(kind)}</div><div class="award-label">${label}</div><div class="award-sub">${sub}</div>`;
    if (isNew) { confetti(card); awardJingle(kind); } else playFanfare();
  } else {
    box.className = 'award-hint';
    box.textContent = `あと ${MEDAL - score} 問でメダル！（${MEDAL}問以上）`;
    playFanfare();
  }
  card.insertBefore(box, card.querySelector('.result-msg').nextSibling);
}

function retry() {
  score = 0; count = 0;
  ['score', 'total'].forEach(id => document.getElementById(id).textContent = '0');
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-text').textContent = `0 / ${TOTAL} 問`;
  document.getElementById('result-view').style.display = 'none';
  document.getElementById('problem-view').style.display = 'block';
  loadProblem();
}

// ========================================
// はじめ：単元の名前、どの話の問題か、来たところへもどるリンク
// ========================================
function cameFrom() {
  try {
    const r = new URL(document.referrer);
    if (r.origin !== location.origin) return null;
    const ep = r.searchParams.get('ep');
    if (/\/story\/(index\.html)?$/.test(r.pathname) && ep && /^c/i.test(ep))
      return { href: r.href, label: `第${Number(ep.replace(/\D/g, ''))}話のストーリーにもどる` };
    const file = r.pathname.split('/').pop();
    if (SIM_EP[file]) return { href: r.href, label: `第${SIM_EP[file]}話のシミュにもどる` };
  } catch (e) { /* referrer がないとき */ }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('drill-title').textContent = `${unitKey}　${unit.name}`;
  document.title = `${unit.name} - わくわく化学基礎`;
  // どの話の問題か
  const chip = document.createElement('a');
  chip.className = 'story-chip';
  chip.href = '../story/index.html?ep=c' + String(unit.ep).padStart(2, '0');
  chip.innerHTML = `<img src="../story/img/newton_question.webp" alt="" width="26" height="26">化学 第${unit.ep}話「${unit.title}」の問題<span>ストーリーを見る ›</span>`;
  const card = document.querySelector('#problem-view .card');
  card.parentNode.insertBefore(chip, card);
  // 来たところへもどる
  const from = cameFrom();
  if (from) {
    const back = document.querySelector('.top .back-link');
    const box = document.createElement('div'); box.className = 'back-links';
    back.replaceWith(box);
    const a = document.createElement('a'); a.className = 'back-link'; a.href = from.href; a.textContent = '← ' + from.label;
    box.append(a, back);
  }
  document.addEventListener('keydown', e => { if (e.key === 'Enter') { if (!answered) checkAnswer(); else nextProblem(); } });
  loadProblem();
});
