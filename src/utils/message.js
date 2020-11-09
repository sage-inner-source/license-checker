const exec = require("@actions/exec");
const core = require("@actions/core");
const github = require("@actions/github");

function shouldSendToSNS() {
  const topic = core.getInput("sns_topic", { required: true });

  if (topic === "false") {
    return false;
  }

  return true;
}

async function send(log) {
  if (!shouldSendToSNS()) return;

  const output = {
    success: "",
    log: "",
    error: "",
  };

  const repo = github.context.repo.repo;
  const subject = `The repository '${repo}' has dependency licenses that need reviewing`;
  const topic = core.getInput("sns_topic", { required: true });
  const message = log;

  const options = {
    silent: false,
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

  const response = await exec.exec(
    "aws",
    [
      "sns",
      "publish",
      "--topic-arn",
      topic,
      "--subject",
      subject,
      "--message",
      "message",
    ],
    options
  );

  console.log(response);
}

module.exports = {
  send,
};