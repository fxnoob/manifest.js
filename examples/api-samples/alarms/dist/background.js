function openDemoTab(){chrome.tabs.create({url:"index.html"})}chrome.runtime.onInstalled.addListener((({reason:e})=>{e===chrome.runtime.OnInstalledReason.INSTALL&&(openDemoTab(),chrome.alarms.create("demo-default-alarm",{delayInMinutes:1,periodInMinutes:1}))})),chrome.action.onClicked.addListener(openDemoTab);