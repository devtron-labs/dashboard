import { EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React, { CSSProperties } from 'react'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'

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
    const handleCDEmptyStateButton = () => {
        return (
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
        )
    }
    return (
        <div style={{ backgroundColor: 'var(--window-bg)' }}>
          <GenericEmptyState
                image={imgSource || AppNotDeployed}
                classname='fs-16'
                title={title ? title : EMPTY_STATE_STATUS.CD_EMPTY_STATE.TITLE}
                subTitle={subtitle ? subtitle : EMPTY_STATE_STATUS.CD_EMPTY_STATE.SUBTITLE}
                renderButton={actionButtonText && handleCDEmptyStateButton}
            />
        </div>
    )
}
