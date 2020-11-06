const log = require("../utils/log");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = await licensed.checkLicenses(configPath);

  if (log.shouldDisplayLogs()) {
    log.write("Status Checks", output.log);
  }

  if (output.success !== true) {
    //placeholder error
    throw new Error(`${output.success}: Failed during license status checks`);
  }
}

module.exports = run;
