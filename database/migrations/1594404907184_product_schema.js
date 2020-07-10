'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductSchema extends Schema {
  up () {
    this.create('products', (table) => {
      table.increments()
      table.string('name',100)
      table.integer('image_id').unSigned()
      table.text('description')
      table.decimal('price',12,2)
      table.timestamps()

      table
        .foreign('image_id')
        .references('id')
        .inTable('images')
        .onDelete('cascade')
    })

    this.create('image_product', (table) => {
      table.increments()
      table.integer('image_id').unSigned()
      table.integer('product_id').unSigned()
      table.timestamps()

      table
        .foreign('image_id')
        .references('id')
        .inTable('images')
        .onDelete('cascade')

        table
        .foreign('product_id')
        .references('id')
        .inTable('products')
        .onDelete('cascade')
    })

    this.create('category_product', (table) => {
      table.increments()
      table.integer('product_id').unSigned()
      table.integer('category_id').unSigned()
      table.timestamps()

      table
        .foreign('product_id')
        .references('id')
        .inTable('products')
        .onDelete('cascade')

        table
        .foreign('category_id')
        .references('id')
        .inTable('categories')
        .onDelete('cascade')
    })
  }

  down () {
    this.drop('image_product')
    this.drop('category_product')
    this.drop('products')
  }
}

module.exports = ProductSchema