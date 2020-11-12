const core = require("@actions/core");
const log = require("../utils/log");
const licensed = require("../utils/licensed");
const message = require("../utils/message");
const git = require("../utils/git");

async function run(configPath) {
  const shouldCache = licensed.shouldCacheLicenses();
  const output = {};

  output.cache = await licensed.cacheLicenses(configPath);
  output.status = await licensed.checkLicenses(configPath);

  if (log.shouldDisplayLogs()) {
    log.write("Caching Process", output.cache.log);
    log.write("Status Checks", output.status.log);
  }

  core.setOutput("cache_log", output.cache.log);
  core.setOutput("status_log", output.status.log);

  switch (output.cache.success) {
    case 0:
      break;
    case 1:
      message.send(output.cache.log);
      break;
    default:
      message.send(output.cache.log);
      throw new Error(`${output.cache.success}: Failed during license caching`);
  }

  switch (output.status.success) {
    case 0:
      break;
    case 1:
      message.send(output.status.log);
      break;
    default:
      message.send(output.status.log);
      throw new Error(
        `${output.status.success}: Failed during license status checks`
      );
  }

  if (shouldCache) {
    git.cacheLicensesToBranch();
  }
}

module.exports = run;
