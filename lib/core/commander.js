const myAction = require('./action')

const myCommander = (program) => {
  program
    .command('create <project> [other...]')
    .alias('crt')
    .description('从模板创建一个新项目')
    .option('-f, --framework <framework>', '指定要使用的框架模板')
    .action((project, other, options) => {
      myAction(project, options)
    })
}

module.exports = myCommander
