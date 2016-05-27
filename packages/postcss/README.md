# Postcss for Meteor

## Usage


```javascript
    import * as Postcss from 'meteor/akryum:postcss';

    let plugins = [];
    let postcssOptions = {
      form: inputFilePath,
      to: inputFilePath,
      map: {
        inline: false,
        annotation: false,
        prev: cssMap
      }
    }

    // Scoped
    if (styleTag.attribs.scoped) {
      plugins.push(Postcss.addHash({
        hash
      }));
    }

    // Autoprefixer
    if (styleTag.attribs.autoprefix !== 'off') {
      plugins.push(Postcss.autoprefixer());
    }

    // Postcss result
    let result = Postcss.postcss(plugins).process(css, postcssOptions);
```
