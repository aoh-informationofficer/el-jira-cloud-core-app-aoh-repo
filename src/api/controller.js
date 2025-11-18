import react, {Component} from 'react';
import api, {route, fetch} from '@forge/api';

class Controller extends Component {

    async getIssue(issueKey) {
        try {
            const res = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`);
            const data = await res.json();
            return data;
        } catch(err) {
            console.error(err.message);
        }
        return {};
    }

    async updateCustomfieldValue(issueKey, bodyFieldValues) {
        try {
            const res = await api.asApp().requestJira(route`/rest/api/2/issue/${issueKey}?overrideScreenSecurity=true`, {
                method: 'PUT',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ fields: bodyFieldValues })
                });
            return res.status;
        } catch(err) {
            console.err(`Error Message: ${err.message}`)
            throw new Error(err.message);
        }
    }

    async updateIssueComment(issueKey, commentBody) {
        try {
            const res = await api.asUser().requestJira(route`/rest/api/2/issue/${issueKey}/comment`, {
                method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: `{"body": ${JSON.stringify(commentBody)}}`
            });
            return res.status;
        } catch (err) {
            console.error(`Error Message: ${err.message}`);
            throw new Error(err.message);
        }
    }
    
    /**
     * Retrieves issues from Jira using JQL (Jira Query Language) search.
     *
     * @param {string} query - The JQL query string to filter issues.
     * @param {string[]} fields - An array of field names to include in the response.
     * @param {string[]} expands - For expanding issue fields, use the expand query parameter.
     * @param {string} nextPageToken - The token for retrieving more results from Jira's API if there are no additional pages of data to retrieve, or null otherwise (default).
     * @param {number} maxResults - The maximum number of issues to return.
     * @returns {Promise<Object>} A promise that resolves to the JSON data of the retrieved issues.
    */
    async getIssuesByJQL(query, fields = [], expands = [], nextPageToken = "", maxResults = 100) {
        const queryFields = fields.join(',');
        const queryExpands = expands.join(',');
        let issues = [];
        // Combine the specified fields into a comma-separated string.
        try { 
            const res = await api.asUser().requestJira(route`/rest/api/3/search/jql?jql=${query}&fields=${queryFields}&maxResults=${maxResults}&expand=${queryExpands}&nextPageToken=${nextPageToken}`);
            const data = await res.json();

            issues = data.issues || [];
            nextPageToken = data.nextPageToken || null;
        } catch (err) {
            console.error(`${err.status} : ${err.message}`);
        }
        return { issues, nextPageToken };
    }

    async getCustomFieldContextOptions(id, contextId) {
        try {
            const res = await api.asApp().requestJira(route`/rest/api/3/field/${id}/context/${contextId}/option`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`${err.status} : ${err.message}`);
        }  
        return {};
    }

    async getCustomfieldContext(id) {
        try {
            const res = await api.asApp().requestJira(route`/rest/api/3/field/${id}/context`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`${err.status} : ${err.message}`);
        }  
        return {};
    }

    async getActorsByProjectKeyAndRoleId(projectKey, roleId, excludeInactiveUsers=false) {
        try {
            const res = await api.asApp().requestJira(route`/rest/api/2/project/${projectKey}/role/${roleId}?excludeInactiveUsers=${excludeInactiveUsers}`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`${err.status} : ${err.message}`);
        }
        return {};
    }
}

export default Controller;