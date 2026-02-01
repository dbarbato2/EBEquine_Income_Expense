const DeductionSchema = require("../models/DeductionModel")
const mongoose = require("mongoose")

exports.addDeduction = async (req, res) => {
    const {month, year, deductionType, deductionDescription, deductionAmount, deductionRecordNumber, userid} = req.body

    const deduction = DeductionSchema({
        Month: month,
        Year: year,
        'Deduction Type': deductionType,
        'Deduction Description': deductionDescription,
        'Deduction Amount': deductionAmount ? `$${Number(deductionAmount).toFixed(2)}` : '',
        'Deduction Record Number': deductionRecordNumber,
        userid
    })

    try {
        if(!month || !year || !deductionType){
            return res.status(400).json({message: 'Month, Year, and Deduction Type are required'})
        }
        if(deductionAmount && Number(deductionAmount) <= 0){
            return res.status(400).json({message: 'Amount must be positive number'})
        }

        await deduction.save()
        res.status(200).json({message: 'Deduction Added'})
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error'})
    }

    // console.log(deduction)
}

exports.getDeductions = async (req, res) => {
    try {
        let {userid} = req.query;
        
        // console.log("User ID received (raw):", userid)
        // console.log("User ID type:", typeof userid)
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        // Trim whitespace
        userid = userid.trim();
        // console.log("User ID after trim:", userid)
        
        // Try to find with exact string match first
        let deductions = await DeductionSchema.find({ userid: userid }).sort({ createdAt: -1 });
        // console.log("Deductions found (string match) count:", deductions.length)
        
        // If no results and userid looks like an ObjectId, try ObjectId comparison
        if (deductions.length === 0 && mongoose.Types.ObjectId.isValid(userid)) {
            // console.log("No string match found, trying ObjectId comparison...")
            try {
                const objectId = new mongoose.Types.ObjectId(userid)
                deductions = await DeductionSchema.find({ userid: objectId }).sort({ createdAt: -1 });
                // console.log("Deductions found (ObjectId match) count:", deductions.length)
            } catch (err) {
                // console.log("ObjectId conversion failed:", err.message)
            }
        }
        
        // If still no results, try case-insensitive regex search
        if (deductions.length === 0) {
            // console.log("No match found yet, trying case-insensitive regex search...")
            deductions = await DeductionSchema.find({userid: {$regex: userid, $options: 'i'}}).sort({createdAt: -1})
            // console.log("Deductions found (case-insensitive) count:", deductions.length)
        }
        
        // console.log("Final deductions data:", deductions)
        console.log("Sample deduction:", deductions[0])
        res.status(200).json(deductions)
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message :'Server Error', error: error.message})
    }
}


exports.deleteDeduction = async (req, res) => {

    const {id} = req.params;
    DeductionSchema.findByIdAndDelete(id)
    .then((deduction) => {
        res.status(200).json({message :'Deduction deleted.'})
    })
    .catch((error) => {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message :'Server Error'})
    })
    
}

exports.searchDeductions = async (req, res) => {
    try {
        const { userid, year, month, deductionType } = req.query;
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        // Build search criteria
        const searchCriteria = { userid: userid.trim() };
        
        if (year) {
            searchCriteria.Year = Number(year);
        }
        
        if (month) {
            searchCriteria.Month = month;
        }
        
        if (deductionType) {
            searchCriteria['Deduction Type'] = deductionType;
        }
        
        const deductions = await DeductionSchema.find(searchCriteria).sort({ createdAt: -1 });
        res.status(200).json(deductions);
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}