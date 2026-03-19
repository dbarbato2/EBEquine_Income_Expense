import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus, x } from '../../utils/Icons';
import { toast } from 'react-hot-toast';


function ExpenseForm() {
    const {addExpense, error, setError, user} = useGlobalContext()
    const [inputState, setInputState] = useState({
        date: '',
        vendor: '',
        location: '',
        expenseType: 'Airfare',
        expenseDescription: '',
        amount: '',
        paymentType: '',
        businessTrip: false,
        expenseRecordNumber: ''
    })

    useEffect(() => {
        // Clear any previous errors when component mounts
        setError('')
    }, [setError])

    const { date, vendor, location, expenseType, expenseDescription, amount, paymentType, businessTrip, expenseRecordNumber } = inputState;

    const handleInput = name => e => {
        setInputState({...inputState, [name]: e.target.value})
        setError('')
    }

    const fetchAndPopulateExpenseRecordNumber = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1/'}get-max-expense-record-number?userid=${user}`);
            const data = await response.json();
            if (data.nextRecordNumber !== undefined) {
                setInputState(prevState => ({
                    ...prevState,
                    expenseRecordNumber: data.nextRecordNumber.toString()
                }))
            }
        } catch (error) {
            console.error('Error fetching max expense record number:', error);
        }
    }

    const handleSubmit = e => {
        e.preventDefault()
        // Convert date object to ISO string if it exists
        const dateToSend = date ? new Date(date).toISOString() : ''
        const updated = {...inputState, date: dateToSend, userid: user}
        addExpense(updated).then(success => {
            if (success) {
                setInputState({
                    date: '',
                    vendor: '',
                    location: '',
                    expenseType: 'Airfare',
                    expenseDescription: '',
                    amount: '',
                    paymentType: '',
                    businessTrip: false,
                    expenseRecordNumber: ''
                })
            }
        })
    }

    const handleReset = e => {
        e.preventDefault()
        setInputState({
            date: '',
            vendor: '',
            location: '',
            expenseType: 'Airfare',
            expenseDescription: '',
            amount: '',
            paymentType: '',
            businessTrip: false,
            expenseRecordNumber: ''
        })
        setError('')
        toast.success('Form reset successfully!')
    }

    return (
        <ExpenseFormStyled onSubmit={handleSubmit}>
            {error && <p className='error'>{error}</p>}
            <div className="input-control">
                <DatePicker 
                    id='date'
                    placeholderText='Enter A Date'
                    selected={date}
                    dateFormat="MM/dd/yyyy"
                    onChange={(date) => {
                        setInputState({...inputState, date: date})
                        fetchAndPopulateExpenseRecordNumber()
                    }}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={vendor}
                    name={'vendor'} 
                    placeholder="Vendor/Payee Name"
                    onChange={handleInput('vendor')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={location}
                    name={'location'} 
                    placeholder="Location"
                    onChange={handleInput('location')}
                />
            </div>
            <div className="selects input-control">
                <select value={expenseType} name="expenseType" id="expenseType" onChange={handleInput('expenseType')}>
                    <option value="Airfare">Airfare</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Rental Car">Rental Car</option>
                    <option value="Food">Food</option>
                    <option value="Parking">Parking</option>
                    <option value="Professional">Professional</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Home Office Expenses">Home Office Expenses</option>
                    <option value="Gas">Gas</option>
                    <option value="Gym">Gym</option>
                    <option value="Car Payment">Car Payment</option>
                    <option value="Car Maintenance">Car Maintenance</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={expenseDescription}
                    name={'expenseDescription'} 
                    placeholder="Expense Description"
                    onChange={handleInput('expenseDescription')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={amount}
                    name={'amount'} 
                    placeholder="Amount"
                    onChange={handleInput('amount')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="selects input-control">
                <select value={paymentType} name="paymentType" id="paymentType" onChange={handleInput('paymentType')} required>
                    <option value="" disabled>Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Chase Credit Card">Chase Credit Card</option>
                    <option value="Venmo">Venmo</option>
                    <option value="AutoPay Needham Bank">AutoPay Needham Bank</option>
                </select>
            </div>
            <div className="input-control checkbox">
                <label>
                    <input 
                        type="checkbox" 
                        name={'businessTrip'}
                        checked={businessTrip}
                        onChange={(e) => setInputState({...inputState, businessTrip: e.target.checked})}
                    />
                    Associated with a Business Trip
                </label>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={expenseRecordNumber}
                    name={'expenseRecordNumber'} 
                    placeholder="Expense Record Number"
                    onChange={handleInput('expenseRecordNumber')}
                    min="0"
                />
                <p className="input-note">Expense Record Number populated automatically, but can be edited</p>
            </div>
            <div className="submit-btn">
                <Button 
                    name={'Add Expense'}
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
        </ExpenseFormStyled>
    )
}


const ExpenseFormStyled = styled.form`
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
        &.checkbox{
            label{
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                color: var(--text-color);
                input[type="checkbox"]{
                    width: auto;
                    margin: 0;
                }
            }
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
export default ExpenseForm
