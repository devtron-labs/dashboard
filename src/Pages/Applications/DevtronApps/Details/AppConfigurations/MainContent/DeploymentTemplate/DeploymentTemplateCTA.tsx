import {
    BaseURLParams,
    Checkbox,
    CHECKBOX_VALUE,
    DeploymentTemplateTabsType,
    Progressing,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { DOCUMENTATION } from '@Config/constants'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '@Components/deploymentConfig/constants'
import { ReactComponent as ICHelpOutline } from '@Icons/ic-help-outline.svg'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { DeploymentTemplateCTAProps } from './types'

// For protect we will have a separate component
const DeploymentTemplateCTA = ({
    isLoading,
    isDisabled,
    isAppMetricsEnabled,
    isAppMetricsConfigured,
    showReadMe,
    selectedChart,
    selectedTab,
    isInheriting,
    isCiPipeline,
    handleSave,
    toggleAppMetrics,
}: DeploymentTemplateCTAProps) => {
    const { envId } = useParams<BaseURLParams>()
    const isCompareTab = selectedTab === DeploymentTemplateTabsType.COMPARE && !showReadMe

    const getInfoText = () => {
        if (!selectedChart.isAppMetricsSupported) {
            return DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.notSupported(selectedChart.name)
        }
        return DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.supported
    }

    const renderApplicationMetrics = () => {
        if (!isAppMetricsConfigured) {
            return null
        }

        if (isLoading) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-16">
                    <Progressing data-testid="app-metrics-checkbox-loading" />
                    <span className="fs-13 fw-4 lh-20">Application metrics</span>
                </div>
            )
        }

        return (
            <div className="flexbox dc__gap-8">
                <Checkbox
                    rootClassName={`mb-0 mt-2 dc__align-start ${!selectedChart.isAppMetricsSupported ? 'dc__disabled' : ''}`}
                    isChecked={isAppMetricsEnabled}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={toggleAppMetrics}
                    dataTestId="app-metrics-checkbox"
                    disabled={isDisabled || !selectedChart.isAppMetricsSupported}
                />

                <div className="flex column left">
                    <div className="flex left fs-13 dc__gap-8">
                        <b className="fw-6 lh-18 cn-9">{DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.label}</b>

                        {isCompareTab || showReadMe ? (
                            <Tooltip alwaysShowTippyOnHover content={getInfoText()}>
                                <button
                                    type="button"
                                    aria-label="show-app-metrics-info"
                                    className="flex dc__transparent icon-dim-16"
                                >
                                    <ICHelpOutline className="icon-dim-16 dc__no-shrink" />
                                </button>
                            </Tooltip>
                        ) : (
                            <a
                                data-testid="app-metrics-learnmore-link"
                                href={DOCUMENTATION.APP_METRICS}
                                target="_blank"
                                className="anchor"
                                rel="noreferrer noopener"
                            >
                                {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.learnMore}
                            </a>
                        )}
                    </div>

                    {!isCompareTab && !showReadMe && (
                        <div
                            data-testid="app-metrics-info-text"
                            className={`fs-13 fw-4 lh-18 ${!selectedChart.isAppMetricsSupported ? 'cr-5' : 'cn-7'}`}
                        >
                            {getInfoText()}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderCTAContent = (): JSX.Element | string => {
        if (!envId && !isCiPipeline) {
            return (
                <>
                    Save & Next
                    <ICArrowRight className={`icon-dim-16 dc__no-shrink ${isDisabled ? 'scn-4' : 'scn-0'}`} />
                </>
            )
        }

        return 'Save changes'
    }

    return (
        <footer className="flexbox dc__content-space py-16 px-20 bcn-0 dc__border-top">
            {showReadMe && <div className="w-50" />}
            {renderApplicationMetrics()}
            <Tooltip
                alwaysShowTippyOnHover={isInheriting}
                content={DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText}
            >
                <button
                    type="button"
                    className={`cta flex h-32 ${isDisabled ? 'dc__disabled' : ''}`}
                    disabled={isDisabled}
                    onClick={handleSave}
                >
                    {isLoading ? <Progressing /> : renderCTAContent()}
                </button>
            </Tooltip>
        </footer>
    )
}

export default DeploymentTemplateCTA
