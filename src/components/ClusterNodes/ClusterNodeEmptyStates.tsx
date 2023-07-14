import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import emptyCustomChart from '../../assets/img/empty-noresult@2x.png'
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging'

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
            title={title || EMPTY_STATE_STATUS.CLUSTER_NODE_EMPTY_STATE.TITLE}
            subTitle={EMPTY_STATE_STATUS.CLUSTER_NODE_EMPTY_STATE.SUBTITLE}
            isButtonAvailable={true}
            renderButton={renderClearSearchButton}
            classname='dc__position-rel-imp'
        />
    )
}
