'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserImageFkSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table
        .foreign('image_id')
        .references('id')
        .onTable('images')
        .onDelete('cascade')
    })
  }

  down () {
    this.table('user_image_fks', (table) => {
      table.dropForeign('image_id')
    })
  }
}

module.exports = UserImageFkSchema
