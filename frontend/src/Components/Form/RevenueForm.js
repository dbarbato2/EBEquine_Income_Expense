import React, { useState } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus, x } from '../../utils/Icons';


function RevenueForm() {
    const {addRevenue, error, setError, user} = useGlobalContext()
    const [inputState, setInputState] = useState({
        date: '',
        client: '',
        service: '1 Hour Massage',
        quantity: '',
        addOnService: '',
        serviceLocation: '',
        serviceFee: '',
        travelFee: '',
        discount: '',
        discountReason: '',
        paymentType: '',
        transactionFee: '',
        actualRevenue: '',
        invoiceNumber: ''
    })

    const { date, client, service, quantity, addOnService, serviceLocation, serviceFee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber } = inputState;

    const handleInput = name => e => {
        setInputState({...inputState, [name]: e.target.value})
        setError('')
    }

    const handleSubmit = e => {
        e.preventDefault()
        const updated = {...inputState, userid: user}
        addRevenue(updated)
        setInputState({
            date: '',
            client: '',
            service: '1 Hour Massage',
            quantity: '',
            addOnService: '',
            serviceLocation: '',
            serviceFee: '',
            travelFee: '',
            discount: '',
            discountReason: '',
            paymentType: '',
            transactionFee: '',
            actualRevenue: '',
            invoiceNumber: ''
        })
    }

    const handleReset = e => {
        e.preventDefault()
        setInputState({
            date: '',
            client: '',
            service: '1 Hour Massage',
            quantity: '',
            addOnService: '',
            serviceLocation: '',
            serviceFee: '',
            travelFee: '',
            discount: '',
            discountReason: '',
            paymentType: '',
            transactionFee: '',
            actualRevenue: '',
            invoiceNumber: ''
        })
        setError('')
    }

    return (
        <FormStyled onSubmit={handleSubmit}>
            {error && <p className='error'>{error}</p>}
            <div className="input-control">
                <DatePicker 
                    id='date'
                    placeholderText='Enter A Date'
                    selected={date}
                    dateFormat="dd/MM/yyyy"
                    onChange={(date) => {
                        setInputState({...inputState, date: date})
                    }}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={client}
                    name={'client'} 
                    placeholder="Client Name"
                    onChange={handleInput('client')}
                />
            </div>
            <div className="selects input-control">
                <select value={service} name="service" id="service" onChange={handleInput('service')}>
                    <option value="Introductory Massager">Introductory Massager</option>
                    <option value="1 Hour Massage">1 Hour Massage</option>
                    <option value="Kinesiology Tape">Kinesiology Tape</option>
                    <option value="8 Hours Teaching">8 Hours Teaching</option>
                    <option value="Gift Certificate">Gift Certificate</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={quantity}
                    name={'quantity'} 
                    placeholder="Quantity"
                    onChange={handleInput('quantity')}
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={addOnService}
                    name={'addOnService'} 
                    placeholder="Add On Service"
                    onChange={handleInput('addOnService')}
                />
            </div>
            <div className="selects input-control">
                <select value={serviceLocation} name="serviceLocation" id="serviceLocation" onChange={handleInput('serviceLocation')}>
                    <option value="MA">MA</option>
                    <option value="NH">NH</option>
                    <option value="NJ">NJ</option>
                    <option value="FL">FL</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={serviceFee}
                    name={'serviceFee'} 
                    placeholder="Service Fee"
                    onChange={handleInput('serviceFee')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={travelFee}
                    name={'travelFee'} 
                    placeholder="Travel Fee"
                    onChange={handleInput('travelFee')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={discount}
                    name={'discount'} 
                    placeholder="Discount"
                    onChange={handleInput('discount')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={discountReason}
                    name={'discountReason'} 
                    placeholder="Discount Reason"
                    onChange={handleInput('discountReason')}
                />
            </div>
            <div className="selects input-control">
                <select value={paymentType} name="paymentType" id="paymentType" onChange={handleInput('paymentType')}>
                    <option value="" disabled>Select Payment Type</option>
                    <option value="Venmo">Venmo</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Gift Certificate">Gift Certificate</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={transactionFee}
                    name={'transactionFee'} 
                    placeholder="Transaction Fee"
                    onChange={handleInput('transactionFee')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={actualRevenue}
                    name={'actualRevenue'} 
                    placeholder="Actual Revenue"
                    onChange={handleInput('actualRevenue')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={invoiceNumber}
                    name={'invoiceNumber'} 
                    placeholder="Invoice Number"
                    onChange={handleInput('invoiceNumber')}
                    min="0"
                />
            </div>
            <div className="submit-btn">
                <Button 
                    name={'Add Revenue'}
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
            color: rgba(34, 34, 96, 0.4);
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
export default RevenueForm
