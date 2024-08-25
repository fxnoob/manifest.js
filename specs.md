# manifest.js

## Specifications

> These specifications are intricately crafted, drawing upon the established blueprint laid out in the standard manifest.json file,
> the very heart of any browser extension.

### 1. Assets 
    Think of these as the building blocks of your extension's visual experience. Defined within manifest.json,
    this section lists the static assets - images, icons, media files, and other accessible resources - that are bundled 
    together when your extension is built.  Below, you'll find a comprehensive inventory of these assets.
    
| Type                     | Usage example                                                                                                                                          |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Main Icon                | "icons": {"48": "images/icon48.png","128": "images/icon128.png","144": "images/icon144.png"},                                                          |
| Action Icon              | "action": {  "default_icon": "images/ic_mic_gray_36dp.png", "default_title": "Click to start / stop recording"},                                       |
| Web accessible resources | "web_accessible_resources": [ { "resources": [ "images/*.png","css/*.css", "settings.html", "setup.html","audio/*.wav"],"matches": [ "<all_urls>" ] }] |
| Localizations            | _locales directory                                                                                                                                     |
| Html Pages               | "options_page": "settings.html", popup_page, etc                                                                                                       |

### 2. Scripts
    Think of these as doorways in your manifest.json file, each one representing a different way your 
    extension can spring to life within the browser – whether it's humming along quietly in the 
    background, driving the core logic, seamlessly interacting with web pages, or powering the dynamic 
    experiences of your custom popups and option pages. Below, you'll find a comprehensive inventory of 
    these scripts.

| Type                         | Usage example                                                                                                                                                                                             |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Background script            | "background": { "service_worker": "background.js" }                                                                                                                                                       |
| Content script               | "content_scripts": [ { "js": [ "cs1.js" ], "matches": [ "<all_urls>" ], "match_about_blank": true }, { "js": [ "cs2.js" ], "matches": [ "<all_urls>" ], "all_frames": true, "match_about_blank": true } ] |
| Popup page script (Custom)   | TBD                                                                                                                                                                                                       |
| Options page script (Custom) | TBD                                                                                                                                                                                                       |
