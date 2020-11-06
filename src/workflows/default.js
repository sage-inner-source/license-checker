const core = require("@actions/core");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = {};

  output.cache = await licensed.cacheLicenses(configPath);
  output.check = await licensed.checkLicenses(configPath);

  //temp check to check output is working
  core.info("********************");
  core.info("Logging output cache log");
  core.info(output.cache.log);
  core.info("Logging output cache error");
  core.info(output.cache.error);

  core.info("********************");
  core.info("Logging output check log");
  core.info(output.check.log);
  core.info("Logging output check error");
  core.info(output.check.error);

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
