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
    this.optionPage = null;
    this.popupPage = null;
  }
  setOption(key, value) {
    this.options[key] = value;
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
  async build() {
    try {
      this.manifest = await this.validator.validate(this.manifest);
      this.setContentScripts();
      this.setBackgroundScripts();
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
