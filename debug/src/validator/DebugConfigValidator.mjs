export default class DebugConfigValidator {

  static validate(config) {
    if (!config.runType) {
      throw new Error("Missing debug-options.yaml runType");
    }

    const runTypeCamelCase = config.runType[0].toUpperCase() + config.runType.slice(1);
    const fn = DebugConfigValidator[`validate${runTypeCamelCase}`];

    if (!fn) {
      throw new Error(`Unknown debug-options.yaml runType: ${config.runType}`);
    }

    const errors = [];
    fn(config, errors);

    if (errors.length) {
      throw new Error("Missing debug-options.yaml configs - " + errors.join(", "));
    }
  }

  static validateWorkflow() {
    return;
  }

  static validateAction(config, errors = []) {
    assertAppName(config, errors);
    assertKey(config, errors);
  }

  static validateSource(config, errors = []) {
    assertAppName(config, errors);
    assertKey(config, errors);
  }

  static validateMethod(config, errors = []) {
    assertAppName(config, errors);
    assertMethodName(config, errors);
    if (config.methodType !== "app") {
      assertKey(config, errors);
    }
    assertMethodType(config, errors, [
      "app",
      "action",
      "source",
    ]);
  }

  static validateHook(config, errors = []) {
    assertAppName(config, errors);
    assertKey(config, errors);
    assertMethodName(config, errors, [
      "deploy",
      "activate",
      "deactivate",
    ]);
  }

  static validateAsyncOptions(config, errors = []) {
    assertAppName(config, errors);
    assertPropName(config, errors);
  }

  static validateAdditionalProps(config, errors = []) {
    assertAppName(config, errors);
    assertKey(config, errors);
    assertMethodType(config, errors, [
      "action",
      "source",
    ]);
  }

}

function assertAppName(config, errors) {
  assert(config.appName, "appName", errors);
}

function assertKey(config, errors) {
  assert(config.key, "key", errors);
}

function assertMethodType(config, errors, valid = []) {
  if (valid.length) {
    assert(valid.includes(config.methodType), `methodType must be one of: [${valid}]`, errors);
  } else {
    assert(config.methodType, "methodType", errors);
  }
}

function assertMethodName(config, errors, valid = []) {
  if (valid.length) {
    assert(valid.includes(config.methodName), `methodName must be one of: [${valid}]`, errors);
  } else {
    assert(config.methodName, "methodName", errors);
  }
}

function assertPropName(config, errors) {
  assert(config.propName, "propName", errors);
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}
