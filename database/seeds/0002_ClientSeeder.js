'use strict'

/*
|--------------------------------------------------------------------------
| ClientSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use('Role')
const User = use('App/Models/User')

class ClientSeeder {
  async run () {
    const role= await Role.findBy('slug','client')
    const Clients = await Factory.blueprint('App/Model/User').createMany(20)

    await Promise.all(
      clients.map( async (client) => {
        await client.roles().attach([role.id])
      })
    )

    const user = await User.create({
      name:'Chris',
      surname:'Nagare',
      email:'chris@example.com',
      password:'secret'
    })

    const adminRole = await Role.findBy('slug','admin')
    await user.roles().attach([adminRole.id])

  }
}

module.exports = ClientSeeder
