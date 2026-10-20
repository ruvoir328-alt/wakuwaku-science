// お助けニュートンくん
// 会話はこのページのメモリの中だけに置き、どこにも保存しない（閉じれば消える）
(function () {
  'use strict';

  var API = (window.NEWTON_API || '').replace(/\/+$/, '');
  var IMG = '../story/img/';
  var MAX_SIDE = 1280;      // 送る前に写真をこの大きさまで縮める
  var MAX_HISTORY = 20;     // サーバーに送る会話の長さ

  var MODES = {
    photo: {
      title: '問題の写真を送る',
      greet: 'ふむ、問題の写真を送っておくれ。\n下の📷ボタンで撮影するか、写真を選べるぞ。\n名前や学校名が写らないようにしてくれるとうれしいのう。',
      placeholder: 'ひとことそえてもOK'
    },
    term: {
      title: '用語を聞く',
      greet: 'ふむ、よい問いを待っておるぞ。\n聞きたい用語を書いておくれ。\n例：「加速度ってなに？」「慣性の法則って？」',
      placeholder: '聞きたい用語を書いてね'
    },
    why: {
      title: '「なんで？」を聞く',
      greet: '「なんで？」と思ったことを聞いておくれ。\n例：「なんで重いものも軽いものも同時に落ちるの？」',
      placeholder: 'ふしぎに思ったことを書いてね'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var home = $('home'), chat = $('chat'), log = $('log');
  var input = $('input'), sendBtn = $('sendBtn'), fileInput = $('fileInput');
  var hintBtn = $('hintBtn'), answerBtn = $('answerBtn');

  var state = {
    mode: 'photo',
    history: [],          // {role:'user'|'assistant', text, image?}
    hintLevel: 0,
    hasProblem: false,
    answering: false,
    pendingImage: null,   // {media_type, data, url}
    busy: false,
    remaining: null,
    limit: null
  };

  // ---------- 端末ID（回数制限のためだけに使う） ----------
  function deviceId() {
    var id = null;
    try { id = localStorage.getItem('newton-device'); } catch (e) {}
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      id = crypto.randomUUID ? crypto.randomUUID() : fallbackUUID();
      try { localStorage.setItem('newton-device', id); } catch (e) {}
    }
    return id;
  }
  function fallbackUUID() {
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  var DEVICE = deviceId();

  // ---------- 残り回数 ----------
  function showQuota() {
    var q = $('quota');
    if (!API) {
      q.className = 'quota off';
      q.textContent = 'ただいま準備中です（サーバーにまだつながっていません）';
      $('chatQuota').textContent = '準備中';
      return;
    }
    if (state.remaining == null) return;
    q.className = 'quota';
    q.innerHTML = '今日あと <b>' + state.remaining + '</b> 回 質問できるよ';
    $('chatQuota').textContent = '今日あと ' + state.remaining + ' 回';
  }
  function loadQuota() {
    showQuota();
    if (!API) return;
    fetch(API + '/quota?deviceId=' + encodeURIComponent(DEVICE))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (typeof d.remaining === 'number') { state.remaining = d.remaining; state.limit = d.limit; showQuota(); }
      })
      .catch(function () {});
  }

  // ---------- 吹き出し ----------
  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addNewton(text, face) {
    var row = document.createElement('div');
    row.className = 'msg msg--newton';
    var img = document.createElement('img');
    img.className = 'face'; img.alt = 'ニュートンくん';
    img.src = IMG + 'newton_' + (face || 'normal') + '.webp';
    var b = document.createElement('div');
    b.className = 'bubble';
    b.textContent = text;
    row.appendChild(img); row.appendChild(b);
    log.appendChild(row); scrollDown();
    return row;
  }
  function addMe(text, imageUrl, tag) {
    var row = document.createElement('div');
    row.className = 'msg msg--me';
    var b = document.createElement('div');
    b.className = 'bubble';
    if (imageUrl) {
      var img = document.createElement('img');
      img.src = imageUrl; img.alt = '送った問題の写真';
      b.appendChild(img);
    }
    if (tag) {
      var t = document.createElement('span');
      t.className = 'tag'; t.textContent = tag;
      b.appendChild(t);
    }
    if (text) b.appendChild(document.createTextNode(text));
    row.appendChild(b);
    log.appendChild(row); scrollDown();
    return row;
  }
  function addSys(text) {
    var row = document.createElement('div');
    row.className = 'msg msg--sys';
    var b = document.createElement('div');
    b.className = 'bubble'; b.textContent = text;
    row.appendChild(b); log.appendChild(row); scrollDown();
  }
  function addTyping() {
    var row = addNewton('', 'think');
    row.classList.add('typing');
    row.querySelector('.bubble').innerHTML = '<i></i><i></i><i></i>';
    row.querySelector('.bubble').setAttribute('aria-label', 'ニュートンくんが考え中');
    return row;
  }

  // 返事の内容に合わせて表情を変える
  function faceFor(action, text) {
    if (action === 'start') return 'question';
    if (action === 'answer') {
      if (/おしい|惜しい/.test(text)) return 'oops';
      if (/正解|その通り|そのとおり|お見事|ばっちり|合っておる|あっておる/.test(text)) return 'happy';
      return 'think';
    }
    if (action === 'hint') return state.hintLevel >= 3 ? 'proud' : 'think';
    if (/専門外|答えられん/.test(text)) return 'oops';
    return 'normal';
  }

  // ---------- ヒントの進み具合 ----------
  function renderHints() {
    var photo = state.mode === 'photo' && state.hasProblem;
    $('hintProgress').hidden = !photo;
    $('actions').hidden = !photo;
    var dots = $('hintProgress').querySelectorAll('.dots i');
    for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < state.hintLevel);
    $('hintCount').textContent = state.hintLevel + '/3';
    hintBtn.disabled = state.busy || state.hintLevel >= 3;
    hintBtn.textContent = state.hintLevel >= 3 ? 'ヒントはここまで' : 'もうちょっとヒント';
    answerBtn.disabled = state.busy;
    answerBtn.classList.toggle('on', state.answering);
  }
  function renderComposer() {
    var off = state.busy || !API || state.remaining === 0;
    sendBtn.disabled = off;
    fileInput.disabled = off;
    fileInput.parentNode.classList.toggle('disabled', off);
    $('pending').hidden = !state.pendingImage;
    if (state.pendingImage) $('pendingImg').src = state.pendingImage.url;
    input.placeholder = state.answering
      ? '答えを書いてね（例：12 m/s）'
      : (state.pendingImage ? MODES.photo.placeholder : MODES[state.mode].placeholder);
    renderHints();
  }

  // ---------- 画面の切りかえ ----------
  function openChat(mode, push) {
    state.mode = mode;
    state.history = [];
    state.hintLevel = 0;
    state.hasProblem = false;
    state.answering = false;
    state.pendingImage = null;
    log.innerHTML = '';
    $('chatTitle').textContent = MODES[mode].title;
    home.hidden = true; chat.hidden = false;
    addNewton(MODES[mode].greet, mode === 'photo' ? 'normal' : 'happy');
    if (!API) addSys('ただいま準備中です。もう少し待っていてね。');
    else if (state.remaining === 0) addSys('今日の質問はここまで。また明日おいで！');
    renderComposer();
    showQuota();
    if (push) history.pushState({ view: 'chat', mode: mode }, '', '#' + mode);
    if (mode !== 'photo') input.focus();
  }
  function showHome() {
    chat.hidden = true; home.hidden = false;
    state.history = []; state.pendingImage = null;
    log.innerHTML = '';
    showQuota();
    window.scrollTo(0, 0);
  }

  var menuItems = document.querySelectorAll('.menu-item');
  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener('click', function () { openChat(this.getAttribute('data-mode'), true); });
  }
  $('backBtn').addEventListener('click', function () {
    if (state.history.length && !confirm('ホームにもどると、この会話は消えるよ。もどる？')) return;
    if (history.state && history.state.view === 'chat') history.back();
    else { history.replaceState(null, '', location.pathname); showHome(); }
  });
  window.addEventListener('popstate', function () {
    if (history.state && history.state.view === 'chat') openChat(history.state.mode, false);
    else showHome();
  });

  // ---------- 写真を縮めて JPEG にする ----------
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image')); };
      img.src = url;
    });
  }
  function shrink(file) {
    return loadImage(file).then(function (img) {
      var scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      var url = c.toDataURL('image/jpeg', 0.82);
      return { media_type: 'image/jpeg', data: url.split(',')[1], url: url };
    });
  }
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    shrink(file).then(function (p) {
      state.pendingImage = p;
      state.answering = false;
      renderComposer();
    }).catch(function () {
      addSys('この写真は読みこめなかったよ。別の写真をためしてね。');
    });
  });
  $('pendingX').addEventListener('click', function () { state.pendingImage = null; renderComposer(); });

  // ---------- 送る ----------
  // 写真は最新の1枚だけ送る（古い写真は、読み取った問題文が会話に残っているので不要）
  function payloadMessages() {
    var h = state.history.slice(-MAX_HISTORY);
    while (h.length && h[0].role !== 'user') h.shift();
    var lastImage = -1;
    h.forEach(function (m, i) { if (m.image) lastImage = i; });
    return h.map(function (m, i) {
      var out = { role: m.role, text: m.text };
      if (m.image && i === lastImage) out.image = { media_type: m.image.media_type, data: m.image.data };
      else if (m.image) out.text = '（前に送った問題の写真）' + (m.text ? '\n' + m.text : '');
      return out;
    });
  }

  function send(action, text, image, tag) {
    if (state.busy || !API) return;
    var prev = { hintLevel: state.hintLevel, hasProblem: state.hasProblem, mode: state.mode };
    if (action === 'start') {
      state.mode = 'photo'; state.hintLevel = 0; state.hasProblem = true;
      $('chatTitle').textContent = MODES.photo.title;
    }
    if (action === 'hint') state.hintLevel = Math.min(3, state.hintLevel + 1);

    var entry = { role: 'user', text: text };
    if (image) entry.image = image;
    state.history.push(entry);
    var bubble = addMe(text, image && image.url, tag);
    state.busy = true; state.answering = false; state.pendingImage = null;
    renderComposer();
    var typing = addTyping();

    fetch(API + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: DEVICE, mode: state.mode, action: action,
        hintLevel: state.hintLevel, messages: payloadMessages()
      })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
    }).then(function (res) {
      typing.remove();
      if (typeof res.d.remaining === 'number') state.remaining = res.d.remaining;
      if (!res.ok) throw res.d;
      state.history.push({ role: 'assistant', text: res.d.reply });
      addNewton(res.d.reply, faceFor(action, res.d.reply));
    }).catch(function (err) {
      if (typing.parentNode) typing.remove();
      // 届かなかった分は会話から外し、書いた内容を入力欄に戻す
      state.history.pop();
      bubble.remove();
      state.hintLevel = prev.hintLevel; state.hasProblem = prev.hasProblem; state.mode = prev.mode;
      if (action !== 'hint') input.value = text;
      if (image) state.pendingImage = image;
      if (action === 'answer') state.answering = true;
      addSys((err && err.message) || '通信がうまくいかなかったようじゃ。電波のよいところで、もう一度送っておくれ。');
    }).then(function () {
      state.busy = false;
      renderComposer();
      showQuota();
    });
  }

  $('composer').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    var image = state.pendingImage;
    if (!text && !image) return;
    if (text.length > 500) text = text.slice(0, 500);
    input.value = ''; autosize();
    if (image) send('start', text, image);
    else if (state.answering) send('answer', text, null, '答え');
    else send('chat', text);
  });
  input.addEventListener('keydown', function (e) {
    // パソコンでは Enter で送信、Shift+Enter で改行（変換中は送らない）
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(pointer:fine)').matches) {
      e.preventDefault();
      $('composer').requestSubmit();
    }
  });
  function autosize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }
  input.addEventListener('input', autosize);

  hintBtn.addEventListener('click', function () {
    if (state.hintLevel >= 3) return;
    send('hint', 'もうちょっとヒントちょうだい！');
  });
  answerBtn.addEventListener('click', function () {
    state.answering = !state.answering;
    renderComposer();
    if (state.answering) input.focus();
  });

  // ---------- はじめに ----------
  var start = location.hash.replace('#', '');
  if (MODES[start]) {
    history.replaceState(null, '', location.pathname);
    history.pushState({ view: 'chat', mode: start }, '', '#' + start);
    openChat(start, false);
  }
  loadQuota();
})();
