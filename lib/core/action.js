const inquirer = require('inquirer')
const config = require('../../config')
const downloadFun = require('./download')

const myAction = async (project, args) => {
  const prompt = inquirer.createPromptModule()
  const result = await prompt([
    {
      type: 'list',
      name: 'framework',
      choices: config.framework,
      message: '请选择你所使用的框架'
    }
  ])

  downloadFun(config.frameworkUrl[result.framework], project)
}

module.exports = myAction
