import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";

export default class AdditionalPropsStrategy extends StrategyTemplateMethod {

  async execute() {
    await this.setup();
    return this.component.additionalProps.call(this.component);
  }

}
