import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';

function QuarterlyRevenue() {
    const { quarterlyRevenue, quarterlyExpenses, quarterlyDeductions, revenue, expenses, deductions } = useGlobalContext()
    const [, setThemeUpdated] = useState(0)

    // Get current date
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const currentQuarter = Math.floor(currentMonth / 3)

    // Listen for theme changes and force re-render
    useEffect(() => {
        const handleThemeChange = () => {
            setThemeUpdated(prev => prev + 1)
        }

        window.addEventListener('themeChange', handleThemeChange)
        
        return () => {
            window.removeEventListener('themeChange', handleThemeChange)
        }
    }, [])

    // Get available years from all collections
    const availableYears = useMemo(() => {
        const years = new Set()
        
        revenue.forEach(item => {
            const dateValue = item.date || item.Date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                if (!isNaN(year)) {
                    years.add(year)
                }
            }
        })
        
        expenses.forEach(item => {
            const dateValue = item.date || item.Date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                if (!isNaN(year)) {
                    years.add(year)
                }
            }
        })
        
        deductions.forEach(item => {
            if (item.Year) {
                const year = parseInt(item.Year)
                if (!isNaN(year)) {
                    years.add(year)
                }
            }
        })
        
        const sortedYears = Array.from(years).sort((a, b) => b - a)
        return sortedYears.length > 0 ? sortedYears : [new Date().getFullYear()]
    }, [revenue, expenses, deductions])

    // Set selected year to the most recent year available in data
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Update selectedYear to the most recent year on component mount or when availableYears changes
    useEffect(() => {
        if (availableYears.length > 0) {
            setSelectedYear(availableYears[0])
        }
    }, [availableYears])

    const quarters = selectedYear === 'all' ? quarterlyRevenue(null) : quarterlyRevenue(selectedYear)
    const expenseData = selectedYear === 'all' ? quarterlyExpenses(null) : quarterlyExpenses(selectedYear)
    const deductionData = selectedYear === 'all' ? quarterlyDeductions(null) : quarterlyDeductions(selectedYear)

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount)
    }

    // Check if a quarter/year is in the future
    const isFutureQuarter = (year, quarterIndex) => {
        if (year > currentYear) {
            return true
        }
        if (year === currentYear && quarterIndex > currentQuarter) {
            return true
        }
        return false
    }

    return (
        <QuarterlyRevenueStyled>
            <div className="header">
                <h2>Quarterly Summary</h2>
                <div className="year-selector">
                    <label htmlFor="year-select">Year:</label>
                    <select 
                        id="year-select" 
                        value={selectedYear} 
                        onChange={(e) => {
                            const value = e.target.value
                            setSelectedYear(value === 'all' ? 'all' : parseInt(value))
                        }}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                        <option value="all">All Years</option>
                    </select>
                </div>
            </div>
            <div className="table-wrapper">
                <table>
                <thead>
                    <tr>
                        <th>Quarter</th>
                        <th>Total Revenue</th>
                        <th>Total Expenses</th>
                        <th>Total Deductions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Q1</td>
                        <td>{selectedYear !== 'all' && isFutureQuarter(selectedYear, 0) ? '-' : formatCurrency(quarters.Q1)}</td>
                        <td className="expense">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 0) ? '-' : formatCurrency(expenseData.Q1)}</td>
                        <td className="deduction">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 0) ? '-' : formatCurrency(deductionData.Q1)}</td>
                    </tr>
                    <tr>
                        <td>Q2</td>
                        <td>{selectedYear !== 'all' && isFutureQuarter(selectedYear, 1) ? '-' : formatCurrency(quarters.Q2)}</td>
                        <td className="expense">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 1) ? '-' : formatCurrency(expenseData.Q2)}</td>
                        <td className="deduction">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 1) ? '-' : formatCurrency(deductionData.Q2)}</td>
                    </tr>
                    <tr>
                        <td>Q3</td>
                        <td>{selectedYear !== 'all' && isFutureQuarter(selectedYear, 2) ? '-' : formatCurrency(quarters.Q3)}</td>
                        <td className="expense">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 2) ? '-' : formatCurrency(expenseData.Q3)}</td>
                        <td className="deduction">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 2) ? '-' : formatCurrency(deductionData.Q3)}</td>
                    </tr>
                    <tr>
                        <td>Q4</td>
                        <td>{selectedYear !== 'all' && isFutureQuarter(selectedYear, 3) ? '-' : formatCurrency(quarters.Q4)}</td>
                        <td className="expense">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 3) ? '-' : formatCurrency(expenseData.Q4)}</td>
                        <td className="deduction">{selectedYear !== 'all' && isFutureQuarter(selectedYear, 3) ? '-' : formatCurrency(deductionData.Q4)}</td>
                    </tr>
                </tbody>
            </table>
            </div>
            <p className="footnote">*Q3 includes only the months of July and August, September included as part of Q4</p>
        </QuarterlyRevenueStyled>
    )
}

const QuarterlyRevenueStyled = styled.div`
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    transition: all 0.3s ease;
    
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    h2 {
        margin: 0;
        font-size: 1.8rem;
        color: var(--text-color);
    }

    .year-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .year-selector label {
        font-weight: 600;
        color: var(--text-color);
    }

    .year-selector select {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--input-bg);
        color: var(--input-text);
        font-weight: 500;
        cursor: pointer;
        min-width: 100px;

        &:hover {
            border-color: var(--text-color);
        }

        &:focus {
            outline: none;
            border-color: var(--text-color);
            box-shadow: 0 0 0 2px var(--hover-bg);
        }
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    .table-wrapper {
        overflow-x: auto;
        overflow-y: auto;
        max-height: 600px;
        border-radius: 8px;
        margin: 1.5rem 0;

        table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: var(--hover-bg);
                position: sticky;
                top: 0;
            }

            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }

            th {
                font-weight: 600;
                color: var(--text-color);
                background: var(--hover-bg);
            }

            tbody tr:hover {
                background: var(--hover-bg);
            }

            tbody tr:last-child td {
                border-bottom: none;
            }

            td {
                color: var(--text-color);
                font-size: 1.1rem;

                &.expense {
                    font-weight: 600;
                    color: var(--text-color);
                }

                &.deduction {
                    font-weight: 600;
                    color: var(--text-color);
                }
            }
        }
    }

    .footnote {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: var(--text-color);
        opacity: 0.7;
        font-style: italic;
    }
`;

export default QuarterlyRevenue
