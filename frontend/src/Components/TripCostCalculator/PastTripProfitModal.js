import React, { useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext'
import { x } from '../../utils/Icons'

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const LOCATIONS = ['NH', 'NJ', 'FL']

const parseAmount = (val) => {
    if (!val) return 0
    const n = parseFloat(val.toString().replace(/\$/g, '').replace(/,/g, '').trim())
    return isNaN(n) ? 0 : n
}

const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const getUTCYear  = (d) => new Date(d).getUTCFullYear()
const getUTCMonth = (d) => new Date(d).getUTCMonth() + 1 // 1-12

function PastTripProfitModal({ onClose }) {
    const { revenue, expenses } = useGlobalContext()

    const [selectedYear,     setSelectedYear]     = useState('')
    const [selectedMonth,    setSelectedMonth]    = useState('')
    const [selectedLocation, setSelectedLocation] = useState('')
    const [results,          setResults]          = useState(null)

    // Derive available years from data
    const availableYears = useMemo(() => {
        const s = new Set()
        revenue.forEach(r => { if (r.Date) s.add(getUTCYear(r.Date)) })
        expenses.forEach(e => { if (e.Date) s.add(getUTCYear(e.Date)) })
        return Array.from(s).sort((a, b) => b - a)
    }, [revenue, expenses])

    const allSelected = selectedYear && selectedMonth && selectedLocation

    const handleSubmit = () => {
        if (!allSelected) return

        const yr = parseInt(selectedYear)
        const mn = parseInt(selectedMonth)

        // Revenue: filter by Service Location, year, month
        const filteredRevenue = revenue.filter(r => {
            if (!r.Date) return false
            if (getUTCYear(r.Date) !== yr) return false
            if (getUTCMonth(r.Date) !== mn) return false
            return (r['Service Location'] || '').toUpperCase() === selectedLocation
        })

        // Expenses: filter by last-2-chars of Location (state), year, month
        const filteredExpenses = expenses.filter(e => {
            if (!e.Date) return false
            if (getUTCYear(e.Date) !== yr) return false
            if (getUTCMonth(e.Date) !== mn) return false
            const state = (e.Location || '').trim().slice(-2).toUpperCase()
            return state === selectedLocation
        })

        const totalRevenue = filteredRevenue.reduce((sum, r) => sum + parseAmount(r['Actual Fees']), 0)
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseAmount(e.Amount), 0)
        const profit = totalRevenue - totalExpenses

        setResults({
            monthName: MONTH_NAMES[mn - 1],
            year: yr,
            location: selectedLocation,
            revenueCount: filteredRevenue.length,
            expenseCount: filteredExpenses.length,
            totalRevenue,
            totalExpenses,
            profit,
        })
    }

    const handleReset = () => {
        setSelectedYear('')
        setSelectedMonth('')
        setSelectedLocation('')
        setResults(null)
    }

    return ReactDOM.createPortal(
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Calculate Profit for Past Trips</h2>
                    <button className="close-btn" onClick={onClose}>{x}</button>
                </div>

                <div className="modal-body">
                    <p className="modal-desc">
                        Select a year, month, and location to see the actual revenue, expenses, and profit for that trip.
                    </p>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Year</label>
                            <select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setResults(null) }}>
                                <option value="">— Select Year —</option>
                                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Month</label>
                            <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setResults(null) }}>
                                <option value="">— Select Month —</option>
                                {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <select value={selectedLocation} onChange={e => { setSelectedLocation(e.target.value); setResults(null) }}>
                                <option value="">— Select Location —</option>
                                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="btn-row">
                        <button className="cancel-btn" onClick={onClose}>Cancel</button>
                        {results && (
                            <button className="reset-btn" onClick={handleReset}>Reset</button>
                        )}
                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={!allSelected}
                        >
                            Submit
                        </button>
                    </div>

                    {results && (
                        <div className="results-section">
                            <h3>{results.monthName} {results.year} — {results.location}</h3>
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th># Records</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Actual Revenue</td>
                                        <td>{results.revenueCount}</td>
                                        <td className="amount positive">{fmt(results.totalRevenue)}</td>
                                    </tr>
                                    <tr>
                                        <td>Expenses</td>
                                        <td>{results.expenseCount}</td>
                                        <td className="amount negative">{fmt(results.totalExpenses)}</td>
                                    </tr>
                                    <tr className="profit-row">
                                        <td><strong>Profit</strong></td>
                                        <td></td>
                                        <td className={`amount ${results.profit >= 0 ? 'positive' : 'negative'}`}>
                                            <strong>{fmt(results.profit)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {(results.revenueCount === 0 && results.expenseCount === 0) && (
                                <p className="no-data-note">No revenue or expense records found for this selection.</p>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </Overlay>,
        document.body
    )
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
`

const Modal = styled.div`
    background: var(--nav-bg);
    border: 3px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    width: 540px;
    max-width: 95vw;
    max-height: 85vh;
    overflow-y: auto;
    backdrop-filter: blur(4.5px);

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
        h2 { color: var(--text-color); font-size: 1.2rem; margin: 0; }
        .close-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
            color: var(--text-color);
            opacity: 0.6;
            &:hover { opacity: 1; }
        }
    }

    .modal-desc {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }

    .form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
    }

    .form-group {
        flex: 1;
        min-width: 130px;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-color);
        }
        select {
            padding: 0.6rem 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-bg);
            color: var(--input-text);
            font-size: 0.9rem;
            font-family: inherit;
            cursor: pointer;
            &:focus { outline: none; border-color: var(--text-color); }
            &:disabled { opacity: 0.5; cursor: not-allowed; }
        }
    }

    .btn-row {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .cancel-btn, .reset-btn {
        flex: 1;
        padding: 0.75rem 1.25rem;
        background: #e9ecef;
        color: #495057;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.2s;
        &:hover { background: #dee2e6; }
    }

    .submit-btn {
        flex: 2;
        padding: 0.75rem 1.25rem;
        background: var(--text-color);
        color: var(--nav-bg);
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: opacity 0.2s;
        &:hover:not(:disabled) { opacity: 0.85; }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .results-section {
        border-top: 2px solid var(--border-color);
        padding-top: 1.25rem;
        animation: fadeIn 0.25s ease;

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        h3 {
            color: var(--text-color);
            font-size: 1rem;
            margin: 0 0 1rem;
        }
    }

    .results-table {
        width: 100%;
        border-collapse: collapse;

        thead tr {
            border-bottom: 2px solid var(--border-color);
        }
        th {
            padding: 0.6rem 0.75rem;
            text-align: left;
            color: var(--text-color);
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        td {
            padding: 0.7rem 0.75rem;
            color: var(--text-color);
            border-bottom: 1px solid var(--border-color);
            font-size: 0.95rem;
        }
        .profit-row td {
            border-bottom: none;
            padding-top: 0.9rem;
        }
        .amount {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }
        .positive { color: #2e7d32; }
        .negative { color: #c62828; }
    }

    .no-data-note {
        margin-top: 0.75rem;
        font-size: 0.88rem;
        color: var(--text-color);
        opacity: 0.6;
        font-style: italic;
        text-align: center;
    }
`

export default PastTripProfitModal
