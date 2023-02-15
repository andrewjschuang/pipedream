export default class PropsBuilder {

  static setupProps({
    steps,
    component,
    configuredProps = {},
    propDefaultValue = undefined,
  }) {
    initialize(component.props, propDefaultValue);
    const props = buildProps(steps, configuredProps);
    setProps(component.props, props);
  }

}

function initialize(props, defaultValue) {
  for (const k in props) {
    props[k] = {
      withLabel: props[k].withLabel,
      value: defaultValue,
    };
  }
}

function setProps(props, configuredProps) {
  for (const k in configuredProps) {
    const configuredProp = configuredProps[k];
    let prop = props[k];

    if (!prop) {
      props[k] = configuredProp.value;
    } else if (prop.withLabel) {
      props[k] = {
        label: configuredProp.label,
        value: configuredProp.value,
      };
    } else {
      props[k] = configuredProp.value;
    }
  }
}

function buildProps(steps, configuredProps) {
  const props = {};

  for (const k in configuredProps) {
    const configuredProp = configuredProps[k];
    if (isNotAppProp(configuredProp)) {
      props[k] = {
        label: configuredProp.__lv && configuredProp.__lv.label,
        value: getConfiguredPropValue(steps, configuredProp),
      };
    }
  }

  return props;
}

function isNotAppProp(prop) {
  return prop && !prop.authProvisionId;
}

function getConfiguredPropValue(steps, propValue) {
  const value = propValue.__lv
    ? propValue.__lv.value
    : propValue;
  return evaluateExpression(steps, value);
}

// steps is needed for evaluating expressions
// eslint-disable-next-line no-unused-vars
function evaluateExpression(steps, value) {
  switch (typeof (value)) {
  case "boolean":
    return evaluateBoolean(value);
  case "number":
    return evaluateNumber(value);
  case "string":
    return evaluateString(steps, value);
  case "object":
    return Array.isArray(value)
      ? evaluateArray(steps, value)
      : evaluateObject(steps, value);
  default:
    return value;
  }
}

function evaluateBoolean(bool) {
  return bool;
}

function evaluateNumber(num) {
  return num;
}

// steps is needed for evaluating expressions
// eslint-disable-next-line no-unused-vars
function evaluateString(steps, str) {
  const isExpressionMatcher = /\{\{.*?\}\}/g;
  const removeCurlyBraces = (str) => str.split("{{")[1].split("}}")[0];

  for (const match of str.match(isExpressionMatcher) ?? []) {
    const trimmed = removeCurlyBraces(match);
    str = str.replace(match, eval(trimmed));
  }

  return str;
}

function evaluateArray(steps, arr) {
  return arr.map((value) => evaluateExpression(steps, value));
}

function evaluateObject(steps, obj) {
  for (const k in obj) {
    obj[k] = evaluateExpression(steps, obj[k]);
  }
  return obj;
}
