import ActionStrategy from "./ActionStrategy.mjs";

export default class DataStoresStrategy extends ActionStrategy {

  constructor(config) {
    super(config);
    this.dataStoreData = {};
  }

  injectAppAuth(app, $auth) {
    return {
      ...super.injectAppAuth(app, $auth),
      ...this.injectDataStoresMethods(),
    };
  }

  injectDataStoresMethods() {
    return {
      get: async (key) => this.dataStoreData[key],
      set: async (key, value) => this.dataStoreData[key] = value,
      has: async (key) => key in this.dataStoreData,
      keys: async () => Object.keys(this.dataStoreData),
      delete: async (key) => delete this.dataStoreData[key],
      clear: async () => this.dataStoreData = {},
    };
  }

  injectAppAuthInComponent(componentBase, app, appName, $auth) {
    const component = super.injectAppAuthInComponent(componentBase, app, appName, $auth);

    component.datastore = component.app;
    component.dataStore = component.app;

    return component;
  }

}
