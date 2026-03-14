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

        // Check if deduction record number is already in use
        if(deductionRecordNumber) {
            const existingDeduction = await DeductionSchema.findOne({
                userid: userid,
                'Deduction Record Number': deductionRecordNumber
            })
            if(existingDeduction) {
                return res.status(400).json({message: 'Record Number already in use. Please use a different number.'})
            }
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
        const { userid, year, month, deductionType, recordNumber } = req.query;
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }

        const trimmedUserid = userid.trim();

        // Fetch ALL deductions for the user (same multi-strategy as getDeductions)
        let allDeductions = await DeductionSchema.find({ userid: trimmedUserid }).sort({ createdAt: -1 });

        if (allDeductions.length === 0 && mongoose.Types.ObjectId.isValid(trimmedUserid)) {
            try {
                const objectId = new mongoose.Types.ObjectId(trimmedUserid);
                allDeductions = await DeductionSchema.find({ userid: objectId }).sort({ createdAt: -1 });
            } catch (err) {
                // ObjectId conversion failed, continue
            }
        }

        if (allDeductions.length === 0) {
            allDeductions = await DeductionSchema.find({ userid: { $regex: trimmedUserid, $options: 'i' } }).sort({ createdAt: -1 });
        }

        // Filter in JavaScript to avoid Mongoose query issues with spaced field names
        let deductions = allDeductions;

        if (year) {
            deductions = deductions.filter(d => d.Year === Number(year));
        }
        if (month) {
            deductions = deductions.filter(d => d.Month === month);
        }
        if (deductionType) {
            deductions = deductions.filter(d => d['Deduction Type'] === deductionType);
        }
        if (recordNumber) {
            const num = Number(recordNumber);
            deductions = deductions.filter(d =>
                d['Deduction Record Number'] === num ||
                String(d['Deduction Record Number']) === String(recordNumber)
            );
        }

        res.status(200).json(deductions);
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

exports.updateDeduction = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year, deductionType, deductionDescription, deductionAmount, deductionRecordNumber } = req.body;

        // Format amount - remove $ if present and add it back with proper formatting
        let formattedAmount = '';
        if (deductionAmount) {
            const amountStr = String(deductionAmount).replace(/\$/g, '').trim();
            if (amountStr) {
                formattedAmount = `$${Number(amountStr).toFixed(2)}`;
            }
        }

        const updateData = {
            Month: month,
            Year: Number(year),
            'Deduction Type': deductionType,
            'Deduction Description': deductionDescription,
            'Deduction Amount': formattedAmount,
            'Deduction Record Number': deductionRecordNumber ? Number(deductionRecordNumber) : undefined
        };

        const updatedDeduction = await DeductionSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDeduction) {
            return res.status(404).json({ message: 'Deduction not found' });
        }

        res.status(200).json({ message: 'Deduction updated successfully', deduction: updatedDeduction });
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

exports.getMaxDeductionRecordNumber = async (req, res) => {
    try {
        let { userid } = req.query
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        userid = userid.trim()
        
        // Get all deduction records for the user
        let deductions = await DeductionSchema.find({userid: userid})
        
        // If no string match found and userid looks like an ObjectId, try ObjectId comparison
        if (deductions.length === 0 && mongoose.Types.ObjectId.isValid(userid)) {
            try {
                const objectId = new mongoose.Types.ObjectId(userid)
                deductions = await DeductionSchema.find({userid: objectId})
            } catch (err) {
                console.log("ObjectId conversion failed:", err.message)
            }
        }
        
        // If still no results, try case-insensitive regex search
        if (deductions.length === 0) {
            deductions = await DeductionSchema.find({userid: {$regex: userid, $options: 'i'}})
        }
        
        // Extract numeric deduction record numbers and find the max
        let maxRecordNumber = 0
        
        deductions.forEach(deduction => {
            if (deduction['Deduction Record Number']) {
                const recordNum = parseInt(deduction['Deduction Record Number'], 10)
                if (!isNaN(recordNum) && recordNum > maxRecordNumber) {
                    maxRecordNumber = recordNum
                }
            }
        })
        
        // Return the next deduction record number
        const nextRecordNumber = maxRecordNumber + 1
        
        res.status(200).json({ nextRecordNumber: nextRecordNumber })
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error'})
    }
}