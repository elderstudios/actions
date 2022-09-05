const core = require('@actions/core');
const axios = require('axios');
const util = require('util');

const fiveDigitRegex = /\d{5}/

const run = async () => {
  try {
    const ghToken = core.getInput('GITHUB_TOKEN', {required: true});
    const prUrl = core.getInput('GITHUB_PR_URL', {required: true});
    const tpAccessToken = core.getInput('TP_ACCESS_TOKEN', {required: true});
    const tpUrl = core.getInput('TP_URL', {required: true});

    const commitsJson = await getCommits(prUrl, ghToken);
    if (commitsJson == null) {
      core.setFailed("Calling GitHub API failed");
    }

    const tpApiUrl = tpUrl + "/api/v1"
    const tpEntityUrl = tpUrl + "/entity/";

    const rawCommitsWithAuthor = commitsJson.map(a => { return {
      commit: formatCommitMessage(a.commit.message),
      author: a.commit.author.name
    }});

    const processedCommits = extractIds(rawCommitsWithAuthor);
    const commitsWithTpIds = processedCommits.withIds;
    const unknown = processedCommits.withoutIds;

    const bugs = [];
    const tasks = [];

    //look up in target process
    for (const commit of commitsWithTpIds) {
      let tpId = commit.tpId;
      let bug = await fetchBug(tpId, tpApiUrl, tpAccessToken);
      if (bug != null) {
        const bugFormatted = formatBug(bug, commit.commit, tpEntityUrl);
        bugs.push(bugFormatted);
      } else {
        let task = await fetchTask(tpId, tpApiUrl, tpAccessToken);
        if (task != null) {
          const taskFormatted = formatTask(task, commit.commit, tpEntityUrl);
          tasks.push(taskFormatted);
        } else {
          unknown.push(commit.commit);
        }
      }
    }
    //link tasks to US
    // fetch all US tasks, add some boolean var to indicate which tasks are done from this release
    const userStories = await linkTasksToUserStories(tasks, tpApiUrl, tpEntityUrl, tpAccessToken);

    const output = {
      userStories: userStories,
      bugs: bugs,
      unassigned: unknown
    };

    //escape single quotes - we cannot use string that has unescaped single quotes in bash
    const outputJson = JSON.stringify(output).replaceAll("'", "\\'")

    //logging both output and output json string for debug purposes
    console.log(util.inspect(output, false, null, true));
    console.log(util.inspect(outputJson, false, null, true));

    core.setOutput("CHANGELOG", outputJson);
  } catch (error) {
    core.setFailed(error.message);
  }
}

const formatCommitMessage = (commit) => {
  return commit.split('\n')[0];
}

const getCommits = (url, accessToken) => {
  return axios.get(url, {
    headers: {
      'Authorization': `token ${accessToken}`
    }
  }).then(response => {
    if (response.status !== 200) {
      console.log("GitHub API did not respond with 200");
      console.log(response.status, response.data);
      return null;
    }
    return response.data;
  }).catch(error => {
    console.log("Failed calling GitHub API");
    console.log(error);
    return null;
  });
}

const extractIds = (commitsWithAuthor) => {
  //extract 6 digit numbers
  const withIds = [];
  const withoutIds = [];
  for (const commit of commitsWithAuthor) {
    let tpId = commit.commit.match(fiveDigitRegex);
    if (tpId != null) {
      let commitWithId = {tpId: tpId[0], commit: commit};
      withIds.push(commitWithId);
    } else {
      withoutIds.push(commit);
    }
  }
  return {withIds: withIds, withoutIds: withoutIds};
}

const fetchBug = (tpId, tpApiUrl, accessToken) => {
  const request = "/Bug/" + tpId;
  return callTpApi(tpApiUrl, accessToken, request);
}

const fetchTask = (tpId, tpApiUrl, accessToken) => {
  const request = "/Task/" + tpId;
  return callTpApi(tpApiUrl, accessToken, request);
}

const fetchUserStory = (tpId, tpApiUrl, accessToken) => {
  const request = "/UserStory/" + tpId;
  return callTpApi(tpApiUrl, accessToken, request);
}

const formatBug = (bug, commit, tpEntityUrl) => {
  return {
    id: bug.Id,
    title: bug.Name,
    state: bug.EntityState.Name,
    url: tpEntityUrl + bug.Id,
    commit: commit
  }
}

const formatTask = (task, commit, tpEntityUrl) => {
  return {
    id: task.Id,
    title: task.Name,
    state: task.EntityState.Name,
    usId: task.UserStory.Id,
    url: tpEntityUrl + task.Id,
    commit: commit
  }
}

const formatUserStory = (userStory, tasks, tpEntityUrl) => {
  return {
    id: userStory.Id,
    title: userStory.Name,
    state: userStory.EntityState.Name,
    url: tpEntityUrl + userStory.Id,
    tasks: tasks
  }
}

const linkTasksToUserStories = async (tasks, tpApiUrl, tpEntityUrl, accessToken) => {
  const usIds = [...new Set(tasks.map(t => t.usId))]; //collect only unique ids
  const userStories = [];
  for (const usId of usIds) {
    const userStory = await fetchUserStory(usId, tpApiUrl, accessToken);
    const userStoryTasks = tasks.filter(t => t.usId === usId);
    userStories.push(formatUserStory(userStory, userStoryTasks, tpEntityUrl));
  }
  return userStories;
}

const callTpApi = (tpApiUrl, accessToken, request) => {
  // request contains Bug/<ID> or task/<ID> or userStory/<Id>
  const url = tpApiUrl + request;
  return axios.get(url, {
    params: {
      format: 'json',
      access_token: accessToken
    }
  }).then(response => {
    return response.status === 200 ? response.data : null;
  }).catch(error => {
    return null;
  });
}

run();
