const RevenueSchema = require("../models/RevenueModel")


exports.addRevenue = async (req, res) => {
    const {date, client, service, quantity, addOnService, serviceLocation, servicefee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber} = req.body

    const revenue = RevenueSchema({
        date, client, service, quantity, addOnService, serviceLocation, servicefee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber
    })

    try {
        if(!date || !client || !service || !quantity){
            return res.status(400).json({message: 'All fields are required'})
        }
        if(quantity <=0 || !quantity === 'number' ){
            return res.status(400).json({message: 'Quantity must be positive number'})
        }

        await revenue.save()
        res.status(200).json({message: 'Revenue Added'})
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error'})
    }

    console.log(revenue)
}

exports.getRevenue = async (req, res) => {
    try {
        /*const {userid} = req.query*/
        const userid = "erinBarbato";
        console.log(userid)
        const revenue = await RevenueSchema.find({userid: userid}).sort({createdAt: -1})
        res.status(200).json(revenue)
        console.log(revenue)
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message :'Server Error',
            error: error.message})
    }

}


exports.deleteRevenue = async (req, res) => {

    const {id} = req.params;
    RevenueSchema.findByIdAndDelete(id)
    .then((revenue) => {
        res.status(200).json({message :'Revenue Transaction deleted.'})
    })
    .catch((error) => {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message :'Server Error'})
    })
    
}