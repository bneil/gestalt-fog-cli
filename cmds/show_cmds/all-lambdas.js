exports.command = 'all-lambdas'
exports.desc = 'List all lambdas'
exports.builder = {}
exports.handler = function (argv) {
    const gestalt = require('../lib/gestalt')
    const displayResource = require('../lib/displayResourceUI');

    const options = {
        message: "Lambdas",
        headers: ['Lambda', 'Runtime', 'Public', 'FQON', 'Type', 'Owner', 'ID'],
        fields: ['name', 'properties.runtime', 'properties.public', 'org.properties.fqon', 'properties.code_type', 'owner.name', 'id'],
        sortField: 'description',
    }

    try {
        let resources = [];
        gestalt.fetchOrgFqons().map(fqon => {
            console.error(`Fetching from ${fqon}...`)
            const res = gestalt.fetchOrgLambdas([fqon]);
            resources = resources.concat(res);
        });

        displayResource.run(options, resources);
    } catch (err) {
        console.log(err.message);
        console.log("Try running 'change-context'");
        console.log();
    }
}