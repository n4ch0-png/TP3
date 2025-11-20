# TP3
ToDo List

Ejercicio 1 – Analisis del paradigma de JavaScript basado en prototipos
1. Generalización simbólica
Son las reglas formales del lenguaje cuando lo usamos con POO basada en prototipos. Las principales son:

-Los objetos heredan directamente de otros objetos mediante la cadena de prototipos.

-Las funciones constructoras permiten crear nuevas instancias.

-Los métodos se agregan al prototype, compartidos por todos los objetos creados.

-Los prototipos pueden modificarse dinámicamente.

-La herencia se resuelve recorriendo la prototype chain.

2. Creencias de los profesionales
La comunidad valora varias características particulares del modelo de objetos de JavaScript:

-Es muy flexible: permite modificar objetos y prototipos en tiempo real.

-La herencia prototípica es más simple que el sistema de clases tradicional.

-Casi todo en JavaScript se comporta como objeto, lo que facilita su uso.

-Permite mezclar POO con programación funcional.

-Se requiere menos código para lograr modelos complejos.

----------------------------------------------------------------

Ejercicio 4
En los ejercicios anteriores tuve que armar un sistema de tareas, primero usando clases y despues usando JavaScript con prototipos. Aunque cambie la forma de escribirlo, en ambos casos termine usando varias ideas de la Programacion Orientada a Objetos. Aca explico cuales use, como las use y cuales no hicieron falta.

1. Abstracción

La abstracción básicamente es agarrar algo del mundo real y convertirlo en un modelo simple dentro del programa.
En mi caso, ese “algo” fue una tarea.

La representé con las cosas que realmente importan: título, descripción, dificultad, estado, etc.
No metí cosas como “quién la creó”, “categorías”, “prioridad numérica” o lo que sea, porque no eran necesarias.

O sea: me quedé con lo esencial -> eso es abstracción.

2. Encapsulamiento

El encapsulamiento lo usé para agrupar los datos y las funciones que trabajan sobre esos datos dentro del mismo objeto.

Por ejemplo, una tarea no solo tiene datos, sino que también sabe cómo mostrarse a sí misma:

Tarea.prototype.showDetails = function() {
  console.log(this.title);
}


Eso hace que la lógica quede ordenada y que no ande con funciones sueltas pasando mil parámetros.

3. Reutilización con prototipos (herencia)

Como el ejercicio 3 pedía usar prototipos, aproveché para poner los métodos en:

Tarea.prototype.algo = function() { ... }


Esto hace que todas las tareas compartan los mismos métodos sin duplicarlos.
Es más eficiente, más ordenado y es la forma en que JavaScript implementa la herencia.

No hice una “cadena” de herencias compleja porque no hacía falta, pero sí usé el concepto básico de compartir comportamientos a través del prototipo.

4. Composición

También usé composición sin pensarlo demasiado:
La lista de tareas (TaskList) simplemente contiene varias instancias de Tarea.

this.tasks = [ new Tarea(...), new Tarea(...), ... ];


Eso es composición: un objeto mas grande hecho de varios objetos más simples.

5. Polimorfismo (no lo use)

Este es el que no aplique:
Porque no tenia distintos tipos de tareas ni comportamientos diferentes según cada tipo.

Todas las tareas funcionaban igual, así que no tenía sentido aplicar polimorfismo.
Si hubiera creado, por ejemplo:

-TareaUrgente

-TareaRepetitiva

-TareaConRecordatorio

ahi si habria usado polimorfismo. Pero el TP no lo pedia.
