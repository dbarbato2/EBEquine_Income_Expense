import React, { useMemo, useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Chart as ChartJs, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie } from 'react-chartjs-2'
import { useGlobalContext } from '../../context/globalContext';
import { downloadCSV, downloadChartPNG } from '../../utils/downloadUtils';

ChartJs.register(ArcElement, Tooltip, Legend, ChartDataLabels)

function RevenueByPaymentType() {
    const { revenue } = useGlobalContext()

    // Get unique years from revenue data, sorted in descending order
    const availableYears = useMemo(() => {
        const yearsSet = new Set()
        revenue.forEach(item => {
            const dateValue = item.Date || item.date || item.createdAt
            if (dateValue) {
                const year = new Date(dateValue).getUTCFullYear()
                yearsSet.add(year)
            }
        })
        return Array.from(yearsSet).sort((a, b) => b - a)
    }, [revenue])

    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))

    // Update selectedYear to the most recent year once data loads
    useEffect(() => {
        if (availableYears.length > 0) {
            setSelectedYear(String(availableYears[0]))
        }
    }, [availableYears])

    // Format payment type display
    const formatPaymentType = (paymentType) => {
        const paymentTypeMap = {
            'venmo': 'Venmo',
            'cash': 'Cash',
            'check': 'Check',
            'gift certificate': 'Gift Certificate'
        }
        
        const lowerPaymentType = paymentType.toLowerCase()
        return paymentTypeMap[lowerPaymentType] || paymentType
    }

    // Calculate revenue by payment type
    const paymentTypeData = useMemo(() => {
        const paymentMap = {}

        revenue.forEach(item => {
            const paymentType = item['Payment Type']
            
            // Skip items without a payment type
            if (!paymentType) return
            
            // Filter by selected year if not 'all'
            if (selectedYear !== 'all') {
                const dateValue = item.Date || item.date || item.createdAt
                const year = new Date(dateValue).getUTCFullYear()
                if (year !== parseInt(selectedYear)) return
            }
            
            // Normalize the payment type for grouping
            const normalizedPaymentType = formatPaymentType(paymentType)
            
            if (!paymentMap[normalizedPaymentType]) {
                paymentMap[normalizedPaymentType] = {
                    invoiceCount: 0,
                    actualRevenue: 0
                }
            }

            // Add quantity to invoice count
            const quantity = item.Quantity ? parseInt(item.Quantity) : 0
            paymentMap[normalizedPaymentType].invoiceCount += quantity

            // Add actual fees to actual revenue
            let actualFees = item['Actual Fees'] || '0'
            // Remove $ and commas, then convert to number
            actualFees = parseFloat(String(actualFees).replace(/\$/g, '').replace(/,/g, '').trim())
            if (!isNaN(actualFees)) {
                paymentMap[normalizedPaymentType].actualRevenue += actualFees
            }
        })

        // Convert to array and sort by payment type name
        return Object.entries(paymentMap).map(([paymentType, data]) => ({
            paymentType,
            invoiceCount: data.invoiceCount,
            actualRevenue: data.actualRevenue
        })).sort((a, b) => a.paymentType.localeCompare(b.paymentType))
    }, [revenue, selectedYear])

    // Format currency
    const formatCurrency = (value) => {
        return `$${value.toFixed(2)}`
    }

    // Prepare pie chart data
    const pieChartData = useMemo(() => {
        const colors = ['#00D9FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#FF8C42', '#9D84B7', '#A8DADC']
        
        return {
            labels: paymentTypeData.map(item => item.paymentType),
            datasets: [
                {
                    label: 'Invoice Count',
                    data: paymentTypeData.map(item => item.invoiceCount),
                    backgroundColor: colors.slice(0, paymentTypeData.length),
                    borderColor: 'var(--card-bg)',
                    borderWidth: 2,
                }
            ]
        }
    }, [paymentTypeData])

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
        const rows = paymentTypeData.map(d => ({
            'Payment Type': formatPaymentType(d.paymentType),
            'Invoice Count': d.invoiceCount,
            'Actual Revenue': formatCurrency(d.actualRevenue)
        }))
        const filename = selectedYear === 'all' ? 'Revenue By Payment Type' : `Revenue By Payment Type - ${selectedYear}`
        downloadCSV(rows, filename)
    }

    const handleDownloadPNG = () => {
        const title = selectedYear === 'all' ? 'Revenue By Payment Type' : `Revenue By Payment Type - ${selectedYear}`
        downloadChartPNG(chartRef, title, title)
    }

    return (
        <RevenueByPaymentTypeStyled>
            <div className="header-with-filter">
                <h3>Revenue Transactions By Payment Type</h3>
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
                </div>
            </div>
            {paymentTypeData.length > 0 ? (
                <>
                    <table className="payment-type-table">
                        <thead>
                            <tr>
                                <th>Payment Type</th>
                                <th>Invoice Count</th>
                                <th>Actual Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentTypeData.map((row, index) => (
                                <tr key={index}>
                                    <td>{formatPaymentType(row.paymentType)}</td>
                                    <td>{row.invoiceCount}</td>
                                    <td className="currency">{formatCurrency(row.actualRevenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pie-chart-container">
                        <Pie 
                            ref={chartRef}
                            data={pieChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return context.label + ': ' + context.parsed + ' invoices'
                                            }
                                        }
                                    },
                                    datalabels: {
                                        color: '#000000',
                                        font: {
                                            weight: 'bold',
                                            size: 16
                                        },
                                        formatter: (value, context) => {
                                            const label = context.chart.data.labels[context.dataIndex]
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                            const percentage = ((value / total) * 100).toFixed(1)
                                            return `${label}\n${value} invoices\n${percentage}%`
                                        },
                                        anchor: 'center',
                                        align: 'center'
                                    }
                                }
                            }}
                        />
                    </div>
                </>
            ) : (
                <p className="no-data">No revenue data available</p>
            )}
        </RevenueByPaymentTypeStyled>
    )
}

const RevenueByPaymentTypeStyled = styled.div`
    position: relative;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;

    .header-with-filter {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        gap: 1rem;

        h3 {
            color: var(--text-color);
            margin: 0;
            font-size: 1.3rem;
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

    .download-wrapper {
        position: relative;
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

    h3 {
        color: var(--text-color);
        margin: 0;
        font-size: 1.3rem;
    }

    .payment-type-table {
        width: 100%;
        border-collapse: collapse;

        thead {
            background: var(--hover-bg);
        }

        th {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
            font-weight: 600;
            color: var(--text-color);
            background: var(--hover-bg);
        }

        td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);

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

    .no-data {
        text-align: center;
        color: var(--text-color);
        font-size: 1rem;
        margin: 1rem 0;
    }

    .pie-chart-container {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
`;

export default RevenueByPaymentType
