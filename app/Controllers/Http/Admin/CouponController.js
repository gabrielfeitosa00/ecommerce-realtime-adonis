'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon= use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index ({ request, response, pagination }) {
    const code= request.input('code')
    const query = await Coupon.query()

    if(code) {
      querry.where('code','LIKE',`%${code}%`)
    }

    const coupons = await query.paginate(pagination.page,pagination.limit)

    return response.send(coupons)

  }


  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    const trx = await Database.beginTransaction()

    /**
     * Business rules for coupons: 
     * 
     * 1 - Products - A coupon can only be used for specific products
     * 
     * 2- Clients - A coupon can only be used by specific clients
     * 
     * 3- Products and CLients - A coupon can only be used by specific clients
     *    and for specific products
     * 
     * 4- The coupon can be used by any client and for any product
     */

    var can_use_for = {
      client:false,
      product:false,
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_unti',
        'quantity',
        'type',
        'recursive'
      ])

      const {users,products} = request.only('users','products')

      const coupon = await Coupon.create(couponData,trx)

      //Service layer

      const service = new Service(coupon,trx)

      //Iserts the coupon relationships into de db

      if(users && users.length > 0 ) {
        await service.syncUsers(users)
        can_use_for.client= true
      }

      if(products && products.length > 0 ) {
        await service.syncProducts(products)
        can_use_for.product= true
      }

      //verify who can use the coupon

      if(can_use_for.product && can_use_for.client) {
        coupon.can_use_for = 'product_client'
      } else if (can_use_for.product && !can_use_for.client) {
        coupon.can_use_for='product'
      } else if (!can_use_for.product && can_use_for.client) {
        coupon.can_use_for='client'
      } else {
        coupon.can_use_for='all'
      }

      //commiting the transaction
      await coupon.save(trx)

      await trx.commit()

      return response.status(201).send(coupon)

    } catch (error) {
      await trx.rollback()

      return response.status(400).send({
        message: 'Could not create coupon at this time!'
      })
    }

  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params:{id}, request, response, view }) {

    const coupon = await Coupon.findOrFail(id)

    return response.send(coupon)
  }


  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params:{id}, request, response }) {

    const trx = await Database.beginTransaction()
    var coupon = await  Coupon.findOrFail(id)

    var can_use_for = {
      client:false,
      product:false,
    }

    try {

      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_unti',
        'quantity',
        'type',
        'recursive'
      ])

      coupon.merge(couponData)

      const {users,products} = request.only(['users','products'])

      const service = new Service(coupon,trx)

      //Iserts the coupon relationships into de db

      if(users && users.length > 0 ) {
        await service.syncUsers(users)
        can_use_for.client= true
      }

      if(products && products.length > 0 ) {
        await service.syncProducts(products)
        can_use_for.product= true
      }

      if(can_use_for.product && can_use_for.client) {
        coupon.can_use_for = 'product_client'
      } else if (can_use_for.product && !can_use_for.client) {
        coupon.can_use_for='product'
      } else if (!can_use_for.product && can_use_for.client) {
        coupon.can_use_for='client'
      } else {
        coupon.can_use_for='all'
      }

      //commiting the transaction
      await coupon.save(trx)

      await trx.commit()

      return response.send(coupon)


      
    } catch (error) {
      await trx.rollback()

      return response.status(400).send({
        message:'Could not update coupon at this time!'
      })
    }

  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params:{id}, request, response }) {

    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(id)

    try {
      // undoes all relationships that the coupon had with 
      // other tables before deleting it 
      await coupon.products().detach([],trx)
      await coupon.orders().detach([],trx)
      await coupon.users().detach([],trx)
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'It was not possible to delete the coupon at this time!'
      })
    }

  }
}

module.exports = CouponController
