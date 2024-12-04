import * as core from "@actions/core"
import * as github from "@actions/github"

async function run() {
    try {
        const token = core.getInput("GITHUB_TOKEN", { required: true })
        const octokit = github.getOctokit(token)

        const { context } = github
        const pullRequest = context.payload.pull_request

        if (!pullRequest) {
            core.setFailed("This action can only be run on Pull Requests")
            return
        }

        const { data: commits } = await octokit.rest.pulls.listCommits({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: pullRequest.number,
        })

        const commitsWithAuthor = commits.map(commit => {
            return {
                commit: commit.commit.message?.split("\n")?.[0] ?? "No commit message",
                author: commit.commit.author?.name ?? "Unknown author",
            }
        })

        const output = {
            userStories: [],
            bugs: [],
            unassigned: commitsWithAuthor
        }

        // NOTE: In JSON, you don"t need to escape single quotes inside a value that is enclosed
        // with double-quotes. In the case that you have double quotes as part of a value
        // (that is enclosed with double quotes) then you would need to escape them.
        // According to the JSON RFC, the characters that MUST be escaped are quotation marks,
        // reverse solidus, and the control characters (U+0000 through U+001F). However,
        // escaping double quotes is already handled by JSON.stringify
        const outputJson = JSON.stringify(output)

        // Logging both output and output json string for debug purposes
        console.log("Output:", JSON.stringify(output))
        console.log("Output JSON:", JSON.stringify(outputJson))

        core.setOutput("CHANGELOG", outputJson)
    } catch (error) {
        console.log(JSON.stringify(error))
        core.setFailed(`The action failed with error: ${(error as Error)?.message ?? "Unknown error"}`)
    }
}

run()
