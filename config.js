// ============================================================
// 模板配置 Schema 速查
//
// templateAliases:常用 "模板 + variant" 组合的简写,
//   命中后会自动定位到 templateGroups 里的最终条目
//   例:create demo -f koa_mysql
//
// templateGroups:支持两种写法,可混用
//   形态 A — 条目自带 url(整仓 clone)
//     { name, label, url }
//
//   形态 B — group / template 上挂 repo(共享同一个仓库),
//           最终条目用 subdir 指明仓库内的子目录
//     CLI 会先把整仓 clone 到系统临时目录,再把 subdir
//     内容拷到目标项目里(临时目录用完即清)
//
//   url / repo 解析优先级(逐层 fallback):
//     entry.url  ??  template.repo  ??  group.repo
//   subdir 只在最终条目(template 或 variant)上读取
// ============================================================

module.exports = {
  templateAliases: {
    koa_mysql: {
      template: 'koa',
      variant: 'mysql'
    },
    koa_mongodb: {
      template: 'koa',
      variant: 'mongodb'
    }
  },
  templateGroups: [
    {
      name: 'backend',
      label: 'Backend',
      templates: [
        {
          name: 'hono',
          label: 'Hono',
          url: 'https://gitee.com/nppe6/hono-starter.git'
        },
        {
          name: 'express',
          label: 'Express',
          url: 'https://gitee.com/nppe6/express-template.git'
        },
        {
          name: 'koa',
          label: 'Koa',
          variants: [
            {
              name: 'mongodb',
              label: 'MongoDB',
              url: 'https://gitee.com/nppe6/koa-template.git'
            },
            {
              name: 'mysql',
              label: 'MySQL',
              url: 'https://gitee.com/nppe6/koa-mysql-template.git'
            }
          ]
        }
      ]
    },
    {
      name: 'frontend',
      label: 'Frontend',
      templates: [
        {
          name: 'uniapp',
          label: 'UniApp',
          url: 'https://gitee.com/nppe6/uni-template-ts.git'
        }
        // {
        //   name: 'vue_front',
        //   label: 'Vue Front',
        //   url: 'git@gitee.com:nppe6/naive-pro.git'
        // },
        // {
        //   name: 'vue_cms',
        //   label: 'Vue CMS',
        //   url: 'git@gitee.com:nppe6/naive-admin-pro.git'
        // },
        // {
        //   name: 'electron',
        //   label: 'Electron',
        //   url: 'git@gitee.com:nppe6/basic-electron.git'
        // },
        // {
        //   name: 'vue3',
        //   label: 'Vue3',
        //   url: 'git@gitee.com:nppe6/xy-vue-admin.git'
        // },
        // {
        //   name: 'nuxt',
        //   label: 'Nuxt',
        //   url: 'git@gitee.com:nppe6/nuxt-template.git'
        // }
      ]
    }

    // ----------------------------------------------------------
    // 形态 B 示例:整个 group 共享同一个仓库,
    //   每个模板用 subdir 指向仓库内的某个子目录
    //   适合"一个仓库放多个模板"的场景(如 scaffolding-template
    //   仓库下的 koa-template / uniapp-template)
    // ----------------------------------------------------------
    // ,{
    //   name: 'scaffolding',
    //   label: 'Scaffolding (mono-repo)',
    //   // 共享仓库地址,组内所有模板都从这里 clone
    //   repo: 'https://gitee.com/nppe6/scaffolding-template.git',
    //   templates: [
    //     {
    //       name: 'koa_mono',
    //       label: 'Koa (子目录)',
    //       // 仓库内的子目录名,clone 后会把这个目录的内容拷到目标项目
    //       subdir: 'koa-template'
    //     },
    //     {
    //       name: 'uniapp_mono',
    //       label: 'UniApp (子目录)',
    //       subdir: 'uniapp-template'
    //     }
    //   ]
    // }

    // ----------------------------------------------------------
    // 形态 C 示例:template 自己挂 repo,variants 各取一个 subdir
    //   适合"同一个模板有多个变体,但全部存在同一个仓库里"的场景
    // ----------------------------------------------------------
    // ,{
    //   name: 'mono-backend',
    //   label: 'Mono Backend',
    //   templates: [
    //     {
    //       name: 'koa_pack',
    //       label: 'Koa Pack',
    //       repo: 'https://gitee.com/nppe6/scaffolding-template.git',
    //       variants: [
    //         { name: 'mysql',   label: 'MySQL',   subdir: 'koa-mysql' },
    //         { name: 'mongodb', label: 'MongoDB', subdir: 'koa-mongodb' }
    //       ]
    //     }
    //   ]
    // }
  ]
}
