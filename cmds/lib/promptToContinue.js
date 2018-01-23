exports.run = async (message = 'Proceed?', defaultChoice = false) => {
    const inquirer = require('inquirer');

    // Prompt to continue
    const questions = [
        {
            message: message,
            type: 'confirm',
            name: 'confirm',
            default: defaultChoice
        },
    ];

    Object.assign(questions, opts);

    return inquirer.prompt(questions).then(answers => {
        return answers.confirm;
    });
}
