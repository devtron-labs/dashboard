import React, { Component } from 'react';
import { components } from 'react-select';
import { ReactComponent as Bug } from '../../../../assets/icons/ic-bug.svg';
import { ReactComponent as ArrowDown } from '../../../../assets/icons/ic-chevron-down.svg';
import { ChartTypes, MetricsType } from './appDetails.type';
import CreatableSelect from 'react-select/creatable';

interface SecurityVulnerabilititesProps {
    imageScanDeployInfoId: number;
    severityCount: {
        critical: number;
        moderate: number;
        low: number;
    };
    onClick: () => void;
}

export class SecurityVulnerabilitites extends Component<SecurityVulnerabilititesProps> {

    render() {
        const { critical = 0, moderate = 0, low = 0 } = this.props.severityCount;
        const total = critical + moderate + low;
        if (total !== 0) {
            return <div className="security-vulnerabilities cursor" onClick={this.props.onClick}>
                <div>
                    <Bug className="icon-dim-20 vertical-align-middle mr-8 fcy-7" />
                    {total} Security Vulnerabilities
                    <span className="security-vulnerabilities__count">
                        {critical ? `${critical} critical, ` : ``}
                        {moderate ? `${moderate} moderate, ` : ``}
                        {low ? `${low} low` : ``}
                    </span>
                </div>
                <div className="cb-5">Details</div>
            </div>
        }
        else return <span></span>
    }
}

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 fcn-6" />
    </components.DropdownIndicator>
}

export function ThroughputSelect(props) {
    return <CreatableSelect className=""
        placeholder="Status Code"
        value={{ label: props.status, value: props.status }}
        options={[
            { label: '2xx', value: '2xx' },
            { label: '200', value: '200' },
            { label: '201', value: '201' },
            { label: '204', value: '204' },
            { label: '4xx', value: '4xx' },
            { label: '5xx', value: '5xx' },
            { label: 'Throughput', value: 'Throughput' }
        ]}
        onChange={props.handleStatusChange}
        styles={{
            container: (base, state) => ({
                ...base,
                outline: 'unset',
                height: "100%",
            }),
            control: (base, state) => ({
                ...base,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                minHeight: '20px',
                height: '100%',
            }),
            menu: (base, state) => ({
                ...base,
                width: '150px'
            }),
            valueContainer: base => ({
                ...base,
                padding: '0',
                height: '100%',
                fontWeight: 600,
            }),
            singleValue: base => ({
                ...base,
                position: 'relative',
                top: '9px',
                maxWidth: '77px',
            }),
            dropdownIndicator: base => ({
                ...base,
                padding: '0',
                height: '20px'
            }),
        }}
        components={{
            IndicatorSeparator: null,
            DropdownIndicator: DropdownIndicator,
        }}
    />
}

export function getIframeSrc(appId: string | number, envId: string | number, environmentName: string, chartName: ChartTypes, newPodHash: string, calendarInputs, tab: MetricsType, isLegendRequired: boolean, statusCode?: string) {
    let rootUrl = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');
    let startTime: string = calendarInputs.startDate;
    let endTime: string = calendarInputs.endDate;
    let url = ``;
    if (chartName !== 'status') {
        url = `${rootUrl}/grafana/d-solo/devtron-app-metrics-`;
    }
    else {
        url = `${rootUrl}/grafana/d-solo/NnFpQOKGk/res_status_per_pod`;
    }
    switch (chartName) {
        case 'latency':
            url += `latency/latency`;
            break;
        case 'ram':
            url += `memory/memory-usage`;
            break;
        case 'cpu':
            url += `cpu/cpu-usage`;
            break;
        case 'status':
            if (statusCode.includes("xx")) url += ``;
            else url += ``;
            break;
        default:
            return '';
    }
    url += `?orgId=${process.env.REACT_APP_GRAFANA_ORG_ID}`;
    url += `&refresh=10s`;
    url += `&var-app=${appId}`;
    url += `&var-env=${envId}`;
    url += `&var-new_rollout_pod_template_hash=${newPodHash}`;
    url += `&var-datasource=Prometheus-${environmentName}`;
    if (chartName === "status") {
        url += (statusCode.includes("xx")) ? `&response_code_class=${statusCode}` : `&response_code_class=`;
        url += (statusCode.includes("xx")) ? `&response_code=` : `&response_code=${statusCode}`;
    }
    let panelId = (tab === 'aggregate') ? 2 : 3;
    if (!isLegendRequired) {
        panelId = (tab === 'aggregate') ? 4 : 5;
    }
    url += `&from=${startTime}&to=${endTime}`;
    url += `&panelId=${panelId}`;
    return url;
}