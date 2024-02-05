import React, { useState } from 'react'
import {
    BulkSelectionEvents,
    CHECKBOX_VALUE,
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
    showError,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { ReactComponent as Trash } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Close } from '../../../../../assets/icons/ic-close.svg'
import BulkUserDeleteModal from './BulkUserDeleteModal'
import { User, UserBulkDeletePayload } from '../../types'
import { deleteUserInBulk } from '../../authorization.service'
import { BulkSelectionActionWidgetProps } from './types'

const BulkStatusUpdateDropdown = importComponentFromFELibrary('BulkStatusUpdateDropdown', null, 'function')

const BulkSelectionActionWidget = ({
    parentRef,
    showStatus,
    count,
    urlFilters,
    refetchUserPermissionList,
}: BulkSelectionActionWidgetProps) => {
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const {
        handleBulkSelection,
        selectedIdentifiers: bulkSelectionState,
        // TODO: try not to use
        checkboxValue,
    } = useBulkSelection<Record<User['id'], boolean>>()
    const selectedUserIds = Object.keys(bulkSelectionState).map(Number)

    const toggleBulkDeleteModal = () => {
        setIsBulkDeleteModalOpen(!isBulkDeleteModalOpen)
    }

    const clearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    const handleBulkDelete = async () => {
        setIsDeleteLoading(true)

        const payload: UserBulkDeletePayload =
            checkboxValue === CHECKBOX_VALUE.BULK_CHECKED
                ? {
                      filterConfig: {
                          searchKey: urlFilters.searchKey,
                      },
                  }
                : {
                      ids: selectedUserIds,
                  }
        try {
            await deleteUserInBulk(payload)
            toast.success('Selected user(s) deleted successfully')
            setIsDeleteLoading(false)
            clearBulkSelection()
            refetchUserPermissionList()
            setIsBulkDeleteModalOpen(false)
        } catch (err) {
            showError(err)
            setIsDeleteLoading(false)
        }
    }

    return (
        <>
            {!isBulkDeleteModalOpen && (
                <DraggableWrapper
                    dragSelector=".drag-selector"
                    positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
                    parentRef={parentRef}
                >
                    <div className="flex dc__gap-8 pt-12 pb-12 pr-12 pl-8 bulk-selection-widget br-8">
                        <DraggableButton dragClassName="drag-selector" />
                        <div className="fs-13 lh-20 fw-6 flex dc__gap-12">
                            <span className="bcb-5 cn-0 br-4 pr-6 pl-6">{count}</span>
                            <span className="cn-9">Selected</span>
                        </div>
                        <div className="dc__divider h-16" />
                        {showStatus && <BulkStatusUpdateDropdown />}
                        <div className="flex dc__gap-8">
                            <button
                                type="button"
                                className="dc__transparent flex p-0"
                                onClick={toggleBulkDeleteModal}
                                aria-label="Delete selected user"
                            >
                                <Trash className="scn-6 icon-dim-28 p-6 icon-delete" />
                            </button>
                            <div className="dc__divider h-16" />
                            <button
                                type="button"
                                className="dc__transparent flex p-0"
                                onClick={clearBulkSelection}
                                aria-label="Clear bulk selection"
                            >
                                <Close className="fcn-6 icon-dim-28 p-6" />
                            </button>
                        </div>
                    </div>
                </DraggableWrapper>
            )}
            {isBulkDeleteModalOpen && (
                <BulkUserDeleteModal
                    usersCountToDelete={count}
                    onClose={toggleBulkDeleteModal}
                    onSubmit={handleBulkDelete}
                    isLoading={isDeleteLoading}
                />
            )}
        </>
    )
}

export default BulkSelectionActionWidget
