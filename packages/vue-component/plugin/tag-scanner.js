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
    this.originalContents = contents;
    this.contents = normalizeCarriageReturns(contents).replace(tagCommentRegex, '');
    this.tagNames = tagNames;

    this.tags = [];

    let result;

    // Unique tags: Template & Script
    while(result = expandedTagRegex.exec(this.contents)) {
      this.addTagFromResult(result);
    }

    // Multiple styles
    while(result = limitedTagRegex.exec(this.contents)) {
      this.addTagFromResult(result);
    }
  }

  addTagFromResult(result) {
    let tagName = result[1];
    let attrs = result[2];
    let tagContents = result[3];

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

    const originalContents = this.originalContents;

    const tag = {
      tagName: tagName,
      attribs: tagAttribs,
      contents: tagContents,
      fileContents: this.contents,
      sourceName: this.sourceName,
      _tagStartIndex: null,
      get tagStartIndex() {
        if(this._tagStartIndex === null) {
          this._tagStartIndex = originalContents.indexOf(tagContents.substr(0, 10));
        }
        return this._tagStartIndex;
      }
    };

    // save the tag
    this.tags.push(tag);
  }

  getTags() {
    return this.tags;
  }
}
