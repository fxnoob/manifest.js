const { Validator } = require('./validator');
const webpack = require('./webpack');
const constants = require('./constants');

class Builder {
  constructor(manifestObject, options = {}) {
    this.options = options || {};
    this.manifest = manifestObject;
    this.validator = new Validator();
    this.contentScripts = [];
    this.webpack = webpack;
    this.backgroundScripts = [];
    this.pages = [];
    this.optionPage = null;
    this.popupPage = null;
    this.historyPage = null;

    this.hasPopupPage = false;
    this.hasOptionPage = false;
    this.hasHistoryPage = false;
  }
  setOption(key, value) {
    this.options[key] = value;
  }
  setPages() {
    const pages = [];
    if (this.manifest?.chrome_url_overrides?.history) {
      pages.push(this.manifest?.chrome_url_overrides?.history);
    }
    if (this.manifest.options_page) {
      pages.push(this.manifest.options_page);
    }
    if (this.manifest.devtools_page) {
      pages.push(this.manifest.devtools_page);
    }
    if (this.manifest?.action?.default_popup) {
      pages.push(this.manifest?.action?.default_popup);
    }
    this.pages = pages;
    return pages;
  }
  setContentScripts() {
    const cScripts = [];
    this.manifest?.content_scripts?.map((cs) => {
      cs?.js?.map((j) => {
        cScripts.push(j);
      });
    });
    this.contentScripts = cScripts;
    return cScripts;
  }
  setBackgroundScripts() {
    const cScripts = [];
    if (this.manifest?.background?.service_worker) {
      this.backgroundScripts = [this.manifest?.background?.service_worker];
    }
  }
  async init() {
    this.manifest = await this.validator.validate(this.manifest);
    this.setContentScripts();
    this.setBackgroundScripts();
    this.setPages();
  }
  async build() {
    try {
      await this.init();
      const allScripts = [...this.contentScripts, ...this.backgroundScripts];
      this.setOption(constants.syncDir, true);
      await this.webpack.buildScripts(allScripts, this.options);
      this.setOption(constants.syncDir, false);
      await this.webpack.buildScripts(allScripts, this.options);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

exports.Builder = Builder;
