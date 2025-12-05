import { DTSwitch, PromoetheusConfigCard } from '@devtron-labs/devtron-fe-common-lib'

import { GrafanaIntegrationRequired, PrometheusWarningInfo } from './ClusterForm.components'
import { ApplicationMonitoringProps } from './types'

const ApplicationMonitoring = ({
    prometheusConfig,
    prometheusUrl,
    isAppMetricsEnabled,
    toggleAppMetrics,
    handleOnChange,
    onPrometheusAuthTypeChange,
    isGrafanaModuleInstalled,
    isCostVisibilityEnabled,
}: ApplicationMonitoringProps) => (
    <div className="flexbox-col flex-grow-1 dc__gap-20 p-20">
        <div className="flexbox-col">
            <span className="fs-16 fw-6 lh-1-5 cn-9">Application Monitoring</span>
            <span className="fs-13 fw-4 lh-1-5 cn-7">Monitor metrics for applications running on this cluster</span>
        </div>
        <div className="divider__secondary--horizontal" />
        {!isGrafanaModuleInstalled && <GrafanaIntegrationRequired />}
        <div className="bg__primary p-20 br-8 flexbox dc__align-items-center dc__content-space border__secondary">
            <div className="flexbox-col">
                <span className="fs-13 fw-6 lh-1-5 cn-9">Enable Application Metrics</span>
                <span className="fs-12 fw-4 lh-1-5 cn-7">
                    See metrics like CPU, RAM, Throughput etc. for applications running in this cluster
                </span>
            </div>
            <DTSwitch
                name="toggle-configure-prometheus"
                ariaLabel="Toggle configure prometheus"
                isChecked={isAppMetricsEnabled}
                onChange={toggleAppMetrics}
                isDisabled={!isGrafanaModuleInstalled || (isAppMetricsEnabled && isCostVisibilityEnabled)}
                tooltipContent={
                    isAppMetricsEnabled && isCostVisibilityEnabled
                        ? 'To disable application metrics, first disable cost visibility from cluster cost configuration.'
                        : ''
                }
            />
        </div>
        {!isAppMetricsEnabled && prometheusUrl && <PrometheusWarningInfo />}
        {isAppMetricsEnabled && (
            <PromoetheusConfigCard
                prometheusConfig={prometheusConfig}
                handleOnChange={handleOnChange}
                onPrometheusAuthTypeChange={onPrometheusAuthTypeChange}
            />
        )}
    </div>
)

export default ApplicationMonitoring
