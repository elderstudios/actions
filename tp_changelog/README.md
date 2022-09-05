# Action for generating changelog with TargetProcess integration

This action takes in a list of commits, and connects the 5 digit number in commit messages to TargetProcess IDs. The TP
API is then called with the IDs, to find tasks and user stories or bugs the commit message relates to. With this
information we build a changelog that is the output of this action.

## Usage

#### Inputs

* `GITHUB_TOKEN`: The GitHub token passed in from the workflow used to connect to API. This token needs to have the `repo` scope.
* `GITHUB_PR_URL`: URL of the pull request commits, in form `https://api.github.com/repos/{owner}/{repo}/pulls/{pr id}/commits`.
  You should be able to get this URL from workflow environment.
* `TP_ACCESS_TOKEN`: TargetProcess token you generated
* `TP_URL`: URL of your TargetProcess

#### Outputs

* `CHANGELOG`: JSON object containing extracted user stories with tasks, bugs and unassigned commits. For structure see
  example below:

```json
{
  "userStories": [
    {
      "id": 52682,
      "title": "Improve data in Aurora tenant",
      "state": "Set Prioritisation",
      "url": "https://auroratarget.tpondemand.com/entity/52682",
      "tasks": [
        {
          "id": 53240,
          "title": "BE - fix account structure",
          "state": "New",
          "usId": 52682,
          "url": "https://auroratarget.tpondemand.com/entity/53240",
          "commit": "US Task #53240"
        }
      ]
    }
  ],
  "bugs": [
    {
      "id": 52667,
      "title": "Demo data missing systemInvoiceRef",
      "state": "In Progress",
      "url": "https://auroratarget.tpondemand.com/entity/52667",
      "commitTitle": "Bug #52667"
    }
  ],
  "unassigned": [
    {
      "commit": "sad commit no TP (#1234)",
      "author": "person1"
    }
  ]
}
```

For further guidance, see how this action is used in `.github/workflows/generate-changelog.yml`.

## Running locally, making changes to the action

### Requirements

This is a JavaScript action and it will require `npm` and `node` to run it (at the time of writing current node version
used is 16.x, with npm 8.x). Additionally, see `package.json` for other dependencies. Another important library that we
use is [`vercel/ncc`](https://github.com/vercel/ncc), you need to install it manually by running:

```shell
$ npm i -g @vercel/ncc
````

### Running locally

1. Ensure you have `node` and `npm` installed
2. In this directory (where this README resides), run

 ```shell 
 $ npm install
 ```

3. The action uses some inputs. To set them locally, we can just have them as environment variables, with
   prefix `INPUT_`:

```shell
  $ export INPUT_GITHUB_TOKEN=<your github token here>
  $ export INPUT_GITHUB_PR_URL="https://api.github.com/repos/elderstudios/goaccount-backend/pulls/1496/commits"
  $ export INPUT_TP_URL="https://auroratarget.tpondemand.com"
  $ export INPUT_TP_ACCESS_TOKEN=<your TP access token>
```

4. To run the action:

 ```shell
 $ node index.js
 ```

* `index.js` is the file that you should be editing if you want to make changes to the action. Do not confuse it
  with `dist/index.js`!
* For testing the TP integration locally, you will need a TP access token. You can find/generate yours using
  instructions
  [on the TP dev documentation website](https://dev.targetprocess.com/docs/authentication).
* To generate GitHub PAT for testing locally see instructions 
  [on GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 

### Committing to repository

GitHub Actions runner requires all the dependencies to be present, but obviously we shouldn't be
committing `node_modules` directory. A neat solution to this is [`vercel/ncc` library](https://github.com/vercel/ncc),
that bundles up all dependencies into a single file (see `dist/index.js`).

To use it, you need to ensure that each time you push to repository you run `$ ncc build` beforehand. This will update
the `dist/index.js` with any changes you made to `index.js` and will update with any libraries you might have installed.

In short:

1. Before committing and pushing, run

 ```shell
$ ncc build
 ```

2. Ensure that you `git add` the newly generated `dist/index.js` file
3. Commit and push

#### Further reading

For general information about how to create and work with custom actions, see this
useful [guide on GitHub Docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action).
