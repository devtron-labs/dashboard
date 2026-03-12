import {
    Button,
    ButtonVariantType,
    Checkbox,
    ComponentSizeType,
    Icon,
    IconName,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { EVENT_ICONS, EVENT_LABEL, EVENTS } from './constants'
import { ModifyRecipientPopUpType, NotificationPipelineType } from './types'

export const ModifyRecipientPopUp = ({
    events,
    applyModifyEvents,
    onChangeCheckboxHandler,
    selectedNotificationList,
}: ModifyRecipientPopUpType) => {
    const getDisabledLabel = (value) => {
        // If BASE type is present among all, only CONFIG_APPROVAL should be enabled
        if (selectedNotificationList.some((row) => row.pipelineType === NotificationPipelineType.BASE)) {
            return value !== EVENTS.CONFIG_APPROVAL
        }

        // If CI is available, disable CONFIG_APPROVAL and IMAGE_APPROVAL
        if (selectedNotificationList.some((row) => row.pipelineType === NotificationPipelineType.CI)) {
            return value === EVENTS.CONFIG_APPROVAL || value === EVENTS.IMAGE_APPROVAL
        }

        return false
    }

    const options = Object.values(EVENTS).map((value) => ({
        label: EVENT_LABEL[value],
        value,
        icon: EVENT_ICONS[value],
        isDisabled: getDisabledLabel(value),
    }))

    return (
        <div>
            <ul className="dc__kebab-menu__list kebab-menu__list--notification-tab ">
                {options.map((option) => (
                    <Tooltip
                        content={option.isDisabled ? 'Cannot edit for the selected resource types.' : ''}
                        placement="top"
                        className="mxh-210 dc__overflow-auto dc__word-break"
                        alwaysShowTippyOnHover={option.isDisabled}
                    >
                        <li
                            key={option.value}
                            className={`dc__kebab-menu__list-item flex-justify flex ${option.isDisabled ? 'dc__disabled' : ''}`}
                        >
                            <div className="flex left dc__gap-8">
                                <Icon name={option.icon as IconName} color={null} />
                                <span>{option.label}</span>
                            </div>

                            <Checkbox
                                rootClassName="mb-0"
                                isChecked={events[option.value].isChecked}
                                value={events[option.value].value}
                                onChange={(e) => onChangeCheckboxHandler(e, option.value)()}
                                disabled={option.isDisabled}
                            >
                                <span />
                            </Checkbox>
                        </li>
                    </Tooltip>
                ))}
            </ul>

            <div className="p-8">
                <Button
                    dataTestId="apply-recipient"
                    text="Apply"
                    variant={ButtonVariantType.primary}
                    size={ComponentSizeType.medium}
                    onClick={applyModifyEvents}
                    fullWidth
                />
            </div>
        </div>
    )
}
