const RevenueSchema = require("../models/RevenueModel")
const mongoose = require("mongoose")


exports.addRevenue = async (req, res) => {
    const {userid, date, client, service, quantity, addOnService, serviceLocation, serviceFee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber} = req.body

    console.log('=== ADD REVENUE DEBUG ===');
    console.log('serviceLocation received:', serviceLocation);
    console.log('serviceLocation type:', typeof serviceLocation);
    console.log('serviceLocation value will be:', serviceLocation || undefined);

    const revenue = RevenueSchema({
        userid,
        Date: date,
        Client: client,
        Service: service,
        Quantity: quantity,
        'Add-On Service': addOnService,
        'Service Location': serviceLocation || undefined,
        'Service Fee': serviceFee ? `$${Number(serviceFee).toFixed(2)}` : '',
        'Travel Fee': travelFee ? `$${Number(travelFee).toFixed(2)}` : '',
        Discount: discount ? `$${Number(discount).toFixed(2)}` : '',
        'Discount Reason': discountReason,
        'Payment Type': paymentType || undefined,
        'Transaction Fees': transactionFee ? `$${Number(transactionFee).toFixed(2)}` : '',
        'Actual Fees': actualRevenue ? `$${Number(actualRevenue).toFixed(2)}` : '',
        'Invoice Number': invoiceNumber
    })

    try {
        if(!userid || !date || !client || !service){
            return res.status(400).json({message: 'Date, Client, and Service are required'})
        }
        if(quantity && Number(quantity) <= 0){
            return res.status(400).json({message: 'Quantity must be positive number'})
        }

        await revenue.save()
        res.status(200).json({message: 'Revenue Added'})
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error'})
    }

    // console.log(revenue)
}

exports.getRevenue = async (req, res) => {
    try {
        let {userid} = req.query
        
        console.log("=== DEBUG: getRevenue called ===")
        console.log("User ID received (raw):", userid)
        console.log("User ID type:", typeof userid)
        console.log("User ID length:", userid ? userid.length : 'null')
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        // Trim whitespace
        userid = userid.trim();
        console.log("User ID after trim:", userid)
        console.log("User ID after trim length:", userid.length)
        
        // Log all revenue records in DB to debug
        const allRevenue = await RevenueSchema.find({}).limit(5)
        console.log("Sample records in DB:", allRevenue.map(r => ({userid: r.userid, client: r.client})))
        
        // Try to find with exact string match first
        let revenue = await RevenueSchema.find({userid: userid}).sort({createdAt: -1})
        console.log("Revenue found (string match) count:", revenue.length)
        
        // If no results and userid looks like an ObjectId, try ObjectId comparison
        if (revenue.length === 0 && mongoose.Types.ObjectId.isValid(userid)) {
            console.log("No string match found, trying ObjectId comparison...")
            try {
                const objectId = new mongoose.Types.ObjectId(userid)
                revenue = await RevenueSchema.find({userid: objectId}).sort({createdAt: -1})
                console.log("Revenue found (ObjectId match) count:", revenue.length)
            } catch (err) {
                console.log("ObjectId conversion failed:", err.message)
            }
        }
        
        // If still no results, try case-insensitive regex search
        if (revenue.length === 0) {
            console.log("No match found yet, trying case-insensitive regex search...")
            revenue = await RevenueSchema.find({userid: {$regex: userid, $options: 'i'}}).sort({createdAt: -1})
            console.log("Revenue found (case-insensitive) count:", revenue.length)
        }
        
        console.log("Final revenue data count:", revenue.length)
        console.log("=== END DEBUG ===")
        res.status(200).json(revenue)
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