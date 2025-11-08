export const htmlprompt = `<boltArtifact id="html-css-js-webcontainer" title="HTML/CSS/JS WebContainer Project">
<boltAction type="file" filePath="package.json">{
  "name": "html-css-js-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.2"
  }
}
</boltAction>

<boltAction type="file" filePath="index.html"><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML/CSS/JS Project</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to Your HTML/CSS/JS Project</h1>
    <p>Start building something amazing!</p>
  </div>
  <script src="/script.js"></script>
</body>
</html>
</boltAction>

<boltAction type="file" filePath="styles.css">* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  text-align: center;
}

h1 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 2rem;
}

p {
  color: #666;
  font-size: 1.1rem;
}
</boltAction>

<boltAction type="file" filePath="script.js">// Your JavaScript code goes here

document.addEventListener('DOMContentLoaded', () => {
  console.log('HTML/CSS/JS project loaded!');
  
  // Example: Add interactivity
  const app = document.getElementById('app');
  if (app) {
    app.addEventListener('click', () => {
      app.style.transform = 'scale(0.95)';
      setTimeout(() => {
        app.style.transform = 'scale(1)';
      }, 150);
    });
  }
});
</boltAction>

<boltAction type="file" filePath="vite.config.js">import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
</boltAction>
</boltArtifact>`;

