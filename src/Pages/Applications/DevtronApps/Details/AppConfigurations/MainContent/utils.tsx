import {
    ConfigHeaderTabType,
    ConfigToolbarPopupMenuConfigType,
    DeploymentTemplateHistoryType,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { ReactComponent as ICArrowSquareIn } from '@Icons/ic-arrow-square-in.svg'
import { ReactComponent as ICDeleteInteractive } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import {
    CompareConfigViewEditorConfigType,
    ConfigHeaderTabConfigType,
    ConfigToolbarProps,
    GetConfigToolbarPopupConfigProps,
} from './types'

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
    showNoOverride: Parameters<typeof getConfigHeaderTabConfig>[2],
) => {
    if (!isOverridable) {
        return 'Configuration'
    }
    if (showNoOverride) {
        return 'No override'
    }
    return 'Override'
}

export const getConfigHeaderTabConfig = (
    tab: ConfigHeaderTabType,
    isOverridable: boolean,
    showNoOverride: boolean,
): ConfigHeaderTabConfigType => {
    switch (tab) {
        case ConfigHeaderTabType.DRY_RUN:
            return {
                text: 'Dry run',
                icon: ICFilePlay,
            }

        case ConfigHeaderTabType.VALUES:
            return {
                text: getValuesViewTabText(isOverridable, showNoOverride),
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
    variant,
}: ConfigToolbarPopupMenuConfigType) => (
    <button
        className={`flexbox dc__transparent dc__hover-n50 dc__align-items-center py-6 px-8 w-100 dc__gap-8 ${variant === 'negative' ? 'cr-5' : 'cn-9'} ${disabled ? 'dc__disabled' : ''}`}
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
    showDeleteOverrideDraftEmptyState = false,
    configHeaderTab,
    isOverridden,
    isPublishedValuesView,
    isPublishedConfigPresent,
    handleDeleteOverride,
    handleDelete,
    handleDiscardDraft,
    unableToParseData,
    isLoading,
    isDraftAvailable,
    handleShowEditHistory,
    isProtected = false,
    isDeletable = false,
}: GetConfigToolbarPopupConfigProps): ConfigToolbarProps['popupConfig']['menuConfig'] => {
    if (isPublishedValuesView && !isPublishedConfigPresent) {
        return null
    }

    const firstConfigSegment: ConfigToolbarPopupMenuConfigType[] = []
    const secondConfigSegment: ConfigToolbarPopupMenuConfigType[] = []

    if (getToggleViewLockedKeysPopupButtonConfig && lockedConfigData && !showDeleteOverrideDraftEmptyState) {
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

    if (getEditHistoryPopupButtonConfig && isDraftAvailable && configHeaderTab === ConfigHeaderTabType.VALUES) {
        const activityHistoryConfig = getEditHistoryPopupButtonConfig(handleShowEditHistory, isLoading)
        if (activityHistoryConfig) {
            firstConfigSegment.push(activityHistoryConfig)
        }
    }

    if (getDeleteDraftPopupButtonConfig && isDraftAvailable && configHeaderTab === ConfigHeaderTabType.VALUES) {
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
            variant: 'negative',
        })
    }

    if (isDeletable && configHeaderTab === ConfigHeaderTabType.VALUES) {
        secondConfigSegment.push({
            text: `Delete${isProtected ? '...' : ''}`,
            onClick: handleDelete,
            dataTestId: 'delete-config-map-secret',
            disabled: isLoading,
            icon: <ICDeleteInteractive className="scr-5 dc__no-shrink icon-dim-16" />,
            variant: 'negative',
        })
    }

    return {
        ...(firstConfigSegment.length && { firstConfigSegment }),
        ...(secondConfigSegment.length && { secondConfigSegment }),
    }
}

export const getCompareViewHistoryDiffConfigProps = (
    showDisplayName: boolean,
    editorTemplate: Record<string | number, unknown>,
    editorConfig: CompareConfigViewEditorConfigType,
):
    | DeploymentTemplateHistoryType['baseTemplateConfiguration']
    | DeploymentTemplateHistoryType['currentConfiguration'] => ({
    codeEditorValue: {
        displayName: showDisplayName ? 'Data' : '',
        ...(editorTemplate && { value: JSON.stringify(editorTemplate) }),
    },
    values: editorConfig,
})
