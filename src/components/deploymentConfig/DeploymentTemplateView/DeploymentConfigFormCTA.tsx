import React, { useContext } from 'react'
import { CHECKBOX_VALUE, Checkbox, ConditionalWrap, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentConfigContextType, DeploymentConfigFormCTAProps } from '../types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { DOCUMENTATION } from '../../../config'
import Tippy from '@tippyjs/react'
import { ReactComponent as Next } from '../../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/ic-info-outline-grey.svg'
import { ReactComponent as HelpIcon } from '../../../assets/icons/ic-help-outline.svg'
import { importComponentFromFELibrary } from '../../common'
import { DeploymentConfigContext } from '../DeploymentConfig'

const ApproveRequestTippy = importComponentFromFELibrary('ApproveRequestTippy')

export default function DeploymentConfigFormCTA({
    loading,
    showAppMetricsToggle,
    isAppMetricsEnabled,
    isEnvOverride,
    isCiPipeline,
    disableCheckbox,
    disableButton,
    toggleAppMetrics,
    isDraftMode,
    reload,
}: DeploymentConfigFormCTAProps) {
    const { state } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const _selectedChart = !isEnvOverride && isDraftMode ? state.publishedState?.selectedChart : state.selectedChart
    const _disabled = disableButton || loading
    const compareTab = state.selectedTabIndex === 2 && !state.showReadme
    const isApprovalPending = compareTab && state.latestDraft?.draftState === 4
    const approveDisabled = isApprovalPending && state.latestDraft && !state.latestDraft.canApprove

    const renderWrappedChildren = (children) => {
        return (
            <Tippy
                className="default-tt w-200"
                arrow={false}
                placement="top-end"
                content={
                    approveDisabled
                        ? 'You have made changes to this file. Users who have edited cannot approve the changes.'
                        : DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText
                }
            >
                {children}
            </Tippy>
        )
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
                    type={_disabled || isApprovalPending ? 'button' : 'submit'}
                    data-testid={`${
                        !isEnvOverride && !isCiPipeline
                            ? 'base-deployment-template-save-and-next-button'
                            : 'base-deployment-template-save-changes-button'
                    }`}
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
                                'Save changes'
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
        } else if (isDraftMode || isApprovalPending) {
            return (
                <div className="form-app-metrics-cta flex left fs-13 fw-4 lh-20 cn-9">
                    <InfoIcon className="icon-dim-16 mr-8" />
                    Application metrics are
                    <span className="fw-6 ml-4">{isAppMetricsEnabled ? 'Enabled' : 'Not enabled'}</span>
                </div>
            )
        } else {
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
                                <div className="flex left fs-13 mb-4">
                                    <b className="fw-6 cn-9 mr-8">
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
                                                <HelpIcon className="icon-dime-16" />
                                            </span>
                                        </Tippy>
                                    ) : (
                                        <a
                                            data-testid="app-metrics-learnmore-link"
                                            href={DOCUMENTATION.APP_METRICS}
                                            target="_blank"
                                            className="fw-4 cb-5 dc__underline-onhover"
                                        >
                                            {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.learnMore}
                                        </a>
                                    )}
                                </div>
                                {!compareTab && !state.showReadme && (
                                    <div
                                        data-testid="app-metrics-info-text"
                                        className={`fs-13 fw-4 ${
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
    }

    const getHeightClass = () => {
        if (compareTab || state.showReadme) {
            return 'h-56'
        } else if (isDraftMode) {
            return 'h-44'
        } else {
            return 'h-76'
        }
    }

    return (
        _selectedChart && (
            <div
                className={`form-cta-section flex pr-20 pl-20 ${
                    showAppMetricsToggle ? 'dc__content-space' : 'right'
                } ${getHeightClass()}`}
            >
                {compareTab && !state.showReadme && <div className="w-50" />}
                {renderApplicationMetrics()}
                {!isDraftMode && (
                    <>
                        {isApprovalPending && state.latestDraft?.canApprove && ApproveRequestTippy ? (
                            <ApproveRequestTippy
                                draftId={state.latestDraft.draftId}
                                draftVersionId={state.latestDraft.draftVersionId}
                                resourceName="deployment template"
                                reload={reload}
                            >
                                {renderButton()}
                            </ApproveRequestTippy>
                        ) : (
                            renderButton()
                        )}
                    </>
                )}
            </div>
        )
    )
}
