import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGlobalContext } from '../../context/globalContext'
import { x } from '../../utils/Icons'

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

// Safely parse a currency string like "$1,234.56" → 1234.56
const parseValue = (value) => {
    if (!value || value === 'N/A' || value === '') return 0
    const numStr = value.toString().replace('$', '').replace(/,/g, '').trim()
    const num = parseFloat(numStr)
    return isNaN(num) ? 0 : num
}

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)

// Format a Date string for display, using UTC to avoid timezone shifts
const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { timeZone: 'UTC' })
}

const getUTCYear  = (dateStr) => new Date(dateStr).getUTCFullYear()
const getUTCMonth = (dateStr) => new Date(dateStr).getUTCMonth() + 1  // 1-12

// ─────────────────────────────────────────────
//  PDF generation helper
// ─────────────────────────────────────────────
const generateTaxPDF = (yr, mn, monthName, filteredRevenue, filteredExpenses, filteredDeductions) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()   // 297mm
    const pageH = doc.internal.pageSize.getHeight()  // 210mm
    const margin = 15

    // ── Title block ──────────────────────────────
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 53, 147)
    doc.text('Transactions Report', margin, 20)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(`${monthName} ${yr}`, margin, 29)

    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(
        `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        margin, 36
    )

    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, 39, pageW - margin, 39)

    let curY = 45

    // ════════════════════════════════════════════
    //  REVENUE
    // ════════════════════════════════════════════
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 53, 147)
    doc.text('Revenue', margin, curY)
    curY += 3

    if (filteredRevenue.length === 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(140, 140, 140)
        doc.text('No revenue transactions for this period.', margin, curY + 5)
        curY += 14
    } else {
        // Totals
        let revQty = 0, revServiceFee = 0, revTravelFee = 0
        let revDiscount = 0, revTransFee = 0, revActualRev = 0
        filteredRevenue.forEach(r => {
            revQty       += parseFloat(r.Quantity) || 0
            revServiceFee += parseValue(r['Service Fee'])
            revTravelFee  += parseValue(r['Travel Fee'])
            revDiscount   += parseValue(r.Discount)
            revTransFee   += parseValue(r['Transaction Fees'])
            revActualRev  += parseValue(r['Actual Fees'])
        })

        const revHead = [[
            'Date', 'Client', 'Service', 'Qty', 'Add-On Service',
            'Location', 'Service Fee', 'Travel Fee', 'Discount',
            'Discount Reason', 'Payment Type', 'Trans. Fee', 'Actual Revenue', 'Invoice #'
        ]]

        const revBody = filteredRevenue.map(r => [
            formatDate(r.Date),
            r.Client || '',
            r.Service || '',
            r.Quantity || '',
            r['Add-On Service'] || '',
            r['Service Location'] || '',
            r['Service Fee'] || '',
            r['Travel Fee'] || '',
            r.Discount || '',
            r['Discount Reason'] || '',
            r['Payment Type'] || '',
            r['Transaction Fees'] || '',
            r['Actual Fees'] || '',
            r['Invoice Number'] || '',
        ])

        const revFoot = [[
            'TOTAL', '', '',
            revQty > 0 ? String(revQty) : '',
            '', '',
            formatCurrency(revServiceFee),
            formatCurrency(revTravelFee),
            formatCurrency(revDiscount),
            '', '',
            formatCurrency(revTransFee),
            formatCurrency(revActualRev),
            '',
        ]]

        autoTable(doc, {
            head: revHead,
            body: revBody,
            foot: revFoot,
            startY: curY,
            margin: { left: margin, right: margin },
            styles: { fontSize: 6.5, cellPadding: 1.5, overflow: 'linebreak' },
            headStyles: {
                fillColor: [40, 53, 147],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 6.5,
            },
            footStyles: {
                fillColor: [220, 228, 255],
                textColor: [20, 20, 100],
                fontStyle: 'bold',
                fontSize: 6.5,
            },
            columnStyles: {
                0:  { cellWidth: 18 },  // Date
                1:  { cellWidth: 23 },  // Client
                2:  { cellWidth: 22 },  // Service
                3:  { cellWidth: 7  },  // Qty
                4:  { cellWidth: 18 },  // Add-On
                5:  { cellWidth: 20 },  // Location
                6:  { cellWidth: 18 },  // Service Fee
                7:  { cellWidth: 16 },  // Travel Fee
                8:  { cellWidth: 16 },  // Discount
                9:  { cellWidth: 22 },  // Discount Reason
                10: { cellWidth: 18 },  // Payment Type
                11: { cellWidth: 15 },  // Trans Fee
                12: { cellWidth: 20 },  // Actual Revenue
                13: { cellWidth: 14 },  // Invoice #
            },
            showFoot: 'lastPage',
        })
        curY = doc.lastAutoTable.finalY + 10
    }

    // ════════════════════════════════════════════
    //  EXPENSES
    // ════════════════════════════════════════════
    if (curY > pageH - 55) { doc.addPage(); curY = 20 }

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(170, 40, 20)
    doc.text('Expenses', margin, curY)
    curY += 3

    if (filteredExpenses.length === 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(140, 140, 140)
        doc.text('No expense transactions for this period.', margin, curY + 5)
        curY += 14
    } else {
        let expTotal = 0
        filteredExpenses.forEach(e => { expTotal += parseValue(e.Amount) })

        const expHead = [[
            'Date', 'Vendor/Payee', 'Location', 'Expense Type',
            'Description', 'Amount', 'Payment Type', 'Business Trip', 'Record #'
        ]]

        const expBody = filteredExpenses.map(e => [
            formatDate(e.Date),
            e['Vendor/Payee'] || '',
            e.Location || '',
            e['Expense Type'] || '',
            e['Expense Description'] || '',
            e.Amount || '',
            e['Payment Type'] || '',
            e['Associated with a Business Trip'] ? 'Yes' : 'No',
            e['Expense Record Number'] || '',
        ])

        const expFoot = [['TOTAL', '', '', '', '', formatCurrency(expTotal), '', '', '']]

        autoTable(doc, {
            head: expHead,
            body: expBody,
            foot: expFoot,
            startY: curY,
            margin: { left: margin, right: margin },
            styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [170, 40, 20], textColor: 255, fontStyle: 'bold' },
            footStyles: { fillColor: [255, 220, 215], textColor: [100, 20, 10], fontStyle: 'bold' },
            showFoot: 'lastPage',
        })
        curY = doc.lastAutoTable.finalY + 10
    }

    // ════════════════════════════════════════════
    //  DEDUCTIONS
    // ════════════════════════════════════════════
    if (curY > pageH - 55) { doc.addPage(); curY = 20 }

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 110, 40)
    doc.text('Deductions', margin, curY)
    curY += 3

    if (filteredDeductions.length === 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(140, 140, 140)
        doc.text('No deduction transactions for this period.', margin, curY + 5)
    } else {
        let dedTotal = 0
        filteredDeductions.forEach(d => { dedTotal += parseValue(d['Deduction Amount']) })

        const dedHead = [['Year', 'Month', 'Deduction Type', 'Description', 'Amount', 'Record #']]

        const dedBody = filteredDeductions.map(d => [
            d.Year || '',
            d.Month || '',
            d['Deduction Type'] || '',
            d['Deduction Description'] || '',
            d['Deduction Amount'] || '',
            d['Deduction Record Number'] || '',
        ])

        const dedFoot = [['TOTAL', '', '', '', formatCurrency(dedTotal), '']]

        autoTable(doc, {
            head: dedHead,
            body: dedBody,
            foot: dedFoot,
            startY: curY,
            margin: { left: margin, right: margin },
            styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [20, 110, 40], textColor: 255, fontStyle: 'bold' },
            footStyles: { fillColor: [210, 245, 220], textColor: [10, 70, 20], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 24 },
                2: { cellWidth: 50 },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 35 },
                5: { cellWidth: 28 },
            },
            showFoot: 'lastPage',
        })
    }

    doc.save(`Tax_Transactions_${monthName}_${yr}.pdf`)
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
const TaxReportModal = ({ isOpen, onClose }) => {
    const { revenue, expenses, deductions } = useGlobalContext()
    const [selectedYear,  setSelectedYear]  = useState('')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [generating, setGenerating] = useState(false)

    // All years that exist in any dataset
    const availableYears = useMemo(() => {
        const yearSet = new Set()
        revenue.forEach(r    => { if (r.Date) yearSet.add(getUTCYear(r.Date)) })
        expenses.forEach(e   => { if (e.Date) yearSet.add(getUTCYear(e.Date)) })
        deductions.forEach(d => { if (d.Year) yearSet.add(parseInt(d.Year))   })
        return Array.from(yearSet).sort((a, b) => b - a)
    }, [revenue, expenses, deductions])

    // Months (1-12) that have data in the chosen year
    const availableMonths = useMemo(() => {
        if (!selectedYear) return []
        const yr = parseInt(selectedYear)
        const monthSet = new Set()
        revenue.forEach(r => {
            if (r.Date && getUTCYear(r.Date) === yr) monthSet.add(getUTCMonth(r.Date))
        })
        expenses.forEach(e => {
            if (e.Date && getUTCYear(e.Date) === yr) monthSet.add(getUTCMonth(e.Date))
        })
        deductions.forEach(d => {
            if (parseInt(d.Year) === yr && d.Month) {
                const idx = MONTH_NAMES.indexOf(d.Month)
                if (idx >= 0) monthSet.add(idx + 1)
            }
        })
        return Array.from(monthSet).sort((a, b) => a - b)
    }, [selectedYear, revenue, expenses, deductions])

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value)
        setSelectedMonth('')
    }

    const handleGenerate = async () => {
        if (!selectedYear || !selectedMonth) return
        setGenerating(true)
        try {
            const yr = parseInt(selectedYear)
            const mn = parseInt(selectedMonth)
            const monthName = MONTH_NAMES[mn - 1]

            const filteredRevenue = [...revenue]
                .filter(r => r.Date && getUTCYear(r.Date) === yr && getUTCMonth(r.Date) === mn)
                .sort((a, b) => new Date(a.Date) - new Date(b.Date))

            const filteredExpenses = [...expenses]
                .filter(e => e.Date && getUTCYear(e.Date) === yr && getUTCMonth(e.Date) === mn)
                .sort((a, b) => new Date(a.Date) - new Date(b.Date))

            const filteredDeductions = deductions.filter(
                d => parseInt(d.Year) === yr && d.Month === monthName
            )

            generateTaxPDF(yr, mn, monthName, filteredRevenue, filteredExpenses, filteredDeductions)
            onClose()
        } catch (err) {
            console.error('Error generating tax report PDF:', err)
        }
        setGenerating(false)
    }

    if (!isOpen) return null

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Download Transactions for Taxes</h2>
                    <button className="close-btn" onClick={onClose}>{x}</button>
                </div>

                <div className="modal-body">
                    <p className="modal-desc">
                        Select a year and month to generate a PDF containing all Revenue,
                        Expense, and Deduction transactions for that period.
                    </p>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tax-year">Year</label>
                            <select
                                id="tax-year"
                                value={selectedYear}
                                onChange={handleYearChange}
                            >
                                <option value="">— Select Year —</option>
                                {availableYears.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tax-month">Month</label>
                            <select
                                id="tax-month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                disabled={!selectedYear}
                            >
                                <option value="">— Select Month —</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="btn-row">
                        <button
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={generating}
                        >
                            Cancel
                        </button>
                        <button
                            className="generate-btn"
                            onClick={handleGenerate}
                            disabled={!selectedYear || !selectedMonth || generating}
                        >
                            {generating ? 'Generating PDF…' : '⬇ Generate PDF'}
                        </button>
                    </div>
                </div>
            </ModalContent>
        </ModalOverlay>
    )
}

// ─────────────────────────────────────────────
//  Styled components
// ─────────────────────────────────────────────
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 80px;
    z-index: 1000;
`

const ModalContent = styled.div`
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    overflow: hidden;

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #0d6e4e 0%, #065f46 100%);
        border-radius: 12px 12px 0 0;

        h2 {
            margin: 0;
            color: white;
            font-size: 1.3rem;
        }

        .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: background 0.2s;

            &:hover { background: rgba(255, 255, 255, 0.35); }

            svg { width: 18px; height: 18px; }
        }
    }

    .modal-body {
        padding: 1.75rem 1.5rem;

        .modal-desc {
            color: #555;
            font-size: 0.95rem;
            margin: 0 0 1.5rem 0;
            line-height: 1.5;
        }

        .form-row {
            display: flex;
            gap: 1.25rem;
            margin-bottom: 1.75rem;

            @media (max-width: 420px) {
                flex-direction: column;
            }
        }

        .form-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;

            label {
                font-size: 0.85rem;
                font-weight: 600;
                color: #444;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            select {
                padding: 0.6rem 0.75rem;
                border: 1.5px solid #d1d5db;
                border-radius: 7px;
                font-size: 0.95rem;
                color: #333;
                background: #fff;
                cursor: pointer;
                transition: border-color 0.2s;

                &:focus {
                    outline: none;
                    border-color: #0d6e4e;
                }

                &:disabled {
                    background: #f3f4f6;
                    cursor: not-allowed;
                    color: #9ca3af;
                }
            }
        }

        .btn-row {
            display: flex;
            gap: 0.75rem;
        }

        .cancel-btn {
            flex: 1;
            padding: 0.8rem 1.5rem;
            background: #e9ecef;
            color: #495057;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;

            &:hover:not(:disabled) { background: #dee2e6; }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        .generate-btn {
            flex: 2;
            padding: 0.8rem 1.5rem;
            background: #0d6e4e;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;

            &:hover:not(:disabled) { background: #065f46; }

            &:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        }
    }
`

export default TaxReportModal
