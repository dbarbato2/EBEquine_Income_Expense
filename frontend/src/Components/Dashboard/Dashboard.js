import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import { useGlobalContext } from '../../context/globalContext';
import { dateFormat } from '../../utils/dateFormat';
import QuarterlyRevenue from './QuarterlyRevenue';
import DetailedBreakdown from './DetailedBreakdown';
import CurrentYearAnalysis from './CurrentYearAnalysis';
import RevenueByPaymentType from './RevenueByPaymentType';

function Dashboard() {
    const { revenue } = useGlobalContext()
    const [showUnpaidInvoices, setShowUnpaidInvoices] = useState(false)
    const [, setThemeUpdated] = useState(0)

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

    // Filter revenue items where Actual Fees is null, empty, or equals 0 (unpaid invoices)
    const unpaidInvoices = revenue.filter(item => {
        const actualFees = item['Actual Fees']
        // Include items with null, undefined, or empty string
        if (!actualFees) return true
        // Handle both string and number formats (e.g., "$0", "0", 0)
        const feeStr = actualFees.toString().replace('$', '').trim()
        const feeNum = parseFloat(feeStr)
        return feeNum === 0 || isNaN(feeNum)
    })

    return (
        <DashboardStyled>
            <InnerLayout>
                <div className="dashboard-header">
                    <button 
                        className="unpaid-btn"
                        onClick={() => setShowUnpaidInvoices(!showUnpaidInvoices)}
                    >
                        {showUnpaidInvoices ? 'Hide' : 'Show'} Unpaid Invoices ({unpaidInvoices.length})
                    </button>
                </div>

                {showUnpaidInvoices && (
                    <UnpaidInvoicesContainer>
                        <h3>Unpaid Invoices</h3>
                        {unpaidInvoices.length > 0 ? (
                            <table className="unpaid-invoices-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Invoice #</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unpaidInvoices.map((invoice, index) => (
                                        <tr key={index}>
                                            <td>{dateFormat(invoice.Date)}</td>
                                            <td>{invoice.Client}</td>
                                            <td>{invoice.Service}</td>
                                            <td>{invoice['Invoice Number'] || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-unpaid">Great! No unpaid invoices.</p>
                        )}
                    </UnpaidInvoicesContainer>
                )}

                <QuarterlyRevenue />
                <DetailedBreakdown />
                <CurrentYearAnalysis />
                <RevenueByPaymentType />
            </InnerLayout>
        </DashboardStyled>
    )
}

const DashboardStyled = styled.div`
    .dashboard-header {
        margin-bottom: 2rem;
    }

    .unpaid-btn {
        padding: 0.8rem 1.6rem;
        border-radius: 8px;
        background: #dc3545;
        color: #fff;
        border: none;
        font-weight: 600;
        cursor: pointer;
        font-size: 1rem;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        transition: background 0.3s ease;

        &:hover {
            background: #c82333;
        }
    }
`;

const UnpaidInvoicesContainer = styled.div`
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;

    h3 {
        color: var(--text-color);
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.3rem;
    }

    .unpaid-invoices-table {
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
        }

        tbody tr:hover {
            background: var(--hover-bg);
        }

        tbody tr:last-child td {
            border-bottom: none;
        }
    }

    .no-unpaid {
        text-align: center;
        color: #228B22;
        font-size: 1.1rem;
        margin: 1rem 0;
    }
`;

export default Dashboard