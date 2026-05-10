const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')

const logInstallHints = (project) => {
  console.log('')
  console.log(chalk.green('  Done!  ') + `项目 ${project} 创建成功啦 🍃 ~`)
  console.log('')
  console.log('  接下来你可以执行：😝')
  console.log('')
  console.log(`  cd ${project}`)
  console.log('')
  console.log(chalk.cyan('  pnpm install') + chalk.gray('  # 推荐使用'))
  console.log(chalk.cyan('  pnpm dev'))
  console.log('')
  console.log(chalk.gray('  如果你更习惯 npm / yarn，也可以使用：'))
  console.log(chalk.gray('  npm install && npm run dev'))
  console.log(chalk.gray('  yarn && yarn dev'))
  console.log('')
}

const downloadFun = (url, project) => {
  const spinner = ora('正在拉取模板代码 😇 ~').start()

  download('direct:' + url, project, { clone: true }, (err) => {
    if (!err) {
      spinner.succeed('拉取模板代码成功 🎉 ~')
      logInstallHints(project)
    } else {
      spinner.fail('拉取模板代码失败 😶 ~')
      console.log(chalk.red(err.message || err))
    }
  })
}

module.exports = downloadFun
