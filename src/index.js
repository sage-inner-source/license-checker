const core = require("@actions/core");
const github = require("@actions/github");
const git = require("./utils/git");
const licensed = require("./utils/licensed");
const workflows = require("./workflows");

// most @actions toolkit packages have async methods
async function run() {
  try {
    //configure local git client on runner
    await git.configureGit();

    //init workflow
    let workflow;

    //get licensed input variables
    const { command, configPath } = await licensed.getInput();

    if (command !== "default" && command !== "both") {
      //non default command, assign specified workflow
      workflow = workflows[command];
    } else {
      //default command, run off event trigger
      //get trigger
      let trigger = github.context.eventName;

      core.info(trigger);

      //check if default workflow has been requested
      if (command === "both") {
        trigger = "default";
      }

      core.info(trigger);

      //assign event trigger as workflow
      switch (trigger) {
        case "push":
        case "schedule":
          core.info("entered push/schedule");
          workflow = workflows[trigger];
          break;
        default:
          core.info("entered default");
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
