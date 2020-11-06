const core = require("@actions/core");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = await licensed.cacheLicenses(configPath);

  //temp check to check output is working
  core.info("********************");
  core.info("Logging output log");
  core.info(output.log);
  core.info("Logging output error");
  core.info(output.error);

  if (output.success !== true) {
    //placeholder error
    throw new Error(`${output.success}: Failed during license caching`);
  }
}

module.exports = run;
