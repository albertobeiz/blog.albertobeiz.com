---
title: 'TDD en el front 4'
subtitle: 'Comunicación entre componentes'
coverImage: '/assets/blog/js.svg'
date: '2022-02-19'
collection: 'TDD en el front'
---

### Contenido del Post

# Comunicación entre componentes

Ya tenemos nuestros dos componentes con sus tests unitarios y funcionando como queremos, falta unirlo todo terminando nuestro test de aceptación.

> **Aviso** - esto es más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅.

# Arreglando el primer escenario

Está fallando porque no encuentra el empty state:

```bash
AssertionError: Timed out retrying after 4000ms: Expected to find content: 'No movies in your list' but never did.
```

Para arreglarlo hay que interceptar la llamada http y devolver una lista vacía.

Voy a aprovechar el método Before, que se ejecuta antes de cada escenario, para agrupar todos los intercepts. Esto no tiene que ser asi en todos los tests, pondremos cada intercept en su step, pero en este caso nos servirá más adelante.

Movemos el POST que teníamos en _I add a movie with name {string}_ (seguirá funcionando gracias al _.as('postMovie')_) y añadimos el intercept para GET devolviendo _[]_

_cypress/integration/AddMovie/steps.js_

```js
Before(() => {
  cy.intercept({ url: '/movies/', method: 'GET' }, []);
  cy.intercept({ url: '/movies/', method: 'POST' }, {}).as('postMovie');
});
```

Y cambiamos el mensaje que taníamos en inglés:

```js
Then('I see an empty list', () => {
  cy.contains('No hay películas añadidas');
});
```

Con esto ya tenemos en verde el primer test y ahora toca resolver el error en el segundo:

```bash
1) Add Movie to the list
       Add a movie to empty list:
     AssertionError: Timed out retrying after 4000ms: Expected to find content: '1' but never did.
```

# Arreglando el segundo escenario

Para pasar este test tendremos que pasar de alguna manera los que nos llega al post. De nuevo, esta forma de hacerlo nos vale en este caso, en escenarios más complejos es mejor ir poniendo cada intercept en su sitio.

```js
Before(() => {
  // películas "en el servidor"
  const movies = [];

  cy.intercept({ url: '/movies/', method: 'GET' }, (req) => {
    // devolvemos la lista de películas
    req.reply(movies);
  });

  cy.intercept({ url: '/movies/', method: 'POST' }, (req) => {
    // Añadimos la película al servidor
    movies.push({ id: movies.length + 1, name: req.body.name });

    // Respuesta vacía
    req.reply({});
  }).as('postMovie');
});
```

Y para hacerlo pasar refrescamos las películas al iniciar la App y después de cada post:

```js
function App() {
  const [refresh, setRefresh] = useState(false);

  const refreshMovies = () => {
    setRefresh(true);

    // Volvemos a false porque el refresh del componente
    // salta cuando pasamos de false a true
    setTimeout(() => {
      setRefresh(false);
    }, 50);
  };

  useEffect(() => {
    // Refresh inicial
    refreshMovies();
  }, []);

  return (
    <div>
      <AddMovieForm
        onSubmit={async ({ name }) => {
          await fetch('/movies/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });

          // Refresh inicial
          refreshMovies();
        }}
      />

      <MovieList
        getMovies={async () => {
          const res = await fetch('/movies/');
          return await res.json();
        }}
        // Refresh prop
        refresh={refresh}
      ></MovieList>
    </div>
  );
}
```

Y si lanzamos los tests:

```bash
Add Movie to the list
    ✓ Empty movies list (2047ms)
    ✓ Add a movie to empty list (1132ms)


  2 passing (6s)
```

🥳 ¡Lo conseguimos! Es un método muy mejorable pero nos vale por ahora, y además tenemos muchos tests para refactorizarlo en el futuro.

# Se nos ha olvidado un escenario

Con tanta emoción nos hemos olvidado de un escenario importante, añadir un elemento a una lista con elementos:

```gherkin
Scenario: Add a movie to a list with items
    Then I have a list with:
      | id | name |
      | 1  | Dune |
    When I visit the site
    And I add a movie with name "Matrix"
    Then I see a list with:
      | id | name   |
      | 1  | Dune   |
      | 2  | Matrix |
```

Modificamos el método Before para poder acceder a la lista de películas desde fuera:

```js
let movies = [];

Before(() => {
  movies = [];
```

Creamos el step que falta:

```js
Given('I have a list with:', (dataset) => {
  dataset.rawTable.slice(1).forEach(([index, movieName]) => {
    movies.push({ id: index, name: movieName });
  });
});
```

Y lanzamos los tests:

```bash
 Add Movie to the list
    ✓ Empty movies list (2046ms)
    ✓ Add a movie to empty list (1070ms)
    ✓ Add a movie to a list with items (495ms)
```

Vaya 😅 el test pasa porque hicimos un poco de trampa y programamos la primera carga sin que ningún test de aceptación lo pidiera.

# ¿Y esto funciona?

Si te paras un momento, no hemos abierto el navegador en todo el proceso de desarrollo. Se puede desarrollar lógica de frontend sin abrir el navegador (obviamente para aplicar estilos hay que verlo 😂).

Si quieres comprobarlo puedes hacerlo lanzando el front en una terminal (no va a funcionar porque no hay backend):

```bash
npm start
```

Y ahora lanza cypress con _open_ para ver el navegador:

```bash
npx cypress open
```

Lanza los tests y cuando pasen puedes usar el formulario para añadir películas. Esto funciona gracias a tener la lista _movies_ en el archivo de los steps:

![image](/images/cypress.png)

¡Y funciona todo! La primera carga, los loaders y el manejo de errores. Puedes dejar cypress abierto y jugar con los intercepts para ver todos los casos posibles.

# Fin del cuarto post

Nuestra primera feature está terminada. Hemos terminado el test de aceptación añadiendo la comunicación entre componentes y hemos comprobado que todo funciona con un test manual muy rápido. Solo faltaría añadir estilos, pero los posts sobre eso se los dejo a los profesionales 😅.

Aún queda algo que no me convence, estamos manejando todo por _props_ y podemos tener problemas de prop drilling. En el próximo post vamos a probar a usar Context para evitarlo y ver si los tests nos ayudan con este cambio.

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/tdd-en-el-front) y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
