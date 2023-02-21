import AppMethodStrategy from "./AppMethodStrategy.mjs";

export default class AsyncOptionsStrategy extends AppMethodStrategy {

  async execute() {
    await this.setup();

    const {
      propName,
      args,
    } = this.config;

    return this.app.propDefinitions[propName].options.call(this.app, args);
  }

}
