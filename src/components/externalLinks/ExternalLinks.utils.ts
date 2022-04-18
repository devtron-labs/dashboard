import { MultiValue } from "react-select"
import { AppDetails } from "../app/types"
import { AppDetails as HelmAppDetails } from "../v2/appDetails/appDetails.type"
import { ExternalLink, OptionTypeWithIcon } from "./ExternalLinks.type"
import CloudwatchlIcon from '../../assets/icons/ic-cloudwatch.png'
import CoralogixlIcon from '../../assets/icons/ic-coralogix.png'
import DatadogIcon from '../../assets/icons/ic-datadog.png'
import GrafanaIcon from '../../assets/icons/ic-grafana.png'
import KibanaIcon from '../../assets/icons/ic-kibana.png'
import LokiIcon from '../../assets/icons/ic-loki.png'
import NewrelicIcon from '../../assets/icons/ic-newrelic.png'
import OtherToolIcon from '../../assets/icons/ic-browser.svg'

export const MONITORING_TOOL_ICONS = {
    'ic-cloudwatch': CloudwatchlIcon,
    'ic-coralogix': CoralogixlIcon,
    'ic-datadog': DatadogIcon,
    'ic-grafana': GrafanaIcon,
    'ic-kibana': KibanaIcon,
    'ic-loki': LokiIcon,
    'ic-newrelic': NewrelicIcon,
    'ic-browser': OtherToolIcon,
}

export const getMonitoringToolIcon = (monitoringTools: MultiValue<OptionTypeWithIcon>, toolId: number): string => {
    return MONITORING_TOOL_ICONS[monitoringTools.find((tool) => tool.value === toolId)?.icon] || OtherToolIcon
}

export const sortByUpdatedOn = (uptA: ExternalLink, uptB: ExternalLink) => {
    return new Date(uptB.updatedOn).getTime() - new Date(uptA.updatedOn).getTime()
}

export const getParsedURL = (
    isAppLevel: boolean,
    url: string,
    appDetails: AppDetails | HelmAppDetails,
    podName?: string,
    containerName?: string,
): string => {
    let parsedUrl = url
        .replace('{appName}', appDetails.appName)
        .replace('{appId}', `${appDetails.appId}`)
        .replace('{envId}', `${appDetails.environmentId}`)
        .replace('{namespace}', `${appDetails.namespace}`)

    if (!isAppLevel) {
        parsedUrl = parsedUrl.replace('{podName}', podName).replace('{containerName}', `${containerName}`)
    }

    return parsedUrl
}

export const onImageLoadError = (e) => {
    if (e && e.target) {
        e.target.src = OtherToolIcon
    }
}

