const myHelp = (program) => {
  program.name('mysite-cli')
  program.helpOption('-h, --help', '查看帮助')
  program.addHelpCommand('help [command]', '查看命令帮助')
  program.option('-v, --version', '查看版本号')
}

module.exports = myHelp
