import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import { useGlobalContext } from '../../context/globalContext';
import { dateFormat } from '../../utils/dateFormat';
import QuarterlyRevenue from './QuarterlyRevenue';
import InvoiceModal from '../Invoice/InvoiceModal';
import DetailedBreakdown from './DetailedBreakdown';
import CurrentYearAnalysis from './CurrentYearAnalysis';
import RevenueByPaymentType from './RevenueByPaymentType';
import LocationByMonth from './LocationByMonth';
import HistoricalRevenue from './HistoricalRevenue';
import RollingRevenue from './RollingRevenue';

function Dashboard() {
    const { revenue, clients } = useGlobalContext()
    const [showUnpaidInvoices, setShowUnpaidInvoices] = useState(false)
    const [, setThemeUpdated] = useState(0)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [selectedRevenue, setSelectedRevenue] = useState(null)
    const [selectedClient, setSelectedClient] = useState(null)

    // Handle row click to open invoice modal
    const handleRowClick = (item) => {
        setSelectedRevenue(item);
        const matchingClient = clients.find(c => c.Name === item.Client);
        setSelectedClient(matchingClient || null);
        setShowInvoiceModal(true);
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    // Helper function to safely parse currency values
    const parseValue = (value) => {
        if (!value || value === 'N/A' || value === '') return 0
        const numStr = value.toString().replace('$', '').trim()
        const num = parseFloat(numStr)
        return isNaN(num) ? 0 : num
    }

    // Calculate Balance = Service Fee + Travel Fee - Discount
    const calculateBalance = (invoice) => {
        const serviceFee = parseValue(invoice['Service Fee'])
        const travelFee = parseValue(invoice['Travel Fee'])
        const discount = parseValue(invoice.Discount)
        const balance = serviceFee + travelFee - discount
        return `$${balance.toFixed(2)}`
    }

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
                                        <th>Quantity</th>
                                        <th>Invoice #</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unpaidInvoices.map((invoice, index) => (
                                        <tr key={index} onClick={() => handleRowClick(invoice)} style={{cursor: 'pointer'}}>
                                            <td>{dateFormat(invoice.Date)}</td>
                                            <td>{invoice.Client}</td>
                                            <td>{invoice.Service}</td>
                                            <td>{invoice.Quantity || '1'}</td>
                                            <td>{invoice['Invoice Number'] || 'N/A'}</td>
                                            <td>{calculateBalance(invoice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-unpaid">Great! No unpaid invoices.</p>
                        )}
                    </UnpaidInvoicesContainer>
                )}

                <SectionNavigationStyled>
                    <nav className="section-nav">
                        <a href="#quarterly-revenue">Quarterly Summary</a>
                        <a href="#detailed-breakdown">Quarterly Breakdown</a>
                        <a href="#current-year-analysis">Monthly Analysis</a>
                        <a href="#revenue-by-payment">Revenue by Payment Type</a>
                        <a href="#location-by-month">Location by Month</a>
                        <a href="#historical-revenue">Historical Revenue</a>
                        <a href="#rolling-revenue">Rolling 12 Months</a>
                    </nav>
                </SectionNavigationStyled>

                <div id="quarterly-revenue">
                    <QuarterlyRevenue />
                </div>
                <div id="detailed-breakdown">
                    <DetailedBreakdown />
                </div>
                <div id="current-year-analysis">
                    <CurrentYearAnalysis />
                </div>
                <div id="revenue-by-payment">
                    <RevenueByPaymentType />
                </div>
                <div id="location-by-month">
                    <LocationByMonth />
                </div>
                <div id="historical-revenue">
                    <HistoricalRevenue />
                </div>
                <div id="rolling-revenue">
                    <RollingRevenue />
                </div>

                <InvoiceModal
                    isOpen={showInvoiceModal}
                    revenueData={selectedRevenue}
                    clientData={selectedClient}
                    onClose={() => {
                        setShowInvoiceModal(false);
                        setSelectedRevenue(null);
                        setSelectedClient(null);
                    }}
                />
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

const SectionNavigationStyled = styled.div`
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;

    .section-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;

        a {
            color: var(--text-color);
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            transition: all 0.3s ease;
            background: var(--hover-bg);

            &:hover {
                background: var(--text-color);
                color: var(--card-bg);
                border-color: var(--text-color);
            }
        }
    }
`;

export default Dashboard