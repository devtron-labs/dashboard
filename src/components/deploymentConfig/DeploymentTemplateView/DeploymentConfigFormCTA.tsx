import React from 'react'
import { CHECKBOX_VALUE, Checkbox, ConditionalWrap, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentConfigFormCTAProps } from '../types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { DOCUMENTATION } from '../../../config'
import Tippy from '@tippyjs/react'
import { ReactComponent as Next } from '../../../assets/icons/ic-arrow-right.svg'

export default function DeploymentConfigFormCTA({
    loading,
    showAppMetricsToggle,
    isAppMetricsEnabled,
    isEnvOverride,
    isCiPipeline,
    disableCheckbox,
    disableButton,
    toggleAppMetrics,
    selectedChart,
}: DeploymentConfigFormCTAProps) {
    const _disabled = disableButton || loading

    const renderWrappedChildren = (children) => {
        return <Tippy
            className="default-tt w-200"
            arrow={false}
            placement="top"
            content={DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText}
        >
            {children}
        </Tippy>
    }

    return (
        selectedChart && (
            <div
                className={`form-cta-section flex pt-16 pb-16 pr-20 pl-20 ${
                    showAppMetricsToggle ? 'dc__content-space' : 'right'
                }`}
            >
                {showAppMetricsToggle && (
                    <div className="form-app-metrics-cta flex top left">
                        {loading ? (
                            <Progressing
                                data-testid="app-metrics-checkbox-loading"
                                styles={{
                                    width: 'auto',
                                    marginRight: '16px',
                                }}
                            />
                        ) : (
                            <Checkbox
                                rootClassName={`mt-2 mr-8 ${
                                    !selectedChart.isAppMetricsSupported ? 'dc__opacity-0_5' : ''
                                }`}
                                isChecked={isAppMetricsEnabled}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={toggleAppMetrics}
                                dataTestId="app-metrics-checkbox"
                                disabled={disableCheckbox || !selectedChart.isAppMetricsSupported}
                            />
                        )}
                        <div className="flex column left">
                            <div className="fs-13 mb-4">
                                <b className="fw-6 cn-9 mr-8">
                                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.label}
                                </b>
                                <a
                                    data-testid="app-metrics-learnmore-link"
                                    href={DOCUMENTATION.APP_METRICS}
                                    target="_blank"
                                    className="fw-4 cb-5 dc__underline-onhover"
                                >
                                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.learnMore}
                                </a>
                            </div>
                            <div
                                data-testid="app-metrics-info-text"
                                className={`fs-13 fw-4 ${!selectedChart.isAppMetricsSupported ? 'cr-5' : 'cn-7'}`}
                            >
                                {!selectedChart.isAppMetricsSupported
                                    ? DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.notSupported(
                                          selectedChart.name,
                                      )
                                    : DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.supported}
                            </div>
                        </div>
                    </div>
                )}
                <ConditionalWrap
                    condition={isEnvOverride && disableButton}
                    wrap={renderWrappedChildren}
                >
                    <button
                        className={`form-submit-cta cta flex h-36 ${_disabled ? 'disabled' : ''}`}
                        type={_disabled ? 'button' : 'submit'}
                        data-testid={`${
                            !isEnvOverride && !isCiPipeline
                                ? 'base-deployment-template-save-and-next-button'
                                : 'base-deployment-template-save-changes-button'
                        }`}
                    >
                        {loading ? (
                            <Progressing />
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
            </div>
        )
    )
}
