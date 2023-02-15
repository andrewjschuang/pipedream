import WorkflowConfig from "../config/WorkflowConfig.mjs";
import ActionStrategy from "./ActionStrategy.mjs";
import CustomNodeStrategy from "./CustomNodeStrategy.mjs";
import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";
import WorkflowStepValidator from "../validator/WorkflowStepValidator.mjs";
import DataStoresStrategy from "./DataStoresStrategy.mjs";

const WORKFLOW_PATH = "./debug/workflow.yaml";

export default class WorkflowStrategy extends StrategyTemplateMethod {

  constructor(config) {
    super(config);
    this.results = {};
  }

  async execute() {
    await this.setup();

    for (const configuredStep of this.configuredSteps) {
      this.configureAppNameAndKey(configuredStep);

      if (WorkflowStepValidator.shouldSkipStepExecution(configuredStep)) {
        continue;
      }

      const strategy = await this.buildStrategy(configuredStep);
      const result = await this.executeStrategy(strategy);

      this.results[strategy.namespace] = {
        namespace: strategy.namespace,
        $return_value: result,
      };
    }

    return this.results;
  }

  async setup() {
    const { steps } = new WorkflowConfig(WORKFLOW_PATH);
    this.configuredSteps = steps;
  }

  configureAppNameAndKey(configuredStep) {
    const { uses: fullAppComponentKey } = configuredStep;

    const [
      componentKey,
      // version,
    ] = fullAppComponentKey.split("@");

    const [
      appName,
      key,
    ] = componentKey.split(/-(.*)/s);

    configuredStep.appName = appName;
    configuredStep.key = key;
  }

  isCustomNodeStep(configuredStep) {
    return !configuredStep.uses.includes("@");
  }

  isDataStoresApp(configuredStep) {
    return configuredStep.appName === "data_stores";
  }

  async buildStrategy(configuredStep) {
    if (this.isCustomNodeStep(configuredStep)) {
      return this.buildCustomStrategy(configuredStep, CustomNodeStrategy);
    }

    if (this.isDataStoresApp(configuredStep)) {
      return this.buildCustomStrategy(configuredStep, DataStoresStrategy);
    }

    return this.buildActionStrategy(configuredStep);
  }

  async buildCustomStrategy(configuredStep, CustomStrategyClass) {
    return new CustomStrategyClass({
      ...configuredStep,
      auths: this.config.auths,
      namespace: configuredStep.namespace,
      results: this.results,
    });
  }

  async buildActionStrategy(configuredStep) {
    const {
      appName,
      key,
      props,
    } = configuredStep;

    return new ActionStrategy({
      appName,
      key,
      props,
      auths: this.config.auths,
      namespace: configuredStep.namespace,
      results: this.results,
    });
  }

  async executeStrategy(strategy) {
    try {
      return await strategy.execute();
    } catch (error) {
      return error;
    }
  }

}
