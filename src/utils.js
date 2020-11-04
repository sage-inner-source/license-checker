const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");

const ORIGIN = "licensed-ci-origin";

//setup git in the action runner
async function configureGit() {
  //get inputs
  const userName = core.getInput("user_name", { required: true });
  const userEmail = core.getInput("user_email", { required: true });
  const token = core.getInput("github_token", { required: true });

  //exec git commands
  await exec.exec("git", ["config", "user.name", userName]);
  await exec.exec("git", ["config", "user.email", userEmail]);
  await exec.exec("git", [
    "remote",
    "add",
    ORIGIN,
    `https://x-access-token:${token}@github.com/${process.env.GITHUB_REPOSITORY}.git`,
  ]);
}

//retrieve and make available inputs related to licensed
async function getLicensedInput() {
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

  const configPath = core.getInput("config_file", { required: true });
  try {
    await fs.access(configPath);
  } catch (err) {
    throw new Error(
      "Config file not found. Please ensure the correct path has been entered"
    );
  }

  return { command, configPath };
}

module.exports = {
  configureGit,
  getLicensedInput,
};
