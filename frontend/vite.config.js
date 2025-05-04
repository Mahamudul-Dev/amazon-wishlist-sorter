import { defineConfig, loadEnv } from 'vite'
import { resolve } from "path";
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



// https://vite.dev/config/
// export default defineConfig(({mode})=>{
//   const env = loadEnv(mode, process.cwd())
//   return {
//     plugins: [react(),  tailwindcss()],
//     build: {
//       outDir: resolve(__dirname, "./dist"), // Output build to /dist
//       emptyOutDir: true,
//     },
    // define: {
    //   'process.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE),
    // }
//   }
// });


export default defineConfig({
  plugins: [react(),  tailwindcss()],
});
