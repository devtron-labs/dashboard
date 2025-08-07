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

/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { useEffect } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
    Icon,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { ENVIRONMENT_OVERVIEW_DRAG_SELECTOR_IDENTIFIER } from './EnvironmentOverview.constants'
import { EnvironmentOverviewPopupMenu } from './EnvironmentOverviewPopupMenu'
import { EnvironmentOverviewBulkSelectionWidgetProps } from './EnvironmentOverviewTable.types'

export const EnvironmentOverviewBulkSelectionWidget = ({
    count,
    onClose,
    parentRef,
    popUpMenuItems,
    children,
}: EnvironmentOverviewBulkSelectionWidgetProps) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    useEffect(() => {
        registerShortcut({ keys: ['Escape'], callback: onClose })

        return () => {
            unregisterShortcut(['Escape'])
        }
    }, [])

    return (
        <DraggableWrapper
            dragSelector={`.${ENVIRONMENT_OVERVIEW_DRAG_SELECTOR_IDENTIFIER}`}
            positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
            zIndex="calc(var(--modal-index) - 1)"
            parentRef={parentRef}
        >
            <div className="bulk-selection-widget br-8 pl-7 pr-11 py-11 flex dc__gap-8">
                <DraggableButton dragClassName={ENVIRONMENT_OVERVIEW_DRAG_SELECTOR_IDENTIFIER} />
                <div className="flex dc__gap-8 fs-13 lh-20 fw-6">
                    <span className="bcb-5 br-4 px-6 cn-0">{count}</span>
                    <span className="cn-9">Selected</span>
                </div>
                <div className="w-1 h-20 bcb-1" />
                {children}
                {popUpMenuItems.length > 0 && <EnvironmentOverviewPopupMenu popUpMenuItems={popUpMenuItems} />}
                <div className="w-1 h-20 bcb-1" />
                <Button
                    icon={<Icon name="ic-close-large" color={null} />}
                    dataTestId="environment-overview-table-action-widget-close"
                    style={ButtonStyleType.negativeGrey}
                    variant={ButtonVariantType.borderLess}
                    ariaLabel="Clear selection(s)"
                    size={ComponentSizeType.small}
                    onClick={onClose}
                    showAriaLabelInTippy={false}
                />
            </div>
        </DraggableWrapper>
    )
}
