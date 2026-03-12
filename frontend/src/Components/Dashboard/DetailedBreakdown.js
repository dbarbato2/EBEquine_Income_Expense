import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { useGlobalContext } from '../../context/globalContext';
import { downloadCSV } from '../../utils/downloadUtils';

function DetailedBreakdown() {
    const { revenue, expenses, deductions } = useGlobalContext()
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedType, setSelectedType] = useState('expenses')
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
                        
                        if (selectedYear === 'all' || year === selectedYear) {
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
                        
                        if (selectedYear === 'all' || year === selectedYear) {
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
                
                if (selectedYear === 'all' || year === selectedYear) {
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

    const handleDownloadCSV = () => {
        const rows = breakdownData.categories.map(cat => {
            const row = { Category: cat }
            ;['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
                row[q] = formatCurrency(breakdownData.data[q][cat] || 0)
            })
            row['Total'] = formatCurrency(
                ['Q1', 'Q2', 'Q3', 'Q4'].reduce((sum, q) => sum + (breakdownData.data[q][cat] || 0), 0)
            )
            return row
        })
        const typeLabel = selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
        const filename = selectedYear === 'all' ? `Quarterly Breakdown - ${typeLabel}` : `Quarterly Breakdown - ${typeLabel} - ${selectedYear}`
        downloadCSV(rows, filename)
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
                    <button className="download-btn" onClick={handleDownloadCSV} title="Download CSV">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
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
                        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, quarterIndex) => (
                            <tr key={quarter}>
                                <td className="quarter-label">{quarter}</td>
                                {breakdownData.categories.map(category => {
                                    const amount = breakdownData.data[quarter][category] || 0
                                    const isFuture = selectedYear !== 'all' && isFutureQuarter(selectedYear, quarterIndex)
                                    return (
                                        <td key={`${quarter}-${category}`} className="amount">
                                            {isFuture ? '-' : formatCurrency(amount)}
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
    position: relative;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;
    transition: all 0.3s ease;
    
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
        color: var(--text-color);
    }

    .controls {
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }

    .download-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--input-bg);
        color: var(--text-color);
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.2s ease;
        &:hover {
            background: var(--hover-bg);
        }
        svg {
            display: block;
        }
    }

    .control-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .control-group label {
        font-weight: 600;
        color: var(--text-color);
    }

    .control-group select {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--input-bg);
        color: var(--input-text);
        font-weight: 500;
        cursor: pointer;
        min-width: 150px;

        &:hover {
            border-color: var(--text-color);
        }

        &:focus {
            outline: none;
            border-color: var(--text-color);
            box-shadow: 0 0 0 2px var(--hover-bg);
        }
    }

    .table-wrapper {
        overflow-x: auto;
        overflow-y: auto;
        max-height: 600px;
        border-radius: 8px;
        border: 1px solid var(--border-color);

        table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: var(--hover-bg);
                position: sticky;
                top: 0;
            }

            th {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
                font-weight: 600;
                color: var(--text-color);
                background: var(--hover-bg);
                white-space: nowrap;
            }

            td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-color);
                font-size: 1rem;
            }

            td.quarter-label {
                font-weight: 600;
                color: var(--text-color);
                width: 80px;
                position: sticky;
                left: 0;
                background: var(--card-bg);
                z-index: 1;
            }

            td.amount {
                text-align: right;
                font-weight: 500;
                color: var(--text-color);
            }

            tbody tr:hover {
                background: var(--hover-bg);
            }

            tbody tr:last-child td {
                border-bottom: none;
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
