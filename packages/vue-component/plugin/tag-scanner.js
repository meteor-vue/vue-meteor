scanHtmlForTags = function scanHtmlForTags(options) {
  const scan = new HtmlScan(options);
  return scan.getTags();
};

/**
 * Scan an HTML file for top-level tags and extract their contents. Pass them to
 * a tag handler (an object with a handleTag method)
 *
 * This is a primitive, regex-based scanner.  It scans
 * top-level tags, which are allowed to have attributes,
 * and ignores top-level HTML comments.
 */
class HtmlScan {
  /**
   * Initialize and run a scan of a single file
   * @param  {String} sourceName The filename, used in errors only
   * @param  {String} contents   The contents of the file
   * @param  {String[]} tagNames An array of tag names that are accepted at the
   * top level. If any other tag is encountered, an error is thrown.
   */
  constructor({
        sourceName,
        contents,
        tagNames
      }) {
    this.sourceName = sourceName;
    this.contents = contents.replace(rnRegex, '\n').replace(rRegex, '\n').replace(tagCommentRegex, '');
    this.tagNames = tagNames;

    this.tags = [];

    let result;

    while(result = tagRegex.exec(this.contents)) {
      let tagName = result[1];
      let attrs = result[2];
      let tagContents = result[3];

      if(tagNames.indexOf(tagName) === -1) {
        this.throwCompileError(`Expected one of: <${this.tagNames.join('>, <')}>, found <${tagName}>`);
      }

      let tagAttribs = {};
      if(attrs) {
        let attr;
        while(attr = attrsRegex.exec(attrs)) {
          let attrValue;
          if(attr.length === 5) {
            attrValue = attr[4];
            if(attrValue === undefined) {
                attrValue = true;
            }
          } else {
            attrValue = true;
          }
          tagAttribs[attr[1]] = attrValue;
        }
      }

      const tag = {
        tagName: tagName,
        attribs: tagAttribs,
        contents: tagContents,
        fileContents: this.contents,
        sourceName: this.sourceName,
      };

      // save the tag
      this.tags.push(tag);

    }
  }

  throwCompileError(msg) {
    const err = new CompileError();
    err.message = msg || "bad formatting in component file";
    err.file = this.sourceName;
    err.line = this.contents.substring(0, finalIndex).split('\n').length;

    throw err;
  }

  getTags() {
    return this.tags;
  }
}

const rnRegex = /\r\n/g;
const rRegex = /\r/g;
const tagCommentRegex = /<!--([\s\S]+?)-->/igm;
const tagRegex = /<(\w+)(\s+.*)?>\n([\s\S]+?)<\/\1>/igm;
const attrsRegex = /\s+(\w+)(=(["'])([\w\/~$@:.-]*)\3)?/ig;
