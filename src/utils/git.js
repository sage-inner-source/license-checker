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

async function configureLicenseBranch(retries) {
  if (retries > 3) {
    core.setFailed(
      "Failed to configure git branch within maximum number of retries"
    );
  }

  const branch = core.getInput("license_branch", { required: true });
  core.info(`Licenses will be cached on '${branch}' branch`);

  switch (branch) {
    case "main":
    case "master":
      ensureBranch(branch, retries);
      break;
    default:
      const originalBranch = await changeBranch(branch);
      ensureBranch(branch, retries);
      copyFilesToBranch(originalBranch);
      break;
  }

  return branch;
}

async function changeBranch(branch) {
  let currentBranch = "";
  const options = {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        currentBranch += data.toString();
      },
    },
  };

  await exec.exec("git", ["branch", "--show-current"], options);

  //remove any line breaks and whitespace imposed by git command
  currentBranch = currentBranch.replace(/[\r\n]+/gm, "");
  currentBranch = currentBranch.trim();
  core.info(`Current branch is '${currentBranch}'`);

  core.info(`Creating and switching to '${branch}' branch`);
  //create branch with no commit history
  await exec.exec("git", ["checkout", "--orphan", branch], { silent: true });
  //remove existing files from branch
  await exec.exec("git", ["rm", "-rf", "."], { silent: true });
  //pull licenses branch to ensure commit history (if branch exists)
  await exec.exec("git", ["pull", "origin", branch], {
    silent: true,
    ignoreReturnCode: true,
  });

  return currentBranch;
}

async function ensureBranch(branch, retries) {
  let currentBranch = "";

  const options = {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        currentBranch += data.toString();
      },
    },
  };

  await exec.exec("git", ["branch", "--show-current"], options);

  if (!currentBranch.includes(branch)) {
    await configureLicenseBranch(retries++);
  }
}

async function copyFilesToBranch(originalBranch) {
  core.info(`Copying license files from '${originalBranch}'`);
  const cachePath = core.getInput("cache_path", { required: true });

  await exec.exec("git", ["checkout", originalBranch, cachePath]);
}

async function pushToGitHub(branch, retries) {
  if (retries > 3) {
    core.setFailed(
      "Failed to push git branch within maximum number of retries"
    );
  }

  const cachePath = core.getInput("cache_path", { required: true });
  const commitMessage = core.getInput("commit_message", { required: true });

  await exec.exec("git", ["add", cachePath], { ignoreErrorCode: true });
  await exec.exec("git", ["commit", "-m", commitMessage], {
    ignoreErrorCode: true,
  });

  let output = "";

  const pushOptions = {
    ignoreErrorCode: true,
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
    },
  };
  await exec.exec("git", ["push", "origin", branch], pushOptions);
}

async function cacheLicensesToBranch() {
  const branch = await configureLicenseBranch(0);

  core.info(
    `Pushing changes to '${core.getInput("license_branch", {
      required: true,
    })}'`
  );

  pushToGitHub(branch, 0);
}

module.exports = {
  configureGit,
  cacheLicensesToBranch,
};
