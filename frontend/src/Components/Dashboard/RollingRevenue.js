import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartDataLabels)

function RollingRevenue() {
    const { revenue } = useGlobalContext()

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    }

    // Build rolling 12-month data
    const rollingData = useMemo(() => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]

        // Create a map of year/month to revenue
        const monthlyRevenue = {}

        revenue.forEach(item => {
            const dateValue = item.Date || item.date || item.createdAt
            if (!dateValue) return
            
            const date = new Date(dateValue)
            const year = date.getUTCFullYear()
            const month = date.getUTCMonth()
            const monthName = months[month]
            
            let actualFees = item['Actual Fees'] ? parseFloat(item['Actual Fees'].toString().replace(/\$/g, '').replace(/,/g, '').trim()) : 0
            actualFees = isNaN(actualFees) ? 0 : actualFees
            
            const key = `${year}-${month}`
            monthlyRevenue[key] = (monthlyRevenue[key] || 0) + actualFees
        })

        // Create sorted list of year/month combinations
        const sortedMonths = Object.keys(monthlyRevenue)
            .map(key => {
                const [year, month] = key.split('-').map(Number)
                return { key, year, month, display: `${months[month].slice(0, 3)} ${year}` }
            })
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year
                return a.month - b.month
            })

        // Calculate rolling 12-month totals
        const rollingTotals = sortedMonths.map((item, index) => {
            let total = 0
            const startIndex = Math.max(0, index - 11)
            
            for (let i = startIndex; i <= index; i++) {
                total += monthlyRevenue[sortedMonths[i].key]
            }
            
            return {
                ...item,
                rollingTotal: total
            }
        })

        return {
            data: rollingTotals
        }
    }, [revenue])

    // Build chart data
    const chartData = useMemo(() => {
        return {
            labels: rollingData.data.map(item => item.display),
            datasets: [{
                label: '12-Month Rolling Total',
                data: rollingData.data.map(item => item.rollingTotal),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#36A2EB',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0,
                fill: 'origin'
            }]
        }
    }, [rollingData])

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
                        size: 10
                    },
                    maxRotation: 45,
                    minRotation: 45
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

    return (
        <RollingRevenueStyled>
            <div className="header">
                <h3>Revenue - Rolling 12 Months</h3>
            </div>

            {rollingData.data.length > 0 ? (
                <div className="chart-wrapper">
                    <Line data={chartData} options={chartOptions} />
                </div>
            ) : (
                <p className="no-data">No revenue data available</p>
            )}
        </RollingRevenueStyled>
    )
}

const RollingRevenueStyled = styled.div`
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

    .chart-wrapper {
        padding: 1.5rem;
        background: #ffffff;
        border-radius: 8px;

        canvas {
            max-height: 400px;
        }
    }

    .no-data {
        text-align: center;
        color: var(--text-color);
        font-size: 1rem;
        margin: 1rem 0;
    }
`;

export default RollingRevenue
