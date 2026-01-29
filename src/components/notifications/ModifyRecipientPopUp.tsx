import {
    Button,
    ButtonVariantType,
    Checkbox,
    ComponentSizeType,
    Icon,
    IconName,
} from '@devtron-labs/devtron-fe-common-lib'

import { EVENT_ICONS, EVENT_LABEL, EVENTS } from './constants'
import { NotificationTabEvents } from './types'

export const ModifyRecipientPopUp = ({
    events,
    applyModifyEvents,
    onChangeCheckboxHandler,
}: {
    events: NotificationTabEvents
    applyModifyEvents: () => void
    onChangeCheckboxHandler: (e, value) => () => void
}) => {
    const options = Object.values(EVENTS).map((value) => ({
        label: EVENT_LABEL[value],
        value,
        icon: EVENT_ICONS[value],
    }))

    return (
        <div>
            <ul className="dc__kebab-menu__list kebab-menu__list--notification-tab ">
                {options.map((option) => (
                    <li key={option.value} className="dc__kebab-menu__list-item flex-justify">
                        <div className="flex left dc__gap-6">
                            <Icon name={option.icon as IconName} color={null} />
                            <span>{option.label}</span>
                        </div>

                        <Checkbox
                            rootClassName=""
                            isChecked={events[option.value].isChecked}
                            value={events[option.value].value}
                            onChange={(e) => onChangeCheckboxHandler(e, option.value)()}
                        >
                            <span />
                        </Checkbox>
                    </li>
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
