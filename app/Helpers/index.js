'use strict'

const crypto = use('crypto')

const Helpers = use('Helpers')

/**
 * Generate a random string
 * 
 * @param {int} length - the length of the string thats being generated
 * @return {string} - a random string of 'length' size
 */

const str_random = async (length = 40) => {
    let string = ''
    let len = string.length

    if (len < length) {
        let size = length - len
        let bytes = await crypto.randomBytes(size)
        let buffer = Buffer.from(bytes)
        string += buffer
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')  // replaces any character that isn't alphanumerical one with a empty space
            .substr(0, size)             // formats the string so it has the previously defined size
    }

    return string
}

/**
 * This helper manages a single upload, it moves a single file to the
 * especified path, if none is present it will move the file to public/uploads
 * @param {FileJar} file the file that's going to be uploaded
 * @param {string} path the path that the uploaded file is going to go in
 * @return {Objecy <FileJar>} the returned file
 */

const manage_single_upload = async (file, path = null) => {

    path = path ? path : Helpers.publicPath('uploads') // checks if the path parameter exists
    // if it doesn't exit the value of path 
    // is public/uploads 

    const random_name = await str_random(30)    // generates a random name for the file
    let filename = `${new Date().getTime()}-${random_name}.${file.subtype}` //generates the actual file name

    // renames the file and moves it to the path

    await file.move(path, {
        name: filename
    })

    return file
}

/**
 *This helper manages a multiple uploads, it moves multiple files to the
 * especified path, if none is present it will move the file to public/uploads
 * @param {FileJar} fileJar
 * @param {string} path
 * @return{Object}
 */

const manage_multiple_uploads = async (fileJar, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')   // checks if the path parameter exists
    // if it doesn't exit the value of path 
    // is public/uploads

    //

    let successes = [], //stores the sucsessful uploads 
        errors = []    //stores the unsucsessful uploads

    await Promise.all(fileJar.files.map(async file => {
        let random_name = await str_random(30)
        let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

        // renames the files and moves them to the path

        await file.move(path, {
            name: filename
        })

        // checks if the file has been moved

        if (file.moved()) {
            successes.push(file)
        } 
        
        else {
            errors.push(file)
        }


    }))


    return {successes,errors}


}

module.exports = {
    str_random,
    manage_single_upload,
    manage_multiple_uploads
}