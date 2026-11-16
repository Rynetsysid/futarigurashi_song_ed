/**
 * ==============================================================================
 * MUSIC CORE DATABASE: LIRIK & TIMELINE SUBTITLE
 * Lagu: 「ココロノサクラ」 (Kokoro no Sakura)
 * Penyanyi: 小波すず (Konami Suzu) | Lirik: 平月智 | Komposer: 溝口ゆうま / sham
 * Terjemahan Indonesia: Rynet
 * ==============================================================================
 * Keterangan Pengeditan:
 * - 'start' : detik mulai lirik muncul
 * - 'end'   : detik lirik selesai / menghilang
 * - 'cgIndex': indeks CG (0 s.d. 6)
 * - 'jp'    : teks asli kanji/kana Jepang
 * - 'romaji': teks bacaan latin / romaji
 * - 'id'    : terjemahan bahasa Indonesia
 * ==============================================================================
 */

const MUSIC_CORE = {
    // Metadata Informasi Lagu
    metadata: {
        titleJp: "ココロノサクラ",
        titleRomaji: "Kokoro no Sakura",
        role: "Ending Theme / Insert Song",
        developer: "PicoPicoSoft",
        vocal: "小波すず (Konami Suzu)",
        lyricsBy: "平月智 (Hiratsuki Satoshi)",
        musicBy: "溝口ゆうま / sham (Craft Edge Lab)",
        translator: "Rynet (Indonesian Translation Project)",
        audioFile: "assets/sound/kokoro_no_sakura.mp3",
        voiceIntroFile: "assets/sound/opdesu.mp3"
    },

    // Timeline Perpindahan CG Visual Lagu (assets/image/)
    cgTimeline: [
        { start: 0, index: 0, name: "assets/image/imagekokoro_start.png" },
        { start: 42, index: 1, name: "assets/image/imagekokoro_eki.png" },
        { start: 68, index: 2, name: "assets/image/imagekokoro_tsubomi.png" },
        { start: 129, index: 3, name: "assets/image/imagekokoro_sunset.png" },
        { start: 154, index: 4, name: "assets/image/imagekokoro_aquarium.png" },
        { start: 202, index: 5, name: "assets/image/imagekokoro_sakura.png" },
        { start: 234, index: 6, name: "assets/image/imagekokoro_ending.png" }
    ],

    // Timeline Lirik & Subtitle Presisi
    lyrics: [
        // -------------------------------------------------------------
        // [Bait 1 / Pembuka: Awal Melodi] — CG: imagekokoro_start.png
        // -------------------------------------------------------------
        {
            start: 5,
            end: 12,
            cgIndex: 0,
            jp: "さくら　さくら",
            romaji: "Sakura sakura...",
            id: "Sakura... sakura..."
        },
        {
            start: 17,
            end: 24,
            cgIndex: 0,
            jp: "さくら　さくら",
            romaji: "Sakura sakura...",
            id: "Sakura... sakura..."
        },
        {
            start: 25,
            end: 34,
            cgIndex: 0,
            jp: "あなたのそばに",
            romaji: "Anata no soba ni",
            id: "Ingin rasanya selalu berada di sisi dirimu..."
        },

        // Jeda Musik 00:34 - 00:42 -> Layar bersih tanpa lirik

        // -------------------------------------------------------------
        // [Bait 2 / Verse 1: Pertemuan di Jalan Stasiun] — CG: imagekokoro_eki.png
        // -------------------------------------------------------------
        {
            start: 42,
            end: 48,
            cgIndex: 1,
            jp: "いつもの駅の　知らない出口",
            romaji: "Itsumo no eki no, shiranai deguchi",
            id: "Pintu keluar asing di stasiun yang biasa kulewati,"
        },
        {
            start: 48,
            end: 53,
            cgIndex: 1,
            jp: "桜舞う　学生鞄",
            romaji: "Sakura mau, gakusei kaban",
            id: "Kelopak sakura menari lembut di atas tas sekolah."
        },
        {
            start: 53,
            end: 56,
            cgIndex: 1,
            jp: "（抱きしめて……）",
            romaji: "（Dakishimete...）",
            id: "（...dekaplah diriku.）"
        },
        {
            start: 56,
            end: 60,
            cgIndex: 1,
            jp: "坂道　行き先　やっと会えるね",
            romaji: "Sakamichi, yukisaki, yatto aeru ne",
            id: "Menyusuri jalan menanjak menuju tempat tujuan, akhirnya kita dapat bersua..."
        },
        {
            start: 61,
            end: 64,
            cgIndex: 1,
            jp: "一人のあなた",
            romaji: "Hitori no anata",
            id: "Terlihat sosokmu yang seorang diri..."
        },
        {
            start: 65,
            end: 67,
            cgIndex: 1,
            jp: "（一人の私……）",
            romaji: "（Hitori no watashi...）",
            id: "（...seperti diriku yang juga seorang diri.）"
        },

        // -------------------------------------------------------------
        // [Bait 3 / Pra-Chorus 1: Tunas Perasaan yang Merekah] — CG: imagekokoro_tsubomi.png
        // -------------------------------------------------------------
        {
            start: 68,
            end: 74,
            cgIndex: 2,
            jp: "気づいていますか？",
            romaji: "Kizuite imasu ka?",
            id: "Adakah engkau menyadarinya?"
        },
        {
            start: 74,
            end: 79,
            cgIndex: 2,
            jp: "あの日の花は　まだ蕾",
            romaji: "Ano hi no hana wa, mada tsubomi",
            id: "Bunga di hari pertemuan itu ternyata masih berupa kuncup yang terlelap."
        },
        {
            start: 79,
            end: 85,
            cgIndex: 2,
            jp: "夢にうつつに　待つのです",
            romaji: "Yume ni utsutsu ni, matsu no desu",
            id: "Antara buaian mimpi dan kenyataan, aku setia menanti,"
        },
        {
            start: 85,
            end: 92,
            cgIndex: 2,
            jp: "新しい恋　開くとき",
            romaji: "Atarashii koi, hiraku toki",
            id: "Saat sebuah rasa cinta yang baru mulai bersemi perlahan."
        },

        // -------------------------------------------------------------
        // [Bait 4 / Chorus 1: Untaian Doa Hati] — CG: imagekokoro_tsubomi.png
        // -------------------------------------------------------------
        {
            start: 92,
            end: 98,
            cgIndex: 2,
            jp: "咲く桜　静かに揺れて",
            romaji: "Saku sakura, shizuka ni yurete",
            id: "Bunga sakura yang mekar berayun lembut dalam hening,"
        },
        {
            start: 98,
            end: 105,
            cgIndex: 2,
            jp: "言葉なしに　願うのです",
            romaji: "Kotoba nashi ni, negau no desu",
            id: "Tanpa terucap sepatah kata pun, hatiku bersujud memohon:"
        },
        {
            start: 105,
            end: 108,
            cgIndex: 2,
            jp: "どうかひととき",
            romaji: "Douka hitotoki",
            id: "Betapa kuimpikan, walau hanya sekejap masa,"
        },
        {
            start: 108,
            end: 117,
            cgIndex: 2,
            jp: "あなたのそばにいられたら",
            romaji: "Anata no soba ni iraretara",
            id: "Andai diri ini dapat terus berada di sisi dirimu..."
        },

        // Jeda Interlude 02:07 - 02:09 -> Layar bersih tanpa lirik

        // -------------------------------------------------------------
        // [Bait 5 / Verse 2: Kehangatan Rumah Berdua] — CG: imagekokoro_sunset.png
        // -------------------------------------------------------------
        {
            start: 129,
            end: 134,
            cgIndex: 3,
            jp: "ベランダごしの　夕日の盛りに",
            romaji: "Beranda goshi no, yūhi no sakari ni",
            id: "Menatap dari balik balkon saat mentari senja merekah sempurna,"
        },
        {
            start: 134,
            end: 140,
            cgIndex: 3,
            jp: "鳥の歌　「おかえりなさい」",
            romaji: "Tori no uta, \"Okaerinasai\"",
            id: "Kicauan burung seakan bersenandung hangat menyambut, \"Selamat datang kembali di rumah...\""
        },
        {
            start: 140,
            end: 141,
            cgIndex: 3,
            jp: "（君が来て……）",
            romaji: "（Kimi ga kite...）",
            id: "（...saat engkau telah tiba.）"
        },
        {
            start: 141,
            end: 147,
            cgIndex: 3,
            jp: "ときめく心で　待っていますね",
            romaji: "Tokimeku kokoro de, matte imasu ne",
            id: "Dengan debaran dada yang penuh kehangatan, aku akan selalu menantimu."
        },
        {
            start: 147,
            end: 150,
            cgIndex: 3,
            jp: "ひとりとひとり",
            romaji: "Hitori to hitori",
            id: "Dua insan yang semula saling menyendiri..."
        },
        {
            start: 151,
            end: 153,
            cgIndex: 3,
            jp: "（一人に……）",
            romaji: "（Hitori ni...）",
            id: "（...kini bersatu menjadi satu.）"
        },

        // -------------------------------------------------------------
        // [Bait 6 / Pra-Chorus 2: Berseminya Bunga Kenangan] — CG: imagekokoro_aquarium.png
        // -------------------------------------------------------------
        {
            start: 154,
            end: 158,
            cgIndex: 4,
            jp: "気づいていますか？",
            romaji: "Kizuite imasu ka?",
            id: "Adakah engkau menyadarinya?"
        },
        {
            start: 158,
            end: 160,
            cgIndex: 4,
            jp: "（……いますか？）",
            romaji: "（...Imasu ka?）",
            id: "（...menyadari kehadiranku?）"
        },
        {
            start: 160,
            end: 165,
            cgIndex: 4,
            jp: "あの日の花は　色づいて",
            romaji: "Ano hi no hana wa, irozuite",
            id: "Bunga kenangan kala itu kini kian merona indah,"
        },
        {
            start: 165,
            end: 172,
            cgIndex: 4,
            jp: "ついに健気に　咲くのです",
            romaji: "Tsui ni kenage ni, saku no desu",
            id: "Akhirnya dengan segenap ketulusan, mekar merekah seutuhnya,"
        },
        {
            start: 172,
            end: 178,
            cgIndex: 4,
            jp: "初めての夢　実るとき",
            romaji: "Hajimete no yume, minoru toki",
            id: "Saat impian pertama ini perlahan membuahkan kebahagiaan..."
        },
        {
            start: 178,
            end: 184,
            cgIndex: 4,
            jp: "さあ……",
            romaji: "Saaa...",
            id: "Menyambut masa..."
        },

        // -------------------------------------------------------------
        // [Bait 7 / Chorus 2: Keabadian Rasa] — CG: imagekokoro_sakura.png
        // -------------------------------------------------------------
        {
            start: 202,
            end: 208,
            cgIndex: 5,
            jp: "咲く桜　静かに揺れて",
            romaji: "Saku sakura, shizuka ni yurete",
            id: "Bunga sakura yang mekar berayun lembut dalam hening,"
        },
        {
            start: 208,
            end: 214,
            cgIndex: 5,
            jp: "儚い日々に　歌うのです",
            romaji: "Hakanai hibi ni, utau no desu",
            id: "Di tengah hari-hari yang fana ini, kulantunkan nada rinduku."
        },
        {
            start: 215,
            end: 219,
            cgIndex: 5,
            jp: "いつか散るとも",
            romaji: "Itsuka chiru tomo",
            id: "Meski kelak kelopaknya kan gugur jua..."
        },
        {
            start: 219,
            end: 229,
            cgIndex: 5,
            jp: "あなたのそばにいられたら",
            romaji: "Anata no soba ni iraretara",
            id: "Asalkan diri ini tetap diizinkan berada di sisi dirimu,"
        },

        // -------------------------------------------------------------
        // [Penutup: Doa Terakhir] — CG: imagekokoro_ending.png
        // -------------------------------------------------------------
        {
            start: 234,
            end: 238,
            cgIndex: 6,
            jp: "どうかひととき",
            romaji: "Douka hitotoki...",
            id: "Semoga... walau hanya sekejap masa,"
        },
        {
            start: 238,
            end: 240,
            cgIndex: 6,
            jp: "（どうかひととき……）",
            romaji: "（Douka hitotoki...）",
            id: "（...walau hanya sekejap masa,）"
        },
        {
            start: 248,
            end: 255,
            cgIndex: 6,
            jp: "あなたのそばに……",
            romaji: "Anata no soba ni...",
            id: "Biarkan aku selalu berada di sisi dirimu..."
        }
    ]
};
