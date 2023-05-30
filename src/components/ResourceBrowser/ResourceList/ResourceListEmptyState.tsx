import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import emptyCustomChart from '../../../assets/img/empty-noresult@2x.png'
import { ResourceListEmptyStateType } from '../Types'

export default function ResourceListEmptyState({
    imgSource,
    title,
    subTitle,
    actionButtonText,
    actionHandler,
}: ResourceListEmptyStateType) {
    const handleButton = () => {
        return (
            <button onClick={actionHandler} className="add-link cta flex">
                {actionButtonText ?? 'Clear filters'}
            </button>
        )
    }
    return (
        <GenericEmptyState
            classname="title"
            heightToDeduct={92}
            image={imgSource ?? emptyCustomChart}
            title={title ?? 'No resources found'}
            subTitle={subTitle}
            renderButton={actionHandler && handleButton}
        />
    )
}
