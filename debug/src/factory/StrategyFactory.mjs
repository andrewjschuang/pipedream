import ActionStrategy from "../strategy/ActionStrategy.mjs";
import AdditionalPropsStrategy from "../strategy/AdditionalPropsStrategy.mjs";
import AsyncOptionsStrategy from "../strategy/AsyncOptionsStrategy.mjs";
import HookMethodStrategy from "../strategy/HookMethodStrategy.mjs";
import MethodStrategy from "../strategy/MethodStrategy.mjs";
import SourceStrategy from "../strategy/SourceStrategy.mjs";
import WorkflowStrategy from "../strategy/WorkflowStrategy.mjs";

export default class StrategyFactory {

  static async createComponentStrategy(config) {
    const Selector = {
      action: ActionStrategy,
      source: SourceStrategy,
      method: MethodStrategy,
      hook: HookMethodStrategy,
      asyncOptions: AsyncOptionsStrategy,
      additionalProps: AdditionalPropsStrategy,
      workflow: WorkflowStrategy,
    };

    const strategy = new Selector[config.runType](config);
    return strategy;
  }

}
