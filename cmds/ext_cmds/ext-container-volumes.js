'use strict';
exports.command = 'container-volumes'
exports.desc = 'Container volumes'
exports.builder = {}
exports.handler = function (argv) {
    const gestalt = require('../lib/gestalt');
    const gestaltState = require('../lib/gestalt-state');
    const displayResource = require('../lib/displayResourceUI');
    const gestaltServicesConfig = require('../lib/gestalt-services-config');
    const request = require('sync-request');
    const inquirer = require('inquirer');
    const SERVICE_CONFIG_KEY = 'kube_efs_volumes.v1';
    const chalk = require('chalk');

    if (argv._.length < 3) {
        printUsage();
        process.exit(1);
    }

    const COMMAND = argv._[2];

    switch (COMMAND) {
        case 'clusters':
            listClusters();
            return;
    }

    // Other commands require the cluster
    if (!argv.cluster) {
        console.log('missing --cluster <cluster>');
        printUsage();
        process.exit(1);
    }

    const CLUSTER = argv.cluster;

    main();

    function printUsage() {
        console.log(`Usage:`);
        console.log();
        console.log(`  list clusters:    ${argv['$0']} clusters`);
        console.log(`  list volumes:     ${argv['$0']} --cluster <cluster> list`);
        console.log(`  create volume:    ${argv['$0']} --cluster <cluster> create --name <volume>`);
        console.log(`  delete volume:    ${argv['$0']} --cluster <cluster> delete --name <volume>`);
        console.log();
    }

    function main() {
        switch (COMMAND) {
            case 'list':
                listVolumes();
                break;
            case 'list-dirs':
                listVolumeDirs();
                break;
            case 'create':
                createVolume();
                break;
            case 'delete':
                deleteVolume();
                break;
            default:
                console.log('Nothing');
        }
    }

    function listClusters() {
        let resources = Object.keys(gestaltServicesConfig.getServiceConfig(SERVICE_CONFIG_KEY));
        resources = resources.map(r => {
            return chalk.green(`'${r}'`);
        });

        console.log();
        console.log(chalk.bold('Clusters: ') + resources.join(', '));
        console.log();
    }

    function createVolume() {
        if (!argv.name) {
            console.log('missing --name');
            printUsage();
            return;
        }
        if (!argv.cluster) {
            console.log('missing --cluster');
            printUsage();
            return;
        }

        try {
            const name = argv.name;
            const cluster = argv.cluster;
            const url = getServiceUrl(cluster);

            console.log(`Creating volume '${name}' on cluster '${cluster}'...`);
            const resources = gestalt.httpPut(`${url}/volumes/${name}`);
            console.log('Done.');
            // listVolumes();
        } catch (err) {
            console.log(err.message);
            console.log();
        }
    }


    function deleteVolume() {
        if (!argv.name) {
            console.log('missing --name');
            printUsage();
            return;
        }
        if (!argv.cluster) {
            console.log('missing --cluster');
            printUsage();
            return;
        }
        try {
            const name = argv.name;
            const cluster = argv.cluster;

            if (!name) throw Error('missing name');
            if (!cluster) throw Error('missing cluster');


            const url = getServiceUrl(cluster);

            console.log(`Fetching volume information from cluster '${cluster}'...`);
            const volume = gestalt.httpGet(`${url}/volumes/${name}`);
            if (!argv.force && volume.status.phase == 'Bound') {
                console.log(`Not deleting volume '${name}' because status is '${volume.status.phase}', use '--force' to override.`);
            } else {
                console.log();
                promptToContinue(`Proceed to delete volume '${name}' on cluster '${cluster}'?`, confirmed => {
                    if (confirmed) {
                        console.log(`Deleting volume '${name}' on cluster '${cluster}'...`);
                        gestalt.httpDelete(`${url}/volumes/${name}`);
                        console.log('Done.');
                    } else {
                        console.log(`Aborted.`);
                    }
                });
            }
        } catch (err) {
            console.log(err.message);
            console.log();
        }
    }

    function listVolumes() {
        if (!argv.cluster) {
            console.log('missing --cluster');
            printUsage();
            return;
        }
        const options = {
            message: `Cluster '${CLUSTER}' Volumes:`,
            // headers: ['Name', /*'Status'*/, /*'Capacity', 'Bound To',*/ "Path"],
            // fields: ['name', /*'status.phase',*/ /*'spec.capacity.storage', 'spec.claimRef.name',*/ 'dir.path'],
            headers: ['Name', 'Server', 'Status', 'Created', /*'Path'*/],
            fields: ['name', 'spec.nfs.server', 'status.phase', 'created' /*, 'spec.nfs.path'*/],
            sortField: 'name',
            emptyString: '-'
        }

        try {
            const cluster = argv.cluster;
            const url = getServiceUrl(cluster);
            const server = getServer(cluster);

            console.log(`Fetching volumes information from cluster '${cluster}'...`);
            let resources = gestalt.httpGet(`${url}/volumes`);

            // console.log(JSON.stringify(resources, null, 2))

            if (!argv.all && server) {
                resources = resources.filter(item => {
                    return item.spec.nfs.server == server;
                });
            }
            displayResource.run(options, resources);
            console.log(`Note: Volumes with status of 'Available' are not attached to a container.`);
            console.log();

        } catch (err) {
            console.log(err.message);
            console.log();
        }
    }

    function listVolumeDirs() {
        const options = {
            message: `Cluster '${argv.cluster}' Volume Directories:`,
            headers: ["Path"],
            fields: ['path'],
            sortField: 'path',
            emptyString: '-'
        }

        try {
            const cluster = argv.cluster;
            const url = getServiceUrl(cluster);
            console.log(`Fetching server filesystem information from cluster '${cluster}'...`);
            const resources = gestalt.httpGet(`${url}/volume_dirs`);
            displayResource.run(options, resources);
        } catch (err) {
            console.log(err.message);
            console.log();
        }
    }

    function getServiceUrl(cluster) {
        return gestaltServicesConfig.getServiceConfig(SERVICE_CONFIG_KEY)[cluster]['service_url'];
    }

    function getServer(cluster) {
        return gestaltServicesConfig.getServiceConfig(SERVICE_CONFIG_KEY)[cluster]['server'];
    }

    function promptToContinue(message, callback) {
        // Prompt to continue
        const questions = [
            {
                message: message,
                type: 'confirm',
                name: 'confirm',
                default: false
            },
        ];
        inquirer.prompt(questions).then(answers => {
            const contents = JSON.stringify(answers, null, '  ');

            if (answers.confirm) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }
}