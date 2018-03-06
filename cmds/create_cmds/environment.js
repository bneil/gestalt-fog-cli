const inquirer = require('inquirer');
const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const inputValidation = require('../lib/inputValidation');
const cmd = require('../lib/cmd-base');
const debug = cmd.debug;
exports.command = 'environment'
exports.desc = 'Create environment'
exports.builder = {}
exports.handler = cmd.handler(async function (argv) {
    const context = await ui.resolveWorkspace();

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
            message: "Type",
            type: 'list',
            name: 'environment_type',
            choices: ['development', 'test', 'production']
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

        const envSpec = {
            name: answers.name,
            description: answers.description,
            properties: {
                environment_type: answers.environment_type
            }
        };

        const environment = await gestalt.createEnvironment(envSpec, context);

        debug(`environment: ${environment}`);

        console.log('Environment created.');
    } else {
        console.log('Aborted.');
    }
});