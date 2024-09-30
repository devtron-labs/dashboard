import { ConfigHeaderTabType, ConfigToolbarPopupMenuConfigType, Tooltip } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { ReactComponent as ICArrowSquareIn } from '@Icons/ic-arrow-square-in.svg'
import { ReactComponent as ICDeleteInteractive } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { ConfigHeaderTabConfigType, ConfigToolbarProps, GetConfigToolbarPopupConfigProps } from './types'

const getToggleViewLockedKeysPopupButtonConfig = importComponentFromFELibrary(
    'getToggleViewLockedKeysPopupButtonConfig',
    null,
    'function',
)

const getDeleteDraftPopupButtonConfig = importComponentFromFELibrary(
    'getDeleteDraftPopupButtonConfig',
    null,
    'function',
)

const getEditHistoryPopupButtonConfig = importComponentFromFELibrary(
    'getEditHistoryPopupButtonConfig',
    null,
    'function',
)

const getValuesViewTabText = (
    isOverridable: Parameters<typeof getConfigHeaderTabConfig>[1],
    isPublishedTemplateOverridden: Parameters<typeof getConfigHeaderTabConfig>[2],
) => {
    if (!isOverridable) {
        return 'Configuration'
    }
    if (isPublishedTemplateOverridden) {
        return 'Override'
    }
    return 'No override'
}

export const getConfigHeaderTabConfig = (
    tab: ConfigHeaderTabType,
    isOverridable: boolean,
    isPublishedTemplateOverridden: boolean,
): ConfigHeaderTabConfigType => {
    switch (tab) {
        case ConfigHeaderTabType.DRY_RUN:
            return {
                text: 'Dry run',
                icon: ICFilePlay,
            }

        case ConfigHeaderTabType.VALUES:
            return {
                text: getValuesViewTabText(isOverridable, isPublishedTemplateOverridden),
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

// TODO: Ask for button variant
export const PopupMenuItem = ({ text, onClick, dataTestId, disabled, icon }: ConfigToolbarPopupMenuConfigType) => (
    <button
        className={`dc__transparent py-6 px-8 flexbox dc__gap-8 dc__align-items-center dc__hover-n50 ${disabled ? 'dc__disabled' : ''}`}
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

export const getConfigToolbarPopupConfig = ({
    lockedConfigData,
    configHeaderTab,
    isOverridden,
    isPublishedValuesView,
    isPublishedConfigPresent,
    handleDeleteOverride,
    handleDiscardDraft,
    unableToParseData,
    isLoading,
    isDraftAvailable,
    handleShowEditHistory,
}: GetConfigToolbarPopupConfigProps): ConfigToolbarProps['popupConfig']['menuConfig'] => {
    if (isPublishedValuesView && !isPublishedConfigPresent) {
        return null
    }

    const firstConfigSegment: ConfigToolbarPopupMenuConfigType[] = []
    const secondConfigSegment: ConfigToolbarPopupMenuConfigType[] = []

    if (lockedConfigData && getToggleViewLockedKeysPopupButtonConfig) {
        const lockedKeysConfig = getToggleViewLockedKeysPopupButtonConfig(
            lockedConfigData.areLockedKeysPresent,
            lockedConfigData.hideLockedKeys,
            unableToParseData || isLoading,
            lockedConfigData.handleSetHideLockedKeys,
        )

        if (lockedKeysConfig) {
            firstConfigSegment.push(lockedKeysConfig)
        }
    }

    if (isDraftAvailable && configHeaderTab === ConfigHeaderTabType.VALUES) {
        const activityHistoryConfig = getEditHistoryPopupButtonConfig(handleShowEditHistory, isLoading)
        if (activityHistoryConfig) {
            firstConfigSegment.push(activityHistoryConfig)
        }
    }

    if (
        getDeleteDraftPopupButtonConfig &&
        !isPublishedValuesView &&
        isDraftAvailable &&
        configHeaderTab === ConfigHeaderTabType.VALUES
    ) {
        const deleteDraftConfig = getDeleteDraftPopupButtonConfig(handleDiscardDraft, isLoading)
        if (deleteDraftConfig) {
            secondConfigSegment.push(deleteDraftConfig)
        }
    }

    if (isOverridden && configHeaderTab === ConfigHeaderTabType.VALUES) {
        secondConfigSegment.push({
            text: 'Delete override',
            onClick: handleDeleteOverride,
            dataTestId: 'delete-override',
            disabled: isLoading,
            icon: <ICDeleteInteractive className="scr-5 dc__no-shrink icon-dim-16" />,
        })
    }

    return {
        ...(firstConfigSegment.length && { firstConfigSegment }),
        ...(secondConfigSegment.length && { secondConfigSegment }),
    }
}
