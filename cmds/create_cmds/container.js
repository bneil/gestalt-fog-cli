const inquirer = require('inquirer');
const fs = require('fs');
const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const inputValidation = require('../lib/inputValidation');
const cmd = require('../lib/cmd-base');
const debug = cmd.debug;
exports.command = 'container'
exports.desc = 'Create container'
exports.builder = {
    template: {
        alias: 't',
        description: 'template file'
    },
    file: {
        alias: 'f',
        description: 'container definition file'
    }
}
exports.handler = cmd.handler(async function (argv) {
    if (argv.file) {
        // load from file
        // Create
        console.log(`Loading container spec from file ${argv.file}`);
        let containerSpec = loadObjectFromFile(argv.file);
        if (argv.template) {
            const template = loadObjectFromFile(argv.template);
            console.log(`Mixing in template: ${template}`);
            containerSpec = Object.assign(template, containerSpec);
        }
        const container = await gestalt.createContainer(containerSpec);
        console.log(`container: ${JSON.stringify(container, null, 2)}`);
        console.log(`Container '${container.name}' created from file ${arg.file}.`);
    } else {

        // Interactive mode
        const answers = await promptForInput();

        debug(`answers: ${JSON.stringify(answers, null, 2)}`);

        if (answers.confirm) {
            const containerSpec = Object.assign({}, answers);
            delete containerSpec.confirm;
            containerSpec.properties.container_type = 'DOCKER';

            debug(`containerSpec: ${JSON.stringify(containerSpec, null, 2)}`);

            // Create
            const container = await gestalt.createContainer(containerSpec);
            debug(`container: ${JSON.stringify(container, null, 2)}`);
            console.log(`Container '${container.name}' created.`);
        } else {
            console.log('Aborted.');
        }
    }

    function loadObjectFromFile(filePath) {
        if (fs.existsSync(filePath)) {
            const contents = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(contents);
        }
        throw new Error(`File '${filePath}' not found`);
    }

    async function promptForInput() {
        const state = await ui.resolveEnvironment();
        const provider = await ui.selectProvider({ type: 'CaaS', message: 'Select Provider', mode: 'list' }, state);
        const template = {};
        if (provider.resource_type == 'CaaS::Kubernetes') {
            template.network = 'default';
        }

        let questions = [
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
                message: "Image",
                type: 'input',
                name: 'properties.image',
                validate: inputValidation.containerImage
            },
            {
                message: "Force Pull Image",
                type: 'confirm',
                name: 'properties.force_pull',
                default: true
            },
            {   // For DCOS Only 
                when: provider.resource_type == 'CaaS::DCOS',
                message: "DC/OS Network Type",
                type: 'list',
                name: 'properties.network',
                choices: ['BRIDGE', 'HOST'],
                default: "BRIDGE"
            },
            {
                message: "CPU",
                type: 'input',
                name: 'properties.cpus',
                default: 0.1,
                validate: inputValidation.cpu
            },
            {
                message: "Memory (MB)",
                type: 'input',
                name: 'properties.memory',
                default: 128,
                validate: inputValidation.memory
            },
            {
                message: "Number of instances",
                type: 'input',
                name: 'properties.num_instances',
                default: 1,
                validate: inputValidation.containerNumInstances
            },
            {
                message: "\nProceed to create container?",
                type: 'confirm',
                name: 'confirm',
                default: false
            },
        ];

        return inquirer.prompt(questions).then(answers => {
            answers.properties.provider = {
                id: provider.id
            };

            // merge in defaults
            answers.properties = Object.assign(template, answers.properties);

            return answers;
        });
    }
});
