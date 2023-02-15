import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import { ReactComponent as Delete } from '../../assets/icons/all-delete.svg'

export function AppEmptyState() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <Delete />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9">Deployment on this environment has been deleted</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                This application is no longer deployed on ‘staging-devtroncd’ environment.
            </EmptyState.Subtitle>
        </EmptyState>
    )
}
