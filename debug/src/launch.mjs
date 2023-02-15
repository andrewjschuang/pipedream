import DebugConfig from "./config/DebugConfig.mjs";
import StrategyFactory from "./factory/StrategyFactory.mjs";

const OPTIONS_PATH = "./debug/debug-options.yaml";
const ENV_PATH = "./debug/.env";

async function main() {
  const config = new DebugConfig(OPTIONS_PATH, ENV_PATH);
  const strategy = await StrategyFactory.createComponentStrategy(config);

  try {
    const result = await strategy.execute();
    if (result) {
      console.log("-------------------- RESULT --------------------");
      console.log(JSON.stringify(result, null, 2));
    }
    console.log("-------------------- END --------------------");
  } catch (e) {
    console.log("-------------------- ERROR --------------------");
    console.log(e);
  }
}

main();
