import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ConfigHeaderTabType,
    ProtectConfigTabsType,
    PopupMenu,
    Toggle,
    Tooltip,
    BaseURLParams,
    InfoIconTippy,
    OverrideMergeStrategyType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICViewVariableToggle } from '@Icons/ic-view-variable-toggle.svg'
import { ReactComponent as ICMore } from '@Icons/ic-more-option.svg'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import { Fragment } from 'react'
import { ConfigToolbarProps } from './types'
import { PopupMenuItem } from './utils'

const ProtectionViewTabGroup = importComponentFromFELibrary('ProtectionViewTabGroup', null, 'function')
const MergePatchWithTemplateCheckbox = importComponentFromFELibrary('MergePatchWithTemplateCheckbox', null, 'function')
const SelectMergeStrategy = importComponentFromFELibrary('SelectMergeStrategy', null, 'function')
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

    handleEnableReadmeView,
    children,

    popupMenuConfig,
    popupMenuNode,

    handleToggleScopedVariablesView,
    resolveScopedVariables,

    configHeaderTab,
    isProtected = false,
    isApprovalPending,
    isDraftPresent,
    approvalUsers,
    isLoadingInitialData,
    // TODO: Will have to segregate cases where all actions are disabled
    disableAllActions = false,
    isPublishedConfigPresent = true,
}: ConfigToolbarProps) => {
    const { envId } = useParams<BaseURLParams>()

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

    const getLHSActionNodes = (): JSX.Element => {
        if (configHeaderTab === ConfigHeaderTabType.INHERITED) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-6">
                    <ICInfoOutlineGrey className="p-2 icon-dim-16 dc__no-shrink" />
                    <span className="cn-9 fs-12 fw-4 lh-20">Inherited from</span>
                    <a
                        href={baseConfigurationURL}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="anchor dc__border-bottom--n1"
                    >
                        Base Configurations
                    </a>
                </div>
            )
        }

        if (!isProtected || !isDraftPresent) {
            return null
        }

        return (
            <div className="flexbox dc__align-items-center dc__gap-12 dc__align-self-stretch">
                {/* Internally handles right border */}
                {ProtectionViewTabGroup && (
                    <>
                        <ProtectionViewTabGroup
                            selectedTab={selectedProtectionViewTab}
                            handleProtectionViewTabChange={handleProtectionViewTabChange}
                            isApprovalPending={isApprovalPending}
                            isDisabled={disableAllActions}
                        />

                        <div className="flexbox dc__border-right-n1 dc__align-self-stretch" />
                    </>
                )}

                {/* Data should always be valid in case we are in approval view */}
                {isCompareView && MergePatchWithTemplateCheckbox && showMergePatchesButton && (
                    <MergePatchWithTemplateCheckbox
                        shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                        handleToggleShowTemplateMergedWithPatch={handleToggleShowTemplateMergedWithPatch}
                        // Will remove this check if merging is happening on ui
                        isDisabled={disableAllActions}
                    />
                )}
            </div>
        )
    }

    const renderProtectedConfigActions = () => {
        const shouldRenderApproverInfoTippy =
            !!isDraftPresent && isApprovalPending && ConfigApproversInfoTippy && !isLoadingInitialData
        const shouldRenderCommentsView = !!isDraftPresent && !isLoadingInitialData
        const hasNothingToRender = !shouldRenderApproverInfoTippy && !shouldRenderCommentsView

        if (!isProtected || hasNothingToRender) {
            return null
        }

        return (
            <div className="flexbox dc__gap-4 dc__align-items-center">
                {shouldRenderApproverInfoTippy && <ConfigApproversInfoTippy approvalUsers={approvalUsers} />}
                {shouldRenderCommentsView && (
                    <ProtectConfigShowCommentsButton
                        areCommentsPresent={areCommentsPresent}
                        handleToggleCommentsView={handleToggleCommentsView}
                    />
                )}
            </div>
        )
    }

    const renderReadmeAndScopedVariablesBlock = () => {
        const shouldRenderReadmeButton = !!handleEnableReadmeView
        const shouldRenderScopedVariables = window._env_.ENABLE_SCOPED_VARIABLES && !isLoadingInitialData
        const hasNothingToRender = !shouldRenderReadmeButton && !shouldRenderScopedVariables

        if (hasNothingToRender) {
            return null
        }

        return (
            <div className="flexbox dc__gap-4 dc__align-items-center">
                {shouldRenderReadmeButton && (
                    <Button
                        onClick={handleEnableReadmeView}
                        disabled={disableAllActions}
                        dataTestId="config-readme-button"
                        ariaLabel="Show Readme view"
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        icon={<ICBookOpen className="p-4 icon-dim-16 dc__no-shrink" />}
                    />
                )}

                {shouldRenderScopedVariables && (
                    <Tooltip
                        alwaysShowTippyOnHover
                        content={resolveScopedVariables ? 'Hide variables value' : 'Show variables value'}
                    >
                        <div className="w-40 h-20">
                            <Toggle
                                selected={resolveScopedVariables}
                                color="var(--B500)"
                                onSelect={handleToggleScopedVariablesView}
                                Icon={ICViewVariableToggle}
                                disabled={disableAllActions}
                            />
                        </div>
                    </Tooltip>
                )}
            </div>
        )
    }

    const renderSelectMergeStrategy = () => {
        if (!envId || !isEditView) {
            return null
        }

        return (
            <>
                {!!children && <div className="dc__border-right-n1 h-16" />}

                {SelectMergeStrategy ? (
                    <SelectMergeStrategy
                        mergeStrategy={mergeStrategy}
                        handleMergeStrategyChange={handleMergeStrategyChange}
                        isDisabled={disableAllActions}
                    />
                ) : (
                    <div className="flexbox dc__gap-4">
                        <InfoIconTippy
                            heading="Merge strategy"
                            // TODO: Replace with actual content and docLink
                            additionalContent="Merge strategy determines how environment configurations are combined with inherited configurations configurations. Choose the strategy that best suits your needs:"
                        />

                        <span className="cn-7 fs-12 fw-4 lh-16">Merge strategy</span>
                        {/* TODO: can make a constant for label text from enum */}
                        <span className="cn-9 fs-12 fw-6 lh-20">{OverrideMergeStrategyType.REPLACE}</span>
                    </div>
                )}
            </>
        )
    }

    const popupConfigGroups = Object.keys(popupMenuConfig ?? {})

    return (
        <div className="px-12 bcn-0 dc__border-bottom-n1 flexbox dc__align-items-center dc__content-space dc__gap-8">
            <div className="flexbox dc__content-space dc__align-items-center dc__gap-8 dc__align-self-stretch">
                {getLHSActionNodes()}

                {children}

                {renderSelectMergeStrategy()}
            </div>

            {isPublishedValuesView && !isPublishedConfigPresent ? null : (
                <div className="flexbox dc__align-items-center dc__gap-8">
                    {renderProtectedConfigActions()}

                    {renderReadmeAndScopedVariablesBlock()}

                    {!!popupConfigGroups.length && (
                        <PopupMenu autoClose>
                            <PopupMenu.Button rootClassName="flex dc__no-shrink" disabled={disableAllActions} isKebab>
                                <ICMore
                                    className="icon-dim-16 fcn-6 dc__flip-90"
                                    data-testid="config-more-options-popup"
                                />
                            </PopupMenu.Button>

                            <PopupMenu.Body
                                rootClassName={popupMenuNode ? '' : 'dc__border pt-4 pb-4 w-150 dc__gap-4 flexbox-col'}
                            >
                                {popupMenuNode ?? (
                                    <div className="flexbox-col dc__gap-4">
                                        {popupConfigGroups.map((groupName, index) => {
                                            const groupItems = popupMenuConfig[groupName] ?? []

                                            return (
                                                <Fragment key={groupName}>
                                                    {index !== 0 && <div className="dc__border-bottom-n1 w-100" />}

                                                    {groupItems.map(({ text, onClick, dataTestId, disabled, icon }) => (
                                                        <PopupMenuItem
                                                            key={text}
                                                            text={text}
                                                            onClick={onClick}
                                                            dataTestId={dataTestId}
                                                            disabled={disabled}
                                                            icon={icon}
                                                        />
                                                    ))}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                )}
                            </PopupMenu.Body>
                        </PopupMenu>
                    )}
                </div>
            )}
        </div>
    )
}

export default ConfigToolbar
