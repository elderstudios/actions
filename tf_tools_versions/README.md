# TF tools version management action

Helps you manage TF tools in your Github Actions.

Currently supported tools:

- `terraform` (via tfenv)
- `terragrunt` (via tgenv)
- `tfsec` (via direct download)

## How to use

- Create configuration files in root of your project:
  - `.terraform-version` for `terraform` tool
  - `.terragrunt-version` for `terragrunt` tool

**Note**: version of `tfsec` is currently hardcoded.

Add first step to your build action:

```yaml
jobs:
  your_validation_job:
    steps:
      - uses: elderstudios/actions/tf_tools_versions@v{version}
```

Installed tools are cached, cache key is derived from contents of `*-version` files

## Reference

* [tfenv](https://github.com/tfutils/tfenv)
* [tgenv](https://github.com/cunymatthieu/tgenv)
* [tfsec](https://aquasecurity.github.io/tfsec/)
