<p align="center">
  <img src="docs/assets/mysite-logo.png" alt="MySite CLI" width="320" />
</p>

<h1 align="center">MySite CLI</h1>

<p align="center">
  一个用于快速拉取前端、后端项目模板的命令行脚手架，支持分组选择模板，并为 Koa 提供 MongoDB / MySQL 二级模板交互。
</p>

<p align="center">
  <a href="#核心能力">核心能力</a>
  ·
  <a href="#快速开始">快速开始</a>
  ·
  <a href="#模板列表">模板列表</a>
  ·
  <a href="#交互流程">交互流程</a>
  ·
  <a href="#常见问题">常见问题</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-18%2B-339933" alt="node 18+" />
  <img src="https://img.shields.io/badge/commander-13-000000" alt="commander 13" />
  <img src="https://img.shields.io/badge/inquirer-12-2f6fef" alt="inquirer 12" />
  <img src="https://img.shields.io/badge/template-Gitee-c71d23" alt="gitee templates" />
</p>

---

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 模板分组 | 先选择前端 / 后端，再选择具体模板，交互更接近 Vite 脚手架。 |
| 二级模板 | Koa 支持 MongoDB / MySQL 两种版本，不再把模板平铺到同一层。 |
| 快速拉取 | 通过 `git clone --depth 1` 从 Gitee 仓库拉取模板代码，兼容 main / master 默认分支。 |
| 命令别名 | `create` 支持别名 `crt`，日常使用更短。 |
| 参数直达 | 支持 `-f, --framework`，例如 `koa`、`koa_mysql`、`uniapp`。 |

## 快速开始

本地开发调试：

```bash
npm link
```

创建项目：

```bash
mysite-cli create my-app
mysite-cli crt my-app
```

指定模板：

```bash
mysite-cli create my-api -f koa
mysite-cli create my-api -f koa_mysql
mysite-cli create my-web -f uniapp
```

> `koa_mysql` 会兼容映射到 Koa + MySQL 模板；`koa` 会继续进入 MongoDB / MySQL 二级选择。

## 模板列表

| 类型 | 模板 | 版本 | 仓库 |
| --- | --- | --- | --- |
| 后端模板 | Express | 默认版本 | `https://gitee.com/nppe6/express-template.git` |
| 后端模板 | Koa | MongoDB | `https://gitee.com/nppe6/koa-template.git` |
| 后端模板 | Koa | MySQL | `https://gitee.com/nppe6/koa-mysql-template.git` |
| 前端模板 | UniApp | TypeScript | `https://gitee.com/nppe6/uni-template-ts.git` |

新增模板时，只需要在 `config.js` 的 `templateGroups` 中补充配置。

## 交互流程

当前交互参考 Vite/create-vite：先选择大类，再选择具体模板，只有存在多个版本时才继续追问。

```text
mysite-cli create my-app
  ├─ 请选择你要创建的项目类型：Backend / Frontend
  ├─ 请选择具体模板：Express / Koa / UniApp
  └─ 如果选择 Koa：MongoDB / MySQL
```

创建成功后会看到类似提示：

```text
Done! 项目 my-app 创建成功啦 🍃 ~

接下来你可以执行：😝
cd my-app
pnpm install  # 推荐使用
pnpm dev
```

## 常见问题

<details>
<summary>为什么 Koa 要做二级选择？</summary>

因为当前 Koa 有 MongoDB 基础模板和 MySQL 模板。收在 Koa 下，选择路径更清楚，也方便后续继续添加更多版本。

</details>

<details>
<summary>为什么推荐 pnpm，但不强制使用？</summary>

CLI 默认推荐 `pnpm`，但不同模板可能有不同习惯；如果模板适配 npm 或 yarn，也可以照常使用。

</details>
