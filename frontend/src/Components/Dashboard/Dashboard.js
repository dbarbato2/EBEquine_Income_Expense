import React from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import QuarterlyRevenue from './QuarterlyRevenue';

function Dashboard() {
    return (
        <DashboardStyled>
            <InnerLayout>
                <QuarterlyRevenue />
            </InnerLayout>
        </DashboardStyled>
    )
}

const DashboardStyled = styled.div`
`;

export default Dashboard