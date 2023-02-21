import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";

export default class AppMethodStrategy extends StrategyTemplateMethod {

  async execute() {
    await this.setup();

    const {
      methodName,
      args,
    } = this.config;

    return this.app[methodName](args);
  }

  // Override Methods
  importComponent() {}
  setupDB() {}
  setupEmitter() {}
  setupProps() {}
  injectAppAuthInComponent() {}

}
