const gestalt = require('./gestalt');
const chalk = require('chalk');

exports.run = (context) => {
    console.log(this.contextString(context));
}

exports.contextString = (context) => {
    // context = context || gestalt.getContext();
    // let s = `${chalk.bold('Context:')} ${chalk.green(gestalt.getHost())}`
    // let s = `${chalk.green(gestalt.getHost())}`
    let s = `${chalk.bold.green(gestalt.getHost())}`
    if (context && context.org) {
        s += ` / ${chalk.green(context.org.fqon)}`;
        if (context.workspace) {
            let value = context.workspace.description || context.workspace.name
            s += ` / ${chalk.green(value)}`;
        }
        if (context.environment) {
            let value = context.environment.description || context.environment.name
            s += ` / ${chalk.green(value)}`;
        }
    }
    return s;
}