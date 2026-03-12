import React, { useMemo, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Line } from 'react-chartjs-2'
import { downloadCSV, downloadChartPNG } from '../../utils/downloadUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels)

function HistoricalRevenue() {
    const { revenue } = useGlobalContext()

    // Get current date
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    }

    // Check if a month/year is in the future or not completed
    const isFutureMonth = (year, monthIndex) => {
        if (year > currentYear) {
            return true
        }
        if (year === currentYear && monthIndex >= currentMonth) {
            return true
        }
        return false
    }

    // Format percentage
    const formatPercentage = (percentage) => {
        return `${percentage.toFixed(2)}%`
    }

    // Calculate year over year percentage change
    const calculateYoYPercentage = (currentValue, previousValue) => {
        if (previousValue === 0) {
            return 'N/A'
        }
        const percentageChange = ((currentValue - previousValue) / previousValue) * 100
        return percentageChange
    }

    // Build table data - historical revenue by year and month
    const tableData = useMemo(() => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]

        const yearMap = {}

        revenue.forEach(item => {
            const dateValue = item.Date || item.date || item.createdAt
            if (!dateValue) return
            
            const date = new Date(dateValue)
            const year = date.getUTCFullYear()
            const month = date.getUTCMonth()
            const monthName = months[month]
            
            let actualFees = item['Actual Fees'] ? parseFloat(item['Actual Fees'].toString().replace(/\$/g, '').replace(/,/g, '').trim()) : 0
            actualFees = isNaN(actualFees) ? 0 : actualFees
            
            if (!yearMap[year]) {
                yearMap[year] = {}
                months.forEach(m => {
                    yearMap[year][m] = 0
                })
            }
            
            yearMap[year][monthName] += actualFees
        })

        const years = Object.keys(yearMap).map(Number).sort((a, b) => a - b)

        return {
            years,
            months,
            data: yearMap
        }
    }, [revenue])

    // Build chart data for line graph
    const chartData = useMemo(() => {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ]

        const datasets = tableData.years.map((year, yearIndex) => ({
            label: year.toString(),
            data: tableData.months.map(month => tableData.data[year][month]),
            borderColor: colors[yearIndex % colors.length],
            backgroundColor: colors[yearIndex % colors.length],
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: colors[yearIndex % colors.length],
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0,
            fill: false
        }))

        return {
            labels: tableData.months.map(m => m.slice(0, 3)),
            datasets
        }
    }, [tableData])

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'var(--text-color)',
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    usePointStyle: true,
                    padding: 15
                }
            },
            title: {
                display: false
            },
            datalabels: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'var(--border-color)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        return formatCurrency(context.parsed.y)
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false
                },
                ticks: {
                    color: 'var(--text-color)',
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.1)'
                },
                ticks: {
                    color: 'var(--text-color)',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        return '$' + value.toLocaleString()
                    }
                }
            }
        }
    }

    const chartRef = useRef(null)

    const [showDownloadMenu, setShowDownloadMenu] = useState(false)
    const downloadMenuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target)) {
                setShowDownloadMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleDownloadCSV = () => {
        const rows = tableData.years.map(year => {
            const row = { Year: year }
            tableData.months.forEach(m => {
                row[m] = formatCurrency(tableData.data[year][m] || 0)
            })
            return row
        })
        downloadCSV(rows, 'Historical Revenue')
    }

    const handleDownloadPNG = () => {
        downloadChartPNG(chartRef, 'Historical Revenue', 'Historical Revenue')
    }

    return (
        <HistoricalRevenueStyled>
            <div className="header">
                <h3>Historical Revenue</h3>
            </div>
            <div className="download-wrapper" ref={downloadMenuRef}>
                <button className="download-btn" onClick={() => setShowDownloadMenu(m => !m)} title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </button>
                {showDownloadMenu && (
                    <div className="download-menu">
                        <button className="download-menu-item" onClick={() => { handleDownloadCSV(); setShowDownloadMenu(false) }}>Download CSV</button>
                        <button className="download-menu-item" onClick={() => { handleDownloadPNG(); setShowDownloadMenu(false) }}>Download PNG</button>
                    </div>
                )}
            </div>
            
            {tableData.years.length > 0 ? (
                <>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    {tableData.months.map(month => (
                                        <th key={month}>{month.slice(0, 3)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.years.map((year, index) => (
                                    <tr key={index}>
                                        <td className="year-name">{year}</td>
                                        {tableData.months.map((month, monthIndex) => (
                                            <td key={month} className="currency">
                                                {isFutureMonth(year, monthIndex) ? '-' : formatCurrency(tableData.data[year][month])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="footnote">* Data for Incomplete Months Not Shown</p>

                    {tableData.years.length > 1 && (
                        <div className="table-wrapper yoy-table-wrapper">
                            <h4>Year-over-Year % Change</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        {tableData.months.map(month => (
                                            <th key={month}>{month.slice(0, 3)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.years.map((year, yearIndex) => {
                                        const previousYear = yearIndex > 0 ? tableData.years[yearIndex - 1] : null
                                        return (
                                            <tr key={yearIndex}>
                                                <td className="year-name">{year}</td>
                                                {tableData.months.map((month, monthIndex) => {
                                                    if (!previousYear) {
                                                        return (
                                                            <td key={month} className="percentage">
                                                                -
                                                            </td>
                                                        )
                                                    }
                                                    
                                                    const isFuture = isFutureMonth(year, monthIndex)
                                                    const currentValue = tableData.data[year][month]
                                                    const previousValue = tableData.data[previousYear][month]
                                                    
                                                    if (isFuture) {
                                                        return (
                                                            <td key={month} className="percentage">
                                                                -
                                                            </td>
                                                        )
                                                    }

                                                    const yoyChange = calculateYoYPercentage(currentValue, previousValue)
                                                    
                                                    return (
                                                        <td key={month} className={`percentage ${typeof yoyChange === 'number' ? (yoyChange >= 0 ? 'positive' : 'negative') : ''}`}>
                                                            {typeof yoyChange === 'number' ? formatPercentage(yoyChange) : yoyChange}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="chart-wrapper">
                        <h4>Monthly Revenue By Year</h4>
                        <Line ref={chartRef} data={chartData} options={chartOptions} />
                    </div>
                </>
            ) : (
                <p className="no-data">No revenue data available</p>
            )}
        </HistoricalRevenueStyled>
    )
}

const HistoricalRevenueStyled = styled.div`
    position: relative;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;

    .header {
        margin-bottom: 1.5rem;

        h3 {
            color: var(--text-color);
            margin: 0;
            font-size: 1.3rem;
        }
    }

    .download-wrapper {
        position: absolute;
        top: 1.5rem;
        right: 2rem;
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

    .download-menu {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        z-index: 100;
        overflow: hidden;
        min-width: 140px;
    }

    .download-menu-item {
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        background: transparent;
        border: none;
        text-align: left;
        color: var(--text-color);
        font-size: 0.85rem;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s ease;
        &:hover {
            background: var(--hover-bg);
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

                &.year-name {
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

    .footnote {
        text-align: left;
        color: var(--text-color);
        font-size: 0.85rem;
        font-style: italic;
        margin-top: 1rem;
        margin-bottom: 0;
        opacity: 0.8;
    }

    .yoy-table-wrapper {
        margin-top: 2rem;

        h4 {
            margin: 0 0 1rem 0;
            color: var(--text-color);
            font-size: 1.1rem;
            font-weight: 600;
        }

        td.percentage {
            &.positive {
                color: var(--text-color);
                font-weight: 500;
            }

            &.negative {
                color: var(--text-color);
                font-weight: 500;
            }
        }
    }

    .chart-wrapper {
        margin-top: 2rem;
        padding: 1.5rem;
        background: #ffffff;
        border-radius: 8px;

        h4 {
            margin: 0 0 1.5rem 0;
            color: var(--text-color);
            font-size: 1.1rem;
            font-weight: 600;
        }

        canvas {
            max-height: 400px;
        }
    }
`;

export default HistoricalRevenue
