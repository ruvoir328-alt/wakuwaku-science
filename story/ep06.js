/* わくわく物理基礎 ストーリーモード
   第6話「重いほうが先に落ちる？」（新編物理基礎 1編1章 6 自由落下運動）

   場面（scene）の書き方
   - bg       : 舞台の絵（title / orchard / tube / tube-vacuum / tube-air / strobe / formula / answer / end）
   - chars    : 登場キャラ [{ who: 'newton' | 'rika', face: 表情, side: 'left' | 'right' }]
   - speaker  : 話している人（'newton' / 'rika' / なし）
   - text     : セリフ
   - choice   : 予想の選択肢（選ぶまで先へ進まない）
   - byChoice : 予想で選んだものによってセリフと表情を変える
                { id: choice の id, options: { 選択肢のkey: { face, text } } }
   - reveal   : 予想の答え合わせ（choice の id を指定。right / wrong にセリフ）
   - end      : 最後の場面（今日のポイントと、次へのボタンを出す）
*/
window.EPISODE = {
  id: '06',
  chapter: '1章 直線運動の世界',
  topic: '自由落下運動',
  title: '重いほうが先に落ちる？',
  drillUrl: '../physics/drill.html?unit=1-4',
  scenes: [
    { bg: 'title' },

    { bg: 'orchard', chars: [{ who: 'newton', face: 'ouch', side: 'left' }],
      speaker: 'newton', text: 'いたたた…。リンゴが頭に落ちてきおった。' },

    { bg: 'orchard', chars: [{ who: 'newton', face: 'think', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'rika', text: 'ニュートンくん、大丈夫？ リンゴって、けっこう速く落ちてくるんだね。' },

    /* ---- 謎と予想 ---- */
    { bg: 'tube', chars: [{ who: 'newton', face: 'question', side: 'left' }],
      speaker: 'newton', text: 'さて、問題じゃ。空気をぬいた真空の筒の中で、鉄球と羽根を同時に落とす。どうなると思う？',
      choice: {
        id: 'q1',
        options: [
          { key: 'ball', label: '鉄球が先に落ちる' },
          { key: 'feather', label: '羽根が先に落ちる' },
          { key: 'same', label: '同時に落ちる' }
        ],
        answer: 'same'
      } },

    { bg: 'tube', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'confident', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        ball:    { face: 'confident', text: 'わたしも鉄球だと思う！ だって重いもん。' },
        feather: { face: 'question',  text: 'えっ、羽根？ ふわふわだから、先には落ちなそうだけど…。' },
        same:    { face: 'surprise',  text: '同時!? 鉄球と羽根じゃ、重さがぜんぜん違うのに？' }
      } } },

    { bg: 'tube', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'normal', side: 'right' }],
      speaker: 'newton',
      byChoice: { id: 'q1', options: {
        ball:    { face: 'proud',    text: 'ふむ。昔の大学者も、重いものほど速く落ちると考えた。では、確かめてみよう。' },
        feather: { face: 'think',    text: 'なかなか大胆な予想じゃな。では、確かめてみよう。' },
        same:    { face: 'question', text: 'ほう、自信がありそうじゃな。では、確かめてみよう。' }
      } } },

    /* ---- シミュレーション ---- */
    { bg: 'tube-vacuum', chars: [{ who: 'rika', face: 'surprise', side: 'right' }],
      speaker: 'rika',
      byChoice: { id: 'q1', options: {
        ball:    { face: 'surprise', text: 'え、そうなの？ 鉄球と羽根が、並んで落ちてる…！' },
        feather: { face: 'surprise', text: 'あれ？ 羽根が先じゃない…。鉄球と並んで落ちてる！' },
        same:    { face: 'happy',    text: 'ほんとに同時だ！ 鉄球と羽根が、並んで落ちてる！' }
      } } },

    /* ---- 答え合わせ ---- */
    { bg: 'answer', reveal: 'q1',
      right: { face: 'happy', text: '正解じゃ！ 真空の中では、鉄球も羽根も同時に落ちる。' },
      wrong: { face: 'oops', text: 'おしい！ 答えは「同時」。真空の中では、重さに関係なく同時に落ちるのじゃ。' } },

    /* ---- くわしく見る ---- */
    { bg: 'strobe', chars: [{ who: 'newton', face: 'normal', side: 'left' }],
      speaker: 'newton', text: 'くわしく見てみよう。0.1秒ごとに写真をとると、間隔がだんだん広がっていく。記録テープのときと同じじゃな。' },

    { bg: 'strobe', chars: [{ who: 'newton', face: 'normal', side: 'left' }, { who: 'rika', face: 'idea', side: 'right' }],
      speaker: 'rika', text: 'そっか！ 落ちるのも、加速度が一定の運動なんだ！' },

    { bg: 'formula', chars: [{ who: 'newton', face: 'proud', side: 'left' }],
      speaker: 'newton', text: 'その加速度が重力加速度 g じゃ。g = 9.8 m/s²。初速度0から落ちるので、この2つの式で表せる。' },

    { bg: 'tube-air', chars: [{ who: 'rika', face: 'question', side: 'right' }],
      speaker: 'rika', text: 'でも、ふだんは羽根のほうがゆっくり落ちるよね？' },

    { bg: 'tube-air', chars: [{ who: 'newton', face: 'think', side: 'left' }, { who: 'rika', face: 'question', side: 'right' }],
      speaker: 'newton', text: 'それは空気にじゃまされておるからじゃ。空気の抵抗がなければ、重さに関係なく同じように落ちる。' },

    { bg: 'orchard', chars: [{ who: 'newton', face: 'proud', side: 'left' }, { who: 'rika', face: 'confused', side: 'right' }],
      speaker: 'rika', text: 'でも、なんで重さに関係ないの？ 重いほうが強く引っぱられそうなのに…。' },

    { bg: 'orchard', chars: [{ who: 'newton', face: 'question', side: 'left' }, { who: 'rika', face: 'confused', side: 'right' }],
      speaker: 'newton', text: 'よい問いじゃ。その謎は2章で、わしの法則が解き明かす。楽しみにしておれ。' },

    /* ---- まとめ ---- */
    { bg: 'end', end: true, chars: [{ who: 'newton', face: 'happy', side: 'left' }, { who: 'rika', face: 'happy', side: 'right' }],
      speaker: 'newton', text: '2秒後の速さは？ 何m落ちた？ 次は計算に挑戦じゃ！',
      points: [
        '空気の抵抗がなければ、物体は重さに関係なく同じように落ちる',
        '落下の加速度は一定で、重力加速度 g = 9.8 m/s²',
        'v = gt、y = ½gt²'
      ] }
  ]
};
