import { Progressing } from '@Common/Progressing'
import { Checkbox } from '@Common/Checkbox'
import { CHECKBOX_VALUE } from '@Common/Types'
import { Tooltip } from '@Common/Tooltip'
import { DOCUMENTATION } from '@Common/Constants'
import { ReactComponent as ICInfoFilledOverride } from '@Icons/ic-info-filled-override.svg'
import { InfoIconTippy, InvalidYAMLTippyWrapper } from '@Shared/Components'
import { DTApplicationMetricsFormFieldProps } from './types'

const DTApplicationMetricsFormField = ({
    showApplicationMetrics,
    isLoading,
    selectedChart,
    isDisabled,
    toggleAppMetrics,
    isAppMetricsEnabled,
    onlyShowCurrentStatus = false,
    parsingError,
    restoreLastSavedYAML,
}: DTApplicationMetricsFormFieldProps) => {
    if (!showApplicationMetrics) {
        return null
    }

    if (onlyShowCurrentStatus) {
        return (
            <div className="flexbox dc__align-items-center dc__gap-8 fs-13 fw-4 lh-20 cn-9">
                <ICInfoFilledOverride className="icon-dim-16 dc__no-shrink" />
                <div className="flexbox dc__gap-6">
                    <span>Application metrics are</span>
                    <span className="fw-6">{isAppMetricsEnabled ? 'Enabled' : 'Not enabled'}</span>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flexbox dc__align-items-center dc__gap-16 dc_max-width__max-content">
                <Progressing data-testid="app-metrics-checkbox-loading" />
                <span className="fs-13 fw-4 lh-20 dc__no-shrink">Application metrics</span>
            </div>
        )
    }

    return (
        <div className="flexbox dc__align-items-center">
            <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                <div>
                    <Checkbox
                        rootClassName={`mb-0 dc__align-items-center ${!selectedChart.isAppMetricsSupported ? 'dc__disabled' : ''}`}
                        isChecked={isAppMetricsEnabled}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={toggleAppMetrics}
                        dataTestId="app-metrics-checkbox"
                        disabled={isDisabled || !selectedChart.isAppMetricsSupported}
                    >
                        <div className="flex column left">
                            <div className="flex left fs-13">
                                <b className="fw-6 lh-18 cn-9">Show application metrics</b>
                            </div>
                        </div>
                    </Checkbox>
                </div>
            </InvalidYAMLTippyWrapper>

            <div className="flexbox dc__gap-6 pl-6 dc__align-items-center">
                {!selectedChart.isAppMetricsSupported && (
                    <Tooltip
                        alwaysShowTippyOnHover
                        content={`Application metrics is not supported for ${selectedChart.name} version ${selectedChart.version}.`}
                    >
                        <span className="cr-5 fs-13 fw-4 lh-20 dc__border-bottom-dashed--n3 dc__no-shrink">
                            Not supported
                        </span>
                    </Tooltip>
                )}

                <InfoIconTippy
                    heading="Application Metrics"
                    infoText="Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency)."
                    documentationLink={DOCUMENTATION.APP_METRICS}
                    documentationLinkText="Learn more"
                    dataTestid="app-metrics-info"
                    iconClassName="dc__no-shrink icon-dim-16 fcn-6"
                />
            </div>
        </div>
    )
}

export default DTApplicationMetricsFormField
