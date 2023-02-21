import fs from "fs";
import yaml from "js-yaml";

export default class WorkflowConfig {

  constructor(workflow_path) {
    this.loadYaml(workflow_path);
  }

  loadYaml(path) {
    const config = yaml.load(fs.readFileSync(path, "utf-8"));

    Object.entries(config)
      .forEach(([
        k,
        v,
      ]) => this[k] = v);
  }

}
