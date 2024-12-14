import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      'main': 'src/main.ts',
    },
    outDir: 'dist',
    format: ['esm'],
    dts: false,
    sourcemap: false,
    clean: true,
    tsconfig: './tsconfig.json',
    external: [],
  },
])
