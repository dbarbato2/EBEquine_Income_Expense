import {dashboard, expenses, transactions, trend, deductions, clients} from '../utils/Icons'

export const menuItems = [
    {
        id: 1,
        title: 'Dashboard',
        icon: dashboard,
        link: '/dashboard'
    },
    {
        id: 2,
        title: "View Transactions",
        icon: transactions,
        link: "/dashboard",
    },
    {
        id: 3,
        title: "Revenue",
        icon: trend,
        link: "/dashboard",
    },
    {
        id: 4,
        title: "Expenses",
        icon: expenses,
        link: "/dashboard",
    },
    {
        id: 5,
        title: "Deductions",
        icon: deductions,
        link: "/dashboard",
    },
    {
        id: 6,
        title: "Clients",
        icon: clients,
        link: "/dashboard",
    },
]