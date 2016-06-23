import fs from 'fs';

let langsJson = fs.readFileSync(`assets/app/i18n/__langs.json`, {
  encoding: 'utf8'
});
let langs = JSON.parse(langsJson);
console.log(langs);

let lang = 'en';
let localeData = fs.readFileSync(`assets/app/i18n/${lang}.json`, {
  encoding: 'utf8'
});
console.log(localeData);

WebAppInternals.addStaticJs(`
(function(){
  window.__vue_langs__ = ${langsJson};
  window.__vue_default_locale__ = ${localeData};
  window.__vue_default_lang__ = '${lang}';
})();
`);
