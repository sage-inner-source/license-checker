const core = require("@actions/core");
const log = require("../utils/log");
const licensed = require("../utils/licensed");
const message = require("../utils/message");

async function run(configPath) {
  const output = await licensed.cacheLicenses(configPath);

  if (log.shouldDisplayLogs()) {
    log.write("Caching Process", output.log);
  }

  core.setOutput("status_log", output.log);

  if (output.success !== true) {
    message.send(output.log);

    throw new Error(`${output.success}: Failed during license caching`);
  }
}

module.exports = run;
