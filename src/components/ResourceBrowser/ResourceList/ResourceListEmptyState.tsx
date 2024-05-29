import React from 'react'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ResourceListEmptyStateType } from '../Types'
import emptyCustomChart from '../../../assets/img/empty-noresult@2x.png'

const ResourceListEmptyState = ({
    imgSource,
    title,
    subTitle,
    actionButtonText,
    actionHandler,
}: ResourceListEmptyStateType) => {
    const handleButton = () => {
        return actionHandler ? (
            <button type="button" onClick={actionHandler} className="add-link cta flex">
                {actionButtonText ?? 'Clear filters'}
            </button>
        ) : null
    }
    return (
        <GenericEmptyState
            classname="title dc__position-rel-imp"
            image={imgSource ?? emptyCustomChart}
            title={title ?? 'No resources found'}
            subTitle={subTitle}
            isButtonAvailable
            renderButton={handleButton}
        />
    )
}

export default ResourceListEmptyState
