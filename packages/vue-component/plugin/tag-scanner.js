import parse5 from 'parse5'
import { Meteor } from 'meteor/meteor'

scanHtmlForTags = function scanHtmlForTags(options) {
  try {
    return parseHtml(options)
  } catch (e) {
    throwCompileError(e)
  }
};

const parseHtml = Meteor.wrapAsync(({
    sourceName,
    contents,
    tagNames
  }, cb) => {

  const tags = []

  const parser = new parse5.SAXParser({
    locationInfo: true,
  })

  let depth = 0
  let info

  function addTag() {
    const tagContents = contents.substring(info.start.index, info.end.index)

    const tag = {
      tagName: info.tag.name,
      attribs: info.tag.attrs,
      contents: tagContents,
      contentsStartIndex: info.start.index,
      tagStartIndex: info.tag.index,
      fileContents: contents,
      sourceName: sourceName,
      startLine: info.start.line,
      endLine: info.end.line
    }

    // save the tag
    tags.push(tag)
  }

  parser.on('startTag', (name, attrs, selfClosing, location) => {
    if (depth === 0) {
      if (tagNames.indexOf(name) !== -1) {
        info = {
          tag: {
            name,
            attrs: attrs.reduce((dic, attr) => {
              const value = attr.value === '' ? true : attr.value
              dic[attr.name] = value
              return dic
            }, {}),
            index: location.startOffset,
          },
          start: {
            line: location.line,
            index: location.endOffset,
          },
        }

        if (selfClosing) {
          info.end = {
            line: location.line,
            index: location.endOffset,
          }

          addTag()
        } else {
          depth++
        }
      }
    } else if (name === info.tag.name) {
      depth ++
    }
  })

  parser.on('endTag', (name, location) => {
    if (depth !== 0 && name === info.tag.name) {
      depth--

      if (depth === 0) {
        info.end = {
          line: location.line,
          index: location.startOffset - 1,
        }

        addTag()
      }
    }
  })

  parser.on('end', () => {
    if (depth !== 0) {
      cb({
        path: sourceName,
        line: info.start.line,
        tag: info.tag.name,
        message: `Missing closing </${info.tag.name}>`,
      }, null)
      return
    }

    cb(null, tags)
  })

  parser.write(contents)
  parser.end()
})
