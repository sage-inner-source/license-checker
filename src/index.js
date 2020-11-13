const core = require("@actions/core");
const licensed = require("./utils/licensed");
const workflows = require("./workflows");

// most @actions toolkit packages have async methods
async function run() {
  try {
    //get licensed input variables
    const { command, configPath } = await licensed.getInput();

    //init workflow
    const workflow = workflows[command];

    //run workflow
    await workflow(configPath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
