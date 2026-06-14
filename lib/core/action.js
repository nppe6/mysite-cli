const inquirer = require('inquirer')
const config = require('../../config')
const downloadFun = require('./download')

const toChoice = (item) => ({
  name: item.label,
  value: item.name
})

const resolveSource = (group, template, variant) => {
  const entry = variant || template
  const url = entry.url || template.repo || group.repo
  return {
    name: entry.name,
    label: entry.label,
    url,
    subdir: entry.subdir
  }
}

const findTemplate = (framework) => {
  const alias = config.templateAliases[framework]
  const templateName = alias ? alias.template : framework

  for (const group of config.templateGroups) {
    const template = group.templates.find((item) => item.name === templateName)

    if (template) {
      return {
        group,
        template,
        variant: alias ? alias.variant : null
      }
    }
  }

  return null
}

const resolveTemplate = async (prompt, framework) => {
  let selectedGroup
  let selectedTemplate

  if (framework) {
    const matched = findTemplate(framework)

    if (!matched) {
      console.log(`暂未找到 "${framework}" 模板，请从列表里重新选择一下 😶`)
    } else {
      selectedGroup = matched.group
      selectedTemplate = matched.template

      if (matched.variant && selectedTemplate.variants) {
        const selectedVariant = selectedTemplate.variants.find((item) => item.name === matched.variant)

        if (selectedVariant) {
          return resolveSource(selectedGroup, selectedTemplate, selectedVariant)
        }
      }
    }
  }

  if (!selectedGroup) {
    const { group } = await prompt([
      {
        type: 'list',
        name: 'group',
        message: '请选择你要创建的项目类型：',
        choices: config.templateGroups.map(toChoice)
      }
    ])

    selectedGroup = config.templateGroups.find((item) => item.name === group)
  }

  if (!selectedTemplate) {
    const { template } = await prompt([
      {
        type: 'list',
        name: 'template',
        message: `请选择${selectedGroup.label}：`,
        choices: selectedGroup.templates.map(toChoice)
      }
    ])

    selectedTemplate = selectedGroup.templates.find((item) => item.name === template)
  }

  if (!selectedTemplate.variants) {
    return resolveSource(selectedGroup, selectedTemplate, null)
  }

  const { variant } = await prompt([
    {
      type: 'list',
      name: 'variant',
      message: `请选择 ${selectedTemplate.label} 的模板版本：`,
      choices: selectedTemplate.variants.map(toChoice)
    }
  ])

  const selectedVariant = selectedTemplate.variants.find((item) => item.name === variant)
  return resolveSource(selectedGroup, selectedTemplate, selectedVariant)
}

const myAction = async (project, args) => {
  const prompt = inquirer.createPromptModule()
  const resolved = await resolveTemplate(prompt, args.framework)

  downloadFun(resolved.url, project, { subdir: resolved.subdir })
}

module.exports = myAction
