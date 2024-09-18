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

import { useState } from 'react'
import {
    CHECKBOX_VALUE,
    Checkbox,
    ConditionalWrap,
    Progressing,
    showError,
    useDeploymentTemplateContext,
    useMainContext,
    useUserEmail,
    DeploymentConfigStateActionTypes,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { DeploymentConfigFormCTAProps } from '../types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { ReactComponent as Next } from '../../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/ic-info-outline-grey.svg'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { hasApproverAccess, importComponentFromFELibrary } from '../../common'

const ApproveRequestTippy = importComponentFromFELibrary('ApproveRequestTippy')

/**
 * @deprecated
 */
export default function DeploymentConfigFormCTA({
    loading,
    showAppMetricsToggle,
    isAppMetricsEnabled,
    isEnvOverride,
    isCiPipeline,
    disableCheckbox,
    disableButton,
    toggleAppMetrics,
    isPublishedMode,
    reload,
    isValues,
    convertVariables,
    handleLockedDiffDrawer,
    setShowLockedDiffForApproval,
    showLockedDiffForApproval,
    checkForProtectedLockedChanges,
    handleSaveChanges,
}: DeploymentConfigFormCTAProps) {
    const { state, isConfigProtectionEnabled, dispatch } = useDeploymentTemplateContext()
    const [approveChangesClicked, setApproveChangesClicked] = useState<boolean>(false)
    const { isSuperAdmin } = useMainContext()
    const _selectedChart = isPublishedMode ? state.publishedState?.selectedChart : state.selectedChart
    const _disabled = disableButton || loading || convertVariables
    const compareTab = state.selectedTabIndex === 2 && !state.showReadme
    const isApprovalPending = compareTab && state.latestDraft?.draftState === 4
    const { email } = useUserEmail()
    const hasAccess = hasApproverAccess(email, state.latestDraft?.approvers ?? [])
    const approveDisabled = isApprovalPending && state.latestDraft && (!state.latestDraft.canApprove || !hasAccess)
    const getCTATippyContent = () => {
        if (isApprovalPending) {
            if (!hasAccess) {
                return 'You do not have permission to approve configuration changes for this application - environment combination.'
            }
            if (approveDisabled) {
                return 'You have made changes to this file. Users who have edited cannot approve the changes.'
            }
        }

        return DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText
    }

    const renderWrappedChildren = (children) => {
        return (
            <Tippy className="default-tt w-200" arrow={false} placement="top-end" content={getCTATippyContent()}>
                <div>{children}</div>
            </Tippy>
        )
    }

    const checkForLockedChangesForApproval = async () => {
        // TODO: Ask product why we are showing another overlay for approve changes
        // setting approveChangesClicked to true only is approve changes button
        if (isApprovalPending && !approveDisabled && !isSuperAdmin) {
            setApproveChangesClicked(true)
            try {
                dispatch({
                    type: DeploymentConfigStateActionTypes.lockChangesLoading,
                    payload: true,
                })
                const deploymentTemplateResp = await checkForProtectedLockedChanges()
                if (deploymentTemplateResp.result.isLockConfigError) {
                    setShowLockedDiffForApproval(true)
                    handleLockedDiffDrawer(true)
                } else {
                    setShowLockedDiffForApproval(false)
                }
            } catch (err) {
                showError(err)
            } finally {
                dispatch({
                    type: DeploymentConfigStateActionTypes.lockChangesLoading,
                    payload: false,
                })
            }
        } else if (isApprovalPending) {
            setApproveChangesClicked(true)
        }
    }

    const renderButton = () => {
        return (
            <ConditionalWrap
                condition={(isEnvOverride && disableButton) || approveDisabled}
                wrap={renderWrappedChildren}
            >
                <button
                    className={`form-submit-cta cta flex h-32 ${isApprovalPending ? 'dc__bg-g5' : ''} ${
                        _disabled || approveDisabled ? 'disabled' : ''
                    }`}
                    type="button"
                    onClick={_disabled || isApprovalPending ? checkForLockedChangesForApproval : handleSaveChanges}
                    data-testid={`${
                        !isEnvOverride && !isCiPipeline
                            ? 'base-deployment-template-save-and-next-button'
                            : 'base-deployment-template-save-changes-button'
                    }`}
                    disabled={
                        loading || state.unableToParseYaml || (!isValues && !isApprovalPending) || convertVariables
                    }
                >
                    {loading ? (
                        <Progressing />
                    ) : isApprovalPending ? (
                        'Approve changes'
                    ) : (
                        <>
                            {!isEnvOverride && !isCiPipeline ? (
                                <>
                                    Save & Next
                                    <Next className={`icon-dim-16 ml-5 ${_disabled ? 'scn-4' : 'scn-0'}`} />
                                </>
                            ) : (
                                `Save changes${isConfigProtectionEnabled ? '...' : ''}`
                            )}
                        </>
                    )}
                </button>
            </ConditionalWrap>
        )
    }

    const getInfoText = () => {
        if (!_selectedChart.isAppMetricsSupported) {
            return DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.notSupported(_selectedChart.name)
        }
        return DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.supported
    }

    const renderApplicationMetrics = () => {
        if (!showAppMetricsToggle) {
            return null
        }
        if (isPublishedMode || isApprovalPending) {
            return (
                <div className="form-app-metrics-cta flex left fs-13 fw-4 lh-20 cn-9">
                    <InfoIcon className="icon-dim-16 mr-8" />
                    Application metrics are
                    <span className="fw-6 ml-4">{isAppMetricsEnabled ? 'Enabled' : 'Not enabled'}</span>
                </div>
            )
        }
        return (
            <div className="form-app-metrics-cta flex top left">
                {loading ? (
                    <>
                        <Progressing
                            data-testid="app-metrics-checkbox-loading"
                            styles={{
                                width: 'auto',
                                marginRight: '16px',
                            }}
                        />
                        <span className="fs-13 fw-4 lh-20">Application metrics</span>
                    </>
                ) : (
                    <>
                        <Checkbox
                            rootClassName={`mt-2 mr-8 ${
                                !_selectedChart.isAppMetricsSupported ? 'dc__opacity-0_5' : ''
                            }`}
                            isChecked={isAppMetricsEnabled}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={toggleAppMetrics}
                            dataTestId="app-metrics-checkbox"
                            disabled={disableCheckbox || !_selectedChart.isAppMetricsSupported}
                        />
                        <div className="flex column left">
                            <div className="flex left fs-13">
                                <b className="fw-6 lh-18 cn-9 mr-8">
                                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.label}
                                </b>
                                {compareTab || state.showReadme ? (
                                    <Tippy
                                        className="default-tt w-300"
                                        arrow={false}
                                        placement="top"
                                        content={getInfoText()}
                                    >
                                        <span className="icon-dime-16">
                                            <ICHelpOutline className="icon-dime-16" />
                                        </span>
                                    </Tippy>
                                ) : (
                                    'Learn more'
                                )}
                            </div>
                            {!compareTab && !state.showReadme && (
                                <div
                                    data-testid="app-metrics-info-text"
                                    className={`fs-13 fw-4 lh-18 ${
                                        !_selectedChart.isAppMetricsSupported ? 'cr-5' : 'cn-7'
                                    }`}
                                >
                                    {getInfoText()}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        )
    }

    const getHeightClass = () => {
        if (compareTab || state.showReadme) {
            return 'h-56'
        }
        if (isPublishedMode) {
            return 'h-44'
        }
        return 'h-64'
    }

    function approveRequestTippy(children) {
        return (
            <ApproveRequestTippy
                draftId={state.latestDraft.draftId}
                draftVersionId={state.latestDraft.draftVersionId}
                resourceName="deployment template"
                reload={reload}
                onClose={() => setApproveChangesClicked(false)}
            >
                <span>{children}</span>
            </ApproveRequestTippy>
        )
    }

    return _selectedChart ? (
        <div
            className={`form-cta-section flex pt-16 pb-16 pr-20 pl-20 ${
                showAppMetricsToggle ? 'dc__content-space' : 'right'
            } ${getHeightClass()} ${state.latestDraft?.canApprove ? 'tippy-over ' : ''}`}
        >
            {compareTab && !state.showReadme && <div className="w-50" />}
            {renderApplicationMetrics()}
            {!isPublishedMode && (
                <ConditionalWrap
                    condition={
                        !showLockedDiffForApproval &&
                        !state.lockChangesLoading &&
                        isApprovalPending &&
                        state.latestDraft?.canApprove &&
                        !approveDisabled &&
                        ApproveRequestTippy &&
                        approveChangesClicked
                    }
                    wrap={approveRequestTippy}
                >
                    {renderButton()}
                </ConditionalWrap>
            )}
        </div>
    ) : null
}
