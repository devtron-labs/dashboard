import { ConfigHeaderTabType, ConfigToolbarPopupMenuConfigType, Tooltip } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { ReactComponent as ICArrowSquareIn } from '@Icons/ic-arrow-square-in.svg'
import { ConfigHeaderTabConfigType } from './types'

const getValuesViewTabText = (
    isBaseDeploymentTemplate: Parameters<typeof getConfigHeaderTabConfig>[1],
    isOverridden: Parameters<typeof getConfigHeaderTabConfig>[2],
) => {
    if (isBaseDeploymentTemplate) {
        return 'No override'
    }
    if (isOverridden) {
        return 'Override'
    }
    return 'Values'
}

export const getConfigHeaderTabConfig = (
    tab: ConfigHeaderTabType,
    isBaseDeploymentTemplate: boolean,
    isOverridden?: boolean,
): ConfigHeaderTabConfigType => {
    switch (tab) {
        case ConfigHeaderTabType.DRY_RUN:
            return {
                text: 'Dry run',
                icon: ICFilePlay,
            }

        case ConfigHeaderTabType.VALUES:
            return {
                text: getValuesViewTabText(isBaseDeploymentTemplate, isOverridden),
                icon: ICFileCode,
            }

        case ConfigHeaderTabType.INHERITED:
            return {
                text: 'Inherited',
                icon: ICArrowSquareIn,
            }
        default:
            return {
                text: tab,
            }
    }
}

export const PopupMenuItem = ({
    text,
    onClick,
    dataTestId,
    disabled,
    icon,
}: Omit<ConfigToolbarPopupMenuConfigType, 'itemKey'>) => (
    <button
        className={`dc__transparent py-6 px-8 flexbox dc__gap-8 dc__hover-n50 ${disabled ? 'dc__disabled' : ''}`}
        onClick={onClick}
        data-testid={dataTestId}
        disabled={disabled}
        type="button"
    >
        {icon}
        <Tooltip content={text}>
            <span className="fs-13 fw-4 lh-20 dc__truncate">{text}</span>
        </Tooltip>
    </button>
)
