import fs from 'fs';
import locale from 'locale';

// Language list
let langsJson = fs.readFileSync(`../web.browser/app/i18n/__langs.json`, {
  encoding: 'utf8'
});
let langs = JSON.parse(langsJson);

// Locale data
let langsData = {};
for(let lang of langs) {
  let localeJson = fs.readFileSync(`../web.browser/app/i18n/${lang}.json`, {
    encoding: 'utf8'
  });
  let localeData = JSON.parse(localeJson);
  langsData[lang] = localeData;
}

// Locale negotiation
WebApp.connectHandlers.use(locale(langs));

// Client request
WebApp.connectHandlers.use((req, res, next) => {
  let lang = req.locale;
  let cookies = req.cookies;
  if(cookies && cookies._vueLang) {
    lang = cookies._vueLang;
  }
  InjectData.pushData(res, 'vue-i18n-lang', {
    langs,
    lang,
    locale: langsData[lang]
  });
  next();
});
