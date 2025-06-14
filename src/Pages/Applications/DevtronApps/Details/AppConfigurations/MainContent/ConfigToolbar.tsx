/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Fragment } from 'react'
import ReactGA from 'react-ga4'
import { useParams } from 'react-router-dom'

import {
    BaseURLParams,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    ConfigHeaderTabType,
    Icon,
    InvalidYAMLTippyWrapper,
    PopupMenu,
    ProtectConfigTabsType,
    ToggleResolveScopedVariables,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import { ReactComponent as ICMore } from '@Icons/ic-more-option.svg'
import { importComponentFromFELibrary } from '@Components/common'

import BaseConfigurationNavigation from './BaseConfigurationNavigation'
import SelectMergeStrategy from './SelectMergeStrategy'
import { ConfigToolbarProps } from './types'
import { PopupMenuItem } from './utils'

const ProtectionViewTabGroup = importComponentFromFELibrary('ProtectionViewTabGroup', null, 'function')
const MergePatchWithTemplateCheckbox = importComponentFromFELibrary('MergePatchWithTemplateCheckbox', null, 'function')
const ConfigApproversInfoTippy = importComponentFromFELibrary('ConfigApproversInfoTippy', null, 'function')
const ExpressEditButton = importComponentFromFELibrary('ExpressEditButton', null, 'function')
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
    hidePatchOption,
    isMergeStrategySelectorDisabled,

    showEnableReadMeButton,
    handleEnableReadmeView,

    children,

    popupConfig,

    handleToggleScopedVariablesView,
    resolveScopedVariables,

    configHeaderTab,
    isApprovalPolicyConfigured = false,
    isApprovalPending,
    isDraftPresent,
    isUnpublished = false,
    draftId,
    draftVersionId,
    requestedUserId,
    handleReload,
    userApprovalMetadata,
    disableAllActions = false,
    parsingError = '',
    restoreLastSavedYAML,
    isPublishedConfigPresent = true,
    headerMessage,
    showDeleteOverrideDraftEmptyState,

    isExceptionUser,
    isExpressEditView,
    expressEditButtonConfig,
}: ConfigToolbarProps) => {
    const { envId } = useParams<BaseURLParams>()
    const isDisabled = disableAllActions || !!parsingError

    if (configHeaderTab === ConfigHeaderTabType.DRY_RUN) {
        return null
    }

    const isCompareView = !!(
        isApprovalPolicyConfigured &&
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.COMPARE
    )

    const isPublishedValuesView = !!(
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED &&
        isApprovalPolicyConfigured &&
        isDraftPresent
    )

    const isEditView = !!(
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        (!isApprovalPolicyConfigured ||
            !isDraftPresent ||
            selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT)
    )

    const showProtectedTabs =
        isApprovalPolicyConfigured &&
        isDraftPresent &&
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        !!ProtectionViewTabGroup

    const hideMergeStrategy =
        !mergeStrategy ||
        !envId ||
        showDeleteOverrideDraftEmptyState ||
        (!isEditView && !(isPublishedValuesView && !!isPublishedConfigPresent))

    const showExpressEditButton =
        !!ExpressEditButton && isExceptionUser && !isExpressEditView && isEditView && !showDeleteOverrideDraftEmptyState

    const getLHSActionNodes = (): JSX.Element => {
        if (isExpressEditView) {
            return (
                <>
                    <div className="flex dc__gap-6">
                        <Icon name="ic-pencil" color="N700" />
                        <p className="m-0 fs-12 lh-18 cn-9">Editing Published</p>
                    </div>
                    {(children || !hideMergeStrategy) && <div className="divider__secondary" />}
                </>
            )
        }

        if (configHeaderTab === ConfigHeaderTabType.INHERITED) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-6">
                    <ICInfoOutlineGrey className="p-2 icon-dim-20 dc__no-shrink scn-6" />
                    <span className="cn-9 fs-12 fw-4 lh-20">Inherited from</span>
                    <BaseConfigurationNavigation baseConfigurationURL={baseConfigurationURL} />
                </div>
            )
        }

        return (
            <>
                {headerMessage && configHeaderTab === ConfigHeaderTabType.VALUES && !showProtectedTabs && (
                    <div className="flexbox dc__align-items-center dc__gap-6">
                        <ICInfoOutlineGrey className="p-2 icon-dim-20 dc__no-shrink scn-6" />
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
                                    hasPublishedConfig={isPublishedConfigPresent}
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

        if (!isApprovalPolicyConfigured || hasNothingToRender || isExpressEditView) {
            return null
        }

        return (
            <>
                {shouldRenderApproverInfoTippy && (
                    <ConfigApproversInfoTippy
                        requestedUserId={requestedUserId}
                        userApprovalMetadata={userApprovalMetadata}
                        draftId={draftId}
                        draftVersionId={draftVersionId}
                        handleReload={handleReload}
                    />
                )}
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
                                name="resolve-scoped-variables"
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
        if (hideMergeStrategy) {
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
                            isDisabled={isDisabled || isMergeStrategySelectorDisabled}
                            variant={isEditView ? 'dropdown' : 'text'}
                            hidePatchOption={hidePatchOption}
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
                                        {groupItems.map(
                                            ({ text, onClick, dataTestId, disabled, icon, variant, tooltipText }) => (
                                                <PopupMenuItem
                                                    key={text}
                                                    text={text}
                                                    onClick={onClick}
                                                    dataTestId={dataTestId}
                                                    disabled={disabled}
                                                    icon={icon}
                                                    variant={variant}
                                                    tooltipText={tooltipText}
                                                />
                                            ),
                                        )}
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
            className={`px-12 bg__primary dc__border-bottom-n1 flexbox dc__align-items-center dc__content-space dc__gap-8 dc__no-shrink h-32 ${!showProtectedTabs ? 'py-4' : ''}`}
        >
            <div className="flexbox dc__content-space dc__align-items-center dc__gap-8 dc__align-self-stretch">
                {getLHSActionNodes()}
                {children}
                {renderSelectMergeStrategy()}
            </div>

            {(showExpressEditButton || !isPublishedValuesView || isPublishedConfigPresent) && (
                <div className="flexbox dc__align-items-center dc__gap-8">
                    {showExpressEditButton && (
                        <ExpressEditButton
                            disabled={isUnpublished}
                            {...(expressEditButtonConfig ?? {})}
                            onClick={() => {
                                ReactGA.event({
                                    category: 'APP_EXPRESS_EDIT_ACCESSED',
                                    action: 'APP_EXPRESS_EDIT_ACCESSED',
                                })
                                expressEditButtonConfig?.onClick?.()
                            }}
                        />
                    )}
                    {isPublishedValuesView && !isPublishedConfigPresent ? null : (
                        <>
                            {renderProtectedConfigActions()}
                            {renderReadmeAndScopedVariablesBlock()}
                            {renderPopupMenu()}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default ConfigToolbar
