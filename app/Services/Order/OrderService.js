'use strict'

const Database = use('Database')

class OrderService {

    constructor(model,trx=false){
        this.model = model
        this.trx = trx
    }

    async syncItems(items) {

        if(!Array.isArray(items)){
            return false
        }


        await this.model.items().delete(this.trx)

        await this.model.items().createMany(items,this.trx)
    }

    async updateItems(items) {
        let currentItems = await this.model
            .items()
            .whereIn('id', items.map(item => item.id))
            .fetch()

        //Deletes items that the user no longer wants

        await this.model
            .items()
            .whereNotIn('id', items.map(item => item.id))
            .delete(this.trx)

        //Updates the items values and quantities

        await Promise.all(currentItems.rows.map( async item => {
            item.fill(items.find(n => n.id === item.id))
            await item.save(this.trx)
        } ))
    }


    async canApplyDiscount(coupon){
        const couponProducts = await Database.from('coupon_products')
            .where('coupon_id', coupon.id)
            .pluck('product_id')

        const couponClients = await Database.from('coupon_user')
            .where('coupon_id',coupon.id)
            .pluck('user_id')

        //Check if the coupon is not associated with specific products and customers

        if(
            Array.isArray(couponProducts) && 
            couponProducts.length<1 && 
            Array.isArray(couponClients) && 
            couponClients.length<1 ) {
                
            /**
             * if the coupon is not associated with a specific customer or product, 
             * it is free to be used by anyone on any product
             *  */
            
            return true 
        }

        let isAssociatedToProducts, isAssociatedToClients = false

        if (Array.isArray(couponProducts) && couponProducts.length > 0){
            isAssociatedToProducts = true
        }

        if (Array.isArray(couponClients) && couponClients.length > 0){
            isAssociatedToClients = true
        }

        const productsMatch = await Database.from('order_items')
            .where('order_id', this.model.id)
            .whereIn('product_id', couponProducts)
            .pluck('product_id')

        /**
         * Use case 1 - the coupon is associated with client and products
         */

        if(isAssociatedToProducts && isAssociatedToClients) {
            const clientMatch = couponClients.find(
                client => client === this.model.user_id
                
                )

            if(
                clientMatch && 
                Array.isArray(productsMatch) && 
                productsMatch.length>0
                ) {
                    return true
                }
        }

        /**
         * Use case 2 - the coupon is only associated with products
         */

        if( 
            isAssociatedToProducts && 
            Array.isArray(productsMatch) && 
            productsMatch.length>0 ) {
            return true
        }

        /**
         * Use case 3 - the coupon is only associated with clients
         */

         if(
             isAssociatedToClients &&
             Array.isArray(couponClients) && 
             couponClients.length>0
         ) {
             const match = couponClients.find( client => client === this.model.user_id)
             if(match){
                 return true
             }
         }

         /**
          * If none of the checks are positive then 
          * the coupon is associated with customers or products or both, 
          * but none of the customers are eligible for the discount and 
          * the coupon cannot be used for any product
          */

        return false
    }

}


module.exports = OrderService