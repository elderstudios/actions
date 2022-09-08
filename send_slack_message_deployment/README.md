# Composite action to send a status message 

This action takes in a path to a JSON template according to [Slack BlockKit specification](https://api.slack.com/block-kit/building) 
and sends the message to a slack webhook. There are some default variables supported in the template  

## Usage

Apart from the inputs and outputs documented in the metadata file there are specific variables supported in the template file:
- `RUN_LINK` - GitHub URL of the deployment pipeline execution
- `EXTRA_SECTIONS` - Extra BlockKit sections ready to be embedded in the template. Input `extra-sections` must be provided to be supported in the template.
- `COMMIT_FORMATTED` - Last commit message. Apostrophes are escaped which allows to embed the message to the BlockKit JSON
- `DEPLOYMENT_ENVIRONMENT` - Target environment of the deployment
- `DEPLOYMENT_STATUS` - Upper-cased status from the input
- `DEPLOYMENT_STATUS_ICON` - icon URL corresponding to the status. Green tick for `success`, red exclamation mark for `failure`
- `DEPLOYMENT_STATUS_HINT` - a hint on a follow-up action according to the deployment status

### Example of template file

```
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "New *BACKEND* functionality for Hub has been added to $DEPLOYMENT_ENVIRONMENT environment:\n\n*<$RUN_LINK|$COMMIT_FORMATTED>*"
      }
    },
    $EXTRA_SECTIONS,
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Author:*\n$GITHUB_ACTOR\n\n*Deployment status:*\n*$DEPLOYMENT_STATUS* $DEPLOYMENT_STATUS_HINT"
      },
      "accessory": {
        "type": "image",
        "image_url": "$DEPLOYMENT_STATUS_ICON",
        "alt_text": "$DEPLOYMENT_STATUS"
      }
    }
  ]
}
```

## Running locally, making changes to the action

This is a composite action according to the GitHub specification. See the offiction
[howto](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) and 
[metadata reference](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-composite-actions)
