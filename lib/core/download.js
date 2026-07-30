const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const { spawn } = require('child_process')
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

const removeDirSafe = (dir) => {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch (_) {
    /* 忽略清理失败 */
  }
}

// 直接用 git clone 拉取默认分支，避免 download-git-repo
// 强制 checkout master 导致 main 分支仓库报错
// 支持 url 后缀 #分支名 指定分支
const gitClone = (url, dir) =>
  new Promise((resolve, reject) => {
    const [repoUrl, branch] = url.split('#')
    const args = ['clone', '--depth', '1']
    if (branch) args.push('--branch', branch)
    args.push('--', repoUrl, dir)

    const child = spawn('git', args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''

    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `git clone 失败（退出码 ${code}）`))
        return
      }
      removeDirSafe(path.join(dir, '.git'))
      resolve()
    })
  })

const downloadFun = async (url, project, { subdir, packageManager } = {}) => {
  const spinner = ora('正在拉取模板代码 😇 ~').start()

  if (fs.existsSync(project)) {
    spinner.fail('拉取模板代码失败 😶 ~')
    console.log(chalk.red(`目标目录 "${project}" 已存在，请更换名称或先删除。`))
    return
  }

  if (!subdir) {
    try {
      await gitClone(url, project)
      spinner.succeed('拉取模板代码成功 🎉 ~')
      logInstallHints(project, packageManager)
    } catch (err) {
      spinner.fail('拉取模板代码失败 😶 ~')
      console.log(chalk.red(err.message || err))
      removeDirSafe(project)
    }
    return
  }

  const tmpDir = path.join(
    os.tmpdir(),
    `mysite-cli-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  )

  try {
    await gitClone(url, tmpDir)

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
