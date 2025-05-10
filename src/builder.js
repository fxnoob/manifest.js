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
    this.assets = {
      mainIcons: [],
      actionIcons: [],
      webAccessibleResources: [],
      localizations: [],
      htmlPages: []
    };
    this.scripts = {
      backgroundScripts: [],
      contentScripts: [],
      popupPageScripts: [],
      optionsPageScripts: []
    };

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
    this.scripts.contentScripts = cScripts;
    return cScripts;
  }

  setPopupPageScripts() {
    const popupScripts = [];
    // If there's a popup page, we need to find associated scripts
    // This would typically require parsing the HTML file to find script tags
    // For now, we'll just assume there might be a script with the same name as the popup page
    if (this.manifest?.action?.default_popup) {
      const popupPage = this.manifest.action.default_popup;
      const scriptName = popupPage.replace('.html', '.js');
      popupScripts.push(scriptName);
    }
    this.scripts.popupPageScripts = popupScripts;
    return popupScripts;
  }

  setOptionsPageScripts() {
    const optionsScripts = [];
    // If there's an options page, we need to find associated scripts
    // This would typically require parsing the HTML file to find script tags
    // For now, we'll just assume there might be a script with the same name as the options page
    if (this.manifest.options_page) {
      const optionsPage = this.manifest.options_page;
      const scriptName = optionsPage.replace('.html', '.js');
      optionsScripts.push(scriptName);
    }
    this.scripts.optionsPageScripts = optionsScripts;
    return optionsScripts;
  }
  setBackgroundScripts() {
    const cScripts = [];
    if (this.manifest?.background?.service_worker) {
      this.backgroundScripts = [this.manifest?.background?.service_worker];
      this.scripts.backgroundScripts = [this.manifest?.background?.service_worker];
    }
  }

  setAssets() {
    // Set main icons
    const mainIcons = [];
    if (this.manifest?.icons) {
      Object.entries(this.manifest.icons).forEach(([size, path]) => {
        mainIcons.push({ size, path });
      });
    }
    this.assets.mainIcons = mainIcons;

    // Set action icons
    const actionIcons = [];
    if (this.manifest?.action?.default_icon) {
      if (typeof this.manifest.action.default_icon === 'string') {
        actionIcons.push({ path: this.manifest.action.default_icon });
      } else {
        Object.entries(this.manifest.action.default_icon).forEach(([size, path]) => {
          actionIcons.push({ size, path });
        });
      }
    }
    this.assets.actionIcons = actionIcons;

    // Set web accessible resources
    const webAccessibleResources = [];
    if (this.manifest?.web_accessible_resources) {
      this.manifest.web_accessible_resources.forEach(resource => {
        if (resource.resources) {
          resource.resources.forEach(res => {
            webAccessibleResources.push(res);
          });
        }
      });
    }
    this.assets.webAccessibleResources = webAccessibleResources;

    // Set localizations
    const localizations = [];
    // Localizations are typically in the _locales directory
    // This would require file system access to scan the directory
    this.assets.localizations = localizations;

    // Set HTML pages
    const htmlPages = [];
    if (this.manifest.options_page) {
      htmlPages.push(this.manifest.options_page);
    }
    if (this.manifest?.action?.default_popup) {
      htmlPages.push(this.manifest.action.default_popup);
    }
    if (this.manifest?.chrome_url_overrides?.history) {
      htmlPages.push(this.manifest.chrome_url_overrides.history);
    }
    if (this.manifest.devtools_page) {
      htmlPages.push(this.manifest.devtools_page);
    }
    this.assets.htmlPages = htmlPages;
  }

  async init() {
    this.manifest = await this.validator.validate(this.manifest);
    this.setContentScripts();
    this.setBackgroundScripts();
    this.setPages();
    this.setAssets();
    this.setPopupPageScripts();
    this.setOptionsPageScripts();
  }
  async build() {
    try {
      await this.init();
      const allScripts = [
        ...this.contentScripts,
        ...this.backgroundScripts,
        ...this.scripts.popupPageScripts,
        ...this.scripts.optionsPageScripts
      ];
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
