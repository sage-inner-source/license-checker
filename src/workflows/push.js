const core = require("@actions/core");
const log = require("../utils/log");
const licensed = require("../utils/licensed");
const message = require("../utils/message");
const git = require("../utils/git");

async function run(configPath) {
  const shouldCache = licensed.shouldCacheLicenses();
  const output = await licensed.cacheLicenses(configPath);

  if (log.shouldDisplayLogs()) {
    log.write("Caching Process", output.log);
  }

  core.setOutput("status_log", output.log);

  switch (output.success) {
    case 0:
      break;
    case 1:
      message.send(output.log);
      break;
    default:
      message.send(output.log);
      throw new Error(`${output.success}: Failed during license caching`);
  }

  if (shouldCache) {
    git.cacheLicensesToBranch();
  }
}

module.exports = run;
