import React, { useState } from 'react'
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

    const { year, month, deductionType, deductionDescription, deductionAmount, deductionRecordNumber } = inputState;

    const handleInput = name => e => {
        const value = name === 'deductionAmount' || name === 'deductionRecordNumber' ? e.target.value : e.target.value
        setInputState({...inputState, [name]: value})
        setError('')
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
                <select value={month} name="month" id="month" onChange={handleInput('month')} required>
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
        border: 2px solid #fff;
        background: transparent;
        resize: none;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        color: rgba(34, 34, 96, 0.9);
        &::placeholder{
            color: rgba(34, 34, 96, 0.4);
        }
    }
    .input-control{
        input{
            width: 100%;
        }
    }

    .selects{
        display: flex;
        justify-content: flex-start;
        select{
            color: rgba(34, 34, 96, 0.9);
            &:invalid{
                color: rgba(34, 34, 96, 0.4);
            }
            &:focus, &:active{
                color: rgba(34, 34, 96, 1);
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
