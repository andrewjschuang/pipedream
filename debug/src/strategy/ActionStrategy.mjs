import StrategyTemplateMethod from "./StrategyTemplateMethod.mjs";

export default class ActionStrategy extends StrategyTemplateMethod {

  constructor(config) {
    super(config);
    this.namespace = config.namespace;
    this.steps = config.results;
  }

  async execute() {
    await this.setup();

    return this.component.run({
      steps: this.steps,
      $: {
        export: (k, v) => console.log(`${k}: ${v}`),
        flow: {
          exit: () => console.log("$.flow.exit called"),
          suspend: () => console.log("$.flow.suspend called"),
          rerun: () => console.log("$.flow.rerun called"),
          send: () => console.log("$.flow.send called"),
          delay: async (ms) => await new Promise((r) => setTimeout(r, ms)),
        },
      },
    });
  }

  async setup() {
    this.config.methodType = "action";
    await super.setup();
  }

}
