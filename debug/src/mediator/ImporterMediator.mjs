const COMPONENTS_PATH_PREFIX = "../../../components";

export default class ImporterMediator {

  static async importApp({ appName }) {
    const appPath = `${COMPONENTS_PATH_PREFIX}/${appName}/${appName}.app.mjs`;
    const appBase = await ImporterMediator.importObject(appPath);
    return {
      appBase,
    };
  }

  static async importComponent({
    appName,
    key,
    type,
  }) {
    const { appBase } = await this.importApp({
      appName,
    });

    const componentPath = `${COMPONENTS_PATH_PREFIX}/${appName}/${type}s/${key}/${key}.mjs`;
    const componentBase = await ImporterMediator.importObject(componentPath);

    return {
      appBase,
      componentBase,
    };
  }

  static async importObject(path) {
    const obj = await import(path);
    return obj && Object.assign({}, obj.default);
  }

}
