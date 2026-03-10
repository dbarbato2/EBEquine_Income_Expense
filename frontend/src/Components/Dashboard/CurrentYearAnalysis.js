import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';

function CurrentYearAnalysis() {
    const { revenue, expenses, deductions } = useGlobalContext()

    // Get current date
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Get unique years from all data
    const availableYears = useMemo(() => {
        const yearsSet = new Set()
        
        revenue.forEach(item => {
            const dateValue = item.date || item.Date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                yearsSet.add(year)
            }
        })
        
        expenses.forEach(item => {
            const dateValue = item.date || item.Date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                yearsSet.add(year)
            }
        })
        
        deductions.forEach(item => {
            if (item.Year) {
                const year = parseInt(item.Year)
                if (!isNaN(year)) {
                    yearsSet.add(year)
                }
            }
        })
        
        return Array.from(yearsSet).sort((a, b) => b - a)
    }, [revenue, expenses, deductions])

    // Get the latest year
    const latestYear = useMemo(() => {
        return availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()
    }, [availableYears])

    const [selectedYear, setSelectedYear] = useState(() => String(latestYear))

    // Check if a month/year is in the future
    const isFutureMonth = (year, monthIndex) => {
        if (year > currentYear) {
            return true
        }
        if (year === currentYear && monthIndex > currentMonth) {
            return true
        }
        return false
    }

    // Calculate monthly data
    const monthlyData = useMemo(() => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        
        // Determine which year(s) to analyze
        let yearsToAnalyze = [parseInt(selectedYear)]
        if (selectedYear === 'all') {
            yearsToAnalyze = availableYears
        }
        
        const data = months.map((month, index) => {
            const monthIndex = index; // 0-based month index
            
            const monthRevenue = revenue.filter(item => {
                const dateValue = item.date || item.Date || item.createdAt
                if (!dateValue) return false
                
                const date = new Date(dateValue)
                const itemYear = date.getUTCFullYear()
                const itemMonth = date.getUTCMonth()
                
                return yearsToAnalyze.includes(itemYear) && itemMonth === monthIndex
            })
            
            const monthExpenses = expenses.filter(item => {
                const dateValue = item.date || item.Date || item.createdAt
                if (!dateValue) return false
                
                const date = new Date(dateValue)
                const itemYear = date.getUTCFullYear()
                const itemMonth = date.getUTCMonth()
                
                return yearsToAnalyze.includes(itemYear) && itemMonth === monthIndex
            })
            
            const monthDeductions = deductions.filter(item => {
                if (!item.Year) return false
                const itemYear = parseInt(item.Year)
                const monthMap = {
                    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
                    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                }
                const itemMonth = monthMap[item.Month]
                
                return yearsToAnalyze.includes(itemYear) && itemMonth === monthIndex
            })
            
            // Calculate number of massages (Introductory Massage or 1 Hour Massage)
            let numberOfMassages = 0
            monthRevenue.forEach(item => {
                const service = item.Service || ''
                if (service === 'Introductory Massage' || service === '1 Hour Massage') {
                    const quantity = item.Quantity ? parseInt(item.Quantity) : 0
                    numberOfMassages += quantity
                }
            })
            
            // Calculate actual revenue
            let actualRevenue = 0
            monthRevenue.forEach(item => {
                const fees = item['Actual Fees'] ? parseFloat(item['Actual Fees'].toString().replace('$', '').replace(/,/g, '').trim()) : 0
                actualRevenue += fees
            })
            
            // Calculate total expenses
            let totalExpenses = 0
            monthExpenses.forEach(item => {
                const amount = item.Amount ? parseFloat(item.Amount.toString().replace('$', '').replace(/,/g, '').trim()) : 0
                totalExpenses += amount
            })
            
            // Calculate total deductions
            let totalDeductions = 0
            monthDeductions.forEach(item => {
                const amount = item['Deduction Amount'] ? parseFloat(item['Deduction Amount'].toString().replace('$', '').replace(/,/g, '').trim()) : 0
                totalDeductions += amount
            })
            
            // Calculate outstanding balances (unpaid invoices)
            let outstandingBalances = 0
            monthRevenue.forEach(item => {
                const actualFees = item['Actual Fees']
                // Check if Actual Fees is 0, null, or empty
                const isUnpaid = !actualFees || actualFees === '' || parseFloat(actualFees.toString().replace('$', '').replace(/,/g, '').trim()) === 0
                
                if (isUnpaid) {
                    const serviceFee = item['Service Fee'] ? parseFloat(item['Service Fee'].toString().replace('$', '').replace(/,/g, '').trim()) : 0
                    const travelFee = item['Travel Fee'] ? parseFloat(item['Travel Fee'].toString().replace('$', '').replace(/,/g, '').trim()) : 0
                    const discount = item.Discount ? parseFloat(item.Discount.toString().replace('$', '').replace(/,/g, '').trim()) : 0
                    
                    outstandingBalances += (serviceFee + travelFee - discount)
                }
            })
            
            return {
                month,
                numberOfMassages,
                actualRevenue,
                totalExpenses,
                totalDeductions,
                outstandingBalances,
                profit: actualRevenue - totalExpenses
            }
        })
        
        return data
    }, [revenue, expenses, deductions, selectedYear, availableYears])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount)
    }

    return (
        <CurrentYearAnalysisStyled>
            <div className="header">
                <h2>Monthly Analysis</h2>
                <div className="filter-group">
                    <label htmlFor="year-filter">Year:</label>
                    <select 
                        id="year-filter"
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="year-dropdown"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={String(year)}>
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
                            <th>Month</th>
                            <th>Number of Massages</th>
                            <th>Actual Revenue</th>
                            <th>Total Expenses</th>
                            <th>Total Deductions</th>
                            <th>Outstanding Balances</th>
                            <th>Profit (Actual Revenue - Expense, Excl. Taxes and Deductions)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.month}</td>
                                <td className="number">{isFutureMonth(parseInt(selectedYear), index) ? '-' : item.numberOfMassages}</td>
                                <td className="currency">{isFutureMonth(parseInt(selectedYear), index) ? '-' : formatCurrency(item.actualRevenue)}</td>
                                <td className="currency">{isFutureMonth(parseInt(selectedYear), index) ? '-' : formatCurrency(item.totalExpenses)}</td>
                                <td className="currency">{isFutureMonth(parseInt(selectedYear), index) ? '-' : formatCurrency(item.totalDeductions)}</td>
                                <td className="currency">{isFutureMonth(parseInt(selectedYear), index) ? '-' : formatCurrency(item.outstandingBalances)}</td>
                                <td className="currency">{isFutureMonth(parseInt(selectedYear), index) ? '-' : formatCurrency(item.profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CurrentYearAnalysisStyled>
    )
}

const CurrentYearAnalysisStyled = styled.div`
    margin-top: 3rem;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;

    .header {
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;

        h2 {
            color: var(--text-color);
            margin: 0;
            font-size: 1.4rem;
        }
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        label {
            color: var(--text-color);
            font-weight: 500;
            white-space: nowrap;
        }
    }

    .year-dropdown {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--card-bg);
        color: var(--text-color);
        font-size: 1rem;
        cursor: pointer;
        transition: border-color 0.3s;

        &:hover {
            border-color: var(--color-green);
        }

        &:focus {
            outline: none;
            border-color: var(--color-green);
        }
    }

    .table-wrapper {
        overflow-x: auto;
        
        table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: var(--hover-bg);
            }

            th {
                padding: 1rem;
                text-align: left;
                border-bottom: 2px solid var(--border-color);
                font-weight: 600;
                color: var(--text-color);
                background: var(--hover-bg);
            }

            td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-color);

                &.number {
                    text-align: center;
                    font-weight: 600;
                }

                &.currency {
                    text-align: right;
                    font-weight: 500;
                }
            }

            tbody tr:hover {
                background: var(--hover-bg);
            }

            tbody tr:last-child td {
                border-bottom: none;
            }
        }
    }
`;

export default CurrentYearAnalysis
