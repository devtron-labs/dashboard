import React from 'react'
import EmptyState from '../../../EmptyState/EmptyState'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'

export default function CDEmptyState({ title, subtitle }: { title?: string; subtitle?: string }) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="fw-6 fs-16">{title ? title : `Data not available`}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                {subtitle ? subtitle : `Deployed configurations is not available for older deployments`}
            </EmptyState.Subtitle>
        </EmptyState>
    )
}
