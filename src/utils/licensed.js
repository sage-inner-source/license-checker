const exec = require("@actions/exec");
const core = require("@actions/core");
const fs = require("fs");

//retrieve and make available inputs related to licensed
async function getInput() {
  const accepted = { licensed: "licensed", cache: "push", status: "schedule" };
  let command = core.getInput("command", { required: true });

  if (!(command in accepted)) {
    throw new Error(
      `Invalid command: "${command}", must be one of: ${Object.keys(
        accepted
      ).join(", ")}`
    );
  }

  command = accepted[command];

  const config = core.getInput("config_file", { required: true });
  const workingPath = process.env.GITHUB_WORKSPACE;
  const configPath = `${workingPath}/${config}`;

  //testing for fs directory search
  let test = `${workingPath}/`;
  core.info(`GitHub Workspace path is: ${test}`);
  await fs.readdir(test, (err, files) => {
    for (let i = 0; i < 4; i++) {
      test += `FILE: ${files[i]}\n`;
    }
  });
  core.info(`Config file path is: ${configPath}`);
  core.info(test);

  try {
    await fs.access(configPath);
  } catch (err) {
    throw new Error(
      "Config file not found. Please ensure the correct path has been entered"
    );
  }

  return { command, configPath };
}

async function cacheLicenses(configPath) {
  const output = {
    log: "",
    error: "",
  };

  const options = {
    listeners: {
      stdout: (data) => {
        output.log += data.toString();
      },
      stderr: (data) => {
        output.error += data.toString();
      },
      silent: true,
      ignoreReturnCode: true,
    },
  };

  const exitCode = await exec.exec(
    "licensed",
    ["cache", "-c", configPath],
    options
  );

  if (exitCode !== 0)
    throw new Error(
      `Licensed failed during execution (exit code: ${exitCode})`
    );

  return output;
}

async function checkLicenses(configPath) {
  const output = {
    log: "",
    error: "",
  };

  const options = {
    listeners: {
      stdout: (data) => {
        output.log += data.toString();
      },
      stderr: (data) => {
        output.error += data.toString();
      },
      silent: true,
      ignoreReturnCode: true,
    },
  };

  const exitCode = await exec.exec(
    "licensed",
    ["cache", "-c", configPath],
    options
  );

  if (exitCode !== 0)
    throw new Error(
      `Licensed failed during execution (exit code: ${exitCode})`
    );

  return output;
}

module.exports = {
  cacheLicenses,
  checkLicenses,
  getInput,
};
