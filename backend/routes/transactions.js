const { addExpense, getExpenses, deleteExpense, searchExpenses, updateExpense, getMaxExpenseRecordNumber } = require('../controllers/expense')
const { addRevenue, getRevenue, deleteRevenue, searchRevenue, updateRevenue, getMaxInvoiceNumber, getMaxIndividualInvoice, getMaxMonthlyInvoice } = require('../controllers/revenue');
const { addDeduction, getDeductions, deleteDeduction, searchDeductions, updateDeduction, getMaxDeductionRecordNumber } = require('../controllers/deduction');
const { addClient, getClients, deleteClient, editClient, searchClients, addClientFromGoogleSheets } = require('../controllers/client');
const { checkUser, register, login, changePassword, forgotPassword, resetPassword } = require('../controllers/user');

const router = require('express').Router()

router.post('/api/v1/add-revenue', addRevenue)
    .get('/api/v1/get-revenue', getRevenue)
    .get('/api/v1/get-max-invoice-number', getMaxInvoiceNumber)
    .get('/api/v1/get-max-individual-invoice', getMaxIndividualInvoice)
    .get('/api/v1/get-max-monthly-invoice', getMaxMonthlyInvoice)
    .get('/api/v1/search-revenue', searchRevenue)
    .put('/api/v1/update-revenue/:id', updateRevenue)
    .delete('/api/v1/delete-revenue/:id', deleteRevenue)
    .post('/api/v1/add-expense', addExpense)
    .get('/api/v1/get-expenses', getExpenses)
    .get('/api/v1/get-max-expense-record-number', getMaxExpenseRecordNumber)
    .get('/api/v1/search-expenses', searchExpenses)
    .put('/api/v1/update-expense/:id', updateExpense)
    .delete('/api/v1/delete-expense/:id', deleteExpense)
    .post('/api/v1/add-deduction', addDeduction)
    .get('/api/v1/get-deductions', getDeductions)
    .get('/api/v1/get-max-deduction-record-number', getMaxDeductionRecordNumber)
    .get('/api/v1/search-deductions', searchDeductions)
    .put('/api/v1/update-deduction/:id', updateDeduction)
    .delete('/api/v1/delete-deduction/:id', deleteDeduction)
    .post('/api/v1/add-client', addClient)
    .get('/api/v1/get-clients', getClients)
    .get('/api/v1/search-clients', searchClients)
    .delete('/api/v1/delete-client/:id', deleteClient)
    .put('/api/v1/edit-client/:id', editClient)
    .post('/api/v1/webhook/google-sheets-client', addClientFromGoogleSheets)
    .post('/api/v1/check-user', checkUser)
    .post("/api/v1/register", register)
    .post("/api/v1/login", login)
    .post("/api/v1/change-password", changePassword)
    .post("/api/v1/forgot-password", forgotPassword)
    .post("/api/v1/reset-password", resetPassword);

module.exports = router