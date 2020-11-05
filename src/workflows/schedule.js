const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = await licensed.checkLicenses(configPath);

  if (output.error !== "") {
    //placeholder error
    throw new Error("There is a licensing error");
  }
}

module.exports = run;
