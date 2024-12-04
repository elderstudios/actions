# Generating Git changelog

# Usage

## Inputs

* `GITHUB_TOKEN`: The GitHub token passed in from the workflow used to connect to API. This token needs to have the `repo` scope.

## Outputs

* `CHANGELOG`: JSON object containing extracted user stories with tasks, bugs and unassigned commits. For structure see
  example below:

```json
{
  "userStories": [],
  "bugs": [],
  "unassigned": [
    {
      "commit": "ST-12345 An amazing new feature",
      "author": "John Doe"
    }
  ]
}
```

This is a backwards-compatible JSON so that the [generate_changelog_slack_sections](../generate_changelog_slack_sections)
action can notify new releases.

# Running locally, making changes to the action

## Requirements

This is a TypeScript action and it will require `npm`, `node`, and `typescript` to run it.
Additionally, see `package.json` for other dependencies.

## Running locally

1. Ensure you have `node` and `npm` installed
2. In this directory (where this `README` resides), run
    ```shell 
    npm install
     ```
3. The action uses some inputs. To set them locally, we can just have them as environment variables, with `INPUT_` prefix:
    ```shell
    export INPUT_GITHUB_TOKEN=<your github token here>
    ```
4. Run the action
    ```shell  
    npm run build
    npm start
    ```

* The `index.ts` is the file that you should be editing if you want to make changes to the action.  
  Do not confuse it with `dist/index.js`!
* To generate the GitHub PAT for testing locally see instructions [on GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 

## Committing to repository

GitHub Actions runner requires all the dependencies to be present, but obviously we shouldn't be committing `node_modules` directory.
A neat solution to this is [`vercel/ncc` library](https://github.com/vercel/ncc), that bundles up all dependencies into a single file (see `dist/index.js`).

To use it, you need to ensure that each time you push to repository you run `npm run build` beforehand.
This will update the `dist/index.js` with any changes you made to the `index.ts`,
and will update with any libraries you might have installed.

In short:

1. Before committing and pushing, run
    ```shell
    npm run build
    ```
2. Ensure that you `git add` the newly generated `dist/index.js` file
3. Commit and push

# Further reading

For general information about how to create and work with custom actions, see this
useful [guide on GitHub Docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action).
