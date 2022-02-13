---
draft: true
title: 'ATDD en el front 1'
subtitle: 'El primer test de aceptación'
coverImage: '/assets/blog/symfony.svg'
date: '2022-01-03'
collection: 'ATDD en el front 1'
---

Llevo un tiempo practicando ATDD en el backend, con Symfony PHP y me apetece probar a hacerlo de forma "rigurosa" en el front.

**Aviso** - esto va a ser más un cuaderno de notas que un post. No esperes largas explicaciones o justificaciones sobre cada decisión tomada 😅

La aplicación que crearemos será una lista de películas. Podremos ir añadiendo las que vamos viendo.

# El primer test de aceptación

Para empezar creamos una nueva carpeta para el proyecto

```bash
mkdir atddd-en-el-front
```

y dentro una carpeta Features donde irán los tests de aceptación

```
atdd-en-el-front
├── Features
    └── addMovie.feature
```

Empezamos la aplicación con el escenario más sencillo, ver una lista de tareas vacía

```gherkin
Feature: Add Tasks into the To-do list
  As User
  I want to add tasks to a todo list
  So that I can manage the things I have to do

  Scenario: Empty to-do list
    Given I have no tasks in my list
    When I get my tasks
    Then I see an empty list
```

Genial, ya tenemos nuestro primer test...¿cómo lo ejecutamos?

```bash
npm init
npm install cypress
```

aa
