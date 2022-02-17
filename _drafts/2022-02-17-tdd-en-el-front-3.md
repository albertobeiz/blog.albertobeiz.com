---
title: 'TDD en el front 3'
subtitle: 'Terminando la primera feature'
coverImage: '/assets/blog/js.svg'
date: '2022-02-17'
collection: 'TDD en el front'
---

### Contenido del Post

# Terminando la primera feature

Por fin tenemos funcionando todo el sistema de testing, tanto los de aceptación con cypress y gherkin como los unitarios con jest 🥳 Ahora es cuando empezamos a coger velocidad de crucero y nuestro proceso de desarrollo será:

1. Escribir el test de aceptación
2. Implementar el primer step que falle
3. Implementar mediante TDD los casos especiales (errores, loaders...)
4. Implementar mediante TDD el código necesario para hacer pasar el step
5. Volver al paso 2 hasta que el test de aceptación pase completamente

> **Aviso** - esto es más un cuaderno de notas que una serie de artículos rigurosos. No esperes largas explicaciones o justificaciones sobre cada decisión tomada, estoy en modo experimentación 😅 y por supuesto no es el post de un experto en el tema.

# La llamada a la API

Algo que puede pasar, y pasa, es que nos demos cuenta de algo cuando ya tenemos el test pasando. Por ejemplo, no estamos comprobando que ocurra una llamada a la API para guardar la película. Tenemos que modificar un poco el step que ya teníamos en verde:

```js
When('I add a movie with name {string}', (movieName) => {
  cy.get('input[id=name]').type(movieName);
  cy.get('button[type=submit]').click();

  cy.intercept('/movies/').as('postMovie');
  cy.wait('@postMovie')
    .its('request.body')
    .should(
      'deep.equal',
      JSON.stringify({
        name: movieName,
      })
    );
});
```

Y ahora fallará de nuevo avisándonos de que no ocurre tal cosa:

```bash
CypressError: Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 1st request to the route: `postMovie`. No request ever occurred.
```

Para implementarlo necesitamos algún mecanismo para que al enviar el formulario se realice esa llamada, pero sin la llamada http en el Componente, no queremos tener que falsear el fetch, mucho trabajo.

La forma más sencilla que se me ocurre por ahora es pasar una función por props, tendremos que comprobar al menos tres situaciones:

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

Y una implementación con el mínimo código posible, no hay que preocuparse por ahora de asíncronías ni nada porque podemos hacer pasar el test usando el estado de _submitted_.

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

## 2. La llamada falla

Preparamos el test:

```js
test('Shows error message when fails', () => {
  givenTheComponentIsRendered();

  whenFormIsCorrect();
  whenFormIsSubmitted();

  expect(screen.queryByText('Añadiendo...')).toBeNull();
  expect(screen.getByText('Añadir película')).toBeInTheDocument();
  expect(screen.getByText('No se pudo añadir la película')).toBeInTheDocument();
});
```

Ya vemos que para hacer pasar este tendríamos que borrar el loader, lo cual haría fallar el anterior test. Necesitamos una dependencia que podamos controlar desde el test:

```js
function givenTheComponentIsRendered(onSubmit) {
  render(<AddMovieForm onSubmit={onSubmit} />);
}
```

Y asi poder forzar en el test un fallo:

```js
test('Shows error message when fails', () => {
  givenTheComponentIsRendered(() => Promise.reject('ERROR'));

  whenFormIsCorrect();
  whenFormIsSubmitted();

  expect(screen.queryByText('Añadiendo...')).toBeNull();
  expect(screen.getByText('Añadir película')).toBeInTheDocument();
  expect(screen.getByText('No se pudo añadir la película')).toBeInTheDocument();
});
```

Y para hacer pasar el test voy a refactorizar un poco y evitar el uso de booleanos para modelar el estado:

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

Falta pasar como función una promera que no resuelva nunca:

```js
test("Shows loader on correct submit", () => {
  givenTheComponentIsRendered(() => new Promise(() => {}));
```

Gracias a que encapsulamos el render en una función podemos añadir parámetros por defecto y que no se rompan nuestros tests anteriores 🙌

## 3. Todo funciona

Preparamos el test del happy path:

```js

```

Y una implementación con el mínimo código posible

```js

```

## Modificando el App.js

Ahora solo queda modificar el App.js para que realice la llamada con un fetch y lanzar los tests:

```js

```

¡Éxito! Ahora podemos continuar con el último paso.

# El tercer step

Primero vamos a programar el step, que comprobará que se vea el número y el nombre de cada película:

```js

```

Y una vez lo vemos fallar, empezamos un nuevo ciclo de TDD para el componente de la lista de películas

# El segundo componente

# Comunicando componentes

# Fin del tercer post

Tienes el código del proyecto [en este enlace](https://github.com/albertobeiz/tdd-en-el-front) y puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).
