#!/usr/bin/env node

exports.run = (opts, callback) => {
    const gestalt = require('./gestalt')
    const selectResource = require('./selectResourceUI');

    let options = {
        mode: 'autocomplete',
        message: "Select Container(s)",
        fields: ['name', 'properties.status', 'properties.image', 'running_instances', 'owner.name', 'properties.provider.name'],
        sortBy: 'name',
        fetchFunction: () => {
            const res = gestalt.fetchContainers();
            return res;
        }
    }

    // merge in user specified options
    options = Object.assign(options, opts);

    selectResource.run(options, selection => {
        if (callback) callback(selection);
    });
}
