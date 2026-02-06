import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { useGlobalContext } from '../../context/globalContext';

function DetailedBreakdown() {
    const { revenue, expenses, deductions } = useGlobalContext()
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedType, setSelectedType] = useState('expenses')

    // Get available years from all collections
    const availableYears = useMemo(() => {
        const years = new Set()
        
        revenue.forEach(item => {
            const dateValue = item.date || item.Date || item.createdAt
            if (dateValue) {
                const momentDate = moment.utc(dateValue)
                if (momentDate.isValid()) {
                    years.add(momentDate.year())
                }
            }
        })
        
        expenses.forEach(item => {
            const dateValue = item.date || item.Date || item.createdAt
            if (dateValue) {
                const momentDate = moment.utc(dateValue)
                if (momentDate.isValid()) {
                    years.add(momentDate.year())
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

    // Set selectedYear to the most recent year on component mount or when availableYears changes
    useEffect(() => {
        if (availableYears.length > 0) {
            setSelectedYear(availableYears[0])
        }
    }, [availableYears])

    // Month to quarter mapping
    const getQuarter = (month) => {
        const monthNum = typeof month === 'string' ? 
            new Date(`${month} 1`).getMonth() + 1 : 
            month
        
        if (monthNum <= 3) return 'Q1'
        if (monthNum <= 6) return 'Q2'
        if (monthNum <= 9) return 'Q3'
        return 'Q4'
    }

    // Get unique categories and build breakdown data
    const breakdownData = useMemo(() => {
        const data = {
            Q1: {},
            Q2: {},
            Q3: {},
            Q4: {}
        }
        const categories = new Set()

        if (selectedType === 'revenue') {
            revenue.forEach(item => {
                const dateValue = item.Date
                if (dateValue) {
                    const momentDate = moment.utc(dateValue)
                    if (momentDate.isValid()) {
                        const year = momentDate.year()
                        const month = momentDate.month() + 1
                        
                        if (year === selectedYear) {
                            const quarter = getQuarter(month)
                            const service = item.Service || 'Unknown'
                            const amount = parseFloat(item['Actual Fees']?.replace(/[$,]/g, '') || 0)
                            
                            categories.add(service)
                            data[quarter][service] = (data[quarter][service] || 0) + amount
                        }
                    }
                }
            })
        } else if (selectedType === 'expenses') {
            expenses.forEach(item => {
                const dateValue = item.Date
                if (dateValue) {
                    const momentDate = moment.utc(dateValue)
                    if (momentDate.isValid()) {
                        const year = momentDate.year()
                        const month = momentDate.month() + 1
                        
                        if (year === selectedYear) {
                            const quarter = getQuarter(month)
                            const expenseType = item['Expense Type'] || 'Unknown'
                            const amount = parseFloat(item.Amount?.replace(/[$,]/g, '') || 0)
                            
                            categories.add(expenseType)
                            data[quarter][expenseType] = (data[quarter][expenseType] || 0) + amount
                        }
                    }
                }
            })
        } else if (selectedType === 'deductions') {
            deductions.forEach(item => {
                const year = parseInt(item.Year)
                
                if (year === selectedYear) {
                    const quarter = getQuarter(item.Month)
                    const deductionType = item['Deduction Type'] || 'Unknown'
                    const amount = parseFloat(item['Deduction Amount']?.replace(/[$,]/g, '') || 0)
                    
                    categories.add(deductionType)
                    data[quarter][deductionType] = (data[quarter][deductionType] || 0) + amount
                }
            })
        }

        return {
            data,
            categories: Array.from(categories).sort()
        }
    }, [selectedYear, selectedType, revenue, expenses, deductions])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount)
    }

    return (
        <DetailedBreakdownStyled>
            <div className="header">
                <h2>Quarterly Breakdown</h2>
                <div className="controls">
                    <div className="control-group">
                        <label htmlFor="year-select">Year:</label>
                        <select 
                            id="year-select" 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="type-select">Category:</label>
                        <select 
                            id="type-select" 
                            value={selectedType} 
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="revenue">Revenue</option>
                            <option value="expenses">Expenses</option>
                            <option value="deductions">Deductions</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Quarter</th>
                            {breakdownData.categories.map(category => (
                                <th key={category}>{category}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
                            <tr key={quarter}>
                                <td className="quarter-label">{quarter}</td>
                                {breakdownData.categories.map(category => {
                                    const amount = breakdownData.data[quarter][category] || 0
                                    return (
                                        <td key={`${quarter}-${category}`} className="amount">
                                            {formatCurrency(amount)}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="footnote">*Q3 includes only the months of July and August, September included as part of Q4</p>
            </div>
        </DetailedBreakdownStyled>
    )
}

const DetailedBreakdownStyled = styled.div`
    background: #FCF6F9;
    border: 2px solid #FFFFFF;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;
    
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    h2 {
        margin: 0;
        font-size: 1.8rem;
        color: #222260;
    }

    .controls {
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }

    .control-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .control-group label {
        font-weight: 600;
        color: #222260;
    }

    .control-group select {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: white;
        color: #222260;
        font-weight: 500;
        cursor: pointer;
        min-width: 150px;

        &:hover {
            border-color: #bbb;
        }

        &:focus {
            outline: none;
            border-color: #999;
            box-shadow: 0 0 0 2px rgba(34, 34, 96, 0.1);
        }
    }

    .table-wrapper {
        overflow-x: auto;
        overflow-y: auto;
        max-height: 600px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;

        table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: #f5f5f5;
                position: sticky;
                top: 0;
            }

            th {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
                font-weight: 600;
                color: #222260;
                background: #f5f5f5;
                white-space: nowrap;
            }

            td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
                color: #222260;
                font-size: 1rem;
            }

            td.quarter-label {
                font-weight: 600;
                color: #222260;
                width: 80px;
                position: sticky;
                left: 0;
                background: #fff;
                z-index: 1;
            }

            td.amount {
                text-align: right;
                font-weight: 500;
                color: #222260;
            }

            tbody tr:hover {
                background: #fff9fc;
            }

            tbody tr:last-child td {
                border-bottom: none;
            }
        }
    }

    .footnote {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #666;
        font-style: italic;
    }

    @media (max-width: 768px) {
        .header {
            flex-direction: column;
            align-items: flex-start;
        }

        .controls {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
        }

        .control-group {
            width: 100%;
        }

        .control-group select {
            width: 100%;
        }
    }
`;

export default DetailedBreakdown
