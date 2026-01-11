const { addExpense, getExpenses, deleteExpense } = require('../controllers/expense')
const { addRevenue, getRevenue, deleteRevenue } = require('../controllers/revenue');
const { addDeduction, getDeductions, deleteDeduction } = require('../controllers/deduction');
const { checkUser, register, login } = require('../controllers/user');

const router = require('express').Router()

router.post('/api/v1/add-revenue', addRevenue)
    .get('/api/v1/get-revenue', getRevenue)
    .delete('/api/v1/delete-revenue/:id', deleteRevenue)
    .post('/api/v1/add-expense', addExpense)
    .get('/api/v1/get-expenses', getExpenses)
    .delete('/api/v1/delete-expense/:id', deleteExpense)
    .post('/api/v1/add-deduction', addDeduction)
    .get('/api/v1/get-deductions', getDeductions)
    .delete('/api/v1/delete-deduction/:id', deleteDeduction)
    .post("", checkUser)
    .post("/api/v1/register", register)
    .post("/api/v1/login", login);

module.exports = router