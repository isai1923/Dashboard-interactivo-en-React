// deploy.js corregido
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando despliegue...');

try {
  // Verificar que existe la carpeta build
  if (!fs.existsSync(path.join(__dirname, 'build'))) {
    console.log('📦 Creando build...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Verificar contenido del build
  console.log('📁 Contenido de la carpeta build:');
  execSync('ls -la build/', { stdio: 'inherit' });
  
  console.log('📁 Contenido de build/data:');
  execSync('ls -la build/data/', { stdio: 'inherit' });

  // Desplegar (sin --force)
  console.log('🌐 Desplegando a GitHub Pages...');
  execSync('npx gh-pages -d build --branch gh-pages --repo https://github.com/isai1923/Dashboard-interactivo-en-React.git', { stdio: 'inherit' });
  
  console.log('✅ ¡Despliegue completado!');
  console.log('🌍 Tu dashboard está en: https://isai1923.github.io/Dashboard-interactivo-en-React/');
  
} catch (error) {
  console.error('❌ Error en el despliegue:', error.message);
  process.exit(1);
}