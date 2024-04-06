const yup = require('yup');
class Validator {
  constructor(props) {}
  async validate(manifestJson) {
    const allowedPermissions = [
      'accessibilityFeatures.modify',
      'accessibilityFeatures.read',
      'activeTab',
      'alarms',
      'audio',
      'background',
      'bookmarks',
      'browsingData',
      'certificateProvider',
      'clipboardRead',
      'clipboardWrite',
      'contentSettings',
      'contextMenus',
      'cookies',
      'debugger',
      'declarativeContent',
      'declarativeNetRequest',
      'declarativeNetRequestWithHostAccess',
      'declarativeNetRequestFeedback',
      'dns',
      'desktopCapture',
      'documentScan',
      'downloads',
      'downloads.open',
      'downloads.ui',
      'enterprise.deviceAttributes',
      'enterprise.hardwarePlatform',
      'enterprise.networkingAttributes',
      'enterprise.platformKeys',
      'favicon',
      'fileBrowserHandler',
      'fileSystemProvider',
      'fontSettings',
      'gcm',
      'geolocation',
      'history',
      'identity',
      'identity.email',
      'idle',
      'loginState',
      'management',
      'nativeMessaging',
      'notifications',
      'offscreen',
      'pageCapture',
      'platformKeys',
      'power',
      'printerProvider',
      'printing',
      'printingMetrics',
      'privacy',
      'processes',
      'proxy',
      'readingList',
      'runtime',
      'scripting',
      'search',
      'sessions',
      'sidePanel',
      'storage',
      'system.cpu',
      'system.display',
      'system.memory',
      'system.storage',
      'tabCapture',
      'tabGroups',
      'tabs',
      'topSites',
      'tts',
      'ttsEngine',
      'unlimitedStorage',
      'vpnProvider',
      'wallpaper',
      'webAuthenticationProxy',
      'webNavigation',
      'webRequest',
      'webRequestBlocking',
    ];
    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().required(),
      manifest_version: yup.number().required(),
      version: yup.string().required(),
      host_permissions: yup.array().of(yup.string()).notRequired(),
      permissions: yup
        .array()
        .of(yup.string().oneOf(allowedPermissions))
        .notRequired(),
      default_locale: yup.string().notRequired(),
      background: yup.object().shape({
        service_worker: yup.string().notRequired(),
      }),
      action: yup.object().shape({
        default_icon: yup
          .object()
          .shape({
            16: yup.string().notRequired(),
            19: yup.string().notRequired(),
            38: yup.string().notRequired(),
            128: yup.string().notRequired(),
          })
          .notRequired(),
      }),
      icons: yup.object().shape({
        16: yup.string().notRequired(),
        19: yup.string().notRequired(),
        38: yup.string().notRequired(),
        128: yup.string().notRequired(),
      }),
      content_scripts: yup
        .array()
        .of(
          yup.object().shape({
            matches: yup.array().of(yup.string()).required(),
            match_about_blank: yup.boolean().notRequired(),
            all_frames: yup.boolean().notRequired(),
            js: yup.array().of(yup.string()).required(),
            run_at: yup.string().notRequired(),
          })
        )
        .notRequired(),
      externally_connectable: yup
        .object()
        .shape({
          matches: yup.array().of(yup.string()).optional(),
        })
        .notRequired(),
    });
    return schema.validate(manifestJson);
  }
}
exports.Validator = Validator;
