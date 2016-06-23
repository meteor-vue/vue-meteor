import { Vue } from 'meteor/akryum:vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

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

      // Auto language selection
      let localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
      console.log('localeFromBrowser', localeFromBrowser);
      let autoLocale = localeFromBrowser;

      if (languageList.indexOf(autoLocale) === -1) {
        if (languageList.indexOf('en') === -1) {
          autoLocale = languageList[0];
        } else {
          autoLocale = 'en';
        }
      }

      this.loadLocale(autoLocale);
    },
    loadLocale(lang) {
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
          return Promise.reject();
        });
      }, () => {
        Vue.config.lang = lang;
      });
    }
  }
});

I18n.lib = VueI18n;

Meteor.startup(function() {
  let languageList = window.__vue_langs__;
  let defaultLang = window.__vue_default_lang__;
  let defaultLocale = window.__vue_default_locale__;

  Vue.locale(defaultLang, defaultLocale);
  Vue.config.lang = defaultLang;
  I18n.init(languageList);
});

export default I18n;
