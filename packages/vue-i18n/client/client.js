import { Vue } from 'meteor/akryum:vue';
import VueI18n from 'vue-i18n';
import Cookies from 'js-cookie';

Vue.use(VueI18n);

// $tp method
const packageNameCharsReg = /:|-/g;
Vue.prototype.$tp = function(key, ...args) {
  if(!key) {
    return '';
  }

  // Add package path to key
  if(this.$options.packageName) {
    // Normalize package name
    if(!this.$options.packageNameI18n) {
      this.$options.packageNameI18n = this.$options.packageName.replace(packageNameCharsReg, '_');
    }

    key = `packages.${this.$options.packageNameI18n}.${key}`;
  }

  return this.$t(key, args);
};

let languageList, defaultLang, defaultLocale;

// Manager
let I18n = new Vue({
  data() {
    return {
      languageList: [],
      loading: false,
      error: null,
      savedLangOption: null,
      autoLocale: null,
      browserLocale: window.navigator.userLanguage || window.navigator.language
    }
  },
  methods: {
    init(languageList) {
      if (languageList.length === 0) {
        throw new Error('Empty language list. Did you add a language file in your client?');
      }
      this.languageList = languageList;

      let savedLang = localStorage.getItem('_vueLang');
      if(savedLang) {
        this.savedLangOption = savedLang;
        if(savedLang !== Vue.config.lang) {
          this.setSavedLocale();
        }
      } else {
        this.savedLangOption = 'auto';
        this.setAutoLocale();
      }
    },
    loadLocale(lang) {
      return new Promise((resolve, reject) => {
        Vue.locale(lang, () => {
          this.loading = true;
          this.error = null;
          return fetch(`/i18n/${lang}.json`, {
            method: 'get',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }).then((res) => {
            return res.json();
          }).then((json) => {
            this.loading = false;
            if (Object.keys(json).length === 0) {
              return Promise.reject(new Error('locale empty !!'));
            } else {
              return Promise.resolve(json);
            }
          }).catch((error) => {
            this.error = error.message;
            this.loading = false;
            reject(error);
            return Promise.reject();
          });
        }, () => {
          Vue.config.lang = lang;
          resolve(lang);
        });
      });
    },
    setLocale(lang, remember=false) {
      this.loadLocale(lang).then((lang) => {
        if(remember) {
          this.saveLang(lang);
        }
      });
    },
    setAutoLocale(remember=false) {
      // Auto language selection
      let autoLocale = this.browserLocale;

      if (this.languageList.indexOf(autoLocale) === -1) {
        if (this.languageList.indexOf(defaultLang) === -1) {
          autoLocale = this.languageList[0];
        } else {
          autoLocale = defaultLang;
        }
      }

      this.autoLocale = autoLocale;

      if(autoLocale !== Vue.config.lang) {
        this.loadLocale(autoLocale);
      }

      if(remember) {
        Cookies.remove('_vueLang');
        localStorage.removeItem('_vueLang');
        this.savedLangOption = 'auto';
      }
    },
    setSavedLocale() {
      let lang = localStorage.getItem('_vueLang');
      if(lang) {
        this.savedLangOption = lang;
        this.loadLocale(lang, true);
      }
    },
    saveLang(lang) {
      this.savedLangOption = lang;
      Cookies.set('_vueLang', lang, {expires: 365});
      localStorage.setItem('_vueLang', lang);
    }
  }
});

I18n.lib = VueI18n;

// Init with server injected locale
InjectData.getData('vue-i18n-lang', function(data) {
  languageList = data.langs;
  defaultLang = data.lang;
  defaultLocale = data.locale;

  Vue.locale(defaultLang, defaultLocale);
  Vue.config.lang = defaultLang;
  I18n.init(languageList);
});

export default I18n;

/**
 * @author Phil Teare
 * using wikipedia data
 */
export const isoLangs = {
    "ab":{
        "name":"Abkhaz",
        "nativeName":"аҧсуа"
    },
    "aa":{
        "name":"Afar",
        "nativeName":"Afaraf"
    },
    "af":{
        "name":"Afrikaans",
        "nativeName":"Afrikaans"
    },
    "ak":{
        "name":"Akan",
        "nativeName":"Akan"
    },
    "sq":{
        "name":"Albanian",
        "nativeName":"Shqip"
    },
    "am":{
        "name":"Amharic",
        "nativeName":"አማርኛ"
    },
    "ar":{
        "name":"Arabic",
        "nativeName":"العربية"
    },
    "an":{
        "name":"Aragonese",
        "nativeName":"Aragonés"
    },
    "hy":{
        "name":"Armenian",
        "nativeName":"Հայերեն"
    },
    "as":{
        "name":"Assamese",
        "nativeName":"অসমীয়া"
    },
    "av":{
        "name":"Avaric",
        "nativeName":"Aвар мацӀ"
    },
    "ae":{
        "name":"Avestan",
        "nativeName":"avesta"
    },
    "ay":{
        "name":"Aymara",
        "nativeName":"Aymar aru"
    },
    "az":{
        "name":"Azerbaijani",
        "nativeName":"Azərbaycan dili"
    },
    "bm":{
        "name":"Bambara",
        "nativeName":"Bamanankan"
    },
    "ba":{
        "name":"Bashkir",
        "nativeName":"башҡорт теле"
    },
    "eu":{
        "name":"Basque",
        "nativeName":"Euskara"
    },
    "be":{
        "name":"Belarusian",
        "nativeName":"Беларуская"
    },
    "bn":{
        "name":"Bengali",
        "nativeName":"বাংলা"
    },
    "bh":{
        "name":"Bihari",
        "nativeName":"भोजपुरी"
    },
    "bi":{
        "name":"Bislama",
        "nativeName":"Bislama"
    },
    "bs":{
        "name":"Bosnian",
        "nativeName":"Bosanski jezik"
    },
    "br":{
        "name":"Breton",
        "nativeName":"Brezhoneg"
    },
    "bg":{
        "name":"Bulgarian",
        "nativeName":"български език"
    },
    "my":{
        "name":"Burmese",
        "nativeName":"ဗမာစာ"
    },
    "ca":{
        "name":"Catalan; Valencian",
        "nativeName":"Català"
    },
    "ch":{
        "name":"Chamorro",
        "nativeName":"Chamoru"
    },
    "ce":{
        "name":"Chechen",
        "nativeName":"нохчийн мотт"
    },
    "ny":{
        "name":"Nyanja",
        "nativeName":"ChiCheŵa"
    },
    "zh":{
        "name":"Chinese",
        "nativeName":"中文"
    },
    "cv":{
        "name":"Chuvash",
        "nativeName":"чӑваш чӗлхи"
    },
    "kw":{
        "name":"Cornish",
        "nativeName":"Kernewek"
    },
    "co":{
        "name":"Corsican",
        "nativeName":"Corsu"
    },
    "cr":{
        "name":"Cree",
        "nativeName":"ᓀᐦᐃᔭᐍᐏᐣ"
    },
    "hr":{
        "name":"Croatian",
        "nativeName":"Hrvatski"
    },
    "cs":{
        "name":"Czech",
        "nativeName":"Česky"
    },
    "da":{
        "name":"Danish",
        "nativeName":"Dansk"
    },
    "dv":{
        "name":"Divehi; Dhivehi; Maldivian;",
        "nativeName":"ދިވެހި"
    },
    "nl":{
        "name":"Dutch",
        "nativeName":"Nederlands, Vlaams"
    },
    "en":{
        "name":"English",
        "nativeName":"English"
    },
    "eo":{
        "name":"Esperanto",
        "nativeName":"Esperanto"
    },
    "et":{
        "name":"Estonian",
        "nativeName":"Eesti"
    },
    "ee":{
        "name":"Ewe",
        "nativeName":"Eʋegbe"
    },
    "fo":{
        "name":"Faroese",
        "nativeName":"Føroyskt"
    },
    "fj":{
        "name":"Fijian",
        "nativeName":"Vosa Vakaviti"
    },
    "fi":{
        "name":"Finnish",
        "nativeName":"Suomi"
    },
    "fr":{
        "name":"French",
        "nativeName":"Français"
    },
    "ff":{
        "name":"Fula",
        "nativeName":"Fulfulde"
    },
    "gl":{
        "name":"Galician",
        "nativeName":"Galego"
    },
    "ka":{
        "name":"Georgian",
        "nativeName":"ქართული"
    },
    "de":{
        "name":"German",
        "nativeName":"Deutsch"
    },
    "el":{
        "name":"Greek (modern)",
        "nativeName":"Ελληνικά"
    },
    "gn":{
        "name":"Guaraní",
        "nativeName":"Avañeẽ"
    },
    "gu":{
        "name":"Gujarati",
        "nativeName":"ગુજરાતી"
    },
    "ht":{
        "name":"Haitian",
        "nativeName":"Kreyòl ayisyen"
    },
    "ha":{
        "name":"Hausa",
        "nativeName":"Hausa"
    },
    "he":{
        "name":"Hebrew (modern)",
        "nativeName":"עברית"
    },
    "hz":{
        "name":"Herero",
        "nativeName":"Otjiherero"
    },
    "hi":{
        "name":"Hindi",
        "nativeName":"हिन्दी"
    },
    "ho":{
        "name":"Hiri Motu",
        "nativeName":"Hiri Motu"
    },
    "hu":{
        "name":"Hungarian",
        "nativeName":"Magyar"
    },
    "ia":{
        "name":"Interlingua",
        "nativeName":"Interlingua"
    },
    "id":{
        "name":"Indonesian",
        "nativeName":"Bahasa Indonesia"
    },
    "ie":{
        "name":"Interlingue",
        "nativeName":"Interlingue"
    },
    "ga":{
        "name":"Irish",
        "nativeName":"Gaeilge"
    },
    "ig":{
        "name":"Igbo",
        "nativeName":"Asụsụ Igbo"
    },
    "ik":{
        "name":"Inupiaq",
        "nativeName":"Iñupiaq"
    },
    "io":{
        "name":"Ido",
        "nativeName":"Ido"
    },
    "is":{
        "name":"Icelandic",
        "nativeName":"Íslenska"
    },
    "it":{
        "name":"Italian",
        "nativeName":"Italiano"
    },
    "iu":{
        "name":"Inuktitut",
        "nativeName":"ᐃᓄᒃᑎᑐᑦ"
    },
    "ja":{
        "name":"Japanese",
        "nativeName":"日本語"
    },
    "jv":{
        "name":"Javanese",
        "nativeName":"Basa Jawa"
    },
    "kl":{
        "name":"Kalaallisut",
        "nativeName":"Kalaallisut"
    },
    "kn":{
        "name":"Kannada",
        "nativeName":"ಕನ್ನಡ"
    },
    "kr":{
        "name":"Kanuri",
        "nativeName":"Kanuri"
    },
    "ks":{
        "name":"Kashmiri",
        "nativeName":"कश्मीरी"
    },
    "kk":{
        "name":"Kazakh",
        "nativeName":"Қазақ тілі"
    },
    "km":{
        "name":"Khmer",
        "nativeName":"ភាសាខ្មែរ"
    },
    "ki":{
        "name":"Kikuyu",
        "nativeName":"Gĩkũyũ"
    },
    "rw":{
        "name":"Kinyarwanda",
        "nativeName":"Ikinyarwanda"
    },
    "ky":{
        "name":"Kirghiz",
        "nativeName":"кыргыз тили"
    },
    "kv":{
        "name":"Komi",
        "nativeName":"коми кыв"
    },
    "kg":{
        "name":"Kongo",
        "nativeName":"KiKongo"
    },
    "ko":{
        "name":"Korean",
        "nativeName":"한국어"
    },
    "ku":{
        "name":"Kurdish",
        "nativeName":"Kurdî"
    },
    "kj":{
        "name":"Kwanyama",
        "nativeName":"Kuanyama"
    },
    "la":{
        "name":"Latin",
        "nativeName":"Latine"
    },
    "lb":{
        "name":"Luxembourgish",
        "nativeName":"Lëtzebuergesch"
    },
    "lg":{
        "name":"Luganda",
        "nativeName":"Luganda"
    },
    "li":{
        "name":"Limburgish",
        "nativeName":"Limburgs"
    },
    "ln":{
        "name":"Lingala",
        "nativeName":"Lingála"
    },
    "lo":{
        "name":"Lao",
        "nativeName":"ພາສາລາວ"
    },
    "lt":{
        "name":"Lithuanian",
        "nativeName":"lietuvių kalba"
    },
    "lu":{
        "name":"Luba-Katanga",
        "nativeName":"Luba-Katanga"
    },
    "lv":{
        "name":"Latvian",
        "nativeName":"latviešu valoda"
    },
    "gv":{
        "name":"Manx",
        "nativeName":"Gaelg"
    },
    "mk":{
        "name":"Macedonian",
        "nativeName":"македонски јазик"
    },
    "mg":{
        "name":"Malagasy",
        "nativeName":"Malagasy fiteny"
    },
    "ms":{
        "name":"Malay",
        "nativeName":"بهاس ملايو‎"
    },
    "ml":{
        "name":"Malayalam",
        "nativeName":"മലയാളം"
    },
    "mt":{
        "name":"Maltese",
        "nativeName":"Malti"
    },
    "mi":{
        "name":"Māori",
        "nativeName":"Māori"
    },
    "mr":{
        "name":"Marathi",
        "nativeName":"मराठी"
    },
    "mh":{
        "name":"Marshallese",
        "nativeName":"Kajin M̧ajeļ"
    },
    "mn":{
        "name":"Mongolian",
        "nativeName":"монгол"
    },
    "na":{
        "name":"Nauru",
        "nativeName":"Ekakairũ Naoero"
    },
    "nv":{
        "name":"Navajo",
        "nativeName":"Diné bizaad"
    },
    "nb":{
        "name":"Norwegian Bokmål",
        "nativeName":"Norsk bokmål"
    },
    "nd":{
        "name":"North Ndebele",
        "nativeName":"IsiNdebele"
    },
    "ne":{
        "name":"Nepali",
        "nativeName":"नेपाली"
    },
    "ng":{
        "name":"Ndonga",
        "nativeName":"Owambo"
    },
    "nn":{
        "name":"Norwegian Nynorsk",
        "nativeName":"Norsk nynorsk"
    },
    "no":{
        "name":"Norwegian",
        "nativeName":"Norsk"
    },
    "ii":{
        "name":"Nuosu",
        "nativeName":"Nuosuhxop"
    },
    "nr":{
        "name":"South Ndebele",
        "nativeName":"IsiNdebele"
    },
    "oc":{
        "name":"Occitan",
        "nativeName":"Occitan"
    },
    "oj":{
        "name":"Ojibwe",
        "nativeName":"ᐊᓂᔑᓈᐯᒧᐎᓐ"
    },
    "cu":{
        "name":"Old Slavonic",
        "nativeName":"ѩзыкъ словѣньскъ"
    },
    "om":{
        "name":"Oromo",
        "nativeName":"Afaan Oromoo"
    },
    "or":{
        "name":"Oriya",
        "nativeName":"ଓଡ଼ିଆ"
    },
    "os":{
        "name":"Ossetian",
        "nativeName":"ирон æвзаг"
    },
    "pa":{
        "name":"Panjabi",
        "nativeName":"ਪੰਜਾਬ"
    },
    "pi":{
        "name":"Pāli",
        "nativeName":"पाऴि"
    },
    "fa":{
        "name":"Persian",
        "nativeName":"فارسی"
    },
    "pl":{
        "name":"Polish",
        "nativeName":"Polski"
    },
    "ps":{
        "name":"Pashto",
        "nativeName":"پښتو"
    },
    "pt":{
        "name":"Portuguese",
        "nativeName":"Português"
    },
    "qu":{
        "name":"Quechua",
        "nativeName":"Runa Simi"
    },
    "rm":{
        "name":"Romansh",
        "nativeName":"Rumantsch grischun"
    },
    "rn":{
        "name":"Kirundi",
        "nativeName":"KiRundi"
    },
    "ro":{
        "name":"Romanian",
        "nativeName":"Română"
    },
    "ru":{
        "name":"Russian",
        "nativeName":"Pусский язык"
    },
    "sa":{
        "name":"Sanskrit (Saṁskṛta)",
        "nativeName":"संस्कृतम्"
    },
    "sc":{
        "name":"Sardinian",
        "nativeName":"Sardu"
    },
    "sd":{
        "name":"Sindhi",
        "nativeName":"सिन्धी"
    },
    "se":{
        "name":"Northern Sami",
        "nativeName":"Davvisámegiella"
    },
    "sm":{
        "name":"Samoan",
        "nativeName":"Gagana faa Samoa"
    },
    "sg":{
        "name":"Sango",
        "nativeName":"Yângâ tî sängö"
    },
    "sr":{
        "name":"Serbian",
        "nativeName":"српски језик"
    },
    "gd":{
        "name":"Gaelic",
        "nativeName":"Gàidhlig"
    },
    "sn":{
        "name":"Shona",
        "nativeName":"ChiShona"
    },
    "si":{
        "name":"Sinhala,",
        "nativeName":"සිංහල"
    },
    "sk":{
        "name":"Slovak",
        "nativeName":"Slovenčina"
    },
    "sl":{
        "name":"Slovene",
        "nativeName":"Slovenščina"
    },
    "so":{
        "name":"Somali",
        "nativeName":"Soomaaliga"
    },
    "st":{
        "name":"Southern Sotho",
        "nativeName":"Sesotho"
    },
    "es":{
        "name":"Spanish",
        "nativeName":"Español"
    },
    "su":{
        "name":"Sundanese",
        "nativeName":"Basa Sunda"
    },
    "sw":{
        "name":"Swahili",
        "nativeName":"Kiswahili"
    },
    "ss":{
        "name":"Swati",
        "nativeName":"SiSwati"
    },
    "sv":{
        "name":"Swedish",
        "nativeName":"Svenska"
    },
    "ta":{
        "name":"Tamil",
        "nativeName":"தமிழ்"
    },
    "te":{
        "name":"Telugu",
        "nativeName":"తెలుగు"
    },
    "tg":{
        "name":"Tajik",
        "nativeName":"тоҷикӣ"
    },
    "th":{
        "name":"Thai",
        "nativeName":"ไทย"
    },
    "ti":{
        "name":"Tigrinya",
        "nativeName":"ትግርኛ"
    },
    "bo":{
        "name":"Tibetan",
        "nativeName":"བོད་ཡིག"
    },
    "tk":{
        "name":"Turkmen",
        "nativeName":"Türkmen, Түркмен"
    },
    "tl":{
        "name":"Tagalog",
        "nativeName":"Wikang Tagalog"
    },
    "tn":{
        "name":"Tswana",
        "nativeName":"Setswana"
    },
    "to":{
        "name":"Tonga",
        "nativeName":"Faka Tonga"
    },
    "tr":{
        "name":"Turkish",
        "nativeName":"Türkçe"
    },
    "ts":{
        "name":"Tsonga",
        "nativeName":"Xitsonga"
    },
    "tt":{
        "name":"Tatar",
        "nativeName":"татарча"
    },
    "tw":{
        "name":"Twi",
        "nativeName":"Twi"
    },
    "ty":{
        "name":"Tahitian",
        "nativeName":"Reo Tahiti"
    },
    "ug":{
        "name":"Uighur",
        "nativeName":"Uyƣurqə"
    },
    "uk":{
        "name":"Ukrainian",
        "nativeName":"українська"
    },
    "ur":{
        "name":"Urdu",
        "nativeName":"اردو"
    },
    "uz":{
        "name":"Uzbek",
        "nativeName":"Zbek"
    },
    "ve":{
        "name":"Venda",
        "nativeName":"Tshivenḓa"
    },
    "vi":{
        "name":"Vietnamese",
        "nativeName":"Tiếng Việt"
    },
    "vo":{
        "name":"Volapük",
        "nativeName":"Volapük"
    },
    "wa":{
        "name":"Walloon",
        "nativeName":"Walon"
    },
    "cy":{
        "name":"Welsh",
        "nativeName":"Cymraeg"
    },
    "wo":{
        "name":"Wolof",
        "nativeName":"Wollof"
    },
    "fy":{
        "name":"Western Frisian",
        "nativeName":"Frysk"
    },
    "xh":{
        "name":"Xhosa",
        "nativeName":"IsiXhosa"
    },
    "yi":{
        "name":"Yiddish",
        "nativeName":"ייִדיש"
    },
    "yo":{
        "name":"Yoruba",
        "nativeName":"Yorùbá"
    },
    "za":{
        "name":"Zhuang",
        "nativeName":"Saɯ cueŋƅ"
    }
};
