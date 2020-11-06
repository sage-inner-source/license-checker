const log = require("../utils/log");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = await licensed.cacheLicenses(configPath);

  if (log.shouldDisplayLogs()) {
    log.write("Caching Process", output.log);
  }

  if (output.success !== true) {
    //placeholder error
    throw new Error(`${output.success}: Failed during license caching`);
  }
}

module.exports = run;
