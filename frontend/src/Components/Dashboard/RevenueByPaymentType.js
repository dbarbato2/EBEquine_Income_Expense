import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Chart as ChartJs, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie } from 'react-chartjs-2'
import { useGlobalContext } from '../../context/globalContext';

ChartJs.register(ArcElement, Tooltip, Legend, ChartDataLabels)

function RevenueByPaymentType() {
    const { revenue } = useGlobalContext()

    // Get unique years from revenue data, sorted in descending order
    const availableYears = useMemo(() => {
        const yearsSet = new Set()
        revenue.forEach(item => {
            if (item.Date) {
                const date = new Date(item.Date)
                const year = date.getFullYear()
                yearsSet.add(year)
            }
        })
        return Array.from(yearsSet).sort((a, b) => b - a)
    }, [revenue])

    // Get the latest year
    const latestYear = useMemo(() => {
        return availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()
    }, [availableYears])

    const [selectedYear, setSelectedYear] = useState(() => String(latestYear))

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
            
            // Filter by selected year
            const date = new Date(item.Date)
            const year = date.getFullYear()
            if (year !== parseInt(selectedYear)) return
            
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
            // Remove $ and convert to number
            actualFees = parseFloat(String(actualFees).replace(/\$/g, '').trim())
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
                    </select>
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
                                            return label + '\n' + value + ' invoices'
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
