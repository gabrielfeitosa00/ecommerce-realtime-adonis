'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View
 */
const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_uploads } = use('App/Helpers')
const fs = use('fs')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, pagination }) {

    const images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)

    return response.send(images)
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {

    // tries to capture one or more images from
    // the reequest 

    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      // what's going to be returned 
      let images = []

      // if single file is uploaded the method manage_single_upload is used
      // if multiple files are uploaded the method manage_multiple_uploads is used


      // this checks if a single image is being uploaded
      if (!fileJar.images) {
        const file = await manage_single_upload(fileJar)

        // checks if the file is moved and creates a new image in the
        // images table

        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          images.push(image)

          return response.status(201).send({ successes: images, error: {} })
        }

        return response.status(400).send({
          message: 'This image could not be processed at this time'
        })
      }

      let files = await manage_multiple_uploads(fileJar)

      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          images.push(image)
        })
      )

      return response
        .status(201)
        .send({ successes: images, errors: file.errors })
    } catch (error) {
      return response.status(400).send({
        message: 'Your request could not be processed!'
      })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, view }) {

    const image = await Image.findOrFail(id)
    return response.send(image)
  }


  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const image = await Image.findOrFail(id)

    try {
      image.merge(request.only(['oringal_name']))
      await image.save()

      return response.status(200).send(image)
    } catch (error) {
      return response.status(400).send({
        message: "The image could not be updated at this time!"
      })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params:{id}, request, response }) {

    const image = await Image.findOrFail(id)

    try {
      let filepath= Helpers.publicPath(`uploads/${image.path}`)
      await fs.unlink(filepath, err => {
        if (!err)
          await image.delete()
      })

      return response.status(204).send()
    } catch (error) {
      return response.status(400).send({
        message: "Could not delete image at this time!"
      })
    }
  }
}

module.exports = ImageController
