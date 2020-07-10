'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PasswordResetSchema extends Schema {
  up () {
    this.create('password_resets', (table) => {
      table.increments()
      table.string('email').notNullable()
      table.string('token').notNullable().unique()
      table.dateTime('expires_at')
      table.timestamps()
      table.integer('coupon_id').unsigned()

      table.integer('user_id').unsigned()

      table
      .foreign('email')
      .references('email')
      .onTable('users')
      .onDelete('cascade')
    })
  }

  down () {
    this.drop('password_resets')
  }
}

module.exports = PasswordResetSchema
