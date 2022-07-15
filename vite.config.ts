import { peerDependencies, dependencies } from './package.json'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic'
    }),
    dts({
      insertTypesEntry: true,
      include: 'src'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'react-open-popup',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), ...Object.keys(dependencies)]
    },
    // minify: 'terser',
    // terserOptions: {
    //   compress: true,
    //   keep_classnames: true,
    //   format: {
    //     comments: false
    //   }
    // },
    target: 'esnext',
    sourcemap: true
  }
})
