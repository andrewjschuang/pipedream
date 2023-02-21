import CustomNodeComponentImporterMediator from "../mediator/CustomNodeComponentImporterMediator.mjs";
import ActionStrategy from "./ActionStrategy.mjs";

export default class CustomNodeStrategy extends ActionStrategy {

  async importComponent(_, appName) {
    return CustomNodeComponentImporterMediator.importCustomNodeComponent({
      path: appName,
    });
  }

  // Override methods
  importApp() {}
  setupDB() {}
  setupEmitter() {}

}
