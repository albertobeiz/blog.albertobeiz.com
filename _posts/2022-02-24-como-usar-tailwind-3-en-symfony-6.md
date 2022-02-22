---
title: 'Como usar Tailwind v3 en Symfony v6'
subtitle: 'Proceso de instalación en 2 minutos'
coverImage: '/assets/blog/symfony.svg'
date: '2022-02-24'
tags: [tailwind, symfony]
---

### Contenido del Post

# Tailwind y Symfony

He tenido que instalar Tailwind en Symfony hace poco y la mayoría de posts y tutoriales que he visto tenía algún detalle que no funcionaba, seguramente por usar versiones anteriores. Asi que voy a documentar el proceso rápidamente.

# Iniciando el proyecto

Creamos un proyecto nuevo en Symfony:

```bash
symfony new tailwind-symfony
cd tailwind-symfony
```

Instalamos Webpack Encore y Twig:

```bash
composer require symfony/twig-bundle
composer require symfony/webpack-encore-bundle
```

Y las dependencias de npm:

```bash
npm i autoprefixer postcss-loader tailwindcss
```

# Creando el controller

Añadimos el controller más sencillo posible:

```php
class HomeController extends AbstractController
{
    #[Route('/')]
    public function __invoke(): Response
    {
        return $this->render('home.html.twig');
    }
}
```

Y creamos el template con algunas clases de tailwind:

```html
{% extends 'base.html.twig' %} {% block body %}
<div class="flex justify-center mt-[200px]">
  <h1 class="text-2xl text-blue-600">Tailwind & Symfony</h1>
</div>
{% endblock %}
```

# Lanzando el proyecto

Necesitamos dos terminales, una con:

```bash
symfony serve
```

y otra con:

```bash
npm run watch
```

Y vemos que no funcionan los estilos de Tailwind:

![Cypress launcher](/images/tailwind-1.png)

# Configurando Tailwind

Modificamos _assets/styles/app.css_:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: lightgray;
}
```

Iniciamos Tailwind en la terminal:

```bash
npx tailwind init
```

Que creará el archivo _tailwind.config.js_. Vamos a modificarlo para indicarle la ruta a nuestros templates:

```js
module.exports = {
  content: ['./templates/**/*.html.twig'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Creamos el archivo _postcss.config.js_:

```js
let tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [tailwindcss('./tailwind.config.js'), require('autoprefixer')],
};
```

Y añadimos _.enablePostCssLoader()_ al final de _webpack.config.js_

```js
const Encore = require('@symfony/webpack-encore');
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore.setOutputPath('public/build/')
  .setPublicPath('/build')
  .addEntry('app', './assets/app.js')
  .enableStimulusBridge('./assets/controllers.json')
  .splitEntryChunks()
  .enableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  .enableVersioning(Encore.isProduction())
  .configureBabel((config) => {
    config.plugins.push('@babel/plugin-proposal-class-properties');
  })
  .configureBabelPresetEnv((config) => {
    config.useBuiltIns = 'usage';
    config.corejs = 3;
  })

  // Activamos postcss
  .enablePostCssLoader();

module.exports = Encore.getWebpackConfig();
```

Y ahora si, ya funcionan los estilos de Tailwind:

![Cypress launcher](/images/tailwind-2.png)

# Para subir a producción

Para hacer el build de producción hay que usar:

```bash
npm run build
```

Ya tenemos configurado Tailwind en Symfony 🥳

Puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
