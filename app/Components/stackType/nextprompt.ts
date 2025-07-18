export const nextprompt = `<boltArtifact id="nextjs-webcontainer" title="Next.js WebContainer Project">
<boltAction type="file" filePath="package.json">{
  "name": "nextjs-webcontainer-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --hostname 0.0.0.0 --port 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "eslint": "^9.9.1",
    "eslint-config-next": "14.2.3",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35"
  }
}
</boltAction>

<boltAction type="file" filePath="tsconfig.json">{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
</boltAction>

<boltAction type="file" filePath="next-env.d.ts">/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />
</boltAction>

<boltAction type="file" filePath="next.config.js">/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
};
</boltAction>

<boltAction type="file" filePath="tailwind.config.js">/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
</boltAction>

<boltAction type="file" filePath="postcss.config.js">module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
</boltAction>

<boltAction type="file" filePath="styles/globals.css">@tailwind base;
@tailwind components;
@tailwind utilities;
</boltAction>

<boltAction type="file" filePath="pages/_app.tsx">import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
</boltAction>

<boltAction type="file" filePath="pages/index.tsx">export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-medium">Hello Next.js on WebContainer!</h1>
    </main>
  )
}
</boltAction>

<boltAction type="file" filePath=".eslintrc.json">{
  "extends": "next/core-web-vitals",
  "rules": {}
}
</boltAction>
</boltArtifact>`;
