export default class WorkflowStepValidator {

  static shouldSkipStepExecution(step) {
    if (WorkflowStepValidator.shouldSkipDebug(step.debug)) {
      WorkflowStepValidator.logWarning(step.namespace, "marked for skipping");
      return true;
    }

    if (WorkflowStepValidator.appIsNotSupported(step.appName)) {
      WorkflowStepValidator.logWarning(step.namespace, `${step.appName} app is not yet supported`);
      return true;
    }

    if (WorkflowStepValidator.isCustomRuntime(step.runtime)) {
      WorkflowStepValidator.logWarning(step.namespace, `${step.runtime} runtime is not yet supported`);
      return true;
    }
  }

  static shouldSkipDebug(debug) {
    return debug === false;
  }

  static appIsNotSupported(appName) {
    const invalidApps = [];
    return invalidApps.includes(appName);
  }

  static isCustomRuntime(runtime) {
    return !runtime.includes("nodejs");
  }

  static logWarning(namespace, message) {
    console.warn(`${namespace}: ${message}`);
  }

}
