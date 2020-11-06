const core = require("@actions/core");
const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = await licensed.checkLicenses(configPath);

  //temp check to check output is working
  core.info("Logging output check now");
  core.info(output);

  if (output.error !== "") {
    //placeholder error
    throw new Error("There is a licensing error");
  }
}

module.exports = run;
