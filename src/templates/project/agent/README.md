# Agentforce Project

This Salesforce DX project contains a pre-built agent called Local Info Agent that could be embedded in, for example, a resort's web site. The agent provides local weather updates, shares information about local events, and helps guests with facility hours. 

The agent demonstrates:

- Three types of agent actions (Invocable Apex, Prompt Template, and Flow)
- Mutable variables
- Flow control with `available when`
- Deterministic branching with `if/else` in reasoning instructions

## Prerequisites

- **Salesforce Developer Edition (DE)** org. Get a free one at [developer.salesforce.com/signup](https://developer.salesforce.com/signup). 
- **Salesforce CLI** (`sf`). Download and install it from [developer.salesforce.com/tools/sfdxcli](https://developer.salesforce.com/tools/sfdxcli).  See the [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) for more detailed information. 
- **VS Code** with the **Salesforce Extensions** pack and the **Agentforce DX** extension. See [Install Pro-Code Tools](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-dx-set-up-env.html) for details. 

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Vibe Code Agents with Agentforce Vibes

If you'd like to start coding a new agent with Agentforce Vibes just open this project in VS Code and click on the Agentforce Vibes view.  Select the `Manage Agentforce Rules, Workflows, Hooks & Skills` tool and ensure the `agentforce-development` skill is enabled.  That's it!

## Skills for Coding Agents

If you prefer to use other coding agents such as Claude Code or Cursor, copy the agentforce [skills](https://github.com/forcedotcom/afv-library/tree/main/skills) from the `afv-library` to a directory in this project specific for the coding agent per their documentation.

## Read All About It

- [Agentforce DX Developer Guide](https://developer.salesforce.com/docs/einstein/genai/guide/agent-dx.html)
- [Agent Script](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-script.html)
- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
