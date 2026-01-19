import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import Form from '../Form/Form';
import RevenueItem from '../RevenueItem/RevenueItem';

function Revenue() {
    const {revenue, getRevenue, deleteRevenue, totalRevenue, user} = useGlobalContext()

    // Log the user ID to verify it's set correctly
    console.log('Current user ID:', user)

    useEffect(() =>{
        if (user) {
            getRevenue()
        }
    }, [user, getRevenue])
    return (
        <RevenueStyled>
            <InnerLayout>
                <h1>Revenue</h1>
                <h2 className="total-revenue">Total Revenue: <span>${totalRevenue()}</span></h2>
                <div className="revenue-content">
                    <div className="form-container">
                        <Form />
                    </div>
                    <div className="revenue">
                        {revenue.map((revenue) => {
                            const {
                                _id,
                                client,
                                service,
                                quantity,
                                addOnService,
                                serviceLocation,
                                serviceFee,
                                travelFee,
                                discount,
                                discountReason,
                                paymentType,
                                transactionFee,
                                actualRevenue,
                                invoiceNumber,
                                date
                            } = revenue;
                            return <RevenueItem
                                key={_id}
                                id={_id}
                                client={client}
                                service={service}
                                quantity={quantity}
                                addOnService={addOnService}
                                serviceLocation={serviceLocation}
                                serviceFee={serviceFee}
                                travelFee={travelFee}
                                discount={discount}
                                discountReason={discountReason}
                                paymentType={paymentType}
                                transactionFee={transactionFee}
                                actualRevenue={actualRevenue}
                                invoiceNumber={invoiceNumber}
                                date={date}
                                indicatorColor="var(--color-green)"
                                deleteItem={deleteRevenue}
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

export default Revenue