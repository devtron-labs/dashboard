import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import notFound from '../../assets/img/page-not-found.png'

export function AppDetailsEmptyState() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={notFound} alt="error" className="w-100" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9 w-300 dc__text-center ">This application is not available on this environment</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>
               <div className='dc__text-center w-300'> Deployment on this environment doesn’t exist or was removed. Please select another environment.</div>
            </EmptyState.Subtitle>
        </EmptyState>
    )
}
