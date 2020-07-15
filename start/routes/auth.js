'use strict'




/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Auth routes
 */

Route.group(() => { 
    Route.post('/register','AuthController.register').as('auth.register')
    Route.post('/login','AuthController.login').as('auth.login')
    Route.post('/refresh','AuthController.refresh').as('auth.refresh')
    Route.post('/logout','AuthController.logout').as('auth.logout')

    // Routes related to changing the password

    Route.post('/reset-password','AuthController.forgot').as('auth.forgot')
    Route.get('/reset-password','AuthController.remember').as('auth.remember')
    Route.put('/reset-password','AuthController.resey').as('auth.reset')
})
    .prefix('v1/auth')
    .namespace('Auth')