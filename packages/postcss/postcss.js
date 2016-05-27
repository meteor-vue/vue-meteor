import postcssLib from 'postcss'
import selectorParserLib from 'postcss-selector-parser'
import autoprefixerLib from 'autoprefixer'

export const name = 'postcss';

export const postcss = postcssLib;
export const selectorParser = selectorParserLib;
export const autoprefixer = autoprefixerLib;

export const addHash = postcss.plugin('add-hash', function (opts) {
  return function (root) {
    root.each(function rewriteSelector (node) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule' && node.name === 'media') {
          node.each(rewriteSelector)
        }
        return
      }
      node.selector = selectorParser(function (selectors) {
        selectors.each(function (selector) {
          var node = null
          selector.each(function (n) {
            if (n.type !== 'pseudo') node = n
          })
          selector.insertAfter(node, selectorParser.attribute({
            attribute: opts.hash
          }))
        })
      }).process(node.selector).result
    })
  }
})
