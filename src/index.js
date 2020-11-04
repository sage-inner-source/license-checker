const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");
const workflows = require("./workflows");

// most @actions toolkit packages have async methods
async function run() {
  try {
    //configure local git client on runner
    await utils.configureGit();

    //init workflow and trigger
    let workflow;
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

    //run workflow
    await workflow();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
