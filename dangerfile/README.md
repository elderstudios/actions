# Dangerfile action

The [Ruby version of Dangerfile](https://danger.systems/ruby/)

## How to use

* create a `Dangerfile` in root of your project. See examples directory.
* use this action in your build step:

```yaml
jobs:
  your_validation_job:
    steps:
      - ... (all your build steps)
      - uses: elderstudios/actions/dangerfile@v{version}
        if: ${{ always() }}
        with:
          github_token: ${{ github.token }}
          danger_id: "some unique value"
```

### Inputs

* **github_token**: the API token to allow PR comments. 
  It is always available as ${{ github.token }}
* **danger_id**: A unique identifier. 
  If you use Dangerfile from multiple steps running for a single github PR, 
  each one of them must use a unique identifier. Otherwise all processes 
  will overwrite single PR comment

## Debugging

See also [troubleshooting docs](https://danger.systems/guides/troubleshooting.html#i-want-to-work-locally-on-my-dangerfile)

1. Start ruby docker image
    ```shell
    docker run -ti --rm --entrypoint /usr/bin/env -v $(pwd):/app ruby:2.6 bash
    ```
2. Install bundle
    ```shell
    bundle install --jobs 4
    ```
3. Create [new api token](https://github.com/settings/tokens/new) with full `repo` access
4. Run Dangerfile against an existing pull request
    ```shell
    DANGER_GITHUB_API_TOKEN={your api token} \
      bundle exec danger pr https://github.com/elderstudios/{repository}/pull/{pr number}
    ```

Danger will not comment on PR, it will dump all data to console.

## Reference

* [Dangerfile on Ruby](https://danger.systems/ruby/)
* [Dangerfile reference](https://danger.systems/reference.html)
