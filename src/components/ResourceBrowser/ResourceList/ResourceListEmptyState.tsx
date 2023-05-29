import { EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
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
        // <EmptyState>
        //     <EmptyState.Image>
        //         <img src={imgSource ?? emptyCustomChart} alt="No resources found" />
        //     </EmptyState.Image>
        //     <EmptyState.Title>
        //         <h4 className="title">{title ?? 'No resources found'}</h4>
        //     </EmptyState.Title>
        //     <EmptyState.Subtitle>{subTitle}</EmptyState.Subtitle>
        //     {actionHandler && (
        //         <EmptyState.Button>
        //             <button onClick={actionHandler} className="add-link cta flex">
        //                 {actionButtonText ?? 'Clear filters'}
        //             </button>
        //         </EmptyState.Button>
        //     )}
        // </EmptyState>
        <GenericEmptyState
            classname="title"
            image={imgSource ?? emptyCustomChart}
            title={title ?? 'No resources found'}
            subTitle={subTitle}
            renderButton={handleButton}
        />
    )
}
