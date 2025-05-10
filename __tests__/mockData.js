// Mock data for testing

const validManifest = {
  name: "Test Extension",
  description: "A test extension for testing purposes",
  manifest_version: 3,
  version: "1.0.0",
  permissions: ["storage", "activeTab"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "background.js"
  },
  action: {
    default_icon: {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    },
    default_title: "Test Extension",
    default_popup: "popup.html"
  },
  icons: {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["content.js"],
      match_about_blank: true
    }
  ],
  options_page: "options.html",
  devtools_page: "devtools.html",
  web_accessible_resources: [
    {
      resources: ["images/*.png", "css/*.css"],
      matches: ["<all_urls>"]
    }
  ],
  chrome_url_overrides: {
    history: "history.html"
  }
};

const invalidManifest = {
  // Missing required fields
  description: "An invalid test extension",
  manifest_version: 3,
  // Invalid permission
  permissions: ["invalid_permission"],
  background: {
    // Missing service_worker
  }
};

module.exports = {
  validManifest,
  invalidManifest
};
