import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import DeductionForm from '../Form/DeductionForm';

function Deductions() {
    const {getDeductions} = useGlobalContext()

    useEffect(() =>{
        getDeductions()
    }, [])
    return (
        <RevenueStyled>
            <InnerLayout>
                <h1>Add Deductions</h1>
                <div className="form-container">
                    <DeductionForm />
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