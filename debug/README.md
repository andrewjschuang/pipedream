# Pipedream Workflow Debug

Debug your Pipedream Workflow locally or inside a Docker container!

**Note**: all local paths mentioned in this README considers `debug/` is used as the prefix unless specified otherwise.

## Table of Contents

- [API Keys](#api-keys)
- [Debug Options Config](#debug-options-config)
- [Workflow Config](#workflow-config)
- [Docker](#docker)
- [VSCode Debugging](#vscode-debugging)
- [Architecture](#architecture)
- [Current Limitations](#current-limitations)

### API Keys

Create a file in named `.env` that should include the API Key for every application within your workflow. Note that this file will not be uploaded to GitHub, but it will be copied to the Docker Image constructed in subsequent stages. Therefore, exercise caution regarding who has authorization to the Docker Image.

Each line should have the following structure:

```bash
${APP_NAME}=${API_KEY}
```

**Note**: The `APP_NAME` should be the app's `name_slug` in uppercase.

For example:

```bash
GITHUB=apikey1234
PIPEDREAM=apikey9876
GOOGLE_SHEETS=apikey1111
```

### Debug Options Config

The `debug-options.yaml` file contains the configuration for debugging.

These are the following options:

  - `runType`: defines which debugging type is to be executed, whether **workflow**, **action**, **hook**, etc. More details below.
  - `steps`: used to pass a value or an object that would be returned by the trigger in a workflow run, as if the source had emitted the event. This object will be populated with the result of each step in the workflow to be executed.
  - `appName`: the name of the app imported by the component. Note that it is **not always** the `name_slug` defined in the app file, but rather the name that is being used when being imported in the component. For example, the Google Sheets app `name_slug` is **google_sheets**, but in most components it is being imported with the name **googleSheets**.
  - `key`: the component key. Does not include the app name.
  - `methodType`: whether the method to be executed is contained in the **app**, **action**, or **source** component.
  - `methodName`: the name of the method to be executed.
  - `propName`: the name of the prop for the **async options** function to be executed.
  - `props`: the props values configuration for the component. Acts as if they were configured in the Pipedream UI.
  - `event`: the event object to be be passed as an argument to the **run** function of the source component.
  - `args`: the arguments to be passed to the component's **method** or **async options** function to be executed.

These are the `runType` options for debugging:

#### Workflow

The default `runType`. In this mode, a `workflow.yaml` file is required. It should not be manually generated, but rather by the [Pipedream GitHub Integration](#cloning-a-github-workflow). It contains the steps and the configured props for each step. You may add a `debug: false` config for a step that you wish to skip. Otherwise, each action step in the workflow will have its **run** method called, sequentially.

```yaml
runType: workflow               # required
steps:                          # optional, type: object
  ${step_name}:
    ${step_result}
```

#### Action

In this mode, a single action component will be executed. Both `appName` and `key` are required. If the action requires props to be configured, they must be declared in the `props` config. Then, the **run** method is invoked.

```yaml
runType: action                 # required
appName: ${app_name}            # required
key: ${component_key}           # required
props:                          # optional, type: object
  ${prop_name}: ${prop_value}
```

#### Source

In this mode, a single source component will be executed. Both `appName` and `key` are required. If the source requires props to be configured, they must be declared in the `props` config. An `event` object may also be declared. Then, the **run** method is invoked.

```yaml
runType: source                 # required
appName: ${app_name}            # required
key: ${component_key}           # required
props:                          # optional, type: object
  ${prop_name}: ${prop_value}
event:                          # optional, type: object
  ${event_object}
```

#### Method

In this mode, a method located in a component's **app**.methods, **action**.methods, or **source**.methods will be invoked. These are the possible `methodType`s. The `methodName` and `appName` are also required. If the `methodType` is **action** or **source**, then `key` is required. You can also declare the `args` that will be passed as parameters to the method.

```yaml
runType: method                 # required
methodType: ${method_type}      # required, values: [ app | action | source ]
methodName: ${method_name}      # required
appName: ${app_name}            # required
key: ${component_key}           # required if methodType === [ action | source ]
args:                           # optional, type: object
  ${args_object}
```

#### Hook

In this mode, either the **deploy**, **activate**, or **deactivate** `methodName` located in a source's hooks will be invoked. The `appName` and `key` are both required. You can also declare the `props` that will be configured in the source.

```yaml
runType: hook                   # required
appName: ${app_name}            # required
key: ${component_key}           # required
methodName: ${method_name}      # required, values: [ deploy | activate | deactivate ]
props:                          # optional, type: object
  ${prop_name}: ${prop_value}
```

#### Async Options

In this mode, the **async options** function for a prop will be invoked. To specify which prop, the `appName` and `propName` configs are required. You can also declare the `args` parameter that will be passed into the function. Usually, `args` may contain `prevContext` and previously configured props.

```yaml
runType: asyncOptions           # required
appName: ${app_name}            # required
propName: ${prop_name}          # required
args:                           # optional, type: object
  ${args_object}
```

#### Additional Props

In this mode, the **additionalProps** method for a `action` or a `source` component will be invoked. This should be defined by the `methodType` config. The `appName` and `key` are also required. You can also declare the `props` that will be configured in the component.

```yaml
runType: additionalProps        # required
methodType: ${method_type}      # required, values: [ action | source ]
appName: ${app_name}            # required
key: ${component_key}           # required
props:                          # optional, type: object
  ${prop_name}: ${prop_value}
```

### Workflow Config

An example `workflow.yaml` is included with steps and props configured. It is required when specifying the [workflow run type](#workflow). Note that to skip execution of a specific step, add a `debug: false` config in it.

#### Cloning a GitHub Workflow

To debug a workflow that is hosted on GitHub, follow these steps:

1. Clone the workflow repository

```bash
cd ~
git clone https://github.com/you/workflow-repo.git
```

2. Copy all the contents inside the folder of the workflow you want to debug. That will include `workflow.yaml` and the code of the components in folders for each step.

```bash
cp -r workflow-repo/workflow-folder/* pipedream-repo/debug/
```

3. Configure `debug-options.yaml` with the workflow run type and you are set to debug your workflow.

### Docker

If you wish to manage the debugging inside a Docker container to avoid executing code in your local workstation, you can build an image and run it in a container. You can also use [VSCode to connect to the running container and debug it remotely](#remote-container-debugging).

**Note**: Run these commands in the pipedream project root directory.

#### Build image

```bash
docker build -t pipedream:debug-workflow .
```

#### Run once and save the results

```bash
docker run pipedream:debug-workflow &> ./debug/results.txt
```

#### Run and leave it in the background for debugging

```bash
docker run -dt --name pipedream pipedream:debug-workflow /bin/bash
```

### VSCode Debugging

With VSCode you can either debug locally or remotely, by connecting to a running Docker container.

#### Local Debugging

1. In the pipedream project root directory, create a `.vscode/launch.json` file with the following content:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Pipedream Workflow",
      "request": "launch",
      "type": "node",
      "program": "${workspaceFolder}/debug/src/launch.mjs"
    }
  ]
}
```

2. Then add some breakpoints and start debugging.

#### Remote Container Debugging

1. After [starting a container running in the background](#run-and-leave-it-in-the-background-for-debugging), open VSCode and install the **Microsoft Remote Explorer extension**.
2. Then go to the **Remote Explorer** tab and you will see a list of containers. Click with the right button and select **Attach to Container**.
3. With the new instance of VSCode, you can start debugging in it.

Note that any code changes and execution will be inside the Docker container and won't affect your local workstation.

### Architecture

TODO:
- Launch point
- Diagram
- Description of each layer
