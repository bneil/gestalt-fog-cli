exports.command = 'container'
exports.desc = 'Select container'
exports.builder = {}
exports.handler = function (argv) {
    const selectHierarchy = require('../lib/selectHierarchy');
    const selectContainer = require('../lib/selectContainer');
    const gestalt = require('../lib/gestalt');

    try {
        selectHierarchy.resolveEnvironment(() => {
            chooseContainer();
        });
    } catch (err) {
        console.log(err.message);
        console.log("Try running 'change-context'");
        console.log();
    }

    function chooseContainer() {
        selectContainer.run({}, (result) => {
            if (result) {
                gestalt.setCurrentContainer(result);

                console.log();
                console.log(`${result.name} selected.`);
                console.log();
            } else {
                console.log("No selection.");
            }
        });
    }
}