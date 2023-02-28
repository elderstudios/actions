# Action for building Slack message containing changelog

This action takes in previously generated JSON changelog (`tp_changelog` action) and builds a JSON
array
with Slack BlockKit sections from this data.

## Usage

### Inputs

* `CHANGELOG_JSON` - JSON containing user stories with tasks, bugs and unassigned items. Expected
  formatting:

```json
{
  "userStories": [
    {
      "id": 52682,
      "title": "Improve data in Aurora tenant",
      "state": "In Progress",
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

### Output

* `SLACK_CHANGELOG_SECTIONS` - JSON array containing correctly formatted Slack BlockKit sections
  that can be used to embed in Slack messages. For example:

```json
[
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*:memo: User stories and tasks: *"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "1.<https://auroratarget.tpondemand.com/entity/52682|#52682>  Improve data in Aurora tenant: _(In progress)_ \n> 1.1.  <https://auroratarget.tpondemand.com/entity/53240|#53240> BE - fix account structure _(Done)_ \n\n"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*:ladybug: Bug fixes:  *"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "1. <https://auroratarget.tpondemand.com/entity/52667|#52667> Demo data missing systemInvoiceRef _(Fixed)_\n 2. <https://auroratarget.tpondemand.com/entity/53624|#53624> Unable to login to Opus UAT after deploy _(Closed)_"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*:question: Unassigned:  *"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "1. sad commit no TP (#1234) by _person1_ "
    }
  }
]
```

You can check how the message would look on Slack on the block kit
builder [message preview page](https://app.slack.com/block-kit-builder/). Just copy and paste in the
JSON above to `blocks` property value, and it should render the view.

## Running locally, making changes to the action

### Requirements

This is a JavaScript action and it will require `npm` and `node` to run it (at the time of writing
current node version
used is 16.x, with npm 8.x). Additionally, see `package.json` for other dependencies. Another
important library that we
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

3. Save the changelog JSON document to file `changelog.json` or download the file straight from the pipeline 
(it is added as an artifact by `tp_changelog` action)

4. Set input variables that action requires as environment variables. It is better to store
from file content to prevent bash interpreting the single quotes

``` shell

$ export INPUT_CHANGELOG_JSON=$(<changelog.json)
```

4. Then you're ready to run the action locally with:

 ```shell
 $ node index.js
 ```

### Committing to repository

GitHub Actions runner requires all the dependencies to be present, but obviously we shouldn't be
committing `node_modules` directory. A neat solution to this
is [`vercel/ncc` library](https://github.com/vercel/ncc),
that bundles up all dependencies into a single file (see `dist/index.js`).

To use it, you need to ensure that each time you push to repository you run `$ ncc build`
beforehand. This will update
the `dist/index.js` with any changes you made to `index.js` and will update with any libraries you
might have installed.

In short:

1. Before committing and pushing, run

 ```shell
$ ncc build
 ```

2. Ensure that you `git add` the newly generated `dist/index.js` file
3. Commit and push

#### Further reading

For general information about how to create and work with custom actions, see this
useful [guide on GitHub Docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
.
