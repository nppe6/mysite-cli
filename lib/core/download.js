const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')

const downloadFun = (url, project) => {
  const spinner = ora().start()
  spinner.text = '正在拉取代码 😇 ~'

  download('direct:' + url, project, { clone: true }, (err) => {
    if (!err) {
      spinner.succeed('拉取模板代码成功 🍃 ~ ')
      console.log(' ')
      console.log(chalk.blue('  Done!  ') + 'you run: 😝 ')
      console.log('  cd ' + project)
      console.log(chalk.rgb(26, 188, 156)('  pnpm install '))
      console.log(chalk.rgb(46, 204, 113)('  pnpm dev '))
      console.log(' ')
    } else {
      spinner.fail('拉去代码失败 😶 ~')
    }
  })
}

module.exports = downloadFun
