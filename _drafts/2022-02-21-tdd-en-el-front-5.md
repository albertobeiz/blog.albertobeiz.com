---
title: 'TDD en el front 5'
subtitle: 'Refactor a React Context'
coverImage: '/assets/blog/js.svg'
date: '2022-02-21'
collection: 'TDD en el front'
---

### Contenido del Post

# Refactor a React Context

Este post va a ser un ejercicio de refactor. Para evitar problemas de prop drilling (que todavía no tenemos, por eso es un ejercicio) vamos a cambiar el sistema de comunicación entre componentes para user Context y que sean los mismos componentes los que pidan sus dependencias.

> **Aviso** - esto es más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅 y por supuesto no es el post de un experto en el tema.

Como no se si me va a gustar el resultado lo primero que hago es cambiarme a una rama nueva:

```bash
git checkout -B react-context
```

Si quieres ver el código final de este post ve a esa rama del repo.

# Añadiendo nuestro Context

Lo primero que tengo claro es que los test de aceptación no pueden cambiar, es un refactor de la app. En cada paso que demos tenemos esa red de seguridad.

Para empezar creo un Context, de momento lo exporto desde App.js:

```js
export const MoviesContext = createContext({
  status: 'LOADING',
  movies: [],
});
```

Y voy a cambiar los tests de mi MovieList para que usen este nuevo context. Cambiamos el given para usar el nuevo provider:

```js
function givenTheComponentIsRendered(status, movies = []) {
  return render(
    <MoviesContext.Provider value={{ status, movies }}>
      <MovieList />
    </MoviesContext.Provider>
  );
}
```

Si ejecutamos los tests asi:

```js
npm t -- --verbose
```

Jest nos dará una lista muy útil sobre que tests pasan y que tests no:

```bash
 FAIL  src/Components/MovieList.test.js
  ✕ Calls getMovies (10 ms)
  ✓ Shows Loader (8 ms)
  ✕ Shows Load Error (1018 ms)
  ✕ Shows Empty State (1013 ms)
  ✕ Shows Movie List (1016 ms)
  ✕ Refreshes Movies (1015 ms)
```

Se ha roto casi todo, como era previsible 😅. Vamos a eliminar el primer test porque ahora la responsabilidad de llamar a la API no es del componente, el segundo test pasa, asi que arreglamos el tercer test. Quitamos la promesa del given y el wait, ahora trabajamos con strings (en el mundo real con un enumerado o constantes) y nuestro componente no se preocupa de asincronías:

```js
test('Shows Load Error', async () => {
  givenTheComponentIsRendered('ERROR');
  expect(screen.getByText('No se pudo cargar la lista')).toBeInTheDocument();
});
```

Para hacerlo pasar, modificamos nuestro componente. Borramos todo el useEffect y el valor del status lo extraemos del context:

```js
const MovieList = ({ getMovies, refresh }) => {
  const status = useContext(MoviesContext).status;
  const [movies, setMovies] = useState([]);

  return (
    <div>
      {status === 'LOADING' && <p>Cargando películas...</p>}
      {status === 'ERROR' && <p>No se pudo cargar la lista</p>}

      {status === 'SUCCESS' && (
        <>
          {movies.length === 0 && <p>No hay películas añadidas</p>}
          <ul>
            {movies &&
              movies.map((movie) => (
                <li key={movie.id}>
                  <span>{movie.id}</span> - <span>{movie.name}</span>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
};
```

Y ahora pasa el test...pero hemos roto el anterior 🤦🏼‍♂️:

```bash
FAIL  src/Components/MovieList.test.js
  ✕ Shows Loader (14 ms)
  ✓ Shows Load Error (3 ms)
  ✕ Shows Empty State (2 ms)
  ✕ Shows Movie List (2 ms)
  ✕ Refreshes Movies (1 ms)
```

Como ya vemos por donde va la cosa, voy a permitirme modificar todos los tests menos el último:

```js
test('Shows Loader', () => {
  givenTheComponentIsRendered('LOADING');
  expect(screen.getByText('Cargando películas...')).toBeInTheDocument();
});

test('Shows Load Error', async () => {
  givenTheComponentIsRendered('ERROR');
  expect(screen.getByText('No se pudo cargar la lista')).toBeInTheDocument();
});

test('Shows Empty State', async () => {
  givenTheComponentIsRendered('SUCCESS', []);
  expect(screen.getByText('No hay películas añadidas')).toBeInTheDocument();
});

test('Shows Movie List', async () => {
  const movies = [
    { id: 1, name: 'Matrix' },
    { id: 2, name: 'Dune' },
  ];

  givenTheComponentIsRendered('SUCCESS', movies);
  movies.forEach((movie) => {
    expect(screen.getByText(movie.id)).toBeInTheDocument();
    expect(screen.getByText(movie.name)).toBeInTheDocument();
  });
});
```

Y para hacerlos pasar, un pequeño cambio en la constante movies:

```js
const MovieList = () => {
  const status = useContext(MoviesContext).status;
  const movies = useContext(MoviesContext).movies;
```

¡Vamos bien!

```bash
 FAIL  src/Components/MovieList.test.js
  ✓ Shows Loader (13 ms)
  ✓ Shows Load Error (3 ms)
  ✓ Shows Empty State (3 ms)
  ✓ Shows Movie List (4 ms)
  ✕ Refreshes Movies (2 ms)
```

El último test debería ser ahora más sencillo:

```js
test('Refreshes Movies', async () => {
  const movies = [
    { id: 1, name: 'Matrix' },
    { id: 2, name: 'Dune' },
  ];

  const { rerender } = givenTheComponentIsRendered('SUCCESS', []);
  expect(screen.getByText('No hay películas añadidas')).toBeInTheDocument();

  rerender(
    <MoviesContext.Provider value={{ status: 'SUCCESS', movies }}>
      <MovieList />
    </MoviesContext.Provider>
  );

  movies.forEach((movie) => {
    expect(screen.getByText(movie.id)).toBeInTheDocument();
    expect(screen.getByText(movie.name)).toBeInTheDocument();
  });
});
```

Que pasará sin problemas, creo que este test al ser todo síncrono no aporta mucho.

```bash
 PASS  src/Components/MovieList.test.js
  ✓ Shows Loader (16 ms)
  ✓ Shows Load Error (7 ms)
  ✓ Shows Empty State (3 ms)
  ✓ Shows Movie List (4 ms)
  ✓ Refreshes Movies (5 ms)
```

Nuestro componente MovieList es ahora mucho más simple. Pero la complejidad esencial ni se crea ni se destruye, se traslada 😂.

# Modificando App.js

Ahora todos nuestros test de aceptación fallan claro, tenemos que llevar toda la lógica que teníamos en la lista a otro sitio. Voy empezar llevándomelo a App.js:

```js
export const MoviesContext = createContext();

async function getMovies() {
  const res = await fetch('/movies/');
  return await res.json();
}

async function postMovie(name) {
  await fetch('/movies/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

function App() {
  const [moviesContext, setMoviesContext] = useState({
    movies: [],
    status: 'LOADING',
  });

  // Ahora es refresh movies el que se encarga
  // de la llamada a la API
  const refreshMovies = async () => {
    setMoviesContext({ movies: [], status: 'LOADING' });

    try {
      const movies = await getMovies();
      setMoviesContext({ movies, status: 'SUCCESS' });
    } catch (error) {
      setMoviesContext({ movies: [], status: 'ERROR' });
    }
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  return (
    <MoviesContext.Provider value={moviesContext}>
      <AddMovieForm
        onSubmit={async ({ name }) => {
          await postMovie(name);
          refreshMovies();
        }}
      />

      <MovieList />
    </MoviesContext.Provider>
  );
}
```

Tenemos los test de aceptación en verde otra vez, pero este diseño no me convence, hay demasiado código fuera de los tests unitarios. Vamos a intentar mejorarlo un poco.

# Extrayendo el context a un componente

# Fin del quinto post

Nuestra primera feature está terminada. Hemos terminado el test de aceptación añadiendo la comunicación entre componentes y hemos comprobado que todo funciona con un test manual muy rápido. Solo faltaría añadir estilos, pero los posts sobre eso se los dejo a los profesionales 😅.

Aún queda algo que no me convence, estamos manejando todo por _props_ y podemos tener problemas de prop drilling. En el próximo post vamos a probar a usar Context para evitarlo y ver si los tests nos ayudan con este cambio.

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/tdd-en-el-front/tree/react-context), esta es la rama del experimento con Context, y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
