#Composite action to send changelog

This action is used to send changelog with a descriptive header message to a given Slack channel.

## Usage

Inputs:
- `message` - short explanatory message to include before changelog in the Slack message
- `raw-changelog` - JSON generated from `tp_changelog` action
- `slack-webhook-url:` - webhook of Slack channel where changelog message should be sent

## Example

With inputs:
- `message`: `Hi QAs, please test this:`
- `slack-webhook-url`: `<webhook url pointing to QA slack channel>`
- `raw-changelog`: 
```
{
  "userStories": [
    {
      "id": 321,
      "title": "Support hotfix builds in backend repositories",
      "state": "Ready For Testing",
      "url": "https://auroratarget.tpondemand.com/entity/321",
      "tasks": [
        {
          "id": 123,
          "title": "BE - create automatic pull request from uat->dev",
          "state": "Done",
          "usId": 321,
          "url": "https://auroratarget.tpondemand.com/entity/123",
          "commit": {
            "commit": "123 - create workflow for syncing uat with dev after hotfix (#2188)",
            "author": "Cool person"
          }
        }
      ]
    }
  ],
  "unassigned": [
    {
      "commit": "Awesome feature (#2186)",
      "author": "Awesome person"
    }
  ]
}
```

Message sent to QA Slack channel will look something like this:

```
Hi QAs, please test this:

:memo: User stories and tasks:
1. #321 Support hotfix builds in backend repositories (Ready For Testing)
1.1. #123 BE - create automatic pull request from uat->dev (Done)

:question: Unassigned:
1. Awesome feature (#2186) by Awesome person
```


