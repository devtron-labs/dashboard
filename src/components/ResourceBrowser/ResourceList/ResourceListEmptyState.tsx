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
            actionHandler ? (
                <button onClick={actionHandler} className="add-link cta flex">
                    {actionButtonText ?? 'Clear filters'}
                </button>
            ) : null
        )
    }
    return (
        <GenericEmptyState
            SvgImage=""
            classname="title dc__position-rel-imp"
            image={imgSource ?? emptyCustomChart}
            title={title ?? 'No resources found'}
            subTitle={subTitle}
            isButtonAvailable={true}
            renderButton={handleButton}
        />
    )
}
