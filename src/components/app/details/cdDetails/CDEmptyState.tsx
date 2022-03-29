import React from 'react'
import EmptyState from '../../../EmptyState/EmptyState'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'

export default function CDEmptyState({
    imgSource,
    title,
    subtitle,
    ActionButtonIcon,
    actionButtonText,
    actionHandler,
}: {
    imgSource?: string
    title?: string
    subtitle?: string
    ActionButtonIcon?: React.FunctionComponent<any>
    actionButtonText?: string
    actionHandler?: () => void
}) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={imgSource || AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="fw-6 fs-16">{title ? title : `Data not available`}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                {subtitle ? subtitle : `Deployed configurations is not available for older deployments`}
            </EmptyState.Subtitle>
            {actionButtonText && (
                <EmptyState.Button>
                    <div className="task-item add-task-container cb-5 fw-6 fs-13 flexbox" onClick={actionHandler}>
                        {ActionButtonIcon && <ActionButtonIcon className="add-icon" />}
                        {actionButtonText}
                    </div>
                </EmptyState.Button>
            )}
        </EmptyState>
    )
}
