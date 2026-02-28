import {dashboard, expenses, trend, deductions, clients, calculator} from '../utils/Icons'

export const menuItems = [
    {
        id: 1,
        title: 'Dashboard',
        icon: dashboard,
        link: '/dashboard'
    },
    {
        id: 5,
        title: "Revenue",
        icon: trend,
        link: "/dashboard",
        submenu: [
            {
                id: 51,
                title: "Add Revenue",
                link: "/dashboard",
            },
            {
                id: 52,
                title: "Modify/Delete Revenue",
                link: "/dashboard",
            },
            {
                id: 50,
                title: "View Transactions",
                link: "/dashboard",
            },
        ]
    },
    {
        id: 6,
        title: "Expenses",
        icon: expenses,
        link: "/dashboard",
        submenu: [
            {
                id: 61,
                title: "Add Expense",
                link: "/dashboard",
            },
            {
                id: 62,
                title: "Modify/Delete Expense",
                link: "/dashboard",
            },
            {
                id: 60,
                title: "View Transactions",
                link: "/dashboard",
            },
        ]
    },
    {
        id: 7,
        title: "Deductions",
        icon: deductions,
        link: "/dashboard",
        submenu: [
            {
                id: 71,
                title: "Add Deduction",
                link: "/dashboard",
            },
            {
                id: 72,
                title: "Modify/Delete Deduction",
                link: "/dashboard",
            },
            {
                id: 70,
                title: "View Transactions",
                link: "/dashboard",
            },
        ]
    },
    {
        id: 8,
        title: "Clients",
        icon: clients,
        link: "/dashboard",
        submenu: [
            {
                id: 81,
                title: "Add Client",
                link: "/dashboard",
            },
            {
                id: 82,
                title: "Modify/Delete Client",
                link: "/dashboard",
            },
            {
                id: 80,
                title: "View Clients",
                link: "/dashboard",
            },
        ]
    },
    {
        id: 9,
        title: "Trip Cost Calculator",
        icon: calculator,
        link: "/trip-calculator"
    },
]