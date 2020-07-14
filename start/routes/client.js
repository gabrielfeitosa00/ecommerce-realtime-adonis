'use strict'






/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Client routes
 */

 Route.group(()=>{

    /**
     * Resource routes
     */

    Route.get('/products','ProductController.index')
    Route.get('/products/:id','ProductController.show')
    
    Route.get('/order','OrderController.index')
    Route.get('/order/:id','OrderController.show')
    Route.post('/order','OrderController.store')
    Route.put('/order/:id','OrderController.put')

 })
    .prefix('v1')
    .namespace('Client')