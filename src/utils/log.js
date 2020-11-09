const core = require("@actions/core");

function shouldDisplayLogs() {
  const shouldDisplay = core.getInput("display_output", { required: true });

  if (shouldDisplay === "true") {
    return true;
  }

  return false;
}

function write(logName, log) {
  core.info(`**** Now displaying ${logName} ****`);
  core.info("");
  core.info(log);
}

module.exports = {
  shouldDisplayLogs,
  write,
};
