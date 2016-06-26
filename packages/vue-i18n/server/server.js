import fs from 'fs';
import locale from 'locale';

const DEFAULT_LANG = process.env.DEFAULT_LANG || 'en';

function watchFile(path, callback) {
  fs.watchFile(path, {
    persistent: false
  }, function(curr, prev) {
    if(curr.mtime !== prev.mtime) {
      if(callback) {
        callback();
      } else {
        console.log(`Watcher on file ${path} has no callback.`);
      }
    }
  });
}


let langs = [];
let langsData = {};
let langWatchers = {};

// Language list
const i18nPath = `../web.browser/app/i18n/`;
const langsPath = `../web.browser/app/i18n/__langs.json`;
function updateLangs() {
  if(fs.existsSync(langsPath)) {
    let langsJson = fs.readFileSync(langsPath, {
      encoding: 'utf8'
    });

    let newLangs = JSON.parse(langsJson);

    if(Meteor.isDevelopment) {
      // Removed langs
      for(let lang of langs) {
        if(newLangs.indexOf(lang) === -1) {
          removeLang(lang);
        } else {
          updateLangData({
            lang: lang,
            path: `../web.browser/app/i18n/${lang}.json`
          });
        }
      }

      // New langs
      for(let lang of newLangs) {
        if(langs.indexOf(lang) === -1) {
          addLang(lang);
        }
      }
    }

    langs = newLangs;
  }
}
updateLangs();

// Watch
if(Meteor.isDevelopment) {
  watchFile(i18nPath, updateLangs);
}

// Locale data

function updateLangData({lang, path}) {
  if(fs.existsSync(path)) {
    let localeJson = fs.readFileSync(path, {
      encoding: 'utf8'
    });
    let localeData = JSON.parse(localeJson);
    langsData[lang] = localeData;
  }
}

function addLang(lang) {
  updateLangData({
    lang: lang,
    path: `../web.browser/app/i18n/${lang}.json`
  });
}

function removeLang(lang) {
  delete langsData[lang];
}

if(!Meteor.isDevelopment) {
  for(let lang of langs) {
    addLang(lang);
  }
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
  if(langs.indexOf(lang) === -1) {
    if(langs.indexOf(DEFAULT_LANG) === -1) {
      lang = langs[0];
    } else {
      lang = DEFAULT_LANG;
    }
  }
  InjectData.pushData(res, 'vue-i18n-lang', {
    langs,
    lang,
    locale: langsData[lang]
  });
  next();
});
