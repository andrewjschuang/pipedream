import PropsBuilder from "../builder/PropsBuilder.mjs";
import ImporterMediator from "../mediator/ImporterMediator.mjs";

export default class StrategyTemplateMethod {

  constructor(config) {
    this.config = config;
  }

  async setup() {
    const {
      appName,
      key,
      auths,
      props: configuredProps,
      methodType,
    } = this.config;

    const importedApp = await this.importApp(appName);
    const importedComponent = await this.importComponent(methodType, appName, key);

    const appBase = importedApp?.appBase || importedComponent?.appBase;
    const componentBase = importedComponent?.componentBase || importedComponent;

    this.setupProps(componentBase, configuredProps);

    this.setupDB(componentBase);
    this.setupEmitter(componentBase);

    const auth = this.buildAuth(appName, auths);
    const app = this.injectAppAuth(appBase, auth);
    const component = this.injectAppAuthInComponent(componentBase, appBase, appName, auth);

    this.app = app;
    this.component = component;
  }

  async importApp(appName) {
    return ImporterMediator.importApp({
      appName,
    });
  }

  async importComponent(methodType, appName, key) {
    return ImporterMediator.importComponent({
      type: methodType,
      appName,
      key,
    });
  }

  setupDB(component) {
    const db = {};
    component.props.db = {
      get(k) {
        const v = db[k];
        console.log(`db[${k}] -> ${v}`);
        return v;
      },
      set(k, v) {
        console.log(`db[${k}] <- ${v}`);
        db[k] = v;
      },
    };
  }

  setupEmitter(component) {
    if (!component.methods) component.methods = {};
    component.methods.$emit = (event, meta) => {
      event = JSON.stringify(event);
      meta = JSON.stringify(meta);
      console.log(`Emitted event meta: ${meta}`);
    };
  }

  setupProps(component, configuredProps) {
    PropsBuilder.setupProps({
      steps: this.steps,
      component,
      configuredProps,
    });
  }

  buildAuth(appName, auths) {
    const auth = auths[appName.toUpperCase()];
    return {
      api_key: auth,
      oauth_access_token: auth,
    };
  }

  injectAppAuth(app, $auth) {
    return {
      ...app,
      ...app?.methods,
      $auth,
    };
  }

  injectAppAuthInComponent(component, app, appName, $auth) {
    app = this.injectAppAuth(app, $auth);

    component = {
      ...component,
      ...component.props,
      ...component.methods,
      ...component.hooks,
      [appName]: app,
      app,
      $auth,
    };

    if (appName.includes("_")) {
      const splitted = appName.split("_");
      const lowerCaseVersion = splitted.join("");
      const camelCaseVersion = splitted[0] + splitted.slice(1)
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join("");

      component[lowerCaseVersion] = app;
      component[camelCaseVersion] = app;
    }

    return component;
  }

}
