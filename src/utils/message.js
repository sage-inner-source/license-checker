const exec = require("@actions/exec");
const core = require("@actions/core");
const github = require("@actions/github");

//Example error message
/*
Checking cached dependency records for licensed-ci-rebuild
...F...................
Errors:
* licensed-ci-rebuild.npm.@actions/http-client
  filename: /home/runner/work/licensed-ci-rebuild/licensed-ci-rebuild/.licenses.ignored/npm/@actions/http-client.dep.yml
    - license needs review: other
*/

function parse(log) {
  const messageParts = log.split("Errors:");
  const errorSection = messageParts[1];
  const errors = errorSection.split("* ");

  let minifiedErrors = errors.map((error) => {
    error = error.split("filename: ");
    error = error[1];
  });

  return message;
}

function shouldSendToSNS() {
  const topic = core.getInput("sns_topic", { required: true });

  if (!topic) {
    return false;
  }

  return true;
}

async function send(message) {
  const output = {
    success: "",
    log: "",
    error: "",
  };

  const repo = github.context.repo.repo;
  const subject = `The repository '${repo}' has dependency licenses that need reviewing`;
  const topic = core.getInput("sns_topic", { required: true });

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
      message,
    ],
    options
  );

  console.log(response);
}

module.exports = {
  parse,
  shouldSendToSNS,
  send,
};
