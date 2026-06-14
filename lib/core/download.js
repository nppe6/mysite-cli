const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
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

const downloadToDir = (url, dir) =>
  new Promise((resolve, reject) => {
    download('direct:' + url, dir, { clone: true }, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

const removeDirSafe = (dir) => {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch (_) {
    /* 忽略清理失败 */
  }
}

const downloadFun = async (url, project, { subdir } = {}) => {
  const spinner = ora('正在拉取模板代码 😇 ~').start()

  if (!subdir) {
    download('direct:' + url, project, { clone: true }, (err) => {
      if (!err) {
        spinner.succeed('拉取模板代码成功 🎉 ~')
        logInstallHints(project)
      } else {
        spinner.fail('拉取模板代码失败 😶 ~')
        console.log(chalk.red(err.message || err))
      }
    })
    return
  }

  if (fs.existsSync(project)) {
    spinner.fail('拉取模板代码失败 😶 ~')
    console.log(chalk.red(`目标目录 "${project}" 已存在，请更换名称或先删除。`))
    return
  }

  const tmpDir = path.join(
    os.tmpdir(),
    `mysite-cli-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  )

  try {
    await downloadToDir(url, tmpDir)

    const srcSubdir = path.join(tmpDir, subdir)
    if (!fs.existsSync(srcSubdir) || !fs.statSync(srcSubdir).isDirectory()) {
      spinner.fail('拉取模板代码失败 😶 ~')
      console.log(chalk.red(`模板仓库中未找到子目录 "${subdir}"，请检查 config 配置。`))
      return
    }

    fs.cpSync(srcSubdir, project, { recursive: true })
    spinner.succeed('拉取模板代码成功 🎉 ~')
    logInstallHints(project)
  } catch (err) {
    spinner.fail('拉取模板代码失败 😶 ~')
    console.log(chalk.red(err.message || err))
  } finally {
    removeDirSafe(tmpDir)
  }
}

module.exports = downloadFun
