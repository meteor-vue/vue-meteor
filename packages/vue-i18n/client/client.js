import { Vue } from 'meteor/akryum:vue';
import VueI18n from 'vue-i18n';
import Cookies from 'js-cookie';

Vue.use(VueI18n);

let languageList, defaultLang, defaultLocale;

// Manager
let I18n = new Vue({
  data() {
    return {
      languageList: [],
      loading: false,
      error: null
    }
  },
  methods: {
    init(languageList) {
      if (languageList.length === 0) {
        throw new Error('Empty language list. Did you add a language file in your client?');
      }
      this.languageList = languageList;

      if(localStorage.getItem('_vueLang')) {
        if(localStorage.getItem('_vueLang') !== Vue.config.lang) {
          this.setSavedLocale();
        }
      } else {
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
          Cookies.set('_vueLang', lang, {expires: 365});
          localStorage.setItem('_vueLang', lang);
        }
      });
    },
    setAutoLocale(remember=false) {
      // Auto language selection
      let localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
      let autoLocale = localeFromBrowser;

      if (this.languageList.indexOf(autoLocale) === -1) {
        if (this.languageList.indexOf('en') === -1) {
          autoLocale = this.languageList[0];
        } else {
          autoLocale = 'en';
        }
      }

      if(autoLocale !== Vue.config.lang) {
        this.loadLocale(autoLocale);
      }

      if(remember) {
        Cookies.remove('_vueLang');
        localStorage.removeItem('_vueLang');
      }
    },
    setSavedLocale() {
      let lang = localStorage.getItem('_vueLang');
      if(lang) {
        this.loadLocale(lang, true);
      }
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
