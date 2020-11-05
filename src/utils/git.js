const core = require("@actions/core");
const exec = require("@actions/exec");

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

module.exports = {
  configureGit,
};
