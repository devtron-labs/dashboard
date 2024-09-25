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
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import { ReactComponent as ICViewVariableToggle } from '@Icons/ic-view-variable-toggle.svg'
import { ReactComponent as ICMore } from '@Icons/ic-more-option.svg'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { useParams } from 'react-router-dom'
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
 * 1. Values view:
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
4. OVERRIDE:
    1. In case of no override - nothing
    2. In case of edit draft
        - protected tabs
        - ToggleEditorView
        - ChartSelectors
        - Merge strategy
        - Approver tippy (RHS)
        - comments view
        - Readme
        - Scoped variables
        - Popup menu (Locked keys, Delete override, Discard draft - only in case of saved as draft)
    3. In compare:
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

    shouldDisableActions,
    configHeaderTab,
    isProtected = false,
    isApprovalPending,
    isDraftPresent,
    approvalUsers,
    isLoading,
}: ConfigToolbarProps) => {
    const { envId } = useParams<BaseURLParams>()

    // FIXME: 3 issues - 1. the divider needs to placed accordingly 2. Can make segments based configuration 3. No relation of override with protected tabs
    if (configHeaderTab === ConfigHeaderTabType.DRY_RUN) {
        return null
    }

    const isDisabled = isLoading || shouldDisableActions

    const isOverrideView = !!envId && configHeaderTab === ConfigHeaderTabType.VALUES
    const isInheritedView = configHeaderTab === ConfigHeaderTabType.INHERITED && isProtected
    const isEditDraftView =
        isOverrideView && isProtected && selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT
    const isEditView = isEditDraftView || configHeaderTab === ConfigHeaderTabType.VALUES

    const renderOverrideView = () => {
        if (!isOverrideView) {
            return null
        }

        const isCompareView = selectedProtectionViewTab === ProtectConfigTabsType.COMPARE

        return (
            <>
                {/* FIXME: No relation to override */}
                {ProtectionViewTabGroup && (
                    <>
                        <ProtectionViewTabGroup
                            selectedTab={selectedProtectionViewTab}
                            handleProtectionViewTabChange={handleProtectionViewTabChange}
                            isApprovalView={isApprovalPending}
                            isDisabled={isDisabled}
                        />

                        <div className="dc__border-right-n1 h-100" />
                    </>
                )}

                {isCompareView && MergePatchWithTemplateCheckbox && showMergePatchesButton && (
                    <MergePatchWithTemplateCheckbox
                        shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                        handleToggleShowTemplateMergedWithPatch={handleToggleShowTemplateMergedWithPatch}
                        isDisabled={isDisabled}
                    />
                )}
            </>
        )
    }

    const renderProtectedConfigActions = () => {
        const shouldRenderApproverInfoTippy =
            isDraftPresent && isApprovalPending && ConfigApproversInfoTippy && !isLoading
        const shouldRenderCommentsView = !!isDraftPresent && !isLoading
        const hasNothingToRender = !shouldRenderApproverInfoTippy && !shouldRenderCommentsView

        if (!isOverrideView || !isProtected || hasNothingToRender) {
            return null
        }

        return (
            <>
                <div className="flexbox dc__gap-4">
                    {shouldRenderApproverInfoTippy && <ConfigApproversInfoTippy approvalUsers={approvalUsers} />}
                    {shouldRenderCommentsView && (
                        <ProtectConfigShowCommentsButton
                            areCommentsPresent={areCommentsPresent}
                            handleToggleCommentsView={handleToggleCommentsView}
                        />
                    )}
                </div>

                <div className="dc__border-right-n1 h-100" />
            </>
        )
    }

    const renderReadmeAndScopedVariablesBlock = () => {
        const shouldRenderReadmeButton = !!handleEnableReadmeView
        const shouldRenderScopedVariables = window._env_.ENABLE_SCOPED_VARIABLES && !isLoading
        const hasNothingToRender = !shouldRenderReadmeButton && !shouldRenderScopedVariables

        if (hasNothingToRender) {
            return null
        }

        return (
            <>
                <div className="flexbox dc__gap-4">
                    {shouldRenderReadmeButton && (
                        <Button
                            onClick={handleEnableReadmeView}
                            disabled={isDisabled}
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
                                    disabled={isDisabled}
                                />
                            </div>
                        </Tooltip>
                    )}
                </div>
                <div className="dc__border-right-n1 h-100" />
            </>
        )
    }

    return (
        <div className="px-12 py-4 bcn-0 dc__border-bottom-n1 flexbox dc__align-items-center dc__content-space dc__gap-8">
            <div className="flexbox dc__content-space dc__align-items-center dc__gap-8">
                {renderOverrideView()}

                {/* Not adding divider since renderOverrideView can't be true with isInheritedView */}
                {isInheritedView && (
                    <>
                        <div className="flexbox dc__align-items-center dc__gap-6">
                            <ICInfoOutlineGrey className="p-2 icon-dim-16 dc__no-shrink" />
                            <span className="cn-9 fs-12 fw-4 lh-20">Inherited from</span>
                            <a
                                href={baseConfigurationURL}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="anchor dc__border-bottom--n"
                            >
                                Base Configurations
                            </a>
                        </div>

                        {(!!children || (isEditView && SelectMergeStrategy)) && (
                            <div className="dc__border-right-n1 h-100" />
                        )}
                    </>
                )}

                {children}

                {isEditView && SelectMergeStrategy && (
                    <SelectMergeStrategy
                        mergeStrategy={mergeStrategy}
                        handleMergeStrategyChange={handleMergeStrategyChange}
                        isDisabled={isDisabled}
                    />
                )}
            </div>

            <div className="flexbox dc__align-items-center dc__gap-8">
                {renderProtectedConfigActions()}

                {renderReadmeAndScopedVariablesBlock()}

                {popupMenuConfig.items.length > 0 && (
                    <PopupMenu autoClose>
                        <PopupMenu.Button rootClassName="flex dc__no-shrink" disabled={isDisabled} isKebab>
                            <ICMore className="icon-dim-16 fcn-6 dc__flip-90" data-testid="config-more-options-popup" />
                        </PopupMenu.Button>

                        <PopupMenu.Body
                            rootClassName={popupMenuNode ? '' : 'dc__border pt-4 pb-4 w-150 dc__gap-4 flexbox-col'}
                        >
                            {popupMenuNode ?? (
                                <>
                                    <div className="flexbox-col">
                                        {popupMenuConfig.items.map(
                                            ({ itemKey, text, onClick, dataTestId, disabled, icon }) => (
                                                <PopupMenuItem
                                                    key={itemKey}
                                                    text={text}
                                                    onClick={onClick}
                                                    dataTestId={dataTestId}
                                                    disabled={disabled}
                                                    icon={icon}
                                                />
                                            ),
                                        )}
                                    </div>

                                    <div className="dc__border-bottom-n1 w-100" />

                                    {popupMenuConfig.footerConfig && (
                                        <PopupMenuItem
                                            text={popupMenuConfig.footerConfig.text}
                                            onClick={popupMenuConfig.footerConfig.onClick}
                                            dataTestId={popupMenuConfig.footerConfig.dataTestId}
                                            disabled={popupMenuConfig.footerConfig.disabled}
                                            icon={popupMenuConfig.footerConfig.icon}
                                        />
                                    )}
                                </>
                            )}
                        </PopupMenu.Body>
                    </PopupMenu>
                )}
            </div>
        </div>
    )
}

export default ConfigToolbar
