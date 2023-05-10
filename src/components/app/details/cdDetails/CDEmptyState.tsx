import { EmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React, { CSSProperties } from 'react'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'

export default function CDEmptyState({
    imgSource,
    title,
    subtitle,
    ActionButtonIcon,
    actionButtonClass,
    actionButtonIconRight,
    actionButtonText,
    actionHandler,
    dataTestId
}: {
    imgSource?: string
    title?: string
    subtitle?: string
    actionButtonClass?: string
    ActionButtonIcon?: React.FunctionComponent<any>
    actionButtonIconRight?: boolean
    actionButtonText?: string
    actionHandler?: () => void
    dataTestId? : string
}) {
    return (
        <div style={{ backgroundColor: 'var(--window-bg)' }}>
          {/* TODO replace with genericemptystate after incoporating png support */}
            <EmptyState>
                <EmptyState.Image>
                    <img src={imgSource || AppNotDeployed} alt="" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4 className="fw-6 fs-16" data-testid={`${dataTestId}-heading`}>
                        {title ? title : `Data not available`}
                    </h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    {subtitle ? subtitle : `Deployed configurations is not available for older deployments`}
                </EmptyState.Subtitle>
                {actionButtonText && (
                    <EmptyState.Button>
                        <div
                            className={`${
                                actionButtonClass ? actionButtonClass : 'cb-5 bcn-0 en-2'
                            } fcn-0 fw-6 fs-13 flexbox br-4 pl-16 pr-16 pt-8 pb-8 pointer`}
                            onClick={actionHandler}
                            data-testid={dataTestId}
                        >
                            {ActionButtonIcon && !actionButtonIconRight && <ActionButtonIcon className="add-icon" />}
                            {actionButtonText}
                            {ActionButtonIcon && actionButtonIconRight && (
                                <ActionButtonIcon className="icon-dim-16 ml-8" />
                            )}
                        </div>
                    </EmptyState.Button>
                )}
            </EmptyState>
        </div>
    )
}
