import prompts from 'prompts'
import minimist from 'minimist'
import semver from 'semver'
import { readFileSync } from 'fs'
import path from 'path'
import shell from 'shelljs'

async function init(){
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    boolean: true
  })

  console.log('argv', argv);  

  const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))

  function versionList(version){
    const major = semver.inc(version, 'major')
    const minor = semver.inc(version, 'minor')
    const patch = semver.inc(version, 'patch')
    const prerelease = semver.inc(version, 'prerelease', 'beta')

    return [
      {title: major, value: major},
      {title: minor, value: minor},
      {title: patch, value: patch},
      {title: prerelease, value: prerelease},
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
      message: '代码要合并到哪条分支上？',
      name: 'branch',
      type: 'text',
      validate: (value) => {
        if(value.trim()){
          return true
        }else{
          return '请输入分支名'
        }
      }
    },
  ])

  const { version, branch } = res
  console.log(`
    版本号：${version}
    分支: ${branch}
  `);

  const isConfirm = await prompts([
    {
      message: '请确认以上信息是否正确',
      name: 'value',
      type: 'confirm'
    }
  ])

  if(!isConfirm.value) process.exit(1)

  const currentBranch = shell.exec('git branch').stdout

  console.log('currentBranch', currentBranch);
  
}

init().catch(err => {
  console.log('catch err', err);
})