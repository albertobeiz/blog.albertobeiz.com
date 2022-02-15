---
title: 'ATDD en el front 2'
subtitle: 'Empezando el ciclo ATDD'
coverImage: '/assets/blog/symfony.svg'
date: '2022-02-14'
collection: 'ATDD en el front'
---

### Contenido del Post

# ATDD en el front 2

Intro

> **Aviso** - esto va a ser más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅 y por supuesto no es el post de un experto en el tema.

# Nuestro primer gran refactor

En esta segunda sesión de ATDD ya he decido que voy a usar React para mi aplicación. Asi que...¡toca cambio de framework!

Esta es una de las grandes ventajas de los tests, podemos cambiar lo que queramos que tenemos una red de seguridad para evitar desastres.

Creamos nuestra app usando create-react-app

```bash
npx create-react-app atdd-en-el-front
```

Volvemos a seguir el paso anterior para dejarlo todo configurado. Instalamos cypress:

```bash
npm i cypress cypress-cucumber-preprocessor
npx cypress open
```

Decimos que queremos borrar los archivos y configuramos el plugin:

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

Recuperamos los steps y hacemos un pequeño cambio de puerto, ahora nuestro server va en el 3000:

_cypress/integration/AddMovie/steps.js_

```js
/* eslint-disable no-undef */
/// <reference types="Cypress" />
import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I have no movies in my list', () => {});

When('I visit the site', () => {
  cy.visit('http://localhost:3000/');
});

Then('I see an empty list', () => {
  cy.contains('No movies in your list');
});
```

Recuperamos nuestra feature:

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

Ahora podemos lanzar el server:

```bash
npm start
```

Y tirar los tests:

```bash
npx cypress run
```

El test falla en el tercer paso porque no encuentra el contenido, modificamos App.js:

_src/App.js_

```js
import './App.css';

function App() {
  return <div>No movies in your list</div>;
}

export default App;
```

Y ya tenemos, gracias a la magia de los tests, la certeza de que lo que funcionaba en nuestro anterior proyecto, funciona en este.

### Segundo test de aceptación

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

  Scenario: Empty movies list
    Given I have no movies in my list
    When I visit the site
    And I add a movie with name "Matrix"
    Then I see a list with:
      | id | Name   |
      | 1  | Matrix |
```

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/atdd-en-el-front) y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
