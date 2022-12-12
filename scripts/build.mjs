import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'outfile.cjs',
  format: 'cjs',
  platform: 'node',
  target: 'node14'
})