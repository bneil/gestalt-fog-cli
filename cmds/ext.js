exports.command = 'ext <command>'
exports.desc = 'External commands'
exports.builder = function (yargs) {
  return yargs.commandDir('ext_cmds')
}
exports.handler = function (argv) {}

