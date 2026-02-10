const ExpenseSchema = require("../models/ExpenseModel")
const mongoose = require("mongoose")

exports.addExpense = async (req, res) => {
    const {date, vendor, location, expenseType, expenseDescription, amount, paymentType, businessTrip, expenseRecordNumber, userid} = req.body

    // Log what we received
    console.log('=== ADD EXPENSE DEBUG ===');
    console.log('Date received:', date);
    console.log('Vendor received:', vendor);
    console.log('Location received:', location);
    console.log('Expense Type received:', expenseType);

    // Validation - check if required fields are empty
    if(!date || !vendor || !location || !expenseType){
        return res.status(400).json({message: 'Date, Vendor, Location, and Expense Type are required'})
    }

    // Ensure date is stored as a Date object
    let dateToStore = date;
    if (typeof date === 'string') {
        dateToStore = new Date(date);
    }

    const expense = ExpenseSchema({
        Date: dateToStore,
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
        if(amount && Number(amount) <= 0){
            return res.status(400).json({message: 'Amount must be positive number'})
        }

        // Check if expense record number is already in use
        if(expenseRecordNumber) {
            const existingExpense = await ExpenseSchema.findOne({
                userid: userid,
                'Expense Record Number': expenseRecordNumber
            })
            if(existingExpense) {
                return res.status(400).json({message: 'Expense Record Number already in use. Please use a different number.'})
            }
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

exports.searchExpenses = async (req, res) => {
    try {
        const { userid, date, vendor, expenseType, location, recordNumber } = req.query;
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        // Build search criteria
        let searchCriteria = { userid: userid.trim() };
        
        if (date) {
            // Match entire day - create range from start to end of day
            const dateObj = new Date(date);
            const year = dateObj.getUTCFullYear();
            const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getUTCDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            
            const startOfDay = new Date(`${dateString}T00:00:00Z`);
            const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
            
            searchCriteria.Date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }
        
        if (expenseType) {
            searchCriteria['Expense Type'] = expenseType;
        }
        
        // Exact match for record number
        if (recordNumber) {
            searchCriteria['Expense Record Number'] = Number(recordNumber);
        }
        
        // Build initial query without vendor and location (we'll do fuzzy matching on results)
        console.log('Initial search criteria:', JSON.stringify(searchCriteria, null, 2));
        let expenses = await ExpenseSchema.find(searchCriteria).sort({ createdAt: -1 });
        
        // Apply fuzzy matching to vendor and location if provided
        if (vendor || location) {
            expenses = applyFuzzyMatch(expenses, vendor, location);
        }
        
        console.log('Found expense records:', expenses.length);
        res.status(200).json(expenses);
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

// Fuzzy matching helper function using Levenshtein distance
const levenshteinDistance = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    
    return track[str2.length][str1.length];
};

// Calculate relevance score for fuzzy matching
const calculateRelevanceScore = (fieldValue, searchTerm) => {
    if (!fieldValue || !searchTerm) return 0;
    
    const normalizedField = String(fieldValue).toLowerCase();
    const normalizedSearch = searchTerm.toLowerCase();
    
    // Exact match (case-insensitive): highest score
    if (normalizedField === normalizedSearch) return 100;
    
    // Contains match: high score
    if (normalizedField.includes(normalizedSearch)) return 80;
    
    // Fuzzy match: score based on Levenshtein distance
    const maxLen = Math.max(normalizedField.length, normalizedSearch.length);
    const distance = levenshteinDistance(normalizedField, normalizedSearch);
    const similarity = 1 - (distance / maxLen);
    
    // Return score between 0-70 based on similarity
    return similarity >= 0.6 ? similarity * 70 : 0;
};

// Apply fuzzy matching and sort by relevance
const applyFuzzyMatch = (expenses, vendor, location) => {
    return expenses
        .map(expense => {
            let relevanceScore = 0;
            
            if (vendor) {
                relevanceScore += calculateRelevanceScore(expense['Vendor/Payee'], vendor);
            }
            
            if (location) {
                relevanceScore += calculateRelevanceScore(expense['Location'], location);
            }
            
            return { ...expense.toObject(), _relevanceScore: relevanceScore };
        })
        .filter(expense => expense._relevanceScore > 0)
        .sort((a, b) => b._relevanceScore - a._relevanceScore);
}

exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, vendor, location, expenseType, expenseDescription, amount, paymentType, businessTrip, expenseRecordNumber } = req.body;

        // Format amount - remove $ if present and add it back with proper formatting
        let formattedAmount = '';
        if (amount) {
            const amountStr = String(amount).replace(/\$/g, '').trim();
            if (amountStr) {
                formattedAmount = `$${Number(amountStr).toFixed(2)}`;
            }
        }

        const updateData = {
            Date: date,
            'Vendor/Payee': vendor,
            Location: location,
            'Expense Type': expenseType,
            'Expense Description': expenseDescription,
            Amount: formattedAmount,
            'Payment Type': paymentType || undefined,
            'Associated with a Business Trip': businessTrip ? 'Yes' : null,
            'Expense Record Number': expenseRecordNumber ? Number(expenseRecordNumber) : undefined
        };

        const updatedExpense = await ExpenseSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

exports.getMaxExpenseRecordNumber = async (req, res) => {
    try {
        let { userid } = req.query
        
        if (!userid) {
            return res.status(400).json({message: 'User ID is required'})
        }
        
        userid = userid.trim()
        
        // Get all expense records for the user
        let expenses = await ExpenseSchema.find({userid: userid})
        
        // If no string match found and userid looks like an ObjectId, try ObjectId comparison
        if (expenses.length === 0 && mongoose.Types.ObjectId.isValid(userid)) {
            try {
                const objectId = new mongoose.Types.ObjectId(userid)
                expenses = await ExpenseSchema.find({userid: objectId})
            } catch (err) {
                console.log("ObjectId conversion failed:", err.message)
            }
        }
        
        // If still no results, try case-insensitive regex search
        if (expenses.length === 0) {
            expenses = await ExpenseSchema.find({userid: {$regex: userid, $options: 'i'}})
        }
        
        // Extract numeric expense record numbers and find the max
        let maxRecordNumber = 0
        
        expenses.forEach(expense => {
            if (expense['Expense Record Number']) {
                const recordNum = parseInt(expense['Expense Record Number'], 10)
                if (!isNaN(recordNum) && recordNum > maxRecordNumber) {
                    maxRecordNumber = recordNum
                }
            }
        })
        
        // Return the next expense record number
        const nextRecordNumber = maxRecordNumber + 1
        
        res.status(200).json({ nextRecordNumber: nextRecordNumber })
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error'})
    }
}