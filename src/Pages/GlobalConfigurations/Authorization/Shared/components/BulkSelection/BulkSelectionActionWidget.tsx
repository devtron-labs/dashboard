/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    BulkSelectionEvents,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { ReactComponent as Trash } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Close } from '../../../../../../assets/icons/ic-close.svg'
import { ReactComponent as Tilde } from '../../../../../../assets/icons/ic-tilde.svg'
import useAuthorizationBulkSelection from './useAuthorizationBulkSelection'
import { BulkSelectionActionWidgetProps } from './types'
import { BulkSelectionEntityTypes, BulkSelectionModalTypes } from './constants'

const BulkStatusUpdateDropdown = importComponentFromFELibrary('BulkStatusUpdateDropdown', null, 'function')

const BulkSelectionActionWidget = ({
    parentRef,
    showStatus,
    count,
    areActionsDisabled,
    setBulkSelectionModalConfig,
    refetchList,
    filterConfig,
    selectedIdentifiersCount,
    isCountApproximate = false,
    entityType,
}: BulkSelectionActionWidgetProps) => {
    const { handleBulkSelection } = useAuthorizationBulkSelection()

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
            dragSelector=".drag-selector"
            positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
            parentRef={parentRef}
            zIndex="calc(var(--modal-index) - 1)"
            layoutFixDelta={67}
        >
            <div className="flex dc__gap-8 pt-12 pb-12 pr-12 pl-8 bulk-selection-widget br-8">
                <DraggableButton dragClassName="drag-selector" />
                <div className="fs-13 lh-20 fw-6 flex dc__gap-12">
                    <span className="flex dc__gap-2 bcb-5 cn-0 br-4 pr-6 pl-6">
                        {isCountApproximate && <Tilde className="dc__no-shrink icon-dim-12 scn-0" />}
                        {count}
                    </span>
                    <span className="cn-9">Selected</span>
                </div>
                <div className="dc__divider h-16" />
                {showStatus && (
                    <BulkStatusUpdateDropdown
                        disabled={areActionsDisabled}
                        refetchUserPermissionList={refetchList}
                        filterConfig={filterConfig}
                        selectedUsersCount={selectedIdentifiersCount}
                    />
                )}
                <div className="flex dc__gap-8">
                    <Button
                        icon={<Trash />}
                        ariaLabel={entityType === BulkSelectionEntityTypes.users ? 'Delete user(s)' : 'Delete group(s)'}
                        onClick={openBulkDeleteModal}
                        disabled={areActionsDisabled}
                        dataTestId="bulk-delete-button"
                        size={ComponentSizeType.small}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                    />
                    <div className="dc__divider h-16" />
                    <Button
                        icon={<Close />}
                        ariaLabel="Clear Selection(s)"
                        onClick={clearBulkSelection}
                        disabled={areActionsDisabled}
                        dataTestId="clear-bulk-selection"
                        size={ComponentSizeType.small}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                    />
                </div>
            </div>
        </DraggableWrapper>
    )
}

export default BulkSelectionActionWidget
