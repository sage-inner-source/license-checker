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
      await changeBranch(branch);
      ensureBranch(branch, retries);
      break;
  }

  return branch;
}

async function changeBranch(branch) {
  const doesBranchExist = await exec.exec(
    "git",
    ["show-ref", "-q", "--heads", branch],
    { ignoreReturnCode: true }
  );

  if (doesBranchExist === 0) {
    core.info(`Switching to '${branch}' branch`);
    await exec.exec("git", ["checkout", branch], { silent: true });
  } else {
    core.info(`Creating and switching to '${branch}' branch`);
    await exec.exec("git", ["checkout", "-b", branch], { silent: true });
  }
}

function overwriteGitignoreFile() {
  const cachePath = core.getInput("cache_path", { required: true });
  const gitignorePath = `${process.env.GITHUB_WORKSPACE}/.gitignore`;
  const contents = `/*\n!/${cachePath}`;

  fs.writeFileSync(gitignorePath, contents);
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

async function cacheLicensesToBranch() {
  const branch = await configureLicenseBranch();

  if (branch !== "main" && branch !== "master") {
    overwriteGitignoreFile();
  }

  core.info(
    `Pushing changes to '${core.getInput("license_branch", {
      required: true,
    })}'`
  );

  pushToGitHub(branch, 0);
}

async function pushToGitHub(branch, retries) {
  if (retries > 3) {
    core.setFailed(
      "Failed to push git branch within maximum number of retries"
    );
  }

  const commitMessage = core.getInput("commit_message", { required: true });

  await exec.exec("git", ["add", "."], { ignoreErrorCode: true });
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

  await exec.exec("git", ["pull", "origin", branch]);
  await exec.exec("git", ["push", "origin", branch], pushOptions);

  if (output.includes("git pull")) {
    await exec.exec("git", ["pull", "origin", branch]);
    core.info("Retrying push");
    pushToGitHub(branch, retries++);
  }
}

module.exports = {
  configureGit,
  cacheLicensesToBranch,
};
