'use strict'

const Model = require("@adonisjs/lucid/src/Lucid/Model")

const OrderHook = exports = module.exports = {}

OrderHook.updateValues = async (model) => {

    model.$sideLoaded.subtotal =await model.items().getSum('subtotal')

    model.$sideLoaded.qty_item =await model.items().getSum('quantity')

    model.$sideLoaded.discount =await model.discounts().getSum('discount')

    model.total= model.$sideLoaded.subtotal - model.$sideLoaded.discount
}

OrderHook.updateCollectionValues= async (models)=>{
    for(let model of models){
        model=await OrderHook.updateValues(model)
    }
}