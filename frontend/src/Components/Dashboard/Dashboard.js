import React from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import QuarterlyRevenue from './QuarterlyRevenue';
import DetailedBreakdown from './DetailedBreakdown';

function Dashboard() {
    return (
        <DashboardStyled>
            <InnerLayout>
                <QuarterlyRevenue />
                <DetailedBreakdown />
            </InnerLayout>
        </DashboardStyled>
    )
}

const DashboardStyled = styled.div`
`;

export default Dashboard