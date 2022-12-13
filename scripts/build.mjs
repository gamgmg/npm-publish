import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'outfile.cjs',
  // bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node14'
})