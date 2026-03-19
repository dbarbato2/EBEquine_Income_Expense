import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus, x } from '../../utils/Icons';
import { toast } from 'react-hot-toast';


function DeductionForm() {
    const {addDeduction, error, setError, user} = useGlobalContext()
    const [inputState, setInputState] = useState({
        year: '',
        month: '',
        deductionType: '',
        deductionDescription: '',
        deductionAmount: '',
        deductionRecordNumber: ''
    })

    useEffect(() => {
        // Clear any previous errors when component mounts
        setError('')
    }, [setError])

    const { year, month, deductionType, deductionDescription, deductionAmount, deductionRecordNumber } = inputState;

    const handleInput = name => e => {
        const value = name === 'deductionAmount' || name === 'deductionRecordNumber' ? e.target.value : e.target.value
        setInputState({...inputState, [name]: value})
        setError('')
    }

    const fetchAndPopulateDeductionRecordNumber = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1/'}get-max-deduction-record-number?userid=${user}`);
            const data = await response.json();
            if (data.nextRecordNumber !== undefined) {
                setInputState(prevState => ({
                    ...prevState,
                    deductionRecordNumber: data.nextRecordNumber.toString()
                }))
            }
        } catch (error) {
            console.error('Error fetching max deduction record number:', error);
        }
    }

    const handleSubmit = e => {
        e.preventDefault()
        const updated = {...inputState, userid: user}
        addDeduction(updated).then(success => {
            if (success) {
                setInputState({
                    year: '',
                    month: '',
                    deductionType: '',
                    deductionDescription: '',
                    deductionAmount: '',
                    deductionRecordNumber: ''
                })
            }
        })
    }

    const handleReset = e => {
        e.preventDefault()
        setInputState({
            year: '',
            month: '',
            deductionType: '',
            deductionDescription: '',
            deductionAmount: '',
            deductionRecordNumber: ''
        })
        setError('')
        toast.success('Form reset successfully!')
    }

    return (
        <FormStyled onSubmit={handleSubmit}>
            {error && <p className='error'>{error}</p>}
            <div className="input-control">
                <input 
                    type="number" 
                    value={year}
                    name={'year'} 
                    placeholder="Year"
                    onChange={handleInput('year')}
                    min="2000"
                    max="2100"
                />
            </div>
            <div className="selects input-control">
                <select value={month} name="month" id="month" onChange={(e) => {
                    handleInput('month')(e);
                    if (e.target.value) {
                        fetchAndPopulateDeductionRecordNumber();
                    }
                }} required>
                    <option value="" disabled>Select Month</option>
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                </select>
            </div>
            <div className="selects input-control">
                <select value={deductionType} name="deductionType" id="deductionType" onChange={handleInput('deductionType')} required>
                    <option value="" disabled>Select Deduction Type</option>
                    <option>Mileage</option>
                    <option>Tolls</option>
                    <option>Car Payment</option>
                    <option>Auto Insurance</option>
                    <option>Gym Membership</option>
                    <option>Mortgage</option>
                    <option>Real Estate Taxes</option>
                    <option>Internet</option>
                    <option>Utilities - Electric</option>
                    <option>Utilities - Gas</option>
                    <option>Lawn Maintenance</option>
                    <option>Recycling/Rubbish</option>
                    <option>Utilities - Water</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={deductionDescription}
                    name={'deductionDescription'} 
                    placeholder="Description"
                    onChange={handleInput('deductionDescription')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={deductionAmount}
                    name={'deductionAmount'} 
                    placeholder="Amount"
                    onChange={handleInput('deductionAmount')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={deductionRecordNumber}
                    name={'deductionRecordNumber'} 
                    placeholder="Record Number"
                    onChange={handleInput('deductionRecordNumber')}
                    min="0"
                />
                <p className="input-note">Record Number populated automatically, but can be edited</p>
            </div>
            <div className="submit-btn">
                <Button 
                    name={'Add Deduction'}
                    icon={plus}
                    bPad={'.8rem 1.6rem'}
                    bRad={'30px'}
                    bg={'var(--color-green)'}
                    color={'#fff'}
                />
                <button 
                    type="button"
                    onClick={handleReset}
                    className="reset-form-btn"
                >
                    {x}
                    Reset Form
                </button>
            </div>
        </FormStyled>
    )
}


const FormStyled = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    input, textarea, select{
        font-family: inherit;
        font-size: inherit;
        outline: none;
        border: none;
        padding: .5rem 1rem;
        border-radius: 5px;
        border: 2px solid var(--border-color);
        background: var(--input-bg);
        resize: none;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        color: var(--input-text);
        &::placeholder{
            color: var(--input-text);
            opacity: 0.5;
        }
    }
    .input-control{
        input{
            width: 100%;
        }
        .input-note{
            font-size: 0.85rem;
            color: var(--text-color);
            opacity: 0.7;
            margin-top: 0.3rem;
            margin-left: 0.1rem;
        }
    }

    .selects{
        display: flex;
        justify-content: flex-start;
        select{
            color: var(--input-text);
            &:invalid{
                color: var(--input-text);
                opacity: 0.5;
            }
            &:focus, &:active{
                color: var(--input-text);
            }
        }
    }

    .submit-btn{
        display: flex;
        gap: 1rem;
        button{
            box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
            &:hover{
                background: var(--color-green) !important;
            }
        }
        .reset-form-btn{
            padding: .8rem 1.6rem;
            border-radius: 30px;
            background: #dc3545;
            color: #fff;
            border: none;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: inherit;
            font-size: inherit;
            &:hover{
                background: #c82333 !important;
            }
        }
    }
`;

export default DeductionForm
