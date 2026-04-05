import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import axios from 'axios'
import { useGlobalContext } from '../../context/globalContext'
import Button from '../Button/Button'
import { plus, x } from '../../utils/Icons'
import { toast } from 'react-hot-toast'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1/'

const HOUSE_CATEGORIES = [
    'Mortgage',
    'Real Estate Taxes',
    'Internet',
    'Utilities - Gas',
    'Utilities - Electric',
    'Utilities - Water',
    'Recycling/Rubbish',
    'Lawn Maintenance',
]

const QUARTER_FIRST_MONTH = {
    Q1: 'January',
    Q2: 'April',
    Q3: 'July',
    Q4: 'October',
}

function getPrevQuarter(quarter, year) {
    if (quarter === 'Q1') return { quarter: 'Q4', year: parseInt(year) - 1 }
    const n = parseInt(quarter[1])
    return { quarter: `Q${n - 1}`, year: parseInt(year) }
}

function QuarterlyDeductionModal({ onClose }) {
    const { deductions, getDeductions, user } = useGlobalContext()

    const [step, setStep] = useState(1)
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState(String(currentYear))
    const [selectedQuarter, setSelectedQuarter] = useState('')
    const [rows, setRows] = useState([])
    const [saving, setSaving] = useState(false)
    const TOTAL_SQ_FT = 2335
    const [officePct, setOfficePct] = useState(() => localStorage.getItem('qdm_officePct') || '2.1')
    const [officeSqFt, setOfficeSqFt] = useState(() => localStorage.getItem('qdm_officeSqFt') || '48')

    const handlePctChange = (val) => {
        setOfficePct(val)
        const sqft = ((parseFloat(val) || 0) / 100 * TOTAL_SQ_FT).toFixed(0)
        setOfficeSqFt(sqft)
    }
    const handleSqFtChange = (val) => {
        setOfficeSqFt(val)
        const pct = ((parseFloat(val) || 0) / TOTAL_SQ_FT * 100).toFixed(1)
        setOfficePct(pct)
    }

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

    const handleContinue = async () => {
        if (!selectedQuarter) {
            toast.error('Please select a quarter')
            return
        }

        const firstMonth = QUARTER_FIRST_MONTH[selectedQuarter]
        const { quarter: prevQ, year: prevYear } = getPrevQuarter(selectedQuarter, selectedYear)
        const prevFirstMonth = QUARTER_FIRST_MONTH[prevQ]

        const getPrevAmount = (type) => {
            const match = deductions.find(d =>
                d['Deduction Type'] === type &&
                String(d.Year) === String(prevYear) &&
                d.Month === prevFirstMonth
            )
            if (!match || !match['Deduction Amount']) return ''
            return match['Deduction Amount'].toString().replace(/\$/g, '').trim()
        }

        let startingRecordNumber = 1
        try {
            const res = await fetch(`${BASE_URL}get-max-deduction-record-number?userid=${user}`)
            const data = await res.json()
            if (data.nextRecordNumber !== undefined) {
                startingRecordNumber = data.nextRecordNumber
            }
        } catch (err) {
            console.error('Error fetching record number:', err)
        }

        const initialRows = HOUSE_CATEGORIES.map((type, i) => ({
            deductionType: type,
            deductionDescription: '',
            deductionAmount: getPrevAmount(type),
            year: parseInt(selectedYear),
            month: firstMonth,
            deductionRecordNumber: startingRecordNumber + i,
        }))

        setRows(initialRows)
        setStep(2)
    }

    const updateRow = (index, field, value) => {
        setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
    }

    const handleSaveAll = async () => {
        setSaving(true)
        try {
            for (const row of rows) {
                await axios.post(`${BASE_URL}add-deduction`, { ...row, userid: user })
            }
            await getDeductions()
            localStorage.setItem('qdm_officePct', officePct)
            localStorage.setItem('qdm_officeSqFt', officeSqFt)
            toast.success(`${rows.length} quarterly house deductions saved!`)
            onClose()
        } catch (err) {
            toast.error('Error saving deductions: ' + (err.response?.data?.message || err.message))
        } finally {
            setSaving(false)
        }
    }

    return ReactDOM.createPortal(
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{step === 1 ? 'Select Quarter' : `Q${selectedQuarter[1]} ${selectedYear} House Deductions`}</h2>
                    <button className="close-btn" onClick={onClose}>{x}</button>
                </div>

                {step === 1 && (
                    <div className="step-one">
                        <p>Choose the year and quarter you want to add house deductions for.</p>
                        <div className="selects-row">
                            <div className="field-group">
                                <label>Year</label>
                                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-group">
                                <label>Quarter</label>
                                <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>
                                    <option value="" disabled>Select Quarter</option>
                                    <option value="Q1">Q1 (January – March)</option>
                                    <option value="Q2">Q2 (April – June)</option>
                                    <option value="Q3">Q3 (July – September)</option>
                                    <option value="Q4">Q4 (October – December)</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="back-btn" type="button" onClick={onClose}>
                                Cancel
                            </button>
                            <Button
                                name={'Continue'}
                                icon={plus}
                                bPad={'.8rem 1.6rem'}
                                bRad={'30px'}
                                bg={'var(--color-green)'}
                                color={'#fff'}
                                onClick={handleContinue}
                                type="button"
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-two">
                        <div className="assumption-note">
                            Assumes a
                            <input
                                className="pct-input"
                                type="number"
                                value={officePct}
                                onChange={e => handlePctChange(e.target.value)}
                                step="0.1"
                                min="0"
                                max="100"
                                onWheel={e => e.target.blur()}
                            />% factor based on square footage of the home designated as an office (
                            <input
                                className="pct-input sqft-input"
                                type="number"
                                value={officeSqFt}
                                onChange={e => handleSqFtChange(e.target.value)}
                                step="1"
                                min="0"
                                onWheel={e => e.target.blur()}
                            /> sq. ft. out of 2,335 total sq. ft.).
                        </div>
                        <p className="subtitle">
                            Amounts pre-filled from the previous quarter. Edit as needed, then click <strong>Add Deductions</strong>.
                        </p>
                        <div className="rows-table">
                            <div className="table-header">
                                <span>Type</span>
                                <span>Month</span>
                                <span>Year</span>
                                <span>Amount ($)</span>
                                <span>Description</span>
                                <span>Rec #</span>
                            </div>
                            {rows.map((row, i) => (
                                <div className="table-row" key={row.deductionType}>
                                    <span className="type-label">{row.deductionType}</span>
                                    <span className="static-field">{row.month}</span>
                                    <span className="static-field">{row.year}</span>
                                    <input
                                        type="number"
                                        onWheel={e => e.target.blur()}
                                        value={row.deductionAmount}
                                        placeholder="0.00"
                                        step="any"
                                        min="0"
                                        onChange={e => updateRow(i, 'deductionAmount', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={row.deductionDescription}
                                        placeholder="Description (optional)"
                                        onChange={e => updateRow(i, 'deductionDescription', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        onWheel={e => e.target.blur()}
                                        value={row.deductionRecordNumber}
                                        min="0"
                                        onChange={e => updateRow(i, 'deductionRecordNumber', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button className="back-btn" type="button" onClick={() => setStep(1)}>
                                ← Back
                            </button>
                            <Button
                                name={saving ? 'Saving...' : 'Add Deductions'}
                                icon={plus}
                                bPad={'.8rem 1.6rem'}
                                bRad={'30px'}
                                bg={'var(--color-green)'}
                                color={'#fff'}
                                onClick={handleSaveAll}
                                type="button"
                                disabled={saving}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </Overlay>,
        document.body
    )
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
`

const Modal = styled.div`
    background: var(--card-bg, #fff);
    border: 2px solid var(--border-color);
    border-radius: 24px;
    padding: 2rem;
    width: 90%;
    max-width: 860px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    color: var(--text-color);

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        h2 { margin: 0; font-size: 1.4rem; }
        .close-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            color: var(--text-color);
            display: flex;
            align-items: center;
            padding: 0.25rem;
        }
    }

    p { margin-bottom: 1.2rem; color: var(--text-color); opacity: 0.85; }
    .subtitle { font-size: 0.9rem; }

    .assumption-note {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-wrap: wrap;
        font-size: 0.9rem;
        font-style: italic;
        color: var(--text-color);
        opacity: 0.85;
        background: var(--input-bg);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        padding: 0.6rem 1rem;
        margin-bottom: 1rem;

        .pct-input {
            width: 58px;
            padding: 0.2rem 0.4rem;
            border-radius: 5px;
            border: 2px solid var(--border-color);
            background: var(--card-bg);
            color: var(--input-text);
            font-family: inherit;
            font-size: inherit;
            font-style: normal;
            font-weight: 700;
            text-align: center;
            outline: none;
        }
    }

    .selects-row {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
        .field-group {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            label { font-weight: 600; font-size: 0.9rem; }
            select {
                font-family: inherit;
                font-size: inherit;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                border: 2px solid var(--border-color);
                background: var(--input-bg);
                color: var(--input-text);
                outline: none;
                min-width: 200px;
            }
        }
    }

    .rows-table {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;

        .table-header {
            display: grid;
            grid-template-columns: 1.8fr 1fr 0.7fr 1fr 1.6fr 0.7fr;
            gap: 0.5rem;
            font-weight: 700;
            font-size: 0.82rem;
            padding: 0.4rem 0.5rem;
            border-bottom: 2px solid var(--border-color);
            opacity: 0.8;
        }

        .table-row {
            display: grid;
            grid-template-columns: 1.8fr 1fr 0.7fr 1fr 1.6fr 0.7fr;
            gap: 0.5rem;
            align-items: center;
            padding: 0.3rem 0;
            border-bottom: 1px solid var(--border-color);

            .type-label {
                font-weight: 600;
                font-size: 0.88rem;
            }

            .static-field {
                font-size: 0.88rem;
                opacity: 0.75;
            }

            input {
                font-family: inherit;
                font-size: 0.88rem;
                padding: 0.4rem 0.6rem;
                border-radius: 5px;
                border: 2px solid var(--border-color);
                background: var(--input-bg);
                color: var(--input-text);
                outline: none;
                width: 100%;
                &::placeholder { opacity: 0.5; }
            }
        }
    }

    .modal-footer {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: flex-end;

        .back-btn {
            padding: 0.8rem 1.6rem;
            border-radius: 30px;
            background: transparent;
            border: 2px solid var(--border-color);
            color: var(--text-color);
            font-family: inherit;
            font-size: inherit;
            font-weight: 600;
            cursor: pointer;
            &:hover { background: var(--border-color); }
        }
    }
`

export default QuarterlyDeductionModal
