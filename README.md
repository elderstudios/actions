# ElderStudios GitHub Actions

Set of actions used in GitHub release pipelines. Please see the specific action README.md for usage
instructions.

- `tp_changelog` - Create a JSON changelog from pull request. Uses TargetProcess API to add links to merged tasks and bugs
- `generate_changelog_slack_sections` - Transforms JSON changelog provided by `tp_changelog` actions into an array of Slack BlockKit sections.
- `send_slack_message_deployment` - Sends a slack message defined in a JSON BlockKit template 
- [`dangerfile`](./dangerfile) - Automate PRs with [Dangerfile]()
- [`tf_tools_versions`](./tf_tools_versions) - Manage terraform project tools in your Github actions
