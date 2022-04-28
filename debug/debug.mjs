/* eslint-disable no-unused-vars */

/**
 * Local debugging for developing action and sources components
 * Supports running actions and sources
 *
 * Currently not supported:
 *  - running async options from props
 *  - source timer polling - not needed
 *  - source receiving http requests- you can configure an event to be sent to the source
 *  - running webhooks
 *
 * Be sure to configure everything!
 *
 * 1. The app and component imports
 * 2. appName - The app name
 * 3. configureApp() - Authentication ($auth)
 *
 * 4. configureComponent() - configure component props
 * 4.1. initializeProps() - (optional) set default prop values
 * 4.2. setupDB() - (no change needed) db for sources
 * 4.3. setupEmitter() - (no change needed) $emit for sources
 * 4.4. setupProps() - set the props values that will be used in the component
 *
 * 5. overrideRun() - (optional) change the run method
 * 6. runAction() - (no change needed) call action.run()
 * 7. runSource() - (optional) set event and call source.run(event)
 */

import appBase from "../components/google_sheets/google_sheets.app.mjs";
import componentBase from "../components/google_sheets/actions/add-single-row/add-single-row.mjs";

const appName = "googleSheets";

let app = appBase;
let component = componentBase;

// Auth Token (API_KEY or OAUTH_KEY)
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Workflow HTTP Trigger URL for creating webhooks
const httpEndpoint = "https://eoas9i0rbuif71x.m.pipedream.net";

// runMethod() type
const METHOD_TYPES = {
  APP: "app",
  COMPONENT: "component",
  HOOK: "hook",
  ADDITIONAL_PROPS: "additionalProps",
};

main();

/**
 * Configure and run action or source
 */
async function main() {
  configureApp();
  const component = configureComponent();
  // overrideRun(component);

  const result = await runAction(component);
  // const result = await runSource(component);
  // const result = await runAsyncOptions(component, "propName", {});
  // const result = await runMethod(component, METHOD_TYPES.HOOK, "methodName", {});

  console.log("---------- result ----------");
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Configures app API_KEY or OAUTH_KEY from AUTH_TOKEN
 * Injects app methods so they are accessible by `this`
 */
function configureApp() {
  app.$auth = {
    api_key: AUTH_TOKEN,
    oauth_access_token: AUTH_TOKEN,
  };

  component.props[appName] = {
    ...app,
    ...app.methods,
  };
}

/**
 * Configures component prop values
 * Injects component methods and props so they are accessible by `this`
 */
function configureComponent() {
  initializeProps();
  setupDB();
  setupHTTP();
  setupEmitter();
  setupProps();

  component = {
    ...component,
    ...component.methods,
    ...component.props,
  };

  return component;
}

/**
 * Initializes props - thanks @zalmanlew for the idea!
 */
function initializeProps(propDefaultValue = undefined) {
  Object.keys(component.props)
    .filter((key) => key !== appName)
    .map((key) => component.props[key] = propDefaultValue);
}

/**
 * Adds DB prop
 */
function setupDB() {
  const db = {};
  component.props.db = {
    get(k) {
      return db[k];
    },
    set(k, v) {
      db[k] = v;
    },
  };
}

/**
 * Adds HTTP endpoint for webhooks
 */
function setupHTTP() {
  component.props.http = {
    endpoint: httpEndpoint,
  };
}

/**
 * Adds $emit method for sources
 */
function setupEmitter() {
  if (!component.methods) component.methods = {};
  component.methods.$emit = (event, meta) => {
    event = JSON.stringify(event);
    meta = JSON.stringify(meta);
    console.log(`Emitted event: ${event}, ${meta}`);
  };
}

/**
 * Define custom prop values
 */
function setupProps() {
  component.props.sheetId = "11s9s17G4WySY_lc0fb1tHFooqZ2B66poAxusq5ptUS8";
  component.props.sheetName = "Sheet1";
  component.props.hasHeaders = "No";
  component.props.myColumnData = [
    "this",
    "is",
    "a",
    "test",
  ];
}

/**
 * Optionally override component's run method
 */
function overrideRun(component) {
  component.run = async () => {
    console.log("Run was overriden!");
  };
}

/**
 * Run Prop Async Options
 * binds so methods can be accessed by `this`
 */
async function runAsyncOptions(component, propName, args = {}) {
  const fn = component.props[appName].propDefinitions[propName].options
    .bind(component.props[appName]);
  return fn(args);
}

/**
 * Run App / Component Method
 * binds so methods can be accessed by `this`
 */
async function runMethod(component, methodType, methodName, args = {}) {
  let fn;

  switch (methodType) {
  case METHOD_TYPES.COMPONENT:
    fn = component.methods[methodName].bind(component);
    break;
  case METHOD_TYPES.HOOK:
    fn = component.hooks[methodName].bind(component);
    break;
  case METHOD_TYPES.ADDITIONAL_PROPS:
    fn = component.additionalProps.bind(component);
    break;
  default:
    fn = component.props[appName].methods[methodName].bind(component.props[appName]);
  }

  return fn(args);
}

/**
 * Runs Action Component
 * @param - $ export
*/
async function runAction(action) {
  return action.run({
    $: {
      export: (k, v) => console.log(`${k}: ${v}`),
    },
  });
}

/**
 * Runs Source Component
 * @param - event
 */
async function runSource(source) {
  return source.run({
    event: "to be sent",
  });
}
