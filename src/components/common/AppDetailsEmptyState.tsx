import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import  EmptyEnvironment  from '../../assets/img/app-detail-empty-state.png'

export function AppDetailsEmptyState() {
    return (
        <EmptyState>
            <EmptyState.Image>
            <img src={EmptyEnvironment} alt="error" className="w-100" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9">Deployment on this environment has been deleted or not found</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                This application is no longer deployed on ‘staging-devtroncd’ environment.
            </EmptyState.Subtitle>
        </EmptyState>
    )
}
