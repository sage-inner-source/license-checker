const licensed = require("../utils/licensed");

async function run(configPath) {
  const output = await licensed.cacheLicenses(configPath);

  if (output.error !== "") {
    //placeholder error
    throw new Error("There is a caching error");
  }
}

module.exports = run;
