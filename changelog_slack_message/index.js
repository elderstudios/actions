const core = require('@actions/core');
const util = require('util');

const userStorySectionText = "*:memo: User stories and tasks: *";
const bugSectionText = "*:ladybug: Bug fixes: *";
const unassignedSectionText = "*:question: Unassigned: *";
const header = "BACKEND - DEV has been promoted to UAT! \n Release notes:";

const run = async () => {
  try {
    const changelogJson = JSON.parse(core.getInput('CHANGELOG_JSON', {required: true}));
    let blocks = [];

    const userStories = changelogJson.userStories;
    const bugs = changelogJson.bugs;
    const unassigned = changelogJson.unassigned;

    blocks.push(buildHeaderblock(header));
    //build blocks for US, bug, unassigned sections
    //of US 1 user story item per block - create new block for each user story
    blocks = blocks.concat(buildSectionAndHeader(userStorySectionText, userStories, userStoryFormat, 1));
    blocks = blocks.concat(buildSectionAndHeader(bugSectionText, bugs, bugOrUserStoryFormat, 15)); //15 items per block
    blocks = blocks.concat(buildSectionAndHeader(unassignedSectionText, unassigned, unassignedFormat, 15));

    const message = {blocks: blocks};
    //logging output for debug purposes
    console.log(util.inspect(message, false, null, true));
    core.setOutput("SLACK_MESSAGE", message);
  } catch (error) {
    core.setFailed(error.message);
  }
}

const buildSectionAndHeader = (headerText, items, itemsFormat, blockSize) => {
  let blocks = [];
  if (items != null && items.length > 0) {
    blocks.push(buildSectionBlock(headerText));
    blocks = blocks.concat(buildItemsSectionBlocks(items, itemsFormat, blockSize));
  }
  return blocks;
}

const bugOrUserStoryFormat = (index, item) => `${index + 1}. #<${item.url}|${item.id}> ${item.title} _(${item.state})_`

const taskFormat = (index, item, usIndex) => `> ${usIndex + 1}.${index + 1}. #<${item.url}|${item.id}> ${item.title} _(${item.state})_`

const unassignedFormat = (index, item) => `${index + 1}. ${item.commit} by _${item.author}_`;

const userStoryFormat = (index, item) => {
  const formatUs = bugOrUserStoryFormat(index, item);
  return formatUs + '\n' + formatUserStoryTasks(item.tasks, index);
}

const buildItemsSectionBlock = (items, format) => {
  const formattedItems = items.map((item, index) => {
    return format(index, item);
  })
  const itemsString = formattedItems.join("\n");
  return buildSectionBlock(itemsString);
}

const buildItemsSectionBlocks = (items, format, blockSize) => {
  const blocks = [];
  const formattedItems = items.map((item, index) => {
    return format(index, item);
  })
  // a section might become too big for slack block (>3000 characters),
  // so need to split up into blocks
  for (let i = 0; i < formattedItems.length; i += blockSize) {
    const formattedItemsChunk = formattedItems.slice (i, i + blockSize);
    const itemsString = formattedItemsChunk.join("\n");
    blocks.push(buildSectionBlock(itemsString));
  }
  return blocks;
}

const formatUserStoryTasks = (tasks, usIndex) => {
  const formattedTasks = tasks.map((item, index) => {
    return taskFormat(index, item, usIndex);
  })
  return formattedTasks.join("\n");
}

const buildSectionBlock = (text) => {
  return buildBlock("section", "mrkdwn", text);
}

const buildHeaderblock = (text) => {
  return buildBlock("header", "plain_text", text);
}

const buildBlock = (type, textType, text) => {
  return {
    type: type,
    text: {
      type: textType,
      text: text
    }
  }
}

run();
