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

  if (output.error !== "") {
    //placeholder error
    throw new Error("There is a caching error");
  }
}

module.exports = run;
