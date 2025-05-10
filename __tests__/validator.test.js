const { Validator } = require('../src/validator');
const { validManifest, invalidManifest } = require('./mockData');

describe('Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe('validate', () => {
    it('should validate a valid manifest', async () => {
      const result = await validator.validate(validManifest);
      // Check key properties instead of exact equality since yup might add empty objects for optional fields
      expect(result.name).toBe(validManifest.name);
      expect(result.description).toBe(validManifest.description);
      expect(result.manifest_version).toBe(validManifest.manifest_version);
      expect(result.version).toBe(validManifest.version);
      expect(result.permissions).toEqual(validManifest.permissions);
      expect(result.background.service_worker).toBe(validManifest.background.service_worker);
      expect(result.action.default_popup).toBe(validManifest.action.default_popup);
      expect(result.options_page).toBe(validManifest.options_page);
      expect(result.devtools_page).toBe(validManifest.devtools_page);
    });

    it('should reject an invalid manifest', async () => {
      await expect(validator.validate(invalidManifest)).rejects.toThrow();
    });

    it('should validate manifest with string default_icon', async () => {
      const manifestWithStringIcon = {
        ...validManifest,
        action: {
          ...validManifest.action,
          default_icon: "images/icon.png"
        }
      };
      const result = await validator.validate(manifestWithStringIcon);
      expect(result.action.default_icon).toBe("images/icon.png");
    });

    it('should validate manifest without optional fields', async () => {
      const minimalManifest = {
        name: "Minimal Extension",
        description: "A minimal extension",
        manifest_version: 3,
        version: "1.0.0"
      };
      const result = await validator.validate(minimalManifest);
      // Check only the required fields
      expect(result.name).toBe(minimalManifest.name);
      expect(result.description).toBe(minimalManifest.description);
      expect(result.manifest_version).toBe(minimalManifest.manifest_version);
      expect(result.version).toBe(minimalManifest.version);
    });

    it('should validate manifest with all allowed permissions', async () => {
      // Create a manifest with all allowed permissions
      const manifestWithAllPermissions = {
        ...validManifest,
        permissions: [
          'activeTab',
          'alarms',
          'background',
          'bookmarks',
          'browsingData',
          'clipboardRead',
          'clipboardWrite',
          'contextMenus',
          'cookies',
          'declarativeContent',
          'storage',
          'tabs',
          'webRequest'
        ]
      };
      const result = await validator.validate(manifestWithAllPermissions);
      expect(result.permissions).toEqual(manifestWithAllPermissions.permissions);
    });

    it('should reject manifest with invalid permissions', async () => {
      const manifestWithInvalidPermission = {
        ...validManifest,
        permissions: ['invalid_permission']
      };
      await expect(validator.validate(manifestWithInvalidPermission)).rejects.toThrow();
    });

    it('should validate manifest with web_accessible_resources', async () => {
      const result = await validator.validate(validManifest);
      expect(result.web_accessible_resources).toEqual(validManifest.web_accessible_resources);
    });

    it('should validate manifest with options_page', async () => {
      const result = await validator.validate(validManifest);
      expect(result.options_page).toBe(validManifest.options_page);
    });

    it('should validate manifest with devtools_page', async () => {
      const result = await validator.validate(validManifest);
      expect(result.devtools_page).toBe(validManifest.devtools_page);
    });

    it('should validate manifest with chrome_url_overrides', async () => {
      const result = await validator.validate(validManifest);
      expect(result.chrome_url_overrides).toEqual(validManifest.chrome_url_overrides);
    });
  });
});
