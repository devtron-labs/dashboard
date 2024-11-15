import { Fragment } from 'react'
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ConfigHeaderTabType,
    ProtectConfigTabsType,
    PopupMenu,
    BaseURLParams,
    ComponentSizeType,
    InvalidYAMLTippyWrapper,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICMore } from '@Icons/ic-more-option.svg'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import BaseConfigurationNavigation from './BaseConfigurationNavigation'
import ToggleResolveScopedVariables from './ToggleResolveScopedVariables'
import { PopupMenuItem } from './utils'
import { ConfigToolbarProps } from './types'
import SelectMergeStrategy from './SelectMergeStrategy'

const ProtectionViewTabGroup = importComponentFromFELibrary('ProtectionViewTabGroup', null, 'function')
const MergePatchWithTemplateCheckbox = importComponentFromFELibrary('MergePatchWithTemplateCheckbox', null, 'function')
const ConfigApproversInfoTippy = importComponentFromFELibrary('ConfigApproversInfoTippy', null, 'function')
const ProtectConfigShowCommentsButton = importComponentFromFELibrary(
    'ProtectConfigShowCommentsButton',
    null,
    'function',
)

/**
 * 1. Base template view (without protect config):
    - ToggleEditorView (LHS)
    - Chart selectors
    - Readme(RHS)
    - Scoped variables
    - Popup menu (Locked keys (in case of OSS no popup))
2. DRY RUN: No toolbar
3. INHERITED:
    - Inherited from base config info tile
    - Chart selectors (disabled)
    - Readme
    - Scoped variables
    - Popup menu (Locked keys (in case of OSS no popup))
4. In case of override:
    1. In case of no override - nothing
5. In case of protect config
    1. In case of edit draft
        - protected tabs
        - ToggleEditorView
        - ChartSelectors
        - Merge strategy
        - Approver tippy (RHS)
        - comments view
        - Readme
        - Scoped variables
        - Popup menu (Locked keys, Delete override, Discard draft - only in case of saved as draft)
    2. In compare:
        - protected tabs (NOTE: in case of approve tab name is Compare & Approve)
        - show merged template button (in case at least on strategy is patch)
        - Approver tippy (RHS)
        - comments view
        - Readme
        - Scoped variables
        - In popup (Locked keys, Delete override, discard draft)
 */
const ConfigToolbar = ({
    baseConfigurationURL,

    selectedProtectionViewTab,
    handleProtectionViewTabChange,

    handleToggleCommentsView,
    areCommentsPresent,

    showMergePatchesButton,
    shouldMergeTemplateWithPatches,
    handleToggleShowTemplateMergedWithPatch,

    mergeStrategy,
    handleMergeStrategyChange,

    showEnableReadMeButton,
    handleEnableReadmeView,

    children,

    popupConfig,

    handleToggleScopedVariablesView,
    resolveScopedVariables,

    configHeaderTab,
    isProtected = false,
    isApprovalPending,
    isDraftPresent,
    approvalUsers,
    disableAllActions = false,
    parsingError = '',
    restoreLastSavedYAML,
    isPublishedConfigPresent = true,
    headerMessage,
    showDeleteOverrideDraftEmptyState,
}: ConfigToolbarProps) => {
    const { envId } = useParams<BaseURLParams>()
    const isDisabled = disableAllActions || !!parsingError

    if (configHeaderTab === ConfigHeaderTabType.DRY_RUN) {
        return null
    }

    const isCompareView = !!(
        isProtected &&
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.COMPARE
    )

    const isPublishedValuesView = !!(
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED &&
        isProtected &&
        isDraftPresent
    )

    const isEditView = !!(
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        (isProtected && isDraftPresent ? selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT : true)
    )

    const showProtectedTabs =
        isProtected && isDraftPresent && configHeaderTab === ConfigHeaderTabType.VALUES && !!ProtectionViewTabGroup

    const getLHSActionNodes = (): JSX.Element => {
        if (configHeaderTab === ConfigHeaderTabType.INHERITED) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-6">
                    <ICInfoOutlineGrey className="p-2 icon-dim-20 dc__no-shrink" />
                    <span className="cn-9 fs-12 fw-4 lh-20">Inherited from</span>
                    <BaseConfigurationNavigation baseConfigurationURL={baseConfigurationURL} />
                </div>
            )
        }

        return (
            <>
                {headerMessage && configHeaderTab === ConfigHeaderTabType.VALUES && !showProtectedTabs && (
                    <div className="flexbox dc__align-items-center dc__gap-6">
                        <ICInfoOutlineGrey className="p-2 icon-dim-20 dc__no-shrink" />
                        <span className="cn-9 fs-12 fw-4 lh-20">{headerMessage}</span>
                    </div>
                )}
                {showProtectedTabs && (
                    <div className="flexbox dc__align-items-center dc__gap-12 dc__align-self-stretch">
                        {ProtectionViewTabGroup && (
                            <>
                                <ProtectionViewTabGroup
                                    selectedTab={selectedProtectionViewTab}
                                    handleProtectionViewTabChange={handleProtectionViewTabChange}
                                    isApprovalPending={isApprovalPending}
                                    isDisabled={isDisabled}
                                    parsingError={parsingError}
                                    restoreLastSavedYAML={restoreLastSavedYAML}
                                />

                                <div className="flexbox dc__border-right-n1 dc__align-self-stretch" />
                            </>
                        )}

                        {/* Data should always be valid in case we are in approval view */}
                        {isCompareView && MergePatchWithTemplateCheckbox && showMergePatchesButton && (
                            <InvalidYAMLTippyWrapper
                                parsingError={parsingError}
                                restoreLastSavedYAML={restoreLastSavedYAML}
                            >
                                <div>
                                    <MergePatchWithTemplateCheckbox
                                        shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                                        handleToggleShowTemplateMergedWithPatch={
                                            handleToggleShowTemplateMergedWithPatch
                                        }
                                        // Will remove this check if merging is happening on ui
                                        isDisabled={isDisabled}
                                    />
                                </div>
                            </InvalidYAMLTippyWrapper>
                        )}
                    </div>
                )}
            </>
        )
    }

    const renderProtectedConfigActions = () => {
        const shouldRenderApproverInfoTippy = !!isDraftPresent && isApprovalPending && ConfigApproversInfoTippy
        const shouldRenderCommentsView = !!isDraftPresent
        const hasNothingToRender = !shouldRenderApproverInfoTippy && !shouldRenderCommentsView

        if (!isProtected || hasNothingToRender) {
            return null
        }

        return (
            <>
                {shouldRenderApproverInfoTippy && <ConfigApproversInfoTippy approvalUsers={approvalUsers} />}
                {shouldRenderCommentsView && (
                    <ProtectConfigShowCommentsButton
                        areCommentsPresent={areCommentsPresent}
                        handleToggleCommentsView={handleToggleCommentsView}
                    />
                )}
            </>
        )
    }

    const renderReadmeAndScopedVariablesBlock = () => {
        const shouldRenderScopedVariables = window._env_.ENABLE_SCOPED_VARIABLES
        const hasNothingToRender = !showEnableReadMeButton && !shouldRenderScopedVariables

        if (hasNothingToRender) {
            return null
        }

        return (
            <>
                {showEnableReadMeButton && (
                    <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                        <div>
                            <Button
                                onClick={handleEnableReadmeView}
                                disabled={isDisabled}
                                dataTestId="config-readme-button"
                                ariaLabel="View Readme"
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.neutral}
                                icon={<ICBookOpen className="scn-7" />}
                                size={ComponentSizeType.xs}
                            />
                        </div>
                    </InvalidYAMLTippyWrapper>
                )}

                {shouldRenderScopedVariables && (
                    <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                        <div>
                            <ToggleResolveScopedVariables
                                resolveScopedVariables={resolveScopedVariables}
                                handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                                isDisabled={isDisabled}
                                showTooltip={!parsingError}
                            />
                        </div>
                    </InvalidYAMLTippyWrapper>
                )}
            </>
        )
    }

    const renderSelectMergeStrategy = () => {
        if (
            !mergeStrategy ||
            !envId ||
            showDeleteOverrideDraftEmptyState ||
            (!isEditView && !(isPublishedValuesView && !!isPublishedConfigPresent))
        ) {
            return null
        }

        return (
            <>
                {!!children && <div className="dc__border-right-n1 h-16" />}
                <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                    <div>
                        <SelectMergeStrategy
                            mergeStrategy={mergeStrategy}
                            handleMergeStrategyChange={handleMergeStrategyChange}
                            isDisabled={isDisabled}
                            variant={isEditView ? 'dropdown' : 'text'}
                        />
                    </div>
                </InvalidYAMLTippyWrapper>
            </>
        )
    }

    const popupConfigGroups = Object.keys(popupConfig?.menuConfig ?? {})

    const renderPopupMenu = () => {
        if (!popupConfigGroups.length) {
            return null
        }

        if (popupConfig.popupNodeType) {
            return popupConfig.popupMenuNode
        }

        return (
            <PopupMenu autoClose>
                <PopupMenu.Button
                    rootClassName="flex dc__no-shrink icon-dim-20 p-0 dc__no-background dc__no-border dc__outline-none-imp dc__tab-focus dc__hover-n50"
                    isKebab
                    dataTestId="config-more-options-popup"
                >
                    <ICMore className="icon-dim-16 fcn-6 dc__flip-90" data-testid="config-more-options-popup" />
                </PopupMenu.Button>

                <PopupMenu.Body
                    rootClassName={
                        popupConfig.popupNodeType
                            ? ''
                            : 'br-4 py-4 dc__overflow-hidden dc__border dc__box-shadow--menu mt-8 mw-120'
                    }
                >
                    <div className="flexbox-col dc__gap-4">
                        {popupConfigGroups.map((groupName, index) => {
                            const groupItems = popupConfig.menuConfig[groupName] ?? []

                            return (
                                <Fragment key={groupName}>
                                    {index !== 0 && <div className="dc__border-bottom-n1 w-100" />}

                                    <div className="flexbox-col">
                                        {groupItems.map(({ text, onClick, dataTestId, disabled, icon, variant }) => (
                                            <PopupMenuItem
                                                key={text}
                                                text={text}
                                                onClick={onClick}
                                                dataTestId={dataTestId}
                                                disabled={disabled}
                                                icon={icon}
                                                variant={variant}
                                            />
                                        ))}
                                    </div>
                                </Fragment>
                            )
                        })}
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
        )
    }

    return (
        <div
            className={`px-12 bcn-0 dc__border-bottom-n1 flexbox dc__align-items-center dc__content-space dc__gap-8 dc__no-shrink h-32 ${!showProtectedTabs ? 'py-4' : ''}`}
        >
            <div className="flexbox dc__content-space dc__align-items-center dc__gap-8 dc__align-self-stretch">
                {getLHSActionNodes()}

                {children}

                {renderSelectMergeStrategy()}
            </div>

            {isPublishedValuesView && !isPublishedConfigPresent ? null : (
                <div className="flexbox dc__align-items-center dc__gap-8">
                    {renderProtectedConfigActions()}

                    {renderReadmeAndScopedVariablesBlock()}

                    {renderPopupMenu()}
                </div>
            )}
        </div>
    )
}

export default ConfigToolbar
