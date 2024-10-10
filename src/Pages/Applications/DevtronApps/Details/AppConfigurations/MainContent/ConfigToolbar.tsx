import { Fragment } from 'react'
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ConfigHeaderTabType,
    ProtectConfigTabsType,
    PopupMenu,
    BaseURLParams,
    InfoIconTippy,
    OverrideMergeStrategyType,
    ComponentSizeType,
    InvalidYAMLTippyWrapper,
    OverrideStrategyTippyContent,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICMore } from '@Icons/ic-more-option.svg'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import { DOCUMENTATION } from '@Config/constants'
import ToggleResolveScopedVariables from './ToggleResolveScopedVariables'
import { ConfigToolbarProps } from './types'
import { PopupMenuItem } from './utils'
import BaseConfigurationNavigation from './BaseConfigurationNavigation'

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
        isProtected && isDraftPresent && configHeaderTab === ConfigHeaderTabType.VALUES && ProtectionViewTabGroup

    const getLHSActionNodes = (): JSX.Element => {
        if (configHeaderTab === ConfigHeaderTabType.INHERITED) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-6">
                    <ICInfoOutlineGrey className="p-2 icon-dim-16 dc__no-shrink" />
                    <span className="cn-9 fs-12 fw-4 lh-20">Inherited from</span>
                    <BaseConfigurationNavigation baseConfigurationURL={baseConfigurationURL} />
                </div>
            )
        }

        if (!isProtected || !isDraftPresent) {
            return null
        }

        return (
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
                    <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                        <div>
                            <MergePatchWithTemplateCheckbox
                                shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                                handleToggleShowTemplateMergedWithPatch={handleToggleShowTemplateMergedWithPatch}
                                // Will remove this check if merging is happening on ui
                                isDisabled={isDisabled}
                            />
                        </div>
                    </InvalidYAMLTippyWrapper>
                )}
            </div>
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
                                ariaLabel="Show Readme view"
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.neutral}
                                icon={<ICBookOpen className="scn-7" />}
                                size={ComponentSizeType.xs}
                                showAriaLabelInTippy={false}
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
        if (!envId || !isEditView || showDeleteOverrideDraftEmptyState) {
            return null
        }

        return (
            <>
                {!!children && <div className="dc__border-right-n1 h-16" />}

                {SelectMergeStrategy ? (
                    <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                        <div>
                            <SelectMergeStrategy
                                mergeStrategy={mergeStrategy}
                                handleMergeStrategyChange={handleMergeStrategyChange}
                                isDisabled={isDisabled}
                            />
                        </div>
                    </InvalidYAMLTippyWrapper>
                ) : (
                    <div className="flexbox dc__gap-4">
                        <InfoIconTippy
                            heading="Merge strategy"
                            additionalContent={<OverrideStrategyTippyContent />}
                            documentationLink={DOCUMENTATION.HOME_PAGE}
                        />

                        <span className="cn-7 fs-12 fw-4 lh-16">Merge strategy</span>
                        {/* TODO: can make a constant for label text from enum */}
                        <span className="cn-9 fs-12 fw-6 lh-20">{OverrideMergeStrategyType.REPLACE}</span>
                    </div>
                )}
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
                <PopupMenu.Button rootClassName="flex dc__no-shrink" isKebab>
                    <ICMore className="icon-dim-16 fcn-6 dc__flip-90" data-testid="config-more-options-popup" />
                </PopupMenu.Button>

                <PopupMenu.Body
                    rootClassName={
                        popupConfig.popupNodeType ? '' : 'dc__border pt-4 pb-4 dc__mxw-200 dc__gap-4 flexbox-col'
                    }
                >
                    <div className="flexbox-col dc__gap-4">
                        {popupConfigGroups.map((groupName, index) => {
                            const groupItems = popupConfig.menuConfig[groupName] ?? []

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
                </PopupMenu.Body>
            </PopupMenu>
        )
    }

    return (
        <div
            className={`px-12 bcn-0 dc__border-bottom-n1 flexbox dc__align-items-center dc__content-space dc__gap-8 ${!showProtectedTabs ? 'py-6' : ''}`}
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
