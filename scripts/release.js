const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const readline = require('readline/promises')

const repoRoot = path.resolve(__dirname, '..')
const packagePath = path.join(repoRoot, 'package.json')
const allowedReleaseTypes = new Set(['patch', 'minor', 'major'])

const readPackage = () => JSON.parse(fs.readFileSync(packagePath, 'utf8'))

const formatCommand = (command, args) => [command, ...args].join(' ')

const run = (
  command,
  args,
  { capture = false, allowFailure = false, displayCommand } = {}
) => {
  console.log(`\n▶ ${displayCommand || formatCommand(command, args)}`)

  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit'
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0 && !allowFailure) {
    const detail = capture ? (result.stderr || result.stdout || '').trim() : ''
    throw new Error(detail || `${formatCommand(command, args)} 执行失败`)
  }

  return result
}

const runNpm = (args, options = {}) => {
  const npmExecPath = process.env.npm_execpath

  if (npmExecPath) {
    return run(process.execPath, [npmExecPath, ...args], {
      ...options,
      displayCommand: formatCommand('npm', args)
    })
  }

  if (process.platform === 'win32') {
    return run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...args], {
      ...options,
      displayCommand: formatCommand('npm', args)
    })
  }

  return run('npm', args, options)
}

const runGit = (args, options) => run('git', args, options)

const parseVersion = (version) => {
  const matched = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)

  if (!matched) {
    throw new Error(`暂不支持版本号 "${version}"，请使用标准 x.y.z 版本`)
  }

  return matched.slice(1).map(Number)
}

const compareVersions = (left, right) => {
  const leftParts = parseVersion(left)
  const rightParts = parseVersion(right)

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] > rightParts[index] ? 1 : -1
    }
  }

  return 0
}

const bumpVersion = (version, releaseType) => {
  const [major, minor, patch] = parseVersion(version)

  if (releaseType === 'major') return `${major + 1}.0.0`
  if (releaseType === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

const confirmRelease = async (message) => {
  if (!process.stdin.isTTY) {
    throw new Error('发布必须在交互式终端中人工确认')
  }

  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  try {
    const answer = await prompt.question(`${message} (y/N) `)
    return /^(y|yes)$/i.test(answer.trim())
  } finally {
    prompt.close()
  }
}

const printHelp = () => {
  console.log(`
用法：
  npm run release             # 默认发布 minor 版本
  npm run release -- patch    # 补丁版本
  npm run release -- minor    # 次版本
  npm run release -- major    # 主版本

流程：检查 Git → npm 登录与权限 → 查询线上版本 → 打包预检 → 人工确认
      → 更新版本 → npm 发布 → 推送 Git 标签 → 验证线上版本
`)
}

const main = async () => {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    return
  }

  const releaseType = args[0] || 'minor'

  if (!allowedReleaseTypes.has(releaseType) || args.length > 1) {
    printHelp()
    throw new Error(`无效的发布参数：${args.join(' ') || '(空)'}`)
  }

  const packageInfo = readPackage()
  console.log(`\n🚀 准备发布 ${packageInfo.name}`)

  const branch = runGit(['branch', '--show-current'], { capture: true }).stdout.trim()
  const gitStatus = runGit(['status', '--porcelain'], { capture: true }).stdout.trim()
  const originResult = runGit(['remote', 'get-url', 'origin'], {
    capture: true,
    allowFailure: true
  })

  if (!branch) {
    throw new Error('当前处于 detached HEAD，无法安全发布')
  }

  if (gitStatus) {
    throw new Error(`工作区存在未提交改动，请先提交：\n${gitStatus}`)
  }

  if (originResult.status !== 0 || !originResult.stdout.trim()) {
    throw new Error('未找到 Git 远程 origin，无法同步发布提交和标签')
  }

  const origin = originResult.stdout.trim()

  let whoami = runNpm(['whoami'], { capture: true, allowFailure: true })

  if (whoami.status !== 0) {
    console.log('\n🔐 当前尚未登录 npm，开始登录...')
    runNpm(['login'])
    whoami = runNpm(['whoami'], { capture: true })
  }

  const npmUser = whoami.stdout.trim()
  const ownerResult = runNpm(['owner', 'ls', packageInfo.name], { capture: true })
  const owners = ownerResult.stdout
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean)

  if (!owners.includes(npmUser)) {
    throw new Error(`npm 用户 ${npmUser} 不是 ${packageInfo.name} 的 owner`)
  }

  const publishedVersion = runNpm(['view', packageInfo.name, 'version'], {
    capture: true
  }).stdout.trim()
  const versionComparison = compareVersions(packageInfo.version, publishedVersion)

  if (versionComparison < 0) {
    throw new Error(
      `本地版本 ${packageInfo.version} 低于线上版本 ${publishedVersion}，请先同步代码`
    )
  }

  const shouldBumpVersion = versionComparison === 0
  const targetVersion = shouldBumpVersion
    ? bumpVersion(packageInfo.version, releaseType)
    : packageInfo.version

  if (!shouldBumpVersion) {
    console.log(`\n♻️ 检测到尚未发布的本地版本 ${targetVersion}，本次不会再次升级版本`)
  }

  if (packageInfo.main && !fs.existsSync(path.join(repoRoot, packageInfo.main))) {
    console.log(`\n⚠️ package.json 的 main 指向不存在的 ${packageInfo.main}，CLI 发布不受影响`)
  }

  runNpm(['pack', '--dry-run'])

  console.log('\n📋 发布摘要')
  console.log(`  npm 用户：${npmUser}`)
  console.log(`  Git 分支：${branch}`)
  console.log(`  Git 远程：${origin}`)
  console.log(`  线上版本：${publishedVersion}`)
  console.log(`  目标版本：${targetVersion}`)
  console.log(`  发布类型：${shouldBumpVersion ? releaseType : '使用本地版本'}`)

  const confirmed = await confirmRelease(`\n确认发布 ${packageInfo.name}@${targetVersion} 吗？`)

  if (!confirmed) {
    console.log('\n🛑 已取消，没有修改版本或执行发布')
    return
  }

  if (shouldBumpVersion) {
    runNpm(['version', releaseType])

    const updatedPackage = readPackage()
    if (updatedPackage.version !== targetVersion) {
      throw new Error(`版本升级结果异常：预期 ${targetVersion}，实际 ${updatedPackage.version}`)
    }
  }

  let npmPublished = false

  try {
    runNpm(['publish'])
    npmPublished = true
    runGit(['push', 'origin', branch, '--follow-tags'])
  } catch (error) {
    if (npmPublished) {
      console.error(`\n⚠️ ${packageInfo.name}@${targetVersion} 已发布到 npm，但 Git 推送失败`)
      console.error(`请修复 Git 权限或网络后执行：git push origin ${branch} --follow-tags`)
    }
    throw error
  }

  const verifiedVersion = runNpm(['view', packageInfo.name, 'version'], {
    capture: true
  }).stdout.trim()

  if (verifiedVersion !== targetVersion) {
    console.log(`\n⚠️ npm 当前返回 ${verifiedVersion}，注册表可能仍在同步`)
  }

  console.log(`\n🎉 发布完成：${packageInfo.name}@${targetVersion}`)
  console.log(`📦 验证命令：npx ${packageInfo.name}@latest --help`)
}

main().catch((error) => {
  console.error(`\n❌ 发布失败：${error.message}`)
  process.exitCode = 1
})
