const inquirer = require('inquirer');
const fs = require('fs');
const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const inputValidation = require('../lib/inputValidation');
const cmd = require('../lib/cmd-base');
const debug = cmd.debug;
exports.command = 'meta-schema-V7-migrate'
exports.desc = 'Meta V7 Schema migrate'
exports.builder = {
    file: {
        alias: 'f',
        description: 'V7 migrate file'
    },
}

exports.handler = cmd.handler(async function (argv) {
    if (!argv.file) {
        throw Error('missing --file parameter');
    }

    let context = null;
    let path = null;
    context = { org: { fqon: 'root' } };
    path = '/migrate';

    console.log(`Loading resource spec from file ${argv.file}`);
    let spec = cmd.loadObjectFromFile(argv.file);

    // Resolve environment context from command line args
    if (argv.provider) {
        const provider = await cmd.resolveProvider(argv, context);
        spec.V7.lambda.properties.id = provider.id;
    }

    const res = await gestalt.metaPost(path, spec);
    console.log(JSON.stringify(res, null, 2));
});
