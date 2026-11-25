/**
 * Kanjimo – Lerninhalte JLPT N5.
 *
 * Lesungen: On-Lesungen in Katakana, Kun-Lesungen in Hiragana.
 * Ein Punkt trennt den Stamm von der Okurigana (z. B. "た.べる"),
 * ein Bindestrich markiert Präfix-/Suffix-Verwendung (z. B. "-び").
 * Die Strichzahl wird aus den KanjiVG-Daten abgeleitet (siehe strokes.json).
 */

export interface Example {
  /** Wort in Schriftform */
  w: string
  /** Lesung in Hiragana */
  r: string
  /** Deutsche Bedeutung */
  m: string
}

export interface KanjiEntry {
  c: string
  /** JLPT-Stufe 5 (leicht) … 1 (schwer); fehlt bei der kuratierten N5-Liste */
  level?: number
  meanings: string[]
  on: string[]
  kun: string[]
  mnemonic: string
  examples: Example[]
}

const e = (w: string, r: string, m: string): Example => ({ w, r, m })

export const KANJI: KanjiEntry[] = [
  // ── Einheit 1: Erste Striche ────────────────────────────────
  {
    c: '一',
    meanings: ['eins'],
    on: ['イチ', 'イツ'],
    kun: ['ひと', 'ひと.つ'],
    mnemonic: 'Ein einziger waagerechter Pinselstrich – eins. Einfacher geht es nicht!',
    examples: [e('一つ', 'ひとつ', 'eins (Stück)'), e('一月', 'いちがつ', 'Januar'), e('一人', 'ひとり', 'eine Person, allein')],
  },
  {
    c: '二',
    meanings: ['zwei'],
    on: ['ニ'],
    kun: ['ふた', 'ふた.つ'],
    mnemonic: 'Zwei Striche übereinander. Der untere ist länger – wie ein fester Boden unter einem Brett.',
    examples: [e('二つ', 'ふたつ', 'zwei (Stück)'), e('二月', 'にがつ', 'Februar'), e('二人', 'ふたり', 'zwei Personen')],
  },
  {
    c: '三',
    meanings: ['drei'],
    on: ['サン'],
    kun: ['み', 'み.つ', 'みっ.つ'],
    mnemonic: 'Drei Striche übereinander – der mittlere ist der kürzeste, der unterste der längste.',
    examples: [e('三つ', 'みっつ', 'drei (Stück)'), e('三月', 'さんがつ', 'März'), e('三人', 'さんにん', 'drei Personen')],
  },
  {
    c: '十',
    meanings: ['zehn'],
    on: ['ジュウ', 'ジッ'],
    kun: ['とお', 'と'],
    mnemonic: 'Ein Kreuz wie ein Pluszeichen: Zehn Finger, beide Hände übereinandergelegt.',
    examples: [e('十', 'とお', 'zehn (Stück)'), e('十月', 'じゅうがつ', 'Oktober'), e('十日', 'とおか', 'der Zehnte, zehn Tage')],
  },
  {
    c: '口',
    meanings: ['Mund', 'Öffnung'],
    on: ['コウ', 'ク'],
    kun: ['くち'],
    mnemonic: 'Ein weit geöffneter Mund – ein Quadrat, das gleich etwas sagen möchte.',
    examples: [e('口', 'くち', 'Mund'), e('入口', 'いりぐち', 'Eingang'), e('人口', 'じんこう', 'Bevölkerung')],
  },

  // ── Einheit 2: Zahlen ──────────────────────────────────────
  {
    c: '四',
    meanings: ['vier'],
    on: ['シ'],
    kun: ['よ', 'よ.つ', 'よっ.つ', 'よん'],
    mnemonic: 'Ein Fenster mit vier Ecken, in dem zwei Beine baumeln.',
    examples: [e('四つ', 'よっつ', 'vier (Stück)'), e('四月', 'しがつ', 'April'), e('四人', 'よにん', 'vier Personen')],
  },
  {
    c: '五',
    meanings: ['fünf'],
    on: ['ゴ'],
    kun: ['いつ', 'いつ.つ'],
    mnemonic: 'Zwischen Himmel und Erde steht eine Fünf, die sich mit einem Haken festhält.',
    examples: [e('五つ', 'いつつ', 'fünf (Stück)'), e('五月', 'ごがつ', 'Mai'), e('五分', 'ごふん', 'fünf Minuten')],
  },
  {
    c: '六',
    meanings: ['sechs'],
    on: ['ロク'],
    kun: ['む', 'む.つ', 'むっ.つ', 'むい'],
    mnemonic: 'Ein Männchen mit Hut steht breitbeinig da und zählt bis sechs.',
    examples: [e('六つ', 'むっつ', 'sechs (Stück)'), e('六月', 'ろくがつ', 'Juni'), e('六百', 'ろっぴゃく', 'sechshundert')],
  },
  {
    c: '七',
    meanings: ['sieben'],
    on: ['シチ'],
    kun: ['なな', 'なな.つ', 'なの'],
    mnemonic: 'Sieht aus wie eine auf den Kopf gestellte, durchgestrichene 7.',
    examples: [e('七つ', 'ななつ', 'sieben (Stück)'), e('七月', 'しちがつ', 'Juli'), e('七日', 'なのか', 'der Siebte, sieben Tage')],
  },
  {
    c: '八',
    meanings: ['acht'],
    on: ['ハチ'],
    kun: ['や', 'や.つ', 'やっ.つ', 'よう'],
    mnemonic: 'Zwei Striche öffnen sich nach unten wie ein Fächer. In Japan bringt die Acht Glück, weil sie sich weit öffnet.',
    examples: [e('八つ', 'やっつ', 'acht (Stück)'), e('八月', 'はちがつ', 'August'), e('八百屋', 'やおや', 'Gemüseladen')],
  },
  {
    c: '九',
    meanings: ['neun'],
    on: ['キュウ', 'ク'],
    kun: ['ここの', 'ここの.つ'],
    mnemonic: 'Ein Arm, der sich nach neun Liegestützen erschöpft zur Seite biegt.',
    examples: [e('九つ', 'ここのつ', 'neun (Stück)'), e('九月', 'くがつ', 'September'), e('九時', 'くじ', 'neun Uhr')],
  },

  // ── Einheit 3: Natur ───────────────────────────────────────
  {
    c: '日',
    meanings: ['Sonne', 'Tag'],
    on: ['ニチ', 'ジツ'],
    kun: ['ひ', '-び', '-か'],
    mnemonic: 'Früher ein Kreis mit einem Punkt darin – die Sonne. Heute ein Fenster, durch das sie scheint.',
    examples: [e('日本', 'にほん', 'Japan'), e('毎日', 'まいにち', 'jeden Tag'), e('日曜日', 'にちようび', 'Sonntag')],
  },
  {
    c: '月',
    meanings: ['Mond', 'Monat'],
    on: ['ゲツ', 'ガツ'],
    kun: ['つき'],
    mnemonic: 'Eine Mondsichel, vor der zwei Wolkenstreifen vorbeiziehen.',
    examples: [e('月', 'つき', 'Mond'), e('月曜日', 'げつようび', 'Montag'), e('一月', 'いちがつ', 'Januar')],
  },
  {
    c: '木',
    meanings: ['Baum', 'Holz'],
    on: ['ボク', 'モク'],
    kun: ['き', 'こ-'],
    mnemonic: 'Ein Baum: oben die ausgestreckten Äste, in der Mitte der Stamm, unten die Wurzeln.',
    examples: [e('木', 'き', 'Baum'), e('木曜日', 'もくようび', 'Donnerstag'), e('木村', 'きむら', 'Kimura (Familienname)')],
  },
  {
    c: '山',
    meanings: ['Berg'],
    on: ['サン'],
    kun: ['やま'],
    mnemonic: 'Drei Berggipfel – der mittlere ragt am höchsten in den Himmel.',
    examples: [e('山', 'やま', 'Berg'), e('富士山', 'ふじさん', 'Berg Fuji'), e('火山', 'かざん', 'Vulkan')],
  },
  {
    c: '川',
    meanings: ['Fluss'],
    on: ['セン'],
    kun: ['かわ'],
    mnemonic: 'Drei Wasserlinien, die gemeinsam den Hang hinabfließen.',
    examples: [e('川', 'かわ', 'Fluss'), e('小川', 'おがわ', 'Bach'), e('川口', 'かわぐち', 'Flussmündung')],
  },

  // ── Einheit 4: Elemente ────────────────────────────────────
  {
    c: '火',
    meanings: ['Feuer'],
    on: ['カ'],
    kun: ['ひ', '-び', 'ほ-'],
    mnemonic: 'Ein Lagerfeuer: Die Flamme lodert in der Mitte, zwei Funken springen zur Seite.',
    examples: [e('火', 'ひ', 'Feuer'), e('火曜日', 'かようび', 'Dienstag'), e('花火', 'はなび', 'Feuerwerk')],
  },
  {
    c: '水',
    meanings: ['Wasser'],
    on: ['スイ'],
    kun: ['みず'],
    mnemonic: 'Ein Hauptstrom fließt in der Mitte, links und rechts spritzen Tropfen weg.',
    examples: [e('水', 'みず', 'Wasser'), e('水曜日', 'すいようび', 'Mittwoch'), e('水着', 'みずぎ', 'Badeanzug')],
  },
  {
    c: '金',
    meanings: ['Gold', 'Geld', 'Metall'],
    on: ['キン', 'コン'],
    kun: ['かね', 'かな-'],
    mnemonic: 'Unter einem Dach glitzern zwei Goldnuggets in der Erde (土).',
    examples: [e('お金', 'おかね', 'Geld'), e('金曜日', 'きんようび', 'Freitag'), e('金魚', 'きんぎょ', 'Goldfisch')],
  },
  {
    c: '土',
    meanings: ['Erde', 'Boden'],
    on: ['ド', 'ト'],
    kun: ['つち'],
    mnemonic: 'Eine kleine Pflanze (十) sprießt aus dem Erdboden (一). Der untere Strich ist länger!',
    examples: [e('土', 'つち', 'Erde'), e('土曜日', 'どようび', 'Samstag'), e('お土産', 'おみやげ', 'Mitbringsel')],
  },
  {
    c: '本',
    meanings: ['Buch', 'Ursprung', 'Haupt-'],
    on: ['ホン'],
    kun: ['もと'],
    mnemonic: 'Ein Baum (木) mit einem Strich an der Wurzel – dort liegt der Ursprung. Und Bücher macht man aus Holz.',
    examples: [e('本', 'ほん', 'Buch'), e('日本', 'にほん', 'Japan'), e('本当', 'ほんとう', 'Wahrheit, wirklich')],
  },

  // ── Einheit 5: Menschen ────────────────────────────────────
  {
    c: '人',
    meanings: ['Mensch', 'Person'],
    on: ['ジン', 'ニン'],
    kun: ['ひと'],
    mnemonic: 'Ein Mensch, der auf zwei Beinen losspaziert.',
    examples: [e('人', 'ひと', 'Mensch'), e('日本人', 'にほんじん', 'Japaner/in'), e('三人', 'さんにん', 'drei Personen')],
  },
  {
    c: '子',
    meanings: ['Kind'],
    on: ['シ', 'ス'],
    kun: ['こ'],
    mnemonic: 'Ein Baby im Wickeltuch, das fröhlich die Ärmchen ausstreckt.',
    examples: [e('子ども', 'こども', 'Kind'), e('女の子', 'おんなのこ', 'Mädchen'), e('男の子', 'おとこのこ', 'Junge')],
  },
  {
    c: '女',
    meanings: ['Frau'],
    on: ['ジョ', 'ニョ'],
    kun: ['おんな', 'め'],
    mnemonic: 'Eine Frau, die anmutig mit überkreuzten Beinen tanzt.',
    examples: [e('女', 'おんな', 'Frau'), e('女の人', 'おんなのひと', 'Frau'), e('女性', 'じょせい', 'Frau (förmlich)')],
  },
  {
    c: '男',
    meanings: ['Mann'],
    on: ['ダン', 'ナン'],
    kun: ['おとこ'],
    mnemonic: 'Kraft (力) auf dem Reisfeld (田) – der Mann schuftet auf dem Feld.',
    examples: [e('男', 'おとこ', 'Mann'), e('男の人', 'おとこのひと', 'Mann'), e('長男', 'ちょうなん', 'ältester Sohn')],
  },
  {
    c: '大',
    meanings: ['groß'],
    on: ['ダイ', 'タイ'],
    kun: ['おお', 'おお.きい', 'おお.いに'],
    mnemonic: 'Ein Mensch (人) breitet die Arme weit aus und ruft: „Sooo groß!“',
    examples: [e('大きい', 'おおきい', 'groß'), e('大学', 'だいがく', 'Universität'), e('大人', 'おとな', 'Erwachsene/r')],
  },
  {
    c: '小',
    meanings: ['klein'],
    on: ['ショウ'],
    kun: ['ちい.さい', 'こ-', 'お-'],
    mnemonic: 'Ein dünner Strich in der Mitte, daneben zwei winzige Tropfen – alles ganz klein.',
    examples: [e('小さい', 'ちいさい', 'klein'), e('小学校', 'しょうがっこう', 'Grundschule'), e('小鳥', 'ことり', 'Vögelchen')],
  },

  // ── Einheit 6: Richtungen ──────────────────────────────────
  {
    c: '上',
    meanings: ['oben', 'auf', 'hinauf'],
    on: ['ジョウ', 'ショウ'],
    kun: ['うえ', 'あ.げる', 'あ.がる', 'のぼ.る'],
    mnemonic: 'Über der Bodenlinie ragt ein Strich nach oben – wie ein Wegweiser „hinauf“.',
    examples: [e('上', 'うえ', 'oben'), e('上手', 'じょうず', 'geschickt'), e('上がる', 'あがる', 'hinaufgehen')],
  },
  {
    c: '下',
    meanings: ['unten', 'unter', 'hinab'],
    on: ['カ', 'ゲ'],
    kun: ['した', 'さ.げる', 'さ.がる', 'くだ.さい', 'お.りる'],
    mnemonic: 'Unter der Decke hängt etwas nach unten – das Gegenteil von 上.',
    examples: [e('下', 'した', 'unten'), e('地下鉄', 'ちかてつ', 'U-Bahn'), e('下手', 'へた', 'ungeschickt')],
  },
  {
    c: '中',
    meanings: ['Mitte', 'innen'],
    on: ['チュウ'],
    kun: ['なか'],
    mnemonic: 'Ein Pfeil trifft eine Zielscheibe genau in der Mitte.',
    examples: [e('中', 'なか', 'innen, Mitte'), e('中国', 'ちゅうごく', 'China'), e('一日中', 'いちにちじゅう', 'den ganzen Tag')],
  },
  {
    c: '右',
    meanings: ['rechts'],
    on: ['ウ', 'ユウ'],
    kun: ['みぎ'],
    mnemonic: 'Die rechte Hand führt das Essen zum Mund (口). Merke: Bei 右 kommt zuerst der schräge Strich!',
    examples: [e('右', 'みぎ', 'rechts'), e('右手', 'みぎて', 'rechte Hand'), e('左右', 'さゆう', 'links und rechts')],
  },
  {
    c: '左',
    meanings: ['links'],
    on: ['サ'],
    kun: ['ひだり'],
    mnemonic: 'Die linke Hand hält das Werkzeug (工). Merke: Bei 左 kommt zuerst der waagerechte Strich!',
    examples: [e('左', 'ひだり', 'links'), e('左手', 'ひだりて', 'linke Hand'), e('左側', 'ひだりがわ', 'linke Seite')],
  },

  // ── Einheit 7: Große Zahlen & Geld ─────────────────────────
  {
    c: '百',
    meanings: ['hundert'],
    on: ['ヒャク', 'ビャク'],
    kun: ['もも'],
    mnemonic: 'Eins (一) über weiß (白): Mit hundert Jahren hat man weiße Haare.',
    examples: [e('百', 'ひゃく', 'hundert'), e('三百', 'さんびゃく', 'dreihundert'), e('百円', 'ひゃくえん', '100 Yen')],
  },
  {
    c: '千',
    meanings: ['tausend'],
    on: ['セン'],
    kun: ['ち'],
    mnemonic: 'Die Zehn (十) bekommt einen schrägen Hut – und wird gleich hundertmal mehr: tausend.',
    examples: [e('千', 'せん', 'tausend'), e('三千', 'さんぜん', 'dreitausend'), e('千円', 'せんえん', '1000 Yen')],
  },
  {
    c: '万',
    meanings: ['zehntausend'],
    on: ['マン', 'バン'],
    kun: ['よろず'],
    mnemonic: 'Ein Dach mit einem großen Haken – an dem hängen zehntausend Dinge.',
    examples: [e('一万', 'いちまん', 'zehntausend'), e('万年筆', 'まんねんひつ', 'Füllfederhalter'), e('一万円', 'いちまんえん', '10.000 Yen')],
  },
  {
    c: '円',
    meanings: ['Yen', 'Kreis', 'rund'],
    on: ['エン'],
    kun: ['まる.い'],
    mnemonic: 'Ein Geldautomat, aus dessen Schlitz ein Yen-Schein kommt.',
    examples: [e('円', 'えん', 'Yen'), e('百円', 'ひゃくえん', '100 Yen'), e('円い', 'まるい', 'rund')],
  },
  {
    c: '半',
    meanings: ['halb', 'Hälfte'],
    on: ['ハン'],
    kun: ['なか.ば'],
    mnemonic: 'Ein senkrechter Strich teilt alles genau in zwei gleiche Hälften.',
    examples: [e('半分', 'はんぶん', 'Hälfte'), e('三時半', 'さんじはん', 'halb vier'), e('半年', 'はんとし', 'ein halbes Jahr')],
  },

  // ── Einheit 8: Körper ──────────────────────────────────────
  {
    c: '目',
    meanings: ['Auge'],
    on: ['モク', 'ボク'],
    kun: ['め'],
    mnemonic: 'Ein hochkant gestelltes Auge mit zwei Lidfalten.',
    examples: [e('目', 'め', 'Auge'), e('一つ目', 'ひとつめ', 'das Erste'), e('目上', 'めうえ', 'Vorgesetzte/r')],
  },
  {
    c: '耳',
    meanings: ['Ohr'],
    on: ['ジ'],
    kun: ['みみ'],
    mnemonic: 'Ein Ohr mit seinen Windungen und dem Ohrläppchen unten rechts.',
    examples: [e('耳', 'みみ', 'Ohr'), e('耳鼻科', 'じびか', 'HNO-Arzt'), e('早耳', 'はやみみ', 'gut informiert sein')],
  },
  {
    c: '手',
    meanings: ['Hand'],
    on: ['シュ'],
    kun: ['て'],
    mnemonic: 'Eine Hand: drei Finger-Linien und der Arm, der unten einen Haken macht.',
    examples: [e('手', 'て', 'Hand'), e('上手', 'じょうず', 'geschickt'), e('切手', 'きって', 'Briefmarke')],
  },
  {
    c: '足',
    meanings: ['Fuß', 'Bein', 'genügen'],
    on: ['ソク'],
    kun: ['あし', 'た.りる', 'た.す'],
    mnemonic: 'Oben die Kniescheibe (口), darunter ein Fuß, der gerade losläuft.',
    examples: [e('足', 'あし', 'Fuß, Bein'), e('足りる', 'たりる', 'ausreichen'), e('一足', 'いっそく', 'ein Paar (Schuhe)')],
  },
  {
    c: '休',
    meanings: ['ausruhen', 'Pause'],
    on: ['キュウ'],
    kun: ['やす.む', 'やす.み'],
    mnemonic: 'Ein Mensch (亻) lehnt sich an einen Baum (木) und macht Pause.',
    examples: [e('休む', 'やすむ', 'sich ausruhen'), e('休み', 'やすみ', 'Pause, Ferien'), e('休日', 'きゅうじつ', 'freier Tag')],
  },

  // ── Einheit 9: Himmel & Wetter ─────────────────────────────
  {
    c: '天',
    meanings: ['Himmel'],
    on: ['テン'],
    kun: ['あま', 'あめ'],
    mnemonic: 'Über dem großen (大) Menschen liegt noch eine Linie – der Himmel.',
    examples: [e('天気', 'てんき', 'Wetter'), e('天国', 'てんごく', 'Paradies'), e('天才', 'てんさい', 'Genie')],
  },
  {
    c: '気',
    meanings: ['Geist', 'Energie', 'Stimmung'],
    on: ['キ', 'ケ'],
    kun: [],
    mnemonic: 'Dampf steigt aus einem Reistopf – unsichtbare Lebensenergie, die man spüren kann.',
    examples: [e('元気', 'げんき', 'munter, gesund'), e('天気', 'てんき', 'Wetter'), e('気持ち', 'きもち', 'Gefühl')],
  },
  {
    c: '雨',
    meanings: ['Regen'],
    on: ['ウ'],
    kun: ['あめ', 'あま-'],
    mnemonic: 'Unter dem Himmelsdach hängt eine Wolke, aus der vier Regentropfen fallen.',
    examples: [e('雨', 'あめ', 'Regen'), e('大雨', 'おおあめ', 'Starkregen'), e('雨水', 'あまみず', 'Regenwasser')],
  },
  {
    c: '空',
    meanings: ['Himmel', 'leer'],
    on: ['クウ'],
    kun: ['そら', 'あ.く', 'から'],
    mnemonic: 'Durch ein Loch (穴) im Dach sieht der Handwerker (工) den weiten, leeren Himmel.',
    examples: [e('空', 'そら', 'Himmel'), e('空港', 'くうこう', 'Flughafen'), e('空く', 'あく', 'frei werden')],
  },
  {
    c: '花',
    meanings: ['Blume', 'Blüte'],
    on: ['カ'],
    kun: ['はな'],
    mnemonic: 'Oben Gras (艹), darunter verwandelt (化) sich eine Knospe in eine Blume.',
    examples: [e('花', 'はな', 'Blume'), e('花見', 'はなみ', 'Kirschblütenschau'), e('花火', 'はなび', 'Feuerwerk')],
  },
  {
    c: '白',
    meanings: ['weiß'],
    on: ['ハク', 'ビャク'],
    kun: ['しろ', 'しろ.い'],
    mnemonic: 'Die Sonne (日) mit einem kleinen Lichtstrahl obendrauf – strahlend weiß.',
    examples: [e('白い', 'しろい', 'weiß'), e('白', 'しろ', 'Weiß'), e('面白い', 'おもしろい', 'interessant, lustig')],
  },

  // ── Einheit 10: Zeit ───────────────────────────────────────
  {
    c: '年',
    meanings: ['Jahr', 'Alter'],
    on: ['ネン'],
    kun: ['とし'],
    mnemonic: 'Ein Bauer schultert die Reisgarben – die Ernte eines ganzen Jahres.',
    examples: [e('今年', 'ことし', 'dieses Jahr'), e('毎年', 'まいとし', 'jedes Jahr'), e('来年', 'らいねん', 'nächstes Jahr')],
  },
  {
    c: '時',
    meanings: ['Zeit', 'Stunde', 'Uhr'],
    on: ['ジ'],
    kun: ['とき'],
    mnemonic: 'Die Sonne (日) zeigt am Tempel (寺) an, wie viel Uhr es ist.',
    examples: [e('時間', 'じかん', 'Zeit'), e('時計', 'とけい', 'Uhr'), e('一時', 'いちじ', 'ein Uhr')],
  },
  {
    c: '分',
    meanings: ['Minute', 'Teil', 'verstehen'],
    on: ['ブン', 'フン', 'ブ'],
    kun: ['わ.かる', 'わ.ける'],
    mnemonic: 'Ein Messer (刀) teilt etwas in zwei Teile (八). Wer etwas zerlegt, versteht es.',
    examples: [e('分かる', 'わかる', 'verstehen'), e('五分', 'ごふん', 'fünf Minuten'), e('自分', 'じぶん', 'selbst')],
  },
  {
    c: '今',
    meanings: ['jetzt'],
    on: ['コン', 'キン'],
    kun: ['いま'],
    mnemonic: 'Alle versammeln sich unter einem Dach – genau jetzt, in diesem Moment.',
    examples: [e('今', 'いま', 'jetzt'), e('今日', 'きょう', 'heute'), e('今晩', 'こんばん', 'heute Abend')],
  },
  {
    c: '午',
    meanings: ['Mittag'],
    on: ['ゴ'],
    kun: ['うま'],
    mnemonic: 'Der Zeiger der Sonnenuhr steht mittags kerzengerade. Vorsicht: Ohne Haken oben, anders als 牛 (Kuh)!',
    examples: [e('午前', 'ごぜん', 'vormittags'), e('午後', 'ごご', 'nachmittags'), e('正午', 'しょうご', 'Mittag, 12 Uhr')],
  },

  // ── Einheit 11: Familie & Freunde ──────────────────────────
  {
    c: '父',
    meanings: ['Vater'],
    on: ['フ'],
    kun: ['ちち'],
    mnemonic: 'Zwei Schweißtropfen über zwei gekreuzten Werkzeugen – der fleißige Vater.',
    examples: [e('父', 'ちち', 'mein Vater'), e('お父さん', 'おとうさん', 'Vater'), e('父母', 'ふぼ', 'Eltern')],
  },
  {
    c: '母',
    meanings: ['Mutter'],
    on: ['ボ'],
    kun: ['はは'],
    mnemonic: 'Eine Mutter, die ihr Baby im Arm hält – die zwei Punkte sind ihr Herz und ihre Fürsorge.',
    examples: [e('母', 'はは', 'meine Mutter'), e('お母さん', 'おかあさん', 'Mutter'), e('母国', 'ぼこく', 'Heimatland')],
  },
  {
    c: '友',
    meanings: ['Freund'],
    on: ['ユウ'],
    kun: ['とも'],
    mnemonic: 'Zwei Hände greifen ineinander – so sieht Freundschaft aus.',
    examples: [e('友だち', 'ともだち', 'Freund/in'), e('友人', 'ゆうじん', 'Freund/in (förmlich)'), e('親友', 'しんゆう', 'beste/r Freund/in')],
  },
  {
    c: '先',
    meanings: ['vorher', 'voraus', 'Spitze'],
    on: ['セン'],
    kun: ['さき'],
    mnemonic: 'Ein Mensch auf langen Beinen (儿) läuft allen anderen voraus.',
    examples: [e('先生', 'せんせい', 'Lehrer/in'), e('先週', 'せんしゅう', 'letzte Woche'), e('先', 'さき', 'Spitze, voraus')],
  },
  {
    c: '生',
    meanings: ['Leben', 'geboren werden', 'roh'],
    on: ['セイ', 'ショウ'],
    kun: ['い.きる', 'う.まれる', 'なま'],
    mnemonic: 'Ein frischer Spross wächst aus der Erde (土) – das Leben beginnt.',
    examples: [e('学生', 'がくせい', 'Student/in'), e('生まれる', 'うまれる', 'geboren werden'), e('生きる', 'いきる', 'leben')],
  },

  // ── Einheit 12: Schule ─────────────────────────────────────
  {
    c: '学',
    meanings: ['lernen', 'Wissenschaft'],
    on: ['ガク'],
    kun: ['まな.ぶ'],
    mnemonic: 'Ein Kind (子) sitzt unter dem Schuldach, über dem drei Funken Wissen leuchten.',
    examples: [e('学校', 'がっこう', 'Schule'), e('大学', 'だいがく', 'Universität'), e('学ぶ', 'まなぶ', 'lernen')],
  },
  {
    c: '校',
    meanings: ['Schule'],
    on: ['コウ'],
    kun: [],
    mnemonic: 'Unter einem Baum (木) treffen sich Menschen und tauschen sich aus (交) – die erste Schule.',
    examples: [e('学校', 'がっこう', 'Schule'), e('高校', 'こうこう', 'Oberschule'), e('校長', 'こうちょう', 'Schulleiter/in')],
  },
  {
    c: '名',
    meanings: ['Name', 'berühmt'],
    on: ['メイ', 'ミョウ'],
    kun: ['な'],
    mnemonic: 'Am Abend (夕) sieht man im Dunkeln nichts – also ruft man mit dem Mund (口) den Namen.',
    examples: [e('名前', 'なまえ', 'Name'), e('有名', 'ゆうめい', 'berühmt'), e('名人', 'めいじん', 'Meister/in')],
  },
  {
    c: '何',
    meanings: ['was', 'wie viel'],
    on: ['カ'],
    kun: ['なに', 'なん'],
    mnemonic: 'Ein Mensch (亻) steht vor einem Tor mit einem Mund (口) darin und fragt: „Was?“',
    examples: [e('何', 'なに', 'was'), e('何時', 'なんじ', 'wie viel Uhr'), e('何人', 'なんにん', 'wie viele Personen')],
  },

  // ── Einheit 13: Himmelsrichtungen ──────────────────────────
  {
    c: '東',
    meanings: ['Osten'],
    on: ['トウ'],
    kun: ['ひがし'],
    mnemonic: 'Die Sonne (日) geht hinter einem Baum (木) auf – im Osten.',
    examples: [e('東', 'ひがし', 'Osten'), e('東京', 'とうきょう', 'Tokio'), e('東口', 'ひがしぐち', 'Ostausgang')],
  },
  {
    c: '西',
    meanings: ['Westen'],
    on: ['セイ', 'サイ'],
    kun: ['にし'],
    mnemonic: 'Ein Vogel kehrt in sein Nest zurück, wenn die Sonne im Westen versinkt.',
    examples: [e('西', 'にし', 'Westen'), e('関西', 'かんさい', 'Kansai-Region'), e('西洋', 'せいよう', 'der Westen, Abendland')],
  },
  {
    c: '南',
    meanings: ['Süden'],
    on: ['ナン', 'ナ'],
    kun: ['みなみ'],
    mnemonic: 'Unter einem Zeltdach im warmen Süden: Zehn (十) Pflanzen wachsen dort wie von selbst.',
    examples: [e('南', 'みなみ', 'Süden'), e('南口', 'みなみぐち', 'Südausgang'), e('東南アジア', 'とうなんアジア', 'Südostasien')],
  },
  {
    c: '北',
    meanings: ['Norden'],
    on: ['ホク'],
    kun: ['きた'],
    mnemonic: 'Zwei Menschen sitzen Rücken an Rücken und wärmen sich gegen den kalten Nordwind.',
    examples: [e('北', 'きた', 'Norden'), e('北口', 'きたぐち', 'Nordausgang'), e('東北', 'とうほく', 'Tōhoku (Nordosten Japans)')],
  },
  {
    c: '外',
    meanings: ['außen', 'fremd'],
    on: ['ガイ', 'ゲ'],
    kun: ['そと', 'ほか', 'はず.す'],
    mnemonic: 'Am Abend (夕) geht die Wahrsagerin (卜) nach draußen und liest die Sterne.',
    examples: [e('外', 'そと', 'draußen'), e('外国', 'がいこく', 'Ausland'), e('外国人', 'がいこくじん', 'Ausländer/in')],
  },

  // ── Einheit 14: Bewegung ───────────────────────────────────
  {
    c: '行',
    meanings: ['gehen', 'Reihe'],
    on: ['コウ', 'ギョウ'],
    kun: ['い.く', 'ゆ.く', 'おこな.う'],
    mnemonic: 'Eine Straßenkreuzung von oben gesehen – hier geht man los.',
    examples: [e('行く', 'いく', 'gehen'), e('銀行', 'ぎんこう', 'Bank'), e('旅行', 'りょこう', 'Reise')],
  },
  {
    c: '来',
    meanings: ['kommen'],
    on: ['ライ'],
    kun: ['く.る', 'きた.る'],
    mnemonic: 'Ein Baum (木) trägt reife Ähren – die Erntezeit kommt.',
    examples: [e('来る', 'くる', 'kommen'), e('来年', 'らいねん', 'nächstes Jahr'), e('来週', 'らいしゅう', 'nächste Woche')],
  },
  {
    c: '出',
    meanings: ['hinausgehen', 'heraus'],
    on: ['シュツ', 'スイ'],
    kun: ['で.る', 'だ.す'],
    mnemonic: 'Zwei Berge (山) übereinander – ein Spross schiebt sich nach draußen.',
    examples: [e('出る', 'でる', 'hinausgehen'), e('出口', 'でぐち', 'Ausgang'), e('出す', 'だす', 'herausnehmen, abschicken')],
  },
  {
    c: '入',
    meanings: ['hineingehen', 'hinein'],
    on: ['ニュウ'],
    kun: ['い.る', 'はい.る', 'い.れる'],
    mnemonic: 'Fast wie 人, nur andersherum: Hier schlüpft jemand durch einen engen Eingang hinein.',
    examples: [e('入る', 'はいる', 'hineingehen'), e('入口', 'いりぐち', 'Eingang'), e('入れる', 'いれる', 'hineintun')],
  },
  {
    c: '立',
    meanings: ['stehen'],
    on: ['リツ', 'リュウ'],
    kun: ['た.つ', 'た.てる'],
    mnemonic: 'Ein Mensch mit Kopf und ausgebreiteten Armen steht fest auf dem Boden.',
    examples: [e('立つ', 'たつ', 'stehen'), e('国立', 'こくりつ', 'national, staatlich'), e('立てる', 'たてる', 'aufstellen')],
  },

  // ── Einheit 15: Sehen, Hören, Sprechen ─────────────────────
  {
    c: '見',
    meanings: ['sehen'],
    on: ['ケン'],
    kun: ['み.る', 'み.える', 'み.せる'],
    mnemonic: 'Ein riesiges Auge (目) auf zwei Beinen – es läuft herum und sieht sich alles an.',
    examples: [e('見る', 'みる', 'sehen'), e('花見', 'はなみ', 'Kirschblütenschau'), e('見せる', 'みせる', 'zeigen')],
  },
  {
    c: '聞',
    meanings: ['hören', 'fragen'],
    on: ['ブン', 'モン'],
    kun: ['き.く', 'き.こえる'],
    mnemonic: 'Ein Ohr (耳) wird an ein Tor (門) gepresst – jemand lauscht.',
    examples: [e('聞く', 'きく', 'hören, fragen'), e('新聞', 'しんぶん', 'Zeitung'), e('聞こえる', 'きこえる', 'hörbar sein')],
  },
  {
    c: '言',
    meanings: ['sagen', 'Wort'],
    on: ['ゲン', 'ゴン'],
    kun: ['い.う', 'こと'],
    mnemonic: 'Über einem Mund (口) schweben Worte wie kleine Sprechblasen-Linien.',
    examples: [e('言う', 'いう', 'sagen'), e('言葉', 'ことば', 'Wort, Sprache'), e('一言', 'ひとこと', 'ein Wort')],
  },
  {
    c: '話',
    meanings: ['sprechen', 'Geschichte'],
    on: ['ワ'],
    kun: ['はな.す', 'はなし'],
    mnemonic: 'Worte (言) rollen über die Zunge (舌) – man spricht.',
    examples: [e('話す', 'はなす', 'sprechen'), e('話', 'はなし', 'Geschichte, Gespräch'), e('電話', 'でんわ', 'Telefon')],
  },

  // ── Einheit 16: Lesen & Schreiben ──────────────────────────
  {
    c: '語',
    meanings: ['Sprache', 'Wort'],
    on: ['ゴ'],
    kun: ['かた.る'],
    mnemonic: 'Worte (言), die ich (吾) spreche – das ist meine Sprache.',
    examples: [e('日本語', 'にほんご', 'Japanisch'), e('英語', 'えいご', 'Englisch'), e('語る', 'かたる', 'erzählen')],
  },
  {
    c: '読',
    meanings: ['lesen'],
    on: ['ドク', 'トク', 'トウ'],
    kun: ['よ.む'],
    mnemonic: 'Worte (言) zum Verkaufen (売) – der Händler liest sie laut vor.',
    examples: [e('読む', 'よむ', 'lesen'), e('読書', 'どくしょ', 'Lesen (als Hobby)'), e('読み方', 'よみかた', 'Lesart')],
  },
  {
    c: '書',
    meanings: ['schreiben'],
    on: ['ショ'],
    kun: ['か.く'],
    mnemonic: 'Eine Hand hält den Pinsel senkrecht über der Sonne (日) – sie schreibt den ganzen Tag.',
    examples: [e('書く', 'かく', 'schreiben'), e('辞書', 'じしょ', 'Wörterbuch'), e('図書館', 'としょかん', 'Bibliothek')],
  },
  {
    c: '国',
    meanings: ['Land', 'Staat'],
    on: ['コク'],
    kun: ['くに'],
    mnemonic: 'Ein kostbarer Edelstein (玉) wird von festen Grenzen (囗) beschützt – das Land.',
    examples: [e('国', 'くに', 'Land'), e('中国', 'ちゅうごく', 'China'), e('外国', 'がいこく', 'Ausland')],
  },

  // ── Einheit 17: Essen & Einkaufen ──────────────────────────
  {
    c: '食',
    meanings: ['essen', 'Speise'],
    on: ['ショク', 'ジキ'],
    kun: ['た.べる', 'く.う'],
    mnemonic: 'Unter einem Dach steht eine Schüssel voll mit gutem Essen.',
    examples: [e('食べる', 'たべる', 'essen'), e('食べ物', 'たべもの', 'Essen, Lebensmittel'), e('食堂', 'しょくどう', 'Speisesaal, Mensa')],
  },
  {
    c: '飲',
    meanings: ['trinken'],
    on: ['イン'],
    kun: ['の.む'],
    mnemonic: 'Neben dem Essen (飠) öffnet jemand weit den Mund (欠) – und trinkt.',
    examples: [e('飲む', 'のむ', 'trinken'), e('飲み物', 'のみもの', 'Getränk'), e('飲食', 'いんしょく', 'Essen und Trinken')],
  },
  {
    c: '買',
    meanings: ['kaufen'],
    on: ['バイ'],
    kun: ['か.う'],
    mnemonic: 'Ein Netz (罒) voller Muscheln (貝) – früher hat man mit Muscheln eingekauft.',
    examples: [e('買う', 'かう', 'kaufen'), e('買い物', 'かいもの', 'Einkauf'), e('売買', 'ばいばい', 'Handel')],
  },
  {
    c: '魚',
    meanings: ['Fisch'],
    on: ['ギョ'],
    kun: ['さかな', 'うお'],
    mnemonic: 'Oben der Kopf, in der Mitte der Körper mit Schuppen, unten vier Punkte als Schwanzflosse.',
    examples: [e('魚', 'さかな', 'Fisch'), e('金魚', 'きんぎょ', 'Goldfisch'), e('魚屋', 'さかなや', 'Fischhändler')],
  },
  {
    c: '店',
    meanings: ['Laden', 'Geschäft'],
    on: ['テン'],
    kun: ['みせ'],
    mnemonic: 'Unter einem Vordach (广) steht der Stand einer Wahrsagerin (占) – ein kleiner Laden.',
    examples: [e('店', 'みせ', 'Laden'), e('喫茶店', 'きっさてん', 'Café'), e('店員', 'てんいん', 'Verkäufer/in')],
  },

  // ── Einheit 18: Unterwegs ──────────────────────────────────
  {
    c: '車',
    meanings: ['Auto', 'Wagen', 'Rad'],
    on: ['シャ'],
    kun: ['くるま'],
    mnemonic: 'Ein Wagen von oben gesehen: zwei Räder an einer langen Achse.',
    examples: [e('車', 'くるま', 'Auto'), e('電車', 'でんしゃ', 'Zug'), e('自転車', 'じてんしゃ', 'Fahrrad')],
  },
  {
    c: '道',
    meanings: ['Weg', 'Straße'],
    on: ['ドウ', 'トウ'],
    kun: ['みち'],
    mnemonic: 'Ein Kopf (首) wandert eine Straße (辶) entlang – auf seinem Lebensweg.',
    examples: [e('道', 'みち', 'Weg, Straße'), e('北海道', 'ほっかいどう', 'Hokkaidō'), e('柔道', 'じゅうどう', 'Judo')],
  },
  {
    c: '電',
    meanings: ['Elektrizität', 'Blitz'],
    on: ['デン'],
    kun: [],
    mnemonic: 'Aus der Regenwolke (雨) zuckt ein Blitz über das Reisfeld – Elektrizität!',
    examples: [e('電車', 'でんしゃ', 'Zug'), e('電話', 'でんわ', 'Telefon'), e('電気', 'でんき', 'Strom, Licht')],
  },
  {
    c: '駅',
    meanings: ['Bahnhof'],
    on: ['エキ'],
    kun: [],
    mnemonic: 'Am Bahnhof wechselte man früher die Pferde (馬) – heute die Züge.',
    examples: [e('駅', 'えき', 'Bahnhof'), e('東京駅', 'とうきょうえき', 'Bahnhof Tokio'), e('駅員', 'えきいん', 'Bahnhofsangestellte/r')],
  },
  {
    c: '社',
    meanings: ['Firma', 'Schrein'],
    on: ['シャ', 'ジャ'],
    kun: ['やしろ'],
    mnemonic: 'Am Altar (礻) wird die Erde (土) verehrt – ein Schrein. Wo Menschen zusammenkommen, entsteht auch eine Firma.',
    examples: [e('会社', 'かいしゃ', 'Firma'), e('神社', 'じんじゃ', 'Shintō-Schrein'), e('社長', 'しゃちょう', 'Firmenchef/in')],
  },

  // ── Einheit 19: Zeiträume ──────────────────────────────────
  {
    c: '毎',
    meanings: ['jeder', 'jedes Mal'],
    on: ['マイ'],
    kun: ['ごと'],
    mnemonic: 'Eine Mutter (母) mit Hut – jeden einzelnen Tag ist sie für uns da.',
    examples: [e('毎日', 'まいにち', 'jeden Tag'), e('毎朝', 'まいあさ', 'jeden Morgen'), e('毎週', 'まいしゅう', 'jede Woche')],
  },
  {
    c: '週',
    meanings: ['Woche'],
    on: ['シュウ'],
    kun: [],
    mnemonic: 'Eine Runde (周) auf der Straße (辶) – jede Woche läuft man dieselbe Runde.',
    examples: [e('今週', 'こんしゅう', 'diese Woche'), e('来週', 'らいしゅう', 'nächste Woche'), e('週末', 'しゅうまつ', 'Wochenende')],
  },
  {
    c: '間',
    meanings: ['zwischen', 'Zeitraum'],
    on: ['カン', 'ケン'],
    kun: ['あいだ', 'ま'],
    mnemonic: 'Zwischen den beiden Torflügeln (門) scheint die Sonne (日) hindurch.',
    examples: [e('時間', 'じかん', 'Zeit'), e('間', 'あいだ', 'zwischen, während'), e('人間', 'にんげん', 'Mensch')],
  },
  {
    c: '前',
    meanings: ['vor', 'vorne', 'früher'],
    on: ['ゼン'],
    kun: ['まえ'],
    mnemonic: 'Mit einem Messer (刂) schneidet man vorne am Boot den Weg frei.',
    examples: [e('前', 'まえ', 'vorne, vorher'), e('名前', 'なまえ', 'Name'), e('午前', 'ごぜん', 'vormittags')],
  },
  {
    c: '後',
    meanings: ['nach', 'hinten', 'später'],
    on: ['ゴ', 'コウ'],
    kun: ['うし.ろ', 'あと', 'のち'],
    mnemonic: 'Mit kleinen Schritten (彳) und verhedderten Füßen kommt man nur langsam hinterher.',
    examples: [e('後ろ', 'うしろ', 'hinten'), e('午後', 'ごご', 'nachmittags'), e('後で', 'あとで', 'später')],
  },
  {
    c: '曜',
    meanings: ['Wochentag'],
    on: ['ヨウ'],
    kun: [],
    mnemonic: 'Neben der Sonne (日) schlägt ein Vogel (隹) mit beiden Flügeln (羽) – die Wochentage fliegen vorbei.',
    examples: [e('曜日', 'ようび', 'Wochentag'), e('日曜日', 'にちようび', 'Sonntag'), e('何曜日', 'なんようび', 'welcher Wochentag')],
  },

  // ── Einheit 20: Viel & wenig ───────────────────────────────
  {
    c: '長',
    meanings: ['lang', 'Leiter/Chef'],
    on: ['チョウ'],
    kun: ['なが.い'],
    mnemonic: 'Ein alter Mann mit langem, wehendem Haar – meist ist er der Chef.',
    examples: [e('長い', 'ながい', 'lang'), e('社長', 'しゃちょう', 'Firmenchef/in'), e('校長', 'こうちょう', 'Schulleiter/in')],
  },
  {
    c: '高',
    meanings: ['hoch', 'teuer'],
    on: ['コウ'],
    kun: ['たか.い', 'たか'],
    mnemonic: 'Ein hoher Turm mit spitzem Dach, einem Fenster (口) und einem großen Tor.',
    examples: [e('高い', 'たかい', 'hoch, teuer'), e('高校', 'こうこう', 'Oberschule'), e('最高', 'さいこう', 'das Beste, großartig')],
  },
  {
    c: '多',
    meanings: ['viel'],
    on: ['タ'],
    kun: ['おお.い'],
    mnemonic: 'Zwei Abende (夕) übereinander – viele, viele Abende.',
    examples: [e('多い', 'おおい', 'viel'), e('多分', 'たぶん', 'vielleicht, wahrscheinlich'), e('多数', 'たすう', 'Mehrheit')],
  },
  {
    c: '少',
    meanings: ['wenig'],
    on: ['ショウ'],
    kun: ['すく.ない', 'すこ.し'],
    mnemonic: 'Klein (小) – und dann wird noch ein Stück weggenommen. Nur noch wenig übrig.',
    examples: [e('少し', 'すこし', 'ein bisschen'), e('少ない', 'すくない', 'wenig'), e('少年', 'しょうねん', 'Junge')],
  },

  // ── Einheit 21: Neu & alt ──────────────────────────────────
  {
    c: '安',
    meanings: ['billig', 'ruhig', 'sicher'],
    on: ['アン'],
    kun: ['やす.い'],
    mnemonic: 'Eine Frau (女) unter dem eigenen Dach (宀) – zu Hause fühlt man sich sicher und ruhig.',
    examples: [e('安い', 'やすい', 'billig'), e('安心', 'あんしん', 'Beruhigung, beruhigt'), e('安全', 'あんぜん', 'Sicherheit')],
  },
  {
    c: '新',
    meanings: ['neu'],
    on: ['シン'],
    kun: ['あたら.しい', 'あら.た', 'にい-'],
    mnemonic: 'Man steht (立) neben einem Baum (木) und schlägt mit der Axt (斤) frisches, neues Holz.',
    examples: [e('新しい', 'あたらしい', 'neu'), e('新聞', 'しんぶん', 'Zeitung'), e('新幹線', 'しんかんせん', 'Shinkansen')],
  },
  {
    c: '古',
    meanings: ['alt'],
    on: ['コ'],
    kun: ['ふる.い', 'ふる'],
    mnemonic: 'Zehn (十) Münder (口) haben diese Geschichte schon erzählt – sie ist uralt.',
    examples: [e('古い', 'ふるい', 'alt'), e('中古', 'ちゅうこ', 'gebraucht'), e('古本', 'ふるほん', 'antiquarisches Buch')],
  },
]

export interface Unit {
  id: number
  level: number
  title: string
  subtitle: string
  icon: string
  kanji: string[]
}

export const UNITS: Unit[] = [
  { id: 1, level: 5, title: 'Erste Striche', subtitle: 'Deine ersten Pinselstriche', icon: '🖌️', kanji: ['一', '二', '三', '十', '口'] },
  { id: 2, level: 5, title: 'Zahlen', subtitle: 'Von vier bis neun', icon: '🔢', kanji: ['四', '五', '六', '七', '八', '九'] },
  { id: 3, level: 5, title: 'Natur', subtitle: 'Sonne, Mond, Baum, Berg, Fluss', icon: '🌄', kanji: ['日', '月', '木', '山', '川'] },
  { id: 4, level: 5, title: 'Elemente', subtitle: 'Feuer, Wasser, Gold, Erde', icon: '🔥', kanji: ['火', '水', '金', '土', '本'] },
  { id: 5, level: 5, title: 'Menschen', subtitle: 'Groß und klein, Frau und Mann', icon: '👪', kanji: ['人', '子', '女', '男', '大', '小'] },
  { id: 6, level: 5, title: 'Richtungen', subtitle: 'Oben, unten, links, rechts', icon: '🧭', kanji: ['上', '下', '中', '右', '左'] },
  { id: 7, level: 5, title: 'Geld & Zahlen', subtitle: 'Hundert, tausend, Yen', icon: '💴', kanji: ['百', '千', '万', '円', '半'] },
  { id: 8, level: 5, title: 'Körper', subtitle: 'Augen, Ohren, Hände, Füße', icon: '✋', kanji: ['目', '耳', '手', '足', '休'] },
  { id: 9, level: 5, title: 'Himmel & Wetter', subtitle: 'Regen, Himmel, Blüten', icon: '🌸', kanji: ['天', '気', '雨', '空', '花', '白'] },
  { id: 10, level: 5, title: 'Zeit', subtitle: 'Jahre, Stunden, Minuten', icon: '⏰', kanji: ['年', '時', '分', '今', '午'] },
  { id: 11, level: 5, title: 'Familie', subtitle: 'Vater, Mutter, Freunde', icon: '💞', kanji: ['父', '母', '友', '先', '生'] },
  { id: 12, level: 5, title: 'Schule', subtitle: 'Lernen und Fragen', icon: '🏫', kanji: ['学', '校', '名', '何'] },
  { id: 13, level: 5, title: 'Himmelsrichtungen', subtitle: 'Nord, Ost, Süd, West', icon: '🗺️', kanji: ['東', '西', '南', '北', '外'] },
  { id: 14, level: 5, title: 'Bewegung', subtitle: 'Gehen, kommen, stehen', icon: '🚶', kanji: ['行', '来', '出', '入', '立'] },
  { id: 15, level: 5, title: 'Sinne', subtitle: 'Sehen, hören, sprechen', icon: '👂', kanji: ['見', '聞', '言', '話'] },
  { id: 16, level: 5, title: 'Lesen & Schreiben', subtitle: 'Sprache und Land', icon: '📖', kanji: ['語', '読', '書', '国'] },
  { id: 17, level: 5, title: 'Essen & Einkaufen', subtitle: 'Essen, trinken, kaufen', icon: '🍣', kanji: ['食', '飲', '買', '魚', '店'] },
  { id: 18, level: 5, title: 'Unterwegs', subtitle: 'Auto, Zug, Bahnhof', icon: '🚃', kanji: ['車', '道', '電', '駅', '社'] },
  { id: 19, level: 5, title: 'Zeiträume', subtitle: 'Woche, vorher, nachher', icon: '📅', kanji: ['毎', '週', '間', '前', '後', '曜'] },
  { id: 20, level: 5, title: 'Viel & wenig', subtitle: 'Lang, hoch, viel, wenig', icon: '📏', kanji: ['長', '高', '多', '少'] },
  { id: 21, level: 5, title: 'Neu & alt', subtitle: 'Billig, neu, alt', icon: '✨', kanji: ['安', '新', '古'] },
]

export const KANJI_MAP: Record<string, KanjiEntry> = Object.fromEntries(KANJI.map((k) => [k.c, { ...k, level: 5 }]))
for (const k of KANJI) k.level = 5

/** Kanji in Lernreihenfolge (Einheiten nacheinander). */
export const KANJI_ORDER: string[] = UNITS.flatMap((u) => u.kanji)

export const LEVELS = [5, 4, 3, 2, 1] as const
export type Level = (typeof LEVELS)[number]

export function levelOf(c: string): number {
  return KANJI_MAP[c]?.level ?? 5
}

const UNIT_SIZE = 6
const loadedLevels = new Set<number>([5])

/** Fügt eine weitere JLPT-Stufe hinzu (Einträge in Lernreihenfolge). Einheiten entstehen automatisch. */
export function registerLevel(level: number, entries: KanjiEntry[]) {
  if (loadedLevels.has(level)) return
  loadedLevels.add(level)
  const fresh = entries.filter((e) => !KANJI_MAP[e.c])
  for (const e of fresh) {
    const k = { ...e, level }
    KANJI.push(k)
    KANJI_MAP[k.c] = k
  }
  let n = 0
  for (let i = 0; i < fresh.length; i += UNIT_SIZE) {
    n++
    const chunk = fresh.slice(i, i + UNIT_SIZE)
    UNITS.push({
      id: UNITS.length + 1,
      level,
      title: `Einheit ${n}`,
      subtitle: chunk
        .slice(0, 3)
        .map((k) => k.meanings[0])
        .join(', '),
      icon: chunk[0].c,
      kanji: chunk.map((k) => k.c),
    })
    KANJI_ORDER.push(...chunk.map((k) => k.c))
  }
}

/** Anzeigetexte einer Einheit: kleine Überschrift und Name. */
export function unitLabel(u: Unit): { kicker: string; name: string } {
  return u.level === 5 ? { kicker: `N5 · Einheit ${u.id}`, name: u.title } : { kicker: `N${u.level} · ${u.title}`, name: u.subtitle }
}

export function unitsOfLevel(level: number): Unit[] {
  return UNITS.filter((u) => u.level === level)
}
