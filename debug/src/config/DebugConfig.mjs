import * as dotenv from "dotenv";
import fs from "fs";
import WorkflowConfig from "./WorkflowConfig.mjs";
import DebugConfigValidator from "../validator/DebugConfigValidator.mjs";

export default class DebugConfig extends WorkflowConfig {

  constructor(options_path, env_path) {
    super(options_path);
    this.loadAuths(env_path);
    DebugConfigValidator.validate(this);
  }

  loadAuths(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`auths file ${path} was not found`);
    }

    const config = {
      path,
    };
    this.auths = dotenv.config(config).parsed;
  }

}
