const core = require("@actions/core");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = {};

  output.cache = await licensed.cacheLicenses(configPath);
  output.check = await licensed.checkLicenses(configPath);

  //temp check to check output is working
  core.info("Logging output check now");
  core.info(output);

  if (output.cache.error !== "") {
    //placeholder error
    throw new Error("There is a caching error");
  }

  if (output.check.error !== "") {
    //placeholder error
    throw new Error("There is a licensing error");
  }
}

module.exports = run;
