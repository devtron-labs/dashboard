import React from 'react'
import {
    BulkSelectionEvents,
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { ReactComponent as Trash } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Close } from '../../../../../assets/icons/ic-close.svg'
import { User } from '../../types'
import { BulkSelectionActionWidgetProps, BulkSelectionModalTypes } from './types'

const BulkStatusUpdateDropdown = importComponentFromFELibrary('BulkStatusUpdateDropdown', null, 'function')

const BulkSelectionActionWidget = ({
    parentRef,
    showStatus,
    count,
    areActionsDisabled,
    setBulkSelectionModalConfig,
    refetchUserPermissionList,
    filterConfig,
    selectedUsersCount,
}: BulkSelectionActionWidgetProps) => {
    const { handleBulkSelection } = useBulkSelection<Record<User['id'], boolean>>()

    const openBulkDeleteModal = () => {
        setBulkSelectionModalConfig({
            type: BulkSelectionModalTypes.deleteConfirmation,
        })
    }

    const clearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    return (
        <DraggableWrapper
            // TODO: Widget doesn't move when at the bottom of the page
            dragSelector=".drag-selector"
            positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
            parentRef={parentRef}
            // TODO: update in common
            // zIndex="calc(var(--modal-index) - 1)"
            zIndex={19}
        >
            <div className="flex dc__gap-8 pt-12 pb-12 pr-12 pl-8 bulk-selection-widget br-8">
                <DraggableButton dragClassName="drag-selector" />
                <div className="fs-13 lh-20 fw-6 flex dc__gap-12">
                    <span className="bcb-5 cn-0 br-4 pr-6 pl-6">{count}</span>
                    <span className="cn-9">Selected</span>
                </div>
                <div className="dc__divider h-16" />
                {showStatus && (
                    <BulkStatusUpdateDropdown
                        disabled={areActionsDisabled}
                        refetchUserPermissionList={refetchUserPermissionList}
                        filterConfig={filterConfig}
                        selectedUsersCount={selectedUsersCount}
                    />
                )}
                <div className="flex dc__gap-8">
                    <button
                        type="button"
                        className="dc__transparent flex p-0"
                        onClick={openBulkDeleteModal}
                        aria-label="Delete selected user"
                        disabled={areActionsDisabled}
                    >
                        <Trash className="scn-6 icon-dim-28 p-6 icon-delete" />
                    </button>
                    <div className="dc__divider h-16" />
                    <button
                        type="button"
                        className="dc__transparent flex p-0"
                        onClick={clearBulkSelection}
                        aria-label="Clear bulk selection"
                        disabled={areActionsDisabled}
                    >
                        <Close className="fcn-6 icon-dim-28 p-6" />
                    </button>
                </div>
            </div>
        </DraggableWrapper>
    )
}

export default BulkSelectionActionWidget
