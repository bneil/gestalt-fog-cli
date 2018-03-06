const inquirer = require('inquirer');
const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const inputValidation = require('../lib/inputValidation');
const cmd = require('../lib/cmd-base');
const debug = cmd.debug;
exports.command = 'workspace'
exports.desc = 'Create workspace'
exports.builder = {}
exports.handler = cmd.handler(async function (argv) {

    const context = await ui.resolveOrg();

    const parent = context.org;

    debug(`parent: ${JSON.stringify(parent, null, 2)}`);

    const questions = [
        {
            message: "Name",
            type: 'input',
            name: 'name',
            validate: inputValidation.resourceName
        },
        {
            message: "Description",
            type: 'input',
            name: 'description',
            validate: inputValidation.resourceDescription
        },
        {
            message: "Proceed?",
            type: 'confirm',
            name: 'confirm',
            default: false
        },
    ];

    const answers = await inquirer.prompt(questions);

    debug(`answers: ${answers}`);

    if (answers.confirm) {

        const workspaceSpec = {
            name: answers.name,
            description: answers.description
        };

        const workspace = await gestalt.createWorkspace(workspaceSpec, parent.fqon);
        debug(`workspace: ${workspace}`);
        console.log(`Workspace '${workspace.name}' created.`);
    } else {
        console.log('Aborted.');
    }
});