/*
 * Copyright (c) 2024. Devtron Inc.
 */

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    DraggableButton,
    DraggablePositionVariant,
    DraggableWrapper,
    Icon,
    PopupMenu,
} from '@devtron-labs/devtron-fe-common-lib'

import { ModifyRecipientPopUp } from './ModifyRecipientPopUp'
import { BulkMultiSelectTagWidgetType } from './types'

export const BulkMultiSelectTagWidget = ({
    parentRef,
    selectedIdentifiersCount,
    showDeleteModal,
    events,
    applyModifyEvents,
    onChangeCheckboxHandler,
    selectedNotificationList,
    onOpenEditNotificationMenu,
    showModifyModal,
}: BulkMultiSelectTagWidgetType) => {
    const renderModifyEventPopUpBody = () => (
        <PopupMenu.Body>
            <ModifyRecipientPopUp
                events={events}
                applyModifyEvents={applyModifyEvents}
                onChangeCheckboxHandler={onChangeCheckboxHandler}
                selectedNotificationList={selectedNotificationList}
            />
        </PopupMenu.Body>
    )
    return (
        <DraggableWrapper
            dragSelector=".drag-selector"
            positionVariant={DraggablePositionVariant.PARENT_BOTTOM_CENTER}
            parentRef={parentRef}
            zIndex="calc(var(--modal-index) - 1)"
        >
            <div className="flex dc__gap-8 pt-12 pb-12 pr-12 pl-8 bulk-selection-widget br-8">
                <DraggableButton dragClassName="drag-selector" />
                <div className="fs-13 lh-20 fw-6 flex dc__gap-12">
                    <span className="flex dc__gap-2 bcb-5 cn-0 br-4 pr-6 pl-6">{selectedIdentifiersCount}</span>
                    <span className="cn-9">Selected</span>
                </div>
                <div className="dc__divider h-16" />
                <div className="flex left dc__gap-4" />
                <div className="flex left dc__gap-4">
                    <Button
                        dataTestId="notification-delete-button"
                        icon={<Icon name="ic-delete" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        ariaLabel="Delete Notifications"
                        onClick={showDeleteModal}
                        showAriaLabelInTippy
                    />
                    <PopupMenu
                        onToggleCallback={(isOpen) => {
                            if (isOpen) {
                                onOpenEditNotificationMenu()
                            }
                        }}
                    >
                        <PopupMenu.Button rootClassName="popup-button--notification-tab">
                            <Icon
                                name="ic-error"
                                color={null}
                                size={20}
                                tooltipProps={{ content: 'Modify events', alwaysShowTippyOnHover: true }}
                            />
                        </PopupMenu.Button>
                        {renderModifyEventPopUpBody()}
                    </PopupMenu>

                    <Button
                        dataTestId="button__modify-recipients"
                        icon={<Icon name="ic-users" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        ariaLabel="Modify Recipients"
                        onClick={showModifyModal}
                        showAriaLabelInTippy
                    />
                </div>
            </div>
        </DraggableWrapper>
    )
}
