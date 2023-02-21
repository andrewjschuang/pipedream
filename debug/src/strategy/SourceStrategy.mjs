import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";

export default class SourceStrategy extends StrategyTemplateMethod {

  async execute() {
    await this.setup();
    const { event = {} } = this.config;
    return this.component.run(event);
  }

  async setup() {
    this.config.methodType = "source";
    await super.setup();
  }

}
