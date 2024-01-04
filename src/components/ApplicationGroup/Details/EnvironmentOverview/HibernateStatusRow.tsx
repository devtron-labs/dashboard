import React from 'react'
import { HibernateResponseRowType, HibernateStatusRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as Skipped } from '../../../../assets/icons/ic-info-filled.svg'

export const HibernateStatusRow = ({ rowData, index, isVirtualEnv, isHibernateOperation }: HibernateStatusRowType) => {
    const renderStatusIcon = (): JSX.Element => {
        if (rowData.success) {
            return <Success className="mr-8 icon-dim-18" />
        }
        if (rowData.authError) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        }
        if (rowData.skipped) {
            return <Skipped className="mr-8 icon-dim-18" />
        }
        return <Error className="mr-8 icon-dim-18" />
    }

    const getStatus = () => {
        if (rowData.success) {
            return isHibernateOperation ? 'Hibernation Initiated' : 'Unhibernation Initiated'
        }
        if (rowData.authError) {
            return 'Not authorized'
        }
        if (rowData.skipped) {
            return 'Skipped'
        }
        return 'Failed'
    }

    const getMessage = () => {
        if (rowData.authError) {
            return 'You do not have permission to trigger deployment for this application + environment'
        }
        if (rowData.error) {
            return rowData.error
        }
        if (rowData.skipped) {
            return rowData.skipped
        }
        return '-'
    }

    return (
        <div className={`response-row  pt-8 pb-8 ${isVirtualEnv ? 'is-virtual' : ''}`}>
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon()}
                <span data-testid={`response-status-text-${index}`}>{getStatus()}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{getMessage()}</div>
        </div>
    )
}
