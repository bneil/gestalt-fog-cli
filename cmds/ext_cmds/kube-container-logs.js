'use strict';
exports.command = 'kube-container-logs'
exports.desc = 'Container logs (Kubernetes)'
exports.builder = {}
exports.handler = function (argv) {
    const gestaltState = require('../lib/gestalt-state');
    const GestaltKubeClient = require('../lib/gestalt-kube-client');
    const gestalt = require('../lib/gestalt')
    const selectContainerInstance = require('../lib/selectContainerInstance');
    const selectContainer = require('../lib/selectContainer');
    const selectHierarchy = require('../lib/selectHierarchy');

    if (argv.cluster || argv.env || argv.instance) {
        if (!argv.env) throw Error('missing argv.env');
        if (!argv.instance) throw Error('missing argv.instance');
        if (!argv.cluster) throw Error('missing argv.cluster');

        // command driven mode

        const kube = new GestaltKubeClient({ cluster: argv.cluster });
        accessLogs(kube, { id: argv.env }, { id: argv.instance }, argv);
    } else {
        // Use the container's provider to get the cluster name e.g. 'dev' or 'prod' so that the kubeconfig can be downloaded via ?cluster=dev
        const providerConfig = gestaltState.loadConfigFile('providers.json');
        selectHierarchy.resolveEnvironment().then(() => {
            const env = gestalt.getCurrentEnvironment();
            // const container = gestalt.fetchCurrentContainer(); // Get the focused container

            selectContainerOrCurrent(container => {
                if (!container) {
                    console.log("No selection.");
                    return;
                }

                const clusterName = providerConfig[container.properties.provider.id];
                const kube = new GestaltKubeClient({ cluster: clusterName });

                // Select the container instance

                console.log(`Container ${container.name}:`);
                console.log();

                if (container.properties.instances.length > 1) {
                    // More than one container instance, choose
                    selectContainerInstance.run(container, (inst) => {
                        displayHint(clusterName, inst.id, env.id);
                        accessLogs(kube, env, inst, argv);
                    });
                } else {
                    displayHint(clusterName, container.properties.instances[0].id, env.id);
                    accessLogs(kube, env, container.properties.instances[0], argv);
                }
            });
        });
    }

    function selectContainerOrCurrent(callback) {
        const state = gestaltState.getState();
        if (state.container && state.container.id) {
            gestalt.fetchCurrentContainer().then(container => {
                callback(container);
            });
        } else {
            // No container in current context, prompt
            selectContainer.run({}, callback);
        }
    }

    function displayHint(cluster, instance, env) {
        console.log('To run this command directly, run a command based on the following:');
        console.log();
        console.log(`    ./container-logs --cluster ${cluster} --instance ${instance} --env ${env}`);
        console.log(`    ./container-logs --cluster ${cluster} --instance ${instance} --env ${env} --follow --tail 100     # Follow log, view last 100 lines`);
        console.log();
    }

    function accessLogs(kube, env, inst, options) {
        // View the log
        console.log(`${inst.id} logs:`);
        console.log();

        kube.accessPodLogs(env.id, inst.id, { follow: options.follow, tail: options.tail }).then(() => {
            console.log('Done.');
        });
    }
}