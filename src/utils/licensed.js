const exec = require("@actions/exec");
const core = require("@actions/core");
const fs = require("fs");

//retrieve and make available inputs related to licensed
async function getInput() {
  const accepted = { licensed: "default", cache: "push", status: "schedule" };
  let command = core.getInput("command", { required: true });

  if (!(command in accepted)) {
    throw new Error(
      `Invalid command: "${command}", must be one of: ${Object.keys(
        accepted
      ).join(", ")}`
    );
  }

  command = accepted[command];

  const configFile = core.getInput("config_file", { required: true });
  const workingPath = process.env.GITHUB_WORKSPACE;
  const configPath = `${workingPath}/${configFile}`;

  try {
    fs.accessSync(configPath);
  } catch (err) {
    throw new Error(
      `Config file not found. Please ensure the correct path has been entered: ${err}`
    );
  }

  return { command, configPath };
}

function checkExitCode(exitCode) {
  const shouldFail = core.getInput("should_fail") === "false" ? false : true;

  if (shouldFail && exitCode !== 0) {
    throw new Error(
      `Licensed failed during execution (exit code: ${exitCode})`
    );
  }

  switch (exitCode) {
    case 0:
    case 1:
      break;
    default:
      throw new Error(
        `Licensed failed during execution (exit code: ${exitCode})`
      );
  }
}

async function cacheLicenses(configPath) {
  const output = {
    log: "",
    error: "",
  };

  const options = {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        output.log += data.toString();
      },
      stderr: (data) => {
        output.error += data.toString();
      },
    },
  };

  const exitCode = await exec.exec(
    "licensed",
    ["cache", "-c", configPath],
    options
  );

  checkExitCode(exitCode);

  return output;
}

async function checkLicenses(configPath) {
  const output = {
    log: "",
    error: "",
  };

  const options = {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        output.log += data.toString();
      },
      stderr: (data) => {
        output.error += data.toString();
      },
    },
  };

  const exitCode = await exec.exec(
    "licensed",
    ["status", "-c", configPath],
    options
  );

  checkExitCode(exitCode);

  return output;
}

module.exports = {
  cacheLicenses,
  checkLicenses,
  getInput,
};
