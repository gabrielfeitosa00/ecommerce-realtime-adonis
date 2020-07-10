'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CouponUserSchema extends Schema {
  up () {
    this.create('coupon_user', (table) => {
      table.increments()
      table.integer('coupon_id').unsigned()

      table.integer('user_id').unsigned()

      table
      .foreign('coupon_id')
      .references('id')
      .onTable('coupons')
      .onDelete('cascade')

      table
      .foreign('user_id')
      .references('id')
      .onTable('user')
      .onDelete('cascade')
    })
  }

  down () {
    this.drop('coupon_user')
  }
}

module.exports = CouponUserSchema
