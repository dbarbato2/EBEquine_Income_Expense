const DeductionSchema = require("../models/DeductionModel")



exports.addDeduction = async (req, res) => {
    const {title, amount, category, description, date, userid} = req.body

    const expense = DeductionSchema({
        title, amount, category, description, date, userid
    })

    try {
        if(!title || !category || !description || !date){
            return res.status(400).json({message: 'All fields are required'})
        }
        if(amount <=0 || !amount === 'number' ){
            return res.status(400).json({message: 'Amount must be positive number'})
        }

        await expense.save()
        res.status(200).json({message: 'Deduction Added'})
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }

    console.log(expense)
}

exports.getDeductions = async (req, res) => {
    try {

        const {userid} = req.query;
        const expenses = await ExpenseSchema.find({ userid: userid }).sort({ createdAt: -1 });
        res.status(200).json(expenses)
    } catch (error) {
        res.status(500).json({message :'Server Error'})
    }

}


exports.deleteDeduction = async (req, res) => {

    const {id} = req.params;
    DeductionSchema.findByIdAndDelete(id)
    .then((deduction) => {
        res.status(200).json({message :'Deduction deleted.'})
    })
    .catch((err) => {
        res.status(500).json({message :'Server Error'})
    })
    
}