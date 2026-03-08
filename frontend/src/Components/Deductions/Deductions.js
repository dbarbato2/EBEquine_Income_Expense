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
    .form-container {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        backdrop-filter: blur(4.5px);
        border-radius: 32px;
        padding: 1.5rem;
        margin-bottom: 2rem;
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