import { EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import emptyCustomChart from '../../assets/img/empty-noresult@2x.png'

export default function ClusterNodeEmptyState({
    title,
    actionHandler,
}: {
    title?: string
    actionHandler?: () => void
}) {

  const renderClearSearchButton = () => {
      return (
          <button onClick={actionHandler} className="add-link cta flex">
              Clear search
          </button>
      )
  }
    return (
        <GenericEmptyState
            image={emptyCustomChart}
            title={title || 'No matching clusters'}
            subTitle="We couldn’t find any matching results"
            isButtonAvailable={true}
            renderButton={renderClearSearchButton}
        />
    )
}
