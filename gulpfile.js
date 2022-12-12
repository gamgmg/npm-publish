const { watch } = require('gulp')
const shell = require('shelljs')

function build(cb){
  shell.exec('pnpm build')
  cb()
}

watch('src/**/*.ts', build)
