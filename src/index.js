import Resolver from '@forge/resolver';
import Controller from './api/controller';

const resolver = new Resolver();
const controller = new Controller();

resolver.define('getStaticContent', (req) => {
  const content = req.context?.extension?.gadgetConfiguration?.content || "";
  return content;
});

/**
  * Prompt a Warning onto the Story if Implementation type is different
  * - customfield_15145: Implementation Type
  */
resolver.define("getInfoPanelData", async (req) => {
  const statement = [];
  const issueKey = req.context.extension.issue.key;
  // Get issue details:
  const currentIssue = await controller.getIssue(issueKey);
  const issueType = currentIssue.fields.issuetype.name;
  if (issueType === "Story") {
    const parentKey = currentIssue.fields.parent.key || "";
    if (!parentKey) {
       console.warn(`Issue: ${issueKey}, parent is empty`);
       return [];
    }
    const parentIssue = await controller.getIssue(parentKey);
    if (!parentIssue) {
      console.warn(`Unable to retrieve issue key parent: ${parentKey}.`);
      return
    }    
    const parentImpVal = parentIssue.fields.customfield_15145 ? parentIssue.fields.customfield_15145.value : "";
    const currentIssueImpVal = currentIssue.fields?.customfield_15145 ? currentIssue.fields.customfield_15145.value : "";
    if (currentIssueImpVal !== parentImpVal) {
      statement.push(parentKey);
    }
  } else if (issueType === "Epic") {
    let allIssues = [];
    let nextPage = "";
    const jql = `parent = ${issueKey}`;
    do {
      const {issues, nextPageToken} = await controller.getIssuesByJQL(jql, ["customfield_15145"], [], nextPage);
      allIssues = [...allIssues, ...issues];
      nextPage = nextPageToken;
    } while (nextPage);
    
    const parentImpVal = currentIssue.fields?.customfield_15145 ? currentIssue.fields.customfield_15145.value : "";
    for (const issue of allIssues) {
      const currentIssueImpVal = issue.fields?.customfield_15145 ? issue.fields.customfield_15145.value : "";
      if (currentIssueImpVal != parentImpVal) {
        statement.push(issue.key);
      }
    }
  }

  return {statements: statement, type: issueType};
});

resolver.define("getIssue", async (req) => {
  const issueKey = req.context.extension.issue.key;
  const currentIssue = await controller.getIssue(issueKey);
  return currentIssue;
})

resolver.define("getFieldDefaultValues", async (req) => {
  const field = req.payload.field;
  const fieldsContexts = await controller.getCustomfieldContext(field);
  const [defaultContext] = fieldsContexts.values;
  
  // Default context
  const values = await controller.getCustomFieldContextOptions(field, defaultContext.id);
  const selectList = values.values.map(value => ({
    value: value.id,
    label: value.value
  }));
  return selectList;
})

resolver.define("getCurrentUserWithRole", async (req) => {
  const {accountId} = req.context;
  const {role} = req.payload;
  const {project} = req.context.extension;
  const res = await controller.getActorsByProjectKeyAndRoleId(project.key, role, true);
  const foundRole = res.actors.find(actor => actor?.actorUser?.accountId === accountId);
  return {accountId:accountId, foundRole: foundRole, project: project.key};
})

resolver.define("postIssueOnHoldUpdate", async (req) => {
  const {formData, bsa} = req.payload;
  const {accountId} = req.context.value;
  const {issue, project} = req.context.extension;
  const {reasonCode, onHold, onHoldReason} = formData;
  let comment = onHoldReason.trim();

  if (comment == "" && onHold) {
    comment += `\n\nReason Code: ${reasonCode.label}\n\n`;
    if (project.key.substring(0, 3) == "JDE" || project.key === "EQMSCCR") {
      const roleList = ["10400","11364"]; // BSA and Architect
      const actors = [];
      for (const role of roleList) {
        const res = await controller.getActorsByProjectKeyAndRoleId(project.key, role, true);
        if (res.actors.length > 0) {
          const accountIds = res.actors.map(actor => actor.actorUser.accountId);
          actors.push(...accountIds);
        }
        if (!res || Object.keys(res).length === 0) {
          return "Uh Oh! Error trying to check user's project roles."
        }
      }
      // check if response doesn't have Business System Analyst of cf ID 14969
      const hasBSA = actors.find((actor) => actor === bsa.accountId);
      if (!hasBSA) {
        // add Business System Analyst if doesn't have to response
        actors.push(bsa.accountId);
      }
      // comment @mention and notify users
      comment += `FYI ${actors.map(id => `[~accountid:${id}]`).join(" ")}`;;
    }
  }

  const updateCfs = {
    "customfield_15087": { "value": onHold ? "Yes" : "No" }, // On Hold
    "customfield_15086": (reasonCode?.label == "None" || !onHold ) ? null : { "value": reasonCode?.label }, // Reason Code
    "customfield_15088": !onHold ? null : { "accountId": accountId }, // On Hold By
  };

  let status = await controller.updateCustomfieldValue(issue.key, updateCfs);
  if (status >= 400) {
    return status;
  }
  status = await controller.updateIssueComment(issue.key, comment);
  return status;
})

export const handler = resolver.getDefinitions();
