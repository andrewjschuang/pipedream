import SourceStrategy from "./SourceStrategy.mjs";

export default class HookMethodStrategy extends SourceStrategy {

  async execute() {
    await this.setup();
    const { methodName } = this.config;
    return this.component.hooks[methodName].call(this.component);
  }

}
