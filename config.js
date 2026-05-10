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
        // {
        //   name: 'nestjs',
        //   label: 'NestJS',
        //   url: 'https://gitee.com/nppe6/nest-cli.git'
        // },
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
  ]
}
