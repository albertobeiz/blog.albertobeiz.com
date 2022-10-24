---
title: 'TDD en el front 1'
subtitle: 'El primer test de aceptación'
coverImage: '/assets/blog/js.svg'
collection: 'TDD en el front'
---

### Contenido del Post

# TDD en el front

En mi día a día practico TDD en el backend, es un proceso que cada vez tengo más interiorizado y me sale de forma natural. Tengo mi test de aceptación que me sirve para validar mi feature y voy desarrollándola usando ciclos de TDD hasta que el test de aceptación pasa.

Pero ¿y el front? Programo el front con Angular o React normalmente y aunque intento testear las partes más importantes no soy ni de lejos igual de riguroso que en el back. Asi que voy a crear una pequeña aplicación que usaré para intentar llegar a ese punto, o al menos aprender mejores prácticas.

> **Aviso** - esto va a ser más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅.

La aplicación que voy a crear es una lista de películas. Podremos ir añadiendo las que vamos viendo.

# El primer test de aceptación

Voy a exagerarlo todo un poco y a empezar desde absolutamente cero, creando una nueva carpeta para el proyecto:

```bash
mkdir tdd-en-el-front
```

Dentro creamos nuestra primera feature, añadir películas, en este caso voy a hacer los test de aceptación usando lenguaje Gherkin.

Empezamos la aplicación con el escenario más sencillo, ver una lista de películas vacía:

_AddMovie.feature_

```gherkin
Feature: Add Movie to the list
  As a User
  I want to add movies to a list
  So that I can track the movies I've seen

  Scenario: Empty movies list
    Given I have no movies in my list
    When I visit the site
    Then I see an empty list
```

Genial, ya tenemos nuestro primer test, pero...¿cómo lo ejecutamos?

# Configurando el entorno

Necesitamos alguna herramienta que nos permita ejecutar este tipo de tests, después de investigar un poco voy a probar con Cypress.

Iniciamos el proyecto node e instalamos cypress:

```bash
npm init
npm install cypress
```

Abrimos cypress por primera vez para que nos genere las carpetas necesarias (podemos hacer click en en eliminar los archivos generados, no los necesitamos):

```bash
npx cypress open
```

Instalamos el plugin para poder ejecutar tests escritos con Gherkin:

```bash
npm install cypress-cucumber-preprocessor
```

Este plugin requiere de unos cuantos pasos de configuración. Añadirlo a la lista de plugins, modificar la configuración de Cypress (aprovechamos para decirle que no nos genere screenshots ni videos para aligerar los tests) y un pequeño añadido al package.json.

_cypress/plugins/index.js_

```javascript
const cucumber = require('cypress-cucumber-preprocessor').default;

module.exports = (on, config) => {
  on('file:preprocessor', cucumber());
};
```

_cypress.json_

```json
{
  "testFiles": "**/*.feature",
  "screenshotOnRunFailure": false,
  "video": false
}
```

_package.json_

```json
"cypress-cucumber-preprocessor": {
  "nonGlobalStepDefinitions": true
}
```

Con esto deberíamos poder lanzar los tests tanto con **cypress open** como con desde la terminal con **cypress run**.

# Ejecutando el test

Pues con todo configurado, movemos nuestro test a la carpeta correspondiente:

_cypress/integration/AddMovie.feature_

```gherkin
Feature: Add Movie to the list
  As a User
  I want to add movies to a list
  So that I can track the movies I've seen

  Scenario: Empty movies list
    Given I have no movies in my list
    When I visit the site
    Then I see an empty list
```

Y lo lanzamos:

```bash
npx cypress run
```

¡Éxito! Ya tenemos nuestro primer test de aceptación fallando.

```bash
0 passing (768ms)
1 failing

1) Add Tasks into the To-do list
      Empty to-do list:
    Error: Step implementation missing for: I have no movies in my list
```

Ahora toca ir resolviendo uno por uno cada error que veamos.

# Implementando los steps

Vemos que no encuentra la implementación del primer step asi que vamos al lío. Creamos el archivo de steps:

_cypress/integration/AddMovie/steps.js_

```js
/// <reference types="Cypress" />
import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I have no movies in my list', () => {});
```

Y volvemos a lanzar el test:

```bash
npx cypress run
```

¡Ha pasado! El mensaje de error ha cambiado.

```bash
Error: Step implementation missing for: I visit the site
```

De momento no tenemos mucho más que hacer por aquí. Ahora vemos que necesitamos implementar el segundo paso.

_cypress/integration/AddMovie/steps.js_

```js
/// <reference types="Cypress" />
import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I have no movies in my list', () => {});

When('I visit the site', () => {
  cy.visit('http://localhost:8080/');
});
```

Si ejecutamos el test veremos que falla porque no puede acceder al sitio.

```bash
CypressError: `cy.visit()` failed trying to load:
http://localhost:8080/
```

La forma más sencilla de hacer pasar este paso es crear un archivo html:

_src/index.html_

```html
¡Hola Mundo!
```

Y ejecutar un server en local:

```bash
npx http-server src
```

Y con el server corriendo, volvermos a tirar el test.

```bash
Error: Step implementation missing for: I see an empty list
```

Vemos que ya el error es debido al último step, asi que lo implementamos y volvemos a lanzarlo.

```js
/// <reference types="Cypress" />
import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I have no movies in my list', () => {});

When('I visit the site', () => {
  cy.visit('http://localhost:8080/');
});

Then('I see an empty list', () => {
  cy.contains('No movies in your list');
});
```

Lo cual dará el siguiente error:

```bash
AssertionError: Timed out retrying after 4000ms: Expected to find content: 'No movies in your list' but never did.
```

Modificamos el archivo index.html para pasar el test y volvemos a lanzarlo.

_src/index.html_

```html
No movies in your list
```

¡Test en verde!

```bash
Add Movie to the list
    ✓ Empty movies list (470ms)

  1 passing (4s)
```

Ya tenemos nuestro primer test de aceptación funcionando, y sin tirar una sola línea de código.

# Fin del primer post

Hemos visto como configurar todo el entorno para poder ejecutar los tests de aceptación.

Hemos resuelto el primero sin necesidad de entrar en el ciclo de TDD (ni que estuviera preparado 😅).

En el siguiente post vamos a crear el formulario para añadir películas y entonces si que entraremos en el mundo de los tests unitarios con Jest.

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/tdd-en-el-front) y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
