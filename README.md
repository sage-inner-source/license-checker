# License Checker

Runs a [github/licensed](https://github.com/github/licensed) CI workflow to check for dependency licenses that could potentially cause issues.

## Configuration

#### Repository Configuration

A `.licensed.yml` file is required by `licensed` to run. Please ensure that this file exists and is populated with initial license types to accept. If this file is not placed within the root of the repository, then please update the `config_file` option specified [below](#workflow-configuration). An example file is as follows, however for more information please check the [github/licensed docs](https://github.com/github/licensed/blob/master/docs/configuration.md).

```yaml
allowed:
  - apache-2.0
  - bsd-2-clause
  - mit
  - isc

cache_path: .licenses

reviewed:
  npm:
    - "@actions/http-client"
```

#### AWS SNS Configuration

If you wish to send licenses for review to a SNS Topic, please ensure the following repository secrets are set:

- `AWS_ACCESS_KEY`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_TOPIC`

#### Workflow Configuration

- `config_file` - Optional. The path to the `.licensed.yml` file within the repository. Only needed if this file is not located in the root of the repository.
- `display_output` - Optional. Whether output from the action should be displayed within the workflow logs. Defaults to `"false"`. If required, set to `"true"`.
- `should_fail` - Optional. Whether the workflow should fail if licenses needing review are found. Defaults to `"false"`. If required, set to `"true"`.
- `sns_topic` - Optional. AWS SNS Topic to send licenses for review to. If required, set to `${{ secrets.AWS_TOPIC }}` and add the relevent SNS Topic into the repository secrets.

#### Workflow Outputs

If you wish/require to build further pipelines based on the result of the license checks, the workflow sets the `log` output.

## Usage

**Note: Examples shown are installing `node.js` and `java` applications. Please change the `Install Repo Dependencies` step to reflect the language/package manager you are using. Repeat for multiple languages/package managers within the same repository. If no licenses are scanned, then please ensure the language/package manager is supported by [github/licensed](https://github.com/github/licensed/tree/master/docs/sources) and carry out any dditional steps mentioned for the specific source.**

Basic usage displaying `licensed` output to the workflow logs and failing if licenses needing review are found.

```yaml
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v2
  - name: Install Repo Dependencies
    run: npm ci && npm install --production
  - name: Setup Licensed
    uses: jonabc/setup-licensed@v1
    with:
      version: "2.x"
  - name: Check Licenses
    uses: sage-inner-source/license-checker@v1.1.0
    with:
      should_fail: "true"
      display_output: "true"
```

Usage outputting licenses for review to AWS SNS Topic.

```yaml
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v2
  - name: Install Repo Dependencies
    run: mvn install
  - name: Setup Licensed
    uses: jonabc/setup-licensed@v1
    with:
      version: "2.x"
  - name: Configure AWS Credentials
    uses: aws-actions/configure-aws-credentials@v1
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: eu-west-2
  - name: Check Licenses
    uses: sage-inner-source/license-checker@v1.1.0
    with:
      sns_topic: ${{ secrets.AWS_TOPIC }}
```
