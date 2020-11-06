const log = require("../utils/log");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = {};

  output.cache = await licensed.cacheLicenses(configPath);
  output.check = await licensed.checkLicenses(configPath);

  if (log.shouldDisplayLogs()) {
    log.write("Caching Process", output.cache.log);
    log.write("Status Checks", output.check.log);
  }

  if (output.cache.success !== true) {
    //placeholder error
    throw new Error(`${output.cache.success}: Failed during license caching`);
  }

  if (output.check.success !== true) {
    //placeholder error
    throw new Error(
      `${output.check.success}: Failed during license status checks`
    );
  }
}

module.exports = run;
