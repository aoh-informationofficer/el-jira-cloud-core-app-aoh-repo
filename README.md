# Edwards Jira Cloud Core App - Forge

3 Features:
- Info Panel
An Issue Panel that displays a warning message on both Story and Epic issues when their Implementation Type values do not match.
This helps ensure alignment across related work items and improves visibility for project stakeholders.

- Static Dashboard Gadget
A Dashboard Gadget that allows users to input and display custom text content through a simple text area.
Ideal for displaying static notes, summaries, or instructions directly on Jira dashboards.

- On Hold
A Jira Issue Action that allows users to place an issue on hold.
Only users with the following roles can remove the hold:
-> Business System Analyst (BSA)
-> Architect
-> On Hold By (the user who originally placed the issue on hold)

This ensures controlled workflow transitions and accountability in issue management.

## Requirements

This project involves converting the existing Laravel-based Connect App into a Forge application.
The goal is to preserve existing functionality while leveraging Jira Forge’s architecture.


## Quick start
- Install top-level dependencies:
```
npm install
```

- Install dependencies inside of the `static/on-hold`, `static/info-panel`, `static/static-content` directory:
```
npm install
```

- Modify your app by editing the files in `static/on-hold`, `static/info-panel`, `static/static-content`. (Optional edit if only required)

- Build your app (inside of the `static/on-hold`, `static/info-panel`, `static/static-content`  directory):
```
npm run build
```

- Deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Use the `forge install --upgrade` command when you want to upgrade the prexisting installed application in your site
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.