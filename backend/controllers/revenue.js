const RevenueSchema = require("../models/RevenueModel")
const mongoose = require("mongoose")


exports.addRevenue = async (req, res) => {
    const {userid, date, client, service, quantity, addOnService, serviceLocation, serviceFee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber} = req.body

    console.log('=== ADD REVENUE DEBUG ===');
    console.log('Date received:', date);
    console.log('Date type:', typeof date);
    console.log('serviceLocation received:', serviceLocation);
    console.log('serviceLocation type:', typeof serviceLocation);
    console.log('serviceLocation value will be:', serviceLocation || undefined);

    // Ensure date is stored as a Date object
    let dateToStore = date;
    if (typeof date === 'string') {
        dateToStore = new Date(date);
    }

    const revenue = RevenueSchema({
        userid,
        Date: dateToStore,
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

exports.searchRevenue = async (req, res) => {
    try {
        const { userid, date, client, service, invoiceNumber } = req.query;
        
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
        
        if (service) {
            searchCriteria.Service = service;
        }
        
        if (invoiceNumber) {
            searchCriteria['Invoice Number'] = invoiceNumber;
        }
        
        // Build initial query without client (we'll do fuzzy matching on results)
        console.log('Initial search criteria:', JSON.stringify(searchCriteria, null, 2));
        let revenue = await RevenueSchema.find(searchCriteria).sort({ createdAt: -1 });
        
        // Apply fuzzy matching to client if provided
        if (client) {
            revenue = applyFuzzyMatchRevenue(revenue, client);
        }
        
        console.log('Found revenue records:', revenue.length);
        res.status(200).json(revenue);
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

// Fuzzy matching helper function using Levenshtein distance
const levenshteinDistanceRevenue = (str1, str2) => {
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
const calculateRelevanceScoreRevenue = (fieldValue, searchTerm) => {
    if (!fieldValue || !searchTerm) return 0;
    
    const normalizedField = String(fieldValue).toLowerCase();
    const normalizedSearch = searchTerm.toLowerCase();
    
    // Exact match (case-insensitive): highest score
    if (normalizedField === normalizedSearch) return 100;
    
    // Contains match: high score
    if (normalizedField.includes(normalizedSearch)) return 80;
    
    // Fuzzy match: score based on Levenshtein distance
    const maxLen = Math.max(normalizedField.length, normalizedSearch.length);
    const distance = levenshteinDistanceRevenue(normalizedField, normalizedSearch);
    const similarity = 1 - (distance / maxLen);
    
    // Return score between 0-70 based on similarity
    return similarity >= 0.6 ? similarity * 70 : 0;
};

// Apply fuzzy matching and sort by relevance for revenue client names
const applyFuzzyMatchRevenue = (revenue, client) => {
    return revenue
        .map(item => {
            const relevanceScore = calculateRelevanceScoreRevenue(item.Client, client);
            return { ...item.toObject(), _relevanceScore: relevanceScore };
        })
        .filter(item => item._relevanceScore > 0)
        .sort((a, b) => b._relevanceScore - a._relevanceScore);
}

exports.updateRevenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, client, service, quantity, addOnService, serviceLocation, serviceFee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber } = req.body;

        // Format amount fields - remove $ if present and add it back with proper formatting
        const formatAmount = (amount) => {
            if (!amount) return '';
            const amountStr = String(amount).replace(/\$/g, '').trim();
            return amountStr ? `$${Number(amountStr).toFixed(2)}` : '';
        };

        const updateData = {
            Date: date,
            Client: client,
            Service: service,
            Quantity: quantity ? Number(quantity) : undefined,
            'Add-On Service': addOnService,
            'Service Location': serviceLocation || undefined,
            'Service Fee': formatAmount(serviceFee),
            'Travel Fee': formatAmount(travelFee),
            Discount: formatAmount(discount),
            'Discount Reason': discountReason,
            'Payment Type': paymentType || undefined,
            'Transaction Fees': formatAmount(transactionFee),
            'Actual Fees': formatAmount(actualRevenue),
            'Invoice Number': invoiceNumber
        };

        const updatedRevenue = await RevenueSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedRevenue) {
            return res.status(404).json({ message: 'Revenue record not found' });
        }

        res.status(200).json({ message: 'Revenue updated successfully', revenue: updatedRevenue });
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}