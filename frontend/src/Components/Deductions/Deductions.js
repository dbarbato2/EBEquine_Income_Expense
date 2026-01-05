import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import DeductionForm from './DeductionForm';
import DeductionItem from './DeductionItem';

function Deductions() {
    const {deductions, getDeductions, deleteDeduction, totalDeductions} = useGlobalContext()

    useEffect(() =>{
        getDeductions()
    }, [])
    return (
        <RevenueStyled>
            <InnerLayout>
                <h1>Deductions</h1>
                <h2 className="total-revenue">Total Deductions: <span>${totalDeductions()}</span></h2>
                <div className="revenue-content">
                    <div className="form-container">
                        <DeductionForm />
                    </div>
                    <div className="deductions">
                        {deductions.map((deduction) => {
                            const {_id, deductionType, deductionAmount, month, deductionDescription } = deduction;
                            return <DeductionItem
                                key={_id}
                                id={_id} 
                                title={deductionType} 
                                description={deductionDescription} 
                                amount={deductionAmount} 
                                date={month} 
                                indicatorColor="var(--color-red)"
                                deleteItem={deleteDeduction}
                            />
                        })}
                    </div>
                </div>
            </InnerLayout>
        </RevenueStyled>
    )
}

const RevenueStyled = styled.div`
    display: flex;
    overflow: auto;
    .total-revenue{
        display: flex;
        justify-content: center;
        align-items: center;
        background: #FCF6F9;
        border: 2px solid #FFFFFF;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        border-radius: 20px;
        padding: 1rem;
        margin: 1rem 0;
        font-size: 2rem;
        gap: .5rem;
        span{
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--color-green);
        }
    }
    .revenue-content{
        display: flex;
        gap: 2rem;
        .revenue{
            flex: 1;
        }
    }
`;

export default Deductions