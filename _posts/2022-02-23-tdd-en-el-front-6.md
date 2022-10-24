---
title: 'TDD en el front 6'
subtitle: 'Conclusiones'
coverImage: '/assets/blog/js.svg'
collection: 'TDD en el front'
---

### Contenido del Post

# Conclusiones

Mi conclusión principal es sencilla:

# Se puede hacer TDD en el front

Creo que va a cambiar mi forma de afrontar los problemas saber que puedo aplicar sin demasiados cambios los mismos procesos que aplico en el back.

Si por ejemplo ahora quisiese añadir un botón para borrar un elemento:

1. Creo el test de aceptación RemoveMovie.feature
   1. Escenario un item en la lista -> debe salir empty state
   2. EScenario varios items -> deben permanecer el resto de items
2. Creo el caso de uso RemoveMovieButton, test a test, algo así:
   1. Componente se renderiza
   2. Al hacer click -> se abre confirmación
   3. Al no confirmar -> no se llama al servicio
   4. Al no confirmar -> se esconde la confirmación
   5. Al confirmar -> se muestra loader
   6. Al confirmar -> se llama al servicio
      1. Error al borrar -> mensaje de error
      2. Éxito al borrar -> mensaje de éxito
3. Añado el componente RemoveMovieButton en el form de MovieList

# Hay más complejidad

Son muchas variables, textos que salen y se esconden, modales, diálogos, asíncronía...se puede hacer TDD pero tampoco creo que sea necesario cubrir el 100% de los casos.

Hay que buscar mecanismos que ayuden, sobre todo en los formularios, haciendo que por ejemplo los mensajes de error tengan el mismo test-id y hacer un queryAllByTestId par comprobar que no hay ninguno.

# No hay que usar el navegador

Es una de las cosas que más me han gustado, he creado una app con un par de casos de uso muy comunes y no he abierto Chrome para nada. Solo este punto hace que el foco esté en la lógica, en el código, sin distracciones visuales.

# Los de aceptación son lentos

Levantar el navegador es una tarea pesada 😅 he terminado levantando cypress con _open_ y el server en local porque los tests van mucho más rápido que con el _run_ en consola. De todas formas si tenemos us sistema de CI es necesario poder levantar el server con el comando.

# Los unitarios son fáciles de escribir

Salvo por alguna cosa complicada al testear asincronías, ha sido muy fácil aprender a testear de la forma propuesta por Testing Library. Poner el foco en lo que ve y hace el usuario crea unos tests muy naturales y además más robustos, se acoplan muy poquito al framework que hay debajo (el _render_ y poco más).

He descubierto (tarde) que también hay testing library para Cypress, para mi siguiente proyecto lo usaré. Tener las mismas herramientas en los _end to end_ y en los unitarios me parece una maravilla.

# Fin de la serie

¡Hasta aquí llegamos! He aprendido un montón de conceptos, procesos y tecnologías nuevas y he repasado otros que tenía algo oxidados.

Espero que te haya servido y para cualquier duda, comentario, sugerencia o simplemente charlar un rato mándame un [dm por Twitter](https://twitter.com/albertobeiz).
