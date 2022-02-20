---
title: 'TDD en el front 3'
subtitle: 'Mocks y Asíncronía'
coverImage: '/assets/blog/js.svg'
date: '2022-02-17'
collection: 'TDD en el front'
---

### Contenido del Post

# Mocks y Asíncronía

Por fin tenemos funcionando todo el sistema de testing, tanto los de aceptación con cypress y gherkin como los unitarios con jest 🥳 Ahora es cuando empezamos a coger velocidad de crucero y nuestro proceso de desarrollo será:

1. Escribir el test de aceptación
2. Implementar el primer step que falle
3. Implementar mediante TDD los casos especiales (errores, loaders...)
4. Implementar mediante TDD el código necesario para hacer pasar el step
5. Volver al paso 2 hasta que el test de aceptación pase completamente

> **Aviso** - esto es más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅.

# La llamada a la API

Algo que puede pasar, y pasa, es que nos demos cuenta de algo cuando ya tenemos el test pasando. Por ejemplo, no estamos comprobando que ocurra una llamada a la API para guardar la película. Tenemos que modificar un poco el step que ya teníamos en verde:

```js
When('I add a movie with name {string}', (movieName) => {
  cy.intercept({ url: '/movies/', method: 'POST' }, {}).as('postMovie');

  cy.get('input[id=name]').type(movieName);
  cy.get('button[type=submit]').click();

  cy.wait('@postMovie')
    .its('request.body')
    .should('deep.equal', { name: movieName });
});
```

Con esto comprobamos que se realiza la llamada, y que lleva el payload correcto.El test falla avisándonos de que no ocurre tal cosa:

```bash
CypressError: Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 1st request to the route: `postMovie`. No request ever occurred.
```

Para implementarlo necesitamos algún mecanismo para que al enviar el formulario se realice esa llamada. Pero no queremos que la llamada http ocurra en el Componente, no queremos tener que doblar el fetch, mucho trabajo.

La forma más sencilla que se me ocurre por ahora es pasar una función _onSubmit_ por props, tendremos que comprobar al menos tres situaciones:

1. La llamada está en curso (loader)
2. La llamada falla
3. Todo funciona

## 1. La llamada está en curso

Preparamos el test, comprobamos que el botón de submit se oculta y que se muesta el loader:

```js
test('Shows loader on correct submit', () => {
  givenTheComponentIsRendered();

  whenFormIsCorrect();
  whenFormIsSubmitted();

  expect(screen.queryByText('Añadir película')).toBeNull();
  expect(screen.getByText('Añadiendo...')).toBeInTheDocument();
});
```

Y hacemos una implementación con el mínimo código posible, no hay que preocuparse por ahora de asíncronías ni nada porque podemos hacer pasar el test usando el estado de _submitted_.

```js
const AddMovieForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');

  const handleForm = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleForm}>
      <label htmlFor="name">Nombre</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      {submitted && !name && <div>El nombre es obligatorio</div>}
      {!submitted && <button type="submit">Añadir película</button>}
      {submitted && <div>Añadiendo...</div>}
    </form>
  );
};
```

Y vemos el test en verde, seguimos.

## 2. La llamada falla

Preparamos el test:

```js
test('Shows error message when fails', () => {
  givenTheComponentIsRendered();

  whenFormIsCorrect();
  whenFormIsSubmitted();

  expect(screen.queryByText('Añadiendo...')).toBeNull();
  expect(screen.getByText('No se pudo añadir la película')).toBeInTheDocument();
});
```

Ya vemos que para hacer pasar este tendríamos que borrar el loader, lo cual haría fallar el anterior test. Necesitamos una dependencia que podamos controlar desde el test, modificamos nuestro render con una función que pasamos por props:

```js
function givenTheComponentIsRendered(onSubmit) {
  render(<AddMovieForm onSubmit={onSubmit} />);
}
```

Y asi poder forzar en el test un fallo. Ahora si que tenemos que pesar en la asincronía y usar el método _waitForElementToBeRemoved_ para evitar mensajes de cambios de estado fuera del método act():

```js
test('Shows error message when fails', () => {
  givenTheComponentIsRendered(() => Promise.reject('ERROR'));

  whenFormIsCorrect();
  whenFormIsSubmitted();

  expect(screen.queryByText('Añadiendo...')).toBeNull();
  expect(screen.getByText('No se pudo añadir la película')).toBeInTheDocument();
});
```

Y para hacer pasar el test voy a refactorizar un poco y evitar el uso de booleanos para modelar el estado. Si ningún test anterior falla, no he roto nada:

```js
const AddMovieForm = ({ onSubmit }) => {
  const [status, setStatus] = useState('INITIAL');
  const [name, setName] = useState('');

  const handleForm = async (e) => {
    e.preventDefault();
    setStatus('LOADING');

    try {
      await onSubmit();
    } catch (error) {
      setStatus('ERROR');
    }
  };

  return (
    <form onSubmit={handleForm}>
      <label htmlFor="name">Nombre</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      {status !== 'INITIAL' && !name && <div>El nombre es obligatorio</div>}
      {status !== 'LOADING' && <button type="submit">Añadir película</button>}
      {status === 'LOADING' && <div>Añadiendo...</div>}
      {status === 'ERROR' && <div>No se pudo añadir la película</div>}
    </form>
  );
};
```

Ahora vemos que falla el test anterior:

```bash
 FAIL  src/Components/AddMovieForm.test.js
  ✓ Hides name required message on start (16 ms)
  ✓ Shows name required message on bad submit (36 ms)
  ✓ Hides name required message on correct submit (21 ms)
  ✕ Shows loader on correct submit (20 ms)
  ✓ Shows error message when fails (16 ms)
```

Falta pasar como función una promesa que no resuelva nunca:

```js
test("Shows loader on correct submit", () => {
  givenTheComponentIsRendered(() => new Promise(() => {}));
```

Gracias a que encapsulamos el render en una función podemos añadir parámetros por defecto y que no se rompan nuestros tests anteriores si fuera necesario 🙌

## 3. Todo funciona

Preparamos el test del happy path:

```js
test('Shows success message', async () => {
  givenTheComponentIsRendered(() => Promise.resolve());

  whenFormIsCorrect();
  whenFormIsSubmitted();

  await waitForElementToBeRemoved(screen.queryByText('Añadiendo...'));
  expect(screen.getByText('¡Película Añadida!')).toBeInTheDocument();
});
```

Y añadimos el control del success en el componente:

```js
const AddMovieForm = ({ onSubmit }) => {
  const [status, setStatus] = useState('INITIAL');
  const [name, setName] = useState('');

  const handleForm = async (e) => {
    e.preventDefault();
    setStatus('LOADING');

    try {
      await onSubmit();
      setStatus('SUCCESS');
    } catch (error) {
      setStatus('ERROR');
    }
  };

  return (
    <form onSubmit={handleForm}>
      <label htmlFor="name">Nombre</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      {status !== 'INITIAL' && !name && <div>El nombre es obligatorio</div>}
      {status !== 'LOADING' && <button type="submit">Añadir película</button>}
      {status === 'LOADING' && <div>Añadiendo...</div>}
      {status === 'ERROR' && <div>No se pudo añadir la película</div>}
      {status === 'SUCCESS' && <div>¡Película Añadida!</div>}
    </form>
  );
};
```

Falta un detallito, tenemos que comprobar que se llama al _onSubmit_ con los parámetros que esperamos:

```js
test('Calls onSubmit with correct params', async () => {
  const onSubmit = jest.fn();
  givenTheComponentIsRendered(onSubmit);

  whenFormIsCorrect();
  whenFormIsSubmitted();

  await waitForElementToBeRemoved(screen.queryByText('Añadiendo...'));
  expect(onSubmit).toHaveBeenCalledWith({ name: 'Matrix' });
});
```

Y lo añadimos al componente:

```js
 try {
      await onSubmit({ name });
      setStatus("SUCCESS");
    } catch (error) {
      setStatus("ERROR");
    }
  };
```

Y listo por ahora. Puedes practicar añadiendo más tests para que por ejemplo se limpie el input cuando todo funcione o más comprobaciones de mensajes, casi no hemos comprobado que las cosas NO aparezcan.

También hay mucho refactor que hacer en los tests. Sobre todo sacar constantes y funciones para no repetir cosas como esperar a que se quite el loader por ejemplo.

## Modificando el App.js

Para pasar nuestro step modificamos App.js para que realice la llamada con un fetch y lanzamos los tests:

```js
function App() {
  return (
    <div>
      <AddMovieForm
        onSubmit={async ({ name }) => {
          await fetch('/movies/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
        }}
      />
      <div>No movies in your list</div>
    </div>
  );
}
```

Y volvemos a ver el mismo error que al principio, que falta el tercer step:

```bash
Error: Step implementation missing for: I see a list with:
```

¡Éxito! Ahora podemos continuar con el último paso.

# El tercer step

Primero vamos a programar el step, que comprobará que se vea el número y el nombre de cada película. Quitamos las cabeceras con un slice y comprobamos por cada fila:

```js
Then('I see a list with:', (dataset) => {
  dataset.rawTable.slice(1).forEach(([index, movieName]) => {
    cy.contains(index);
    cy.contains(movieName);
  });
});
```

Podemos hacer trampa poniendo en el App.js:

```js
function App() {
  return (
    <div>
      <AddMovieForm
        onSubmit={async ({ name }) => {
          await fetch('/movies/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
        }}
      />
      <div>No movies in your list</div>
      <div>1 - Matrix</div>
    </div>
  );
}
```

Y vemos que efectivamente funciona:

```bash
  Add Movie to the list
    ✓ Empty movies list (1602ms)
    ✓ Add a movie to empty list (1102ms)


  2 passing (6s)
```

¡Ojalá fuera tan fácil 😅! Quitamos tanto el empty state como lo que acabamos de añadir y lanzamos los tests.
Una vez los vemos fallar (el primer escenario fallará también), empezamos un nuevo ciclo de TDD para el componente de la lista de películas

# El segundo componente

Es una buena práctica empezar listando los requisitos de nuestro componente, es una lista que puede ir modificándose a medida que avancemos en el desarrollo y nos demos cuenta de que falta o sobran cosas. Mi primera lista será esta:

- Cargar la lista
- Mostrar un loader mientras se carga la lista
- Si la carga falla mostrar mensaje
- Si la carga funciona mostrar la lista de películas
- Poder recargar la lista desde fuera del componente

Vamos a ir caso por caso sin dar muchas explicaciones, todos menos el último son muy parecidos a los del componente anterior.

## Cargar la lista

Test:

```js
function givenTheComponentIsRendered(getMovies) {
  render(<MovieList getMovies={getMovies} />);
}

test('Calls getMovies', () => {
  const getMovies = jest.fn();
  givenTheComponentIsRendered(getMovies);

  expect(getMovies).toHaveBeenCalledTimes(1);
});
```

Componente:

```js
const MovieList = ({ getMovies }) => {
  useEffect(() => {
    getMovies();
  }, [getMovies]);

  return <ul></ul>;
};
```

## Mostrar un loader

Test:

```js
test('Shows Loader', () => {
  givenTheComponentIsRendered(() => new Promise(() => {}));
  expect(screen.getByText('Cargando películas...')).toBeInTheDocument();
});
```

Componente:

```js
const MovieList = ({ getMovies }) => {
  useEffect(() => {
    getMovies();
  }, [getMovies]);

  return <p>Cargando películas...</p>;
};
```

## Fallo en la carga

Test:

```js
test('Shows Load Error', async () => {
  givenTheComponentIsRendered(() => Promise.reject());

  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));

  expect(screen.getByText('No se pudo cargar la lista')).toBeInTheDocument();
});
```

Componente:

```js
const MovieList = ({ getMovies }) => {
  const [status, setStatus] = useState('LOADING');

  useEffect(() => {
    getMovies().catch(() => setStatus('ERROR'));
  }, [getMovies]);

  return (
    <div>
      {status === 'LOADING' && <p>Cargando películas...</p>}
      {status === 'ERROR' && <p>No se pudo cargar la lista</p>}
    </div>
  );
};
```

Al añadir el _catch_ falla el primer test, lo resolvemos con un _stub_ que devuelva una promesa:

```js
test("Calls getMovies", () => {
  const getMovies = jest.fn(() => new Promise(() => {}));
```

## Mostrar películas

Test:

```js
test('Shows Movie List', async () => {
  const movies = [
    { id: 1, name: 'Matrix' },
    { id: 2, name: 'Dune' },
  ];

  givenTheComponentIsRendered(() => Promise.resolve(movies));

  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));

  movies.forEach((movie) => {
    expect(screen.getByText(movie.id)).toBeInTheDocument();
    expect(screen.getByText(movie.name)).toBeInTheDocument();
  });
});
```

Componente:

```js
const MovieList = ({ getMovies }) => {
  const [status, setStatus] = useState('LOADING');
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies()
      .then((movies) => {
        setStatus('SUCCESS');
        setMovies(movies);
      })
      .catch(() => setStatus('ERROR'));
  }, [getMovies]);

  return (
    <div>
      {status === 'LOADING' && <p>Cargando películas...</p>}
      {status === 'ERROR' && <p>No se pudo cargar la lista</p>}

      {status === 'SUCCESS' && (
        <ul>
          {movies &&
            movies.map((movie) => (
              <li key={movie.id}>
                <span>{movie.id}</span> - <span>{movie.name}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};
```

Aqui me doy cuenta de que se me ha olvidado el caso de empty state, vamos a añadirlo a la lista y a implementarlo.

## Lista vacía

Test:

```js
test('Shows Empty State', async () => {
  givenTheComponentIsRendered(() => Promise.resolve([]));

  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));

  expect(screen.getByText('No hay películas añadidas')).toBeInTheDocument();
});
```

Componente:

```js
const MovieList = ({ getMovies }) => {
  const [status, setStatus] = useState('LOADING');
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies()
      .then((movies) => {
        setStatus('SUCCESS');
        setMovies(movies);
      })
      .catch(() => setStatus('ERROR'));
  }, [getMovies]);

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

## Recargar Películas

Este es el caso más interesante, vamos a suponer que tenemos una prop _refresh_ que al pasar de false a true, hace que el componente vuelva a pedir la lista de películas.

Tenemos que modificar el _given_ para que acepte la nueva prop y devuelva el método _rerender_, que se utiliza para cuando queremos volver a renderizar el mismo componente:

```js
function givenTheComponentIsRendered(getMovies, refresh = true) {
  return render(<MovieList getMovies={getMovies} refresh={refresh} />);
}
```

¿Seguro que es el mismo componente? Una forma fácil de verificarlo es haciendo un rerender y comprobando que no sale el loader, porque el componente ya tiene state === 'SUCCESS'

```js
test('Refreshes Movies', async () => {
  const getMovies = jest.fn().mockResolvedValueOnce([]);

  const { rerender } = givenTheComponentIsRendered(getMovies);

  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));
  expect(screen.getByText('No hay películas añadidas')).toBeInTheDocument();

  rerender(<MovieList getMovies={getMovies} refresh={false} />);
  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));
});
```

🔴 Vemos que el error nos marca justamente que no se puede esperar a que se borre algo que no existe, porque es el mismo componente que ya ha pasado por el ciclo de carga:

```bash
 FAIL  src/Components/MovieList.test.js
  ● Refreshes Movies

    The element(s) given to waitForElementToBeRemoved are already removed. waitForElementToBeRemoved requires that the element(s) exist(s) before waiting for removal.

      58 |
      59 |   rerender(<MovieList getMovies={getMovies} refresh={false} />);
    > 60 |   await waitForElementToBeRemoved(screen.queryByText("Cargando películas..."));
```

Poder hacer este tipo de experimentos es otro punto a favor de programar con TDD.

Pasamos ahora a escribir el test final. Voy a dejar la explicación en comentarios:

```js
test('Refreshes Movies', async () => {
  const movies = [
    { id: 1, name: 'Matrix' },
    { id: 2, name: 'Dune' },
  ];

  // Sabemos que se llamará dos veces a la función
  const getMovies = jest
    .fn()
    // La primera devolvemos un array vacío
    .mockResolvedValueOnce([])
    // La segunda una lista con películas
    .mockResolvedValueOnce(movies);

  // Primer render normal
  const { rerender } = givenTheComponentIsRendered(getMovies);

  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));
  expect(screen.getByText('No hay películas añadidas')).toBeInTheDocument();

  // Forzamos el refresh de las películas
  // Hay mejores formas de hacer esto
  // pero de momento nos vale
  rerender(<MovieList getMovies={getMovies} refresh={false} />);
  rerender(<MovieList getMovies={getMovies} refresh={true} />);
  await waitForElementToBeRemoved(screen.queryByText('Cargando películas...'));

  // Comprobamos que ahora si hay contenido
  movies.forEach((movie) => {
    expect(screen.getByText(movie.id)).toBeInTheDocument();
    expect(screen.getByText(movie.name)).toBeInTheDocument();
  });
});
```

En el componente hay que modificar las props y el useEffect:

```js
const MovieList = ({ getMovies, refresh }) => {
  const [status, setStatus] = useState("LOADING");
  const [movies, setMovies] = useState([]);

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

```

Y ya tenemos nuestro componente listo para ser añadido al App.js, aunque obviamente todavía no pasará el test de aceptación. ¡Ya queda poco!

```js
function App() {
  return (
    <div>
      <AddMovieForm
        onSubmit={async ({ name }) => {
          await fetch('/movies/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
        }}
      />

      <MovieList
        getMovies={async () => {
          const res = await fetch('/movies/');
          return await res.json();
        }}
        refresh={true}
      ></MovieList>
    </div>
  );
}
```

# Fin del tercer post

Pues ya tenemos nuestra lista de películas funcionando. Hemos visto como testear llamadas a una API, a pasar dependencias y controlar y testear acciones asíncronas.

Después hemos listado los requisitos de nuestra lista de películas y los hemos ido implementando uno por uno.

En el siguiente post terminaremos nuestra feature viendo varias formas de comunicar nuestros componentes.

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/tdd-en-el-front) y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
