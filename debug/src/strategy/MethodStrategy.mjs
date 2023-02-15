import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";
import AppMethodStrategy from "./AppMethodStrategy.mjs";
import ComponentMethodStrategy from "./ComponentMethodStrategy.mjs";

export default class MethodStrategy extends StrategyTemplateMethod {

  constructor(config) {
    const Selector = {
      app: AppMethodStrategy,
      action: ComponentMethodStrategy,
      source: ComponentMethodStrategy,
    };
    return new Selector[config.methodType](config);
  }

}
