#!/usr/bin/env node

import prompts from 'prompts'
import semver from 'semver'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import shell from 'shelljs'

async function init() {
  const pkgPath = path.resolve(process.cwd(), 'package.json')

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

  function versionList(version) {
    const major = semver.inc(version, 'major')
    const minor = semver.inc(version, 'minor')
    const patch = semver.inc(version, 'patch')
    const prerelease = semver.inc(version, 'prerelease', 'beta')

    return [
      { title: major, value: major },
      { title: minor, value: minor },
      { title: patch, value: patch },
      { title: prerelease, value: prerelease }
    ]
  }

  const res = await prompts([
    {
      message: '请选择版本号',
      name: 'version',
      type: 'select',
      choices: versionList(pkg.version)
    },
    {
      message: '是否要添加tag？',
      name: 'tag',
      type: 'confirm'
    },
    {
      message: '代码要合并到哪条分支上？',
      name: 'branch',
      type: 'text',
      validate: (value) => {
        if (value.trim()) {
          return true
        } else {
          return '请输入分支名'
        }
      }
    }
  ])

  const { version, branch, tag } = res
  console.log(`
    版本号：${version}
    是否要添加tag: ${tag}
    需要合并的分支: ${branch}
  `)

  const isConfirm = await prompts([
    {
      message: '请确认以上信息是否正确',
      name: 'value',
      type: 'confirm'
    }
  ])

  if (!isConfirm.value) process.exit(1)

  pkg.version = version

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  const branchStr = shell.exec('git branch').stdout
  const currentBranch = branchStr.slice(2, branchStr.match('\n').index)

  console.log('currentBranch', currentBranch)
  console.log('branch', branch)

  shell.exec('git add .')
  shell.exec(`git commit -m 'chore(release): ${version}'`)

  console.log(`git push => ${currentBranch}`)
  shell.exec(`git push -u origin ${currentBranch}`)

  if (currentBranch !== branch) {
    const res = shell.exec(`git checkout ${branch}`)
    if (res.code !== 0 && res.stderr === `error: 路径规格 '${branch}' 未匹配任何 git 已知文件\n`) {
      shell.exec(`git checkout -b ${branch}`)
    }
    shell.exec(`git merge ${currentBranch}`)
    console.log(`git push => ${branch}`)
    shell.exec(`git push -u origin ${branch}`)
  }

  if (tag) {
    console.log(`git tag => ${tag}`)
    shell.exec(`git tag ${version}`)
    shell.exec(`git push origin ${version}`)
  }

  shell.exec('npm publish')

  if (currentBranch !== branch) {
    shell.exec(`git checkout ${currentBranch}`)
  }
}

init().catch((err) => {
  console.log('catch err', err)
})
