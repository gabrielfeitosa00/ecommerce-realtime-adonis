'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderSchema extends Schema {
  up() {
    this.create('orders', (table) => {
      table.increments()
      table.decimal('total', 12, 2).defaultTo(0, 0)
      table.enu('status', [
        'pending',
        'cancelled',
        'shipped',
        'paid',
        'finished'
      ])
      table.integer('user_id').unsigned()
      table.timestamps()

      table
        .foreign('user_id')
        .references('id')
        .onTable('users')
        .onDelete('cascade')
    })
  }

  down() {
    this.drop('orders')
  }
}

module.exports = OrderSchema
