// TODO: Replace this with ActionMenu component
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    PopupMenu,
} from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentOverviewTableRow } from './EnvironmentOverviewTable.types'

export const EnvironmentOverviewPopupMenu = ({
    popUpMenuItems,
}: Pick<EnvironmentOverviewTableRow, 'popUpMenuItems'>) => (
    <PopupMenu autoClose>
        <PopupMenu.Button isKebab rootClassName="p-0 dc__no-border cursor">
            <Button
                icon={<Icon name="ic-more-vertical" color={null} />}
                dataTestId="environment-overview-pop-up-menu"
                style={ButtonStyleType.neutral}
                variant={ButtonVariantType.borderLess}
                ariaLabel="environment-overview-pop-up-menu"
                size={ComponentSizeType.xs}
                showAriaLabelInTippy={false}
            />
        </PopupMenu.Button>
        <PopupMenu.Body noBackDrop rootClassName="dc__border py-4 w-180">
            {popUpMenuItems.map((popUpMenuItem) => {
                if ('label' in popUpMenuItem) {
                    const { label, onClick, disabled, iconName } = popUpMenuItem

                    return (
                        <button
                            key={label}
                            type="button"
                            className={`dc__transparent w-100 py-6 px-8 flexbox dc__align-items-center dc__gap-8 ${disabled ? ' dc__opacity-0_5 cursor-not-allowed' : 'dc__hover-n50'}`}
                            onClick={onClick}
                            disabled={disabled}
                        >
                            {iconName && <Icon name={iconName} color="N800" />}
                            <span className="dc__truncate cn-9 fs-13 lh-20">{label}</span>
                        </button>
                    )
                }

                return popUpMenuItem
            })}
        </PopupMenu.Body>
    </PopupMenu>
)
