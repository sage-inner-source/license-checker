const core = require("@actions/core");
const utils = require("./utils");

// most @actions toolkit packages have async methods
async function run() {
  try {
    await utils.configureGit();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
