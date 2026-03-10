import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Chart as ChartJs, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useGlobalContext } from '../../context/globalContext';

ChartJs.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function LocationByMonth() {
    const { revenue, expenses } = useGlobalContext()
    const [selectedCategory, setSelectedCategory] = useState('Revenue')

    // Get current date
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Get unique years from both revenue and expenses data
    const availableYears = useMemo(() => {
        const yearsSet = new Set()
        
        revenue.forEach(item => {
            const dateValue = item.Date || item.date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                yearsSet.add(year)
            }
        })
        
        expenses.forEach(item => {
            const dateValue = item.Date || item.date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                yearsSet.add(year)
            }
        })
        
        return Array.from(yearsSet).sort((a, b) => b - a)
    }, [revenue, expenses])

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

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    }

    // Build table data based on selected category
    const tableData = useMemo(() => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]

        if (selectedCategory === 'Revenue') {
            // Build revenue table
            const locationMap = {}
            
            revenue.forEach(item => {
                const dateValue = item.Date || item.date || item.createdAt
                if (!dateValue) return
                
                const date = new Date(dateValue)
                const year = date.getUTCFullYear()
                const month = date.getUTCMonth()
                
                // Filter by selected year
                const yearToCheck = selectedYear === 'all' ? null : parseInt(selectedYear)
                if (yearToCheck && year !== yearToCheck) return
                
                const location = item['Service Location'] || 'Unknown'
                const monthName = months[month]
                let actualFees = item['Actual Fees'] ? parseFloat(item['Actual Fees'].toString().replace(/\$/g, '').replace(/,/g, '').trim()) : 0
                actualFees = isNaN(actualFees) ? 0 : actualFees
                
                if (!locationMap[location]) {
                    locationMap[location] = {}
                    months.forEach(m => {
                        locationMap[location][m] = 0
                    })
                }
                
                locationMap[location][monthName] += actualFees
            })
            
            return {
                locations: Object.keys(locationMap).filter(loc => loc && loc !== 'Unknown' && loc !== 'N/A').sort(),
                months,
                data: locationMap
            }
        } else {
            // Build expenses table
            const stateMap = {}
            
            expenses.forEach(item => {
                const dateValue = item.Date || item.date || item.createdAt
                if (!dateValue) return
                
                const date = new Date(dateValue)
                const year = date.getUTCFullYear()
                const month = date.getUTCMonth()
                
                // Filter by selected year
                const yearToCheck = selectedYear === 'all' ? null : parseInt(selectedYear)
                if (yearToCheck && year !== yearToCheck) return
                
                const location = item.Location || ''
                const state = location.slice(-2).toUpperCase() || 'Unknown'
                const monthName = months[month]
                let amount = item.Amount ? parseFloat(item.Amount.toString().replace(/\$/g, '').replace(/,/g, '').trim()) : 0
                amount = isNaN(amount) ? 0 : amount
                
                if (!stateMap[state]) {
                    stateMap[state] = {}
                    months.forEach(m => {
                        stateMap[state][m] = 0
                    })
                }
                
                stateMap[state][monthName] += amount
            })
            
            return {
                locations: Object.keys(stateMap).filter(state => state && state !== 'Unknown' && state !== 'N/A').sort(),
                months,
                data: stateMap
            }
        }
    }, [revenue, expenses, selectedCategory, selectedYear])

    // Prepare bar chart data
    const barChartData = useMemo(() => {
        const colors = ['#00D9FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#FF8C42', '#9D84B7', '#A8DADC', '#F7DC6F', '#BB8FCE']
        
        const datasets = tableData.locations.map((location, index) => ({
            label: location,
            data: tableData.months.map(month => tableData.data[location][month]),
            backgroundColor: colors[index % colors.length],
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1
        }))

        return {
            labels: tableData.months,
            datasets
        }
    }, [tableData])

    return (
        <LocationByMonthStyled>
            <div className="header-with-filters">
                <h3>Monthly Summary By Location</h3>
                <div className="filters-group">
                    <div className="filter-group">
                        <label htmlFor="category-filter">Category:</label>
                        <select 
                            id="category-filter"
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="dropdown"
                        >
                            <option value="Revenue">Revenue</option>
                            <option value="Expenses">Expenses</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="year-filter">Year:</label>
                        <select 
                            id="year-filter"
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="dropdown"
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
            </div>
            
            {tableData.locations.length > 0 ? (
                <>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>{selectedCategory === 'Revenue' ? 'Service Location' : 'State'}</th>
                                    {tableData.months.map(month => (
                                        <th key={month}>{month.slice(0, 3)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.locations.map((location, index) => (
                                    <tr key={index}>
                                        <td className="location-name">{location}</td>
                                        {tableData.months.map((month, monthIndex) => (
                                            <td key={month} className="currency">
                                                {isFutureMonth(parseInt(selectedYear), monthIndex) ? '-' : formatCurrency(tableData.data[location][month])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bar-chart-container">
                        <Bar 
                            data={barChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                indexAxis: undefined,
                                scales: {
                                    x: {
                                        stacked: true,
                                        ticks: {
                                            color: 'var(--text-color)'
                                        },
                                        grid: {
                                            display: false
                                        }
                                    },
                                    y: {
                                        stacked: true,
                                        ticks: {
                                            color: 'var(--text-color)',
                                            callback: function(value) {
                                                return '$' + value.toLocaleString()
                                            }
                                        },
                                        grid: {
                                            color: 'rgba(128, 128, 128, 0.2)'
                                        }
                                    }
                                },
                                plugins: {
                                    datalabels: {
                                        display: false
                                    },
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: 'var(--text-color)',
                                            padding: 15,
                                            font: {
                                                size: 12
                                            }
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const value = new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(context.parsed.y)
                                                return context.dataset.label + ': ' + value
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </>
            ) : (
                <p className="no-data">No data available for the selected filters</p>
            )}
        </LocationByMonthStyled>
    )
}

const LocationByMonthStyled = styled.div`
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;

    .header-with-filters {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;

        h3 {
            color: var(--text-color);
            margin: 0;
            font-size: 1.3rem;
        }
    }

    .filters-group {
        display: flex;
        align-items: center;
        gap: 1.5rem;
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

    .dropdown {
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
                text-align: right;
                border-bottom: 2px solid var(--border-color);
                font-weight: 600;
                color: var(--text-color);
                background: var(--hover-bg);

                &:first-child {
                    text-align: left;
                }
            }

            td {
                padding: 1rem;
                text-align: right;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-color);

                &.location-name {
                    text-align: left;
                    font-weight: 500;
                }

                &.currency {
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

    .no-data {
        text-align: center;
        color: var(--text-color);
        font-size: 1rem;
        margin: 1rem 0;
    }

    .bar-chart-container {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
        max-height: 500px;
    }
`;

export default LocationByMonth
