const ExpenseSchema = require("../models/ExpenseModel")
const mongoose = require("mongoose")

exports.addExpense = async (req, res) => {
    const {date, vendor, location, expenseType, expenseDescription, amount, paymentType, businessTrip, expenseRecordNumber, userid} = req.body

    const expense = ExpenseSchema({
        Date: date,
        'Vendor/Payee': vendor,
        Location: location,
        'Expense Type': expenseType,
        'Expense Description': expenseDescription,
        Amount: amount ? `$${Number(amount).toFixed(2)}` : '',
        'Payment Type': paymentType,
        'Associated with a Business Trip': businessTrip ? 'Yes' : null,
        'Expense Record Number': expenseRecordNumber,
        userid
    })

    try {
        if(!date || !vendor || !location || !expenseType){
            return res.status(400).json({message: 'Date, Vendor, Location, and Expense Type are required'})
        }
        if(amount && Number(amount) <= 0){
            return res.status(400).json({message: 'Amount must be positive number'})
        }

        await expense.save()
        res.status(200).json({message: 'Expense Added'})
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error'})
    }

    // console.log(expense)
}

exports.getExpenses = async (req, res) => {
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
        let expenses = await ExpenseSchema.find({ userid: userid }).sort({ createdAt: -1 });
        // console.log("Expenses found (string match) count:", expenses.length)
        
        // If no results and userid looks like an ObjectId, try ObjectId comparison
        if (expenses.length === 0 && mongoose.Types.ObjectId.isValid(userid)) {
            // console.log("No string match found, trying ObjectId comparison...")
            try {
                const objectId = new mongoose.Types.ObjectId(userid)
                expenses = await ExpenseSchema.find({ userid: objectId }).sort({ createdAt: -1 });
                // console.log("Expenses found (ObjectId match) count:", expenses.length)
            } catch (err) {
                // console.log("ObjectId conversion failed:", err.message)
            }
        }
        
        // If still no results, try case-insensitive regex search
        if (expenses.length === 0) {
            // console.log("No match found yet, trying case-insensitive regex search...")
            expenses = await ExpenseSchema.find({userid: {$regex: userid, $options: 'i'}}).sort({createdAt: -1})
            // console.log("Expenses found (case-insensitive) count:", expenses.length)
        }
        
        // console.log("Final expenses data:", expenses)
        res.status(200).json(expenses)
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message :'Server Error', error: error.message})
    }
}


exports.deleteExpense = async (req, res) => {

    const {id} = req.params;
    ExpenseSchema.findByIdAndDelete(id)
    .then((expense) => {
        res.status(200).json({message :'Expense deleted.'})
    })
    .catch((error) => {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message :'Server Error'})
    })
    
}