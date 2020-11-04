const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");
const workflows = require("./workflows");

// most @actions toolkit packages have async methods
async function run() {
  try {
    //configure local git client on runner
    await utils.configureGit();

    //init workflow
    let workflow;

    //get licensed input variables
    const { command, configPath } = await utils.getLicensedInput();

    if (command !== "licensed") {
      //non default command, assign specified workflow
      workflow = workflows[command];
    } else {
      //default command, run off event trigger
      //get trigger
      let trigger = github.context.eventName;

      //assign event trigger as workflow
      switch (trigger) {
        case "push":
        case "schedule":
        case "pull_request":
          workflow = workflows[trigger];
          break;
        default:
          workflow = workflows["default"];
          break;
      }
    }

    //run workflow
    await workflow(configPath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
