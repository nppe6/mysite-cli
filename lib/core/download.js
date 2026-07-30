const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')

const logInstallHints = (project, packageManager) => {
  const useBun = packageManager === 'bun'

  console.log('')
  console.log(chalk.green('  Done!  ') + `项目 ${project} 创建成功啦 🍃 ~`)
  console.log('')
  console.log('  接下来你可以执行：😝')
  console.log('')
  console.log(`  cd ${project}`)
  console.log('')

  if (useBun) {
    console.log(chalk.yellow('  🍞 这个模板使用 Bun，请执行：'))
    console.log('')
    console.log(chalk.cyan('  bun install') + chalk.gray('  # 安装依赖 📦'))
    console.log(chalk.cyan('  bun run dev') + chalk.gray('  # 启动项目 🚀'))
    console.log('')
    console.log(chalk.green('  ⚡ 准备就绪，开始开发吧 😎 ~'))
  } else {
    console.log(chalk.yellow('  📦 推荐使用 pnpm，请执行：'))
    console.log('')
    console.log(chalk.cyan('  pnpm install') + chalk.gray('  # 安装依赖 🧩'))
    console.log(chalk.cyan('  pnpm dev') + chalk.gray('  # 启动项目 🚀'))
    console.log('')
    console.log(chalk.gray('  🔄 如果你更习惯 npm / yarn，也可以使用：'))
    console.log(chalk.gray('  npm install && npm run dev  # npm 📦'))
    console.log(chalk.gray('  yarn && yarn dev            # Yarn 🧶'))
    console.log('')
    console.log(chalk.green('  ✨ 准备就绪，开始开发吧 😎 ~'))
  }

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

const downloadFun = async (url, project, { subdir, packageManager } = {}) => {
  const spinner = ora('正在拉取模板代码 😇 ~').start()

  if (!subdir) {
    download('direct:' + url, project, { clone: true }, (err) => {
      if (!err) {
        spinner.succeed('拉取模板代码成功 🎉 ~')
        logInstallHints(project, packageManager)
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
    logInstallHints(project, packageManager)
  } catch (err) {
    spinner.fail('拉取模板代码失败 😶 ~')
    console.log(chalk.red(err.message || err))
  } finally {
    removeDirSafe(tmpDir)
  }
}

module.exports = downloadFun
