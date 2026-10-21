import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Los comentarios de una tarea (`openspec/specs/comments/spec.md`): un texto, quién
 * lo escribió, sobre qué tarea y cuándo.
 *
 * Rama (convención 5): no mueve ni transforma datos. Es una tabla nueva y no toca
 * ninguna fila existente; contado contra la base de desarrollo antes de escribirla,
 * `comments` no existía. `down()` la quita entera, y con ella los comentarios que se
 * hayan escrito para entonces: con la tabla vacía no pierde nada.
 *
 * Sin valores cerrados (convención 2): `body` es texto libre. Aun así lleva un `CHECK`
 * propio, explicado junto a la columna.
 */
export default class extends BaseSchema {
  protected tableName = 'comments'
  protected bodyCheckName = 'comments_body_not_blank_check'

  async down() {
    // Quitar la tabla quita también sus claves foráneas, su índice y su CHECK.
    this.schema.dropTable(this.tableName)
  }

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      // CASCADE: un comentario es parte de su tarea y no significa nada sin ella. Borrar
      // una tarea desde la API no llega aquí (la manda a la papelera y la fila sigue);
      // solo quitar la fila de verdad arrastra su hilo, que es lo que se quiere.
      table
        .integer('task_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')

      // CASCADE, igual que `tasks.assignee_id`: el sistema ya decidió que quitar una
      // cuenta se lleva sus tareas, y sus comentarios siguen la misma regla. SET NULL no
      // cabe, porque todo comentario muestra a su autor; y RESTRICT haría imposible
      // borrar una cuenta que haya comentado alguna vez, una decisión de producto que
      // nadie ha tomado. Hoy no hay ningún camino en la API que borre cuentas.
      table
        .integer('author_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // El máximo de 500 es el del requisito, y `varchar(500)` lo impone también fuera
      // de la API. Postgres cuenta caracteres y JavaScript unidades UTF-16, así que lo
      // que acepta el validador cabe siempre aquí.
      table.string('body', 500).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // «El último comentario de esta cuenta en esta tarea» se busca en cada alta, y el
      // hilo de una tarea se leerá por `task_id`: el mismo índice sirve a las dos cosas.
      table.index(['task_id', 'author_id'])
    })

    // Un comentario vacío o de solo espacios no es un comentario. No es un dominio
    // cerrado, pero el validador se salta con un INSERT, un seeder o una factory, y
    // aquí cuesta una línea. El recorte de los extremos y el «no repetir seguido» se
    // quedan en la aplicación: el primero depende de qué cuenta como espacio, y el
    // segundo mira otras filas.
    this.schema.raw(`
      ALTER TABLE ${this.tableName}
      ADD CONSTRAINT ${this.bodyCheckName}
      CHECK (btrim(body) <> '')
    `)
  }
}
