import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";

export default class ComponentMethodStrategy extends StrategyTemplateMethod {

  async execute() {
    await this.setup();

    const {
      methodName,
      args,
    } = this.config;

    return this.component[methodName](args);
  }

}
