---
title: 'TDD en el front 5'
subtitle: 'Refactor a React Context'
coverImage: '/assets/blog/js.svg'
collection: 'TDD en el front'
---

### Contenido del Post

# Refactor a React Context

Este post va a ser un ejercicio de refactor. Para evitar problemas de prop drilling (que todavía no tenemos, por eso es un ejercicio) vamos a cambiar el sistema de comunicación entre componentes para user Context y que sean los mismos componentes los que pidan sus dependencias.

> **Aviso** - esto es más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅.

Como no se si me va a gustar el resultado lo primero que hago es cambiarme a una rama nueva:

```bash
git checkout -B react-context
```

Si quieres ver el código final de este post ve a esa rama del repo.

# Añadiendo nuestro Context

Tengo claro es que los test de aceptación no pueden cambiar, y que de los unitarios solo deberíamos cambiar el _given_, es un refactor de la app, no vamos a tocar comportamiento.

Voy a ir trabajando desde fuera hacia dentro (outside-in), modifco App.js para añadir un nuevo componente MoviesProvder:

```js
async function getMovies() {
  const res = await fetch('/movies/');
  return await res.json();
}

async function postMovie({ name }) {
  await fetch('/movies/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

function App() {
  return (
    <MoviesProvider getMovies={getMovies} addMovie={postMovie}>
      <AddMovieForm />
      <MovieList />
    </MoviesProvider>
  );
}
```

Y fallan los test end to end claro:

```bash
 > MoviesProvider is not defined
```

Vamos a crearlo, con lo mímino para pasar los tests:

_src/Contexts/MoviesProvider.js_

```js
export const MoviesContext = createContext();

const MoviesProvider = ({ children }) => {
  return <MoviesContext.Provider>{children}</MoviesContext.Provider>;
};

export default MoviesProvider;
```

Y ahora vamos a eliminar las dependencias. Empezamos moviendo la función de añadir películas, la pasamos del componente al provider:

```js
<MoviesProvider
  addMovie={async ({ name }) => {
    await fetch('/movies/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    refreshMovies();
  }}
>
  <AddMovieForm />
  <MovieList
    getMovies={async () => {
      const res = await fetch('/movies/');
      return await res.json();
    }}
    refresh={refresh}
  ></MovieList>
</MoviesProvider>
```

# Modificando el formulario

Los tests de aceptación nos avisan de que no se está realizando la llamada http:

```bash
CypressError: Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 1st request to the route: `postMovie`. No request ever occurred
```

Exponemos la función desde el context para poder usarla en los componentes:

```js
const MoviesProvider = ({ addMovie, children }) => {
  return (
    <MoviesContext.Provider value={{ addMovie }}>
      {children}
    </MoviesContext.Provider>
  );
};
```

Vamos a cambiar el test unitario para usar el context, cambiamos el given:

```js
function givenTheComponentIsRendered(onSubmit) {
  render(
    <MoviesProvider addMovie={onSubmit}>
      <AddMovieForm />
    </MoviesProvider>
  );
}
```

Ahora los unitarios fallarán porque no se borra el loader, arreglamos el componente pasando de:

```js
const AddMovieForm = ({ onSubmit }) => {
  const [status, setStatus] = useState("INITIAL");
  const [name, setName] = useState("");
```

A traernos la dependencia del context:

```js
const AddMovieForm = () => {
  const [status, setStatus] = useState("INITIAL");
  const [name, setName] = useState("");
  const onSubmit = useContext(MoviesProvider).addMovie;
```

Y ya tenemos todo en verde, aceptación y unitarios.

# Modificando la lista

Seguimos quitando dependencias, en este caso las de la lista del App.js:

```js
function App() {
  return (
    <MoviesProvider
      addMovie={async ({ name }) => {
        await fetch('/movies/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        // PROBLEMA!
        refreshMovies();
      }}
      getMovies={async () => {
        const res = await fetch('/movies/');
        return await res.json();
      }}
    >
      <AddMovieForm />
      <MovieList />
    </MoviesProvider>
  );
}
```

Ese _refreshMovies_ tenemos que moverlo ahora dentro del provider, lo quitamos de app y lo añadimos al provider:

```js
const MoviesProvider = ({ getMovies, addMovie, children }) => {
  const [refresh, setRefresh] = useState(false);

  const refreshMovies = () => {
    if (!getMovies) return;

    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
    }, 50);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  const addMovieWithRefresh = async ({ name }) => {
    await addMovie({ name });
    refreshMovies();
  };

  return (
    <MoviesContext.Provider
      value={{ getMovies, addMovie: addMovieWithRefresh, refresh }}
    >
      {children}
    </MoviesContext.Provider>
  );
};
```

Modificamos los tests y el componente MovieList igual que antes con el formulario. Del _given_ quitamos el refresh, ahora es responsabilidad del provider:

```js
function givenTheComponentIsRendered(getMovies) {
  return render(
    <MoviesProvider getMovies={getMovies}>
      <MovieList />
    </MoviesProvider>
  );
}
```

Modificamos el componente:

```js
const MovieList = () => {
  const [status, setStatus] = useState("LOADING");
  const [movies, setMovies] = useState([]);
  const { getMovies, refresh } = useContext(MoviesContext);
```

Y pasan todos menos el último:

```bash
 FAIL  src/Components/MovieList.test.js
  ✓ Calls getMovies (12 ms)
  ✓ Shows Loader (8 ms)
  ✓ Shows Load Error (5 ms)
  ✓ Shows Empty State (4 ms)
  ✓ Shows Movie List (5 ms)
  ✕ Refreshes Movies (43 ms)
```

Podemos simular la actualización modificando un poco el test:

```js
test('Refreshes Movies', async () => {
  const { rerender } = givenTheComponentIsRendered(() => Promise.resolve([]));

  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));
  expect(screen.getByText('No hay películas añadidas')).toBeInTheDocument();

  const movies = [
    { id: 1, name: 'Matrix' },
    { id: 2, name: 'Dune' },
  ];

  rerender(
    <MoviesProvider getMovies={() => Promise.resolve(movies)}>
      <MovieList />
    </MoviesProvider>
  );
  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));

  movies.forEach((movie) => {
    expect(screen.getByText(movie.id)).toBeInTheDocument();
    expect(screen.getByText(movie.name)).toBeInTheDocument();
  });
});
```

Ya tenemos todos los test en verde y sin embargo hay un warning:

```js
Warning: An update to AddMovieForm inside a test was not wrapped in act(...).
```

Esto suele significar que hay alguna operación asíncrona que no estamos controlando.

# Arreglando bugs

Pues si, después de un rato depurando me doy cuenta de que me salté un caso importando al hacer el formulario. Este es el test que reproduce el bug:

```js
test('Does not call onSubmit on incorrect form', async () => {
  const onSubmit = jest.fn();
  givenTheComponentIsRendered(onSubmit);

  whenFormIsSubmitted();

  expect(onSubmit).toHaveBeenCalledTimes(0);
});
```

Es importante que si el formulario es incorrecto, no se llame a la API 😅. Escribiendo tests cada vez que tengamos un bug nos evitaremos problemas de regresión en el futuro. Para pasar el test:

```js
const AddMovieForm = () => {
  const [status, setStatus] = useState('INITIAL');
  const [name, setName] = useState('');
  const onSubmit = useContext(MoviesContext).addMovie;

  const handleForm = async (e) => {
    e.preventDefault();

    // Validamos el form
    if (!name) {
      setStatus('INVALID_FORM');
      return;
    }

    setStatus('LOADING');

    try {
      await onSubmit({ name });
      setStatus('SUCCESS');
    } catch (error) {
      setStatus('ERROR');
    }
  };

  return (
    <form onSubmit={handleForm}>
      <label htmlFor="name">Nombre</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      // Comprobamos ahora el invalid form
      {status === 'INVALID_FORM' && !name && (
        <div>El nombre es obligatorio</div>
      )}
      {status !== 'LOADING' && <button type="submit">Añadir película</button>}
      {status === 'LOADING' && <div>Añadiendo...</div>}
      {status === 'ERROR' && <div>No se pudo añadir la película</div>}
      {status === 'SUCCESS' && <div>¡Película Añadida!</div>}
    </form>
  );
};
```

Y ahora si, todo en verde de nuevo 🙌.

# Usando el Context como store

Lo último que vamos a hacer es sacar la lógica para obtener las películas de la lista y ponerla en el provider, para que la lista se dedique únicamente a mostrarla. Pasamos de:

```js
const MovieList = () => {
  const [status, setStatus] = useState("LOADING");
  const [movies, setMovies] = useState([]);
  const { getMovies, refresh } = useContext(MoviesContext);

  useEffect(() => {
    if (refresh) {
      setStatus("LOADING");
      getMovies()
        .then((movies) => {
          setStatus("SUCCESS");
          setMovies(movies);
        })
        .catch(() => setStatus("ERROR"));
    }
  }, [getMovies, refresh]);
  .
  .
  .
```

A sacarlo del context:

```js
const MovieList = () => {
  const { status, movies } = useContext(MoviesContext);
  .
  .
  .
```

Y movemos toda esa lógica al provider, que será el storage de las películas ahora:

```js
const MoviesProvider = ({ getMovies, addMovie, children }) => {
  const [status, setStatus] = useState('LOADING');
  const [movies, setMovies] = useState([]);

  const refreshMovies = () => {
    if (!getMovies) return;

    setStatus('LOADING');
    getMovies()
      .then((movies) => {
        setStatus('SUCCESS');
        setMovies(movies);
      })
      .catch(() => setStatus('ERROR'));
  };

  useEffect(() => {
    refreshMovies();
  }, [getMovies]);

  const addMovieWithRefresh = async ({ name }) => {
    await addMovie({ name });

    refreshMovies();
  };

  return (
    <MoviesContext.Provider
      value={{ addMovie: addMovieWithRefresh, status, movies }}
    >
      {children}
    </MoviesContext.Provider>
  );
};
```

Y todo sigue en verde, en teoría no hemos roto nada, no puedo evitar hacer una pruebilla manual para comprobarlo 😂.

# Fin del quinto post

Hemos comprobado lo útiles que son los tests al refactorizar, podríamos cambiar ahora a usar un UseReducer o React Redux para manejar el estado. O alguna librería para formularios. Y tenemos confianza en que no vamos a romper nada que funcionase antes.

> Tener confianza no significa que al 100% no vamos a romper nada, pero sabemos que la probabilidad de romper algo es mucho menor que sin tests. Y que si se rompe algo, el tiempo en arreglarlo será menor.

También hemos visto como tratar los bugs, creamos un test primero que confirme el error, y luego lo resolvemos.

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/tdd-en-el-front/tree/react-context), esta es la rama del experimento con Context, y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
