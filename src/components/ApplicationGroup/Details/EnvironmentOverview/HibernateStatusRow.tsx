import React from 'react'
import { HibernateResponseRowType, HibernateStatusRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'

export function HibernateStatusRow({ rowData, index, isVirtualEnv, isHibernateOperation }: HibernateStatusRowType) {
    const renderStatusIcon = (rowData: HibernateResponseRowType): JSX.Element => {
        if (rowData.success) {
            return <Success className="mr-8 icon-dim-18" />
        } else if (rowData.authError) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        } else {
            return <Error className="mr-8 icon-dim-18" />
        }
    }

    const getStatus = () => {
        if (rowData.success) {
            return isHibernateOperation ? 'Hibernation Initiated' : 'Unhibernation Initiated'
        } else if (rowData.authError) {
            return 'Not authorized'
        } else {
            return 'Failed'
        }
    }

    const getMessage = () => {
        if (rowData.authError) {
            return 'You do not have permission to trigger deployment for this application + environment'
        } else if (rowData.error) {
            return rowData.error
        }
        return '-'
    }

    return (
        <div className={`response-row  pt-8 pb-8 ${isVirtualEnv ? 'is-virtual' : ''}`} key={`response-${rowData.id}`}>
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon(rowData)}
                <span data-testid={`response-status-text-${index}`}>{getStatus()}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{getMessage()}</div>
        </div>
    )
}
