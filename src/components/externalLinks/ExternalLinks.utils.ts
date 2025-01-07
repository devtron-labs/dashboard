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

import { MultiValue } from 'react-select'
import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import { AppDetails } from '../app/types'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'
import { ExternalLink, OptionTypeWithIcon } from './ExternalLinks.type'
import CloudwatchlIcon from '../../assets/icons/ic-cloudwatch.png'
import CoralogixlIcon from '../../assets/icons/ic-coralogix.png'
import DatadogIcon from '../../assets/icons/ic-datadog.png'
import GrafanaIcon from '../../assets/icons/ic-grafana.png'
import KibanaIcon from '../../assets/icons/ic-kibana.png'
import LokiIcon from '../../assets/icons/ic-loki.png'
import NewrelicIcon from '../../assets/icons/ic-newrelic.png'
import AlertsIcon from '../../assets/icons/tools/ic-link-alerts.png'
import BugsIcon from '../../assets/icons/tools/ic-link-bugs.png'
import ChatIcon from '../../assets/icons/tools/ic-link-chat.png'
import ConfluenceIcon from '../../assets/icons/tools/ic-link-confluence.png'
import DocumentIcon from '../../assets/icons/tools/ic-link-document.png'
import FolderIcon from '../../assets/icons/tools/ic-link-folder.png'
import JiraIcon from '../../assets/icons/tools/ic-link-jira.png'
import PerformanceIcon from '../../assets/icons/tools/ic-link-performance.png'
import ReportIcon from '../../assets/icons/tools/ic-link-report.png'
import SwaggerIcon from '../../assets/icons/tools/ic-link-swagger.png'
import WebpageIcon from '../../assets/icons/tools/ic-link-webpage.png'
import { tempMultiSelectStyles } from '../ciConfig/CIConfig.utils'

export const MONITORING_TOOL_ICONS = {
    cloudwatch: CloudwatchlIcon,
    coralogix: CoralogixlIcon,
    datadog: DatadogIcon,
    grafana: GrafanaIcon,
    kibana: KibanaIcon,
    loki: LokiIcon,
    newrelic: NewrelicIcon,
    alerts: AlertsIcon,
    bugs: BugsIcon,
    chat: ChatIcon,
    confluence: ConfluenceIcon,
    document: DocumentIcon,
    folder: FolderIcon,
    jira: JiraIcon,
    performance: PerformanceIcon,
    report: ReportIcon,
    swagger: SwaggerIcon,
    webpage: WebpageIcon,
}

export const customMultiSelectStyles = {
    ...multiSelectStyles,
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: '100%',
    }),
    menuList: (base, state) => ({
        ...base,
        maxHeight: '190px',
        borderRadius: '4px',
        paddingTop: 0,
        paddingBottom: 0,
    }),
    option: (base, state) => ({
        ...base,
        padding: '10px 12px',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--bg-primary)',
        color: 'var(--N900)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
    }),
    control: (base, state) => ({
        ...base,
        width: '160px',
        minHeight: '36px',
        border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
        backgroundColor: 'var(--bg-secondary)',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        boxShadow: 'none',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 8px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N400)',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        padding: '0 8px',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--N900)',
    }),
}

export const ToolSelectStyles = {
    ...customMultiSelectStyles,
    menuList: (base, state) => ({
        ...customMultiSelectStyles.menuList(base, state),
        maxHeight: '208px',
        padding: '14px',
    }),
    menu: (base, state) => ({
        ...customMultiSelectStyles.menu(base, state),
        width: 'auto',
        marginTop: '0',
    }),
    control: (base, state) => ({
        ...customMultiSelectStyles.control(base, state),
        minHeight: '36px',
        width: '40px',
        border: 'none',
        backgroundColor: 'var(--bg-primary)',
        boxShadow: 'none',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--N500)',
    }),
    dropdownIndicator: (base, state) => ({
        ...customMultiSelectStyles.dropdownIndicator(base, state),
        padding: '0',
        svg: {
            width: '16px',
            height: '16px',
        },
    }),
}

export const NodeLevelSelectStyles = {
    ...customMultiSelectStyles,
    menu: (base) => ({
        ...base,
        width: '120px',
    }),
    control: (base) => ({
        ...base,
        minWidth: '67px',
        maxWidth: '112px',
        minHeight: '24px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--N200)',
        cursor: 'pointer',
    }),
    option: (base) => ({
        ...base,
        cursor: 'pointer',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: 0,
        paddingLeft: '8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    dropdownIndicator: (base, state) => ({
        ...customMultiSelectStyles.dropdownIndicator(base, state),
        padding: '0 8px 0 4px',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--N700)',
        margin: 0,
        minWidth: '45px',
        maxWidth: '60px',
    }),
}

export const IdentifierSelectStyles = {
    ...tempMultiSelectStyles,
    placeholder: (base) => ({
        ...base,
        color: 'var(--N500)',
    }),
    control: (base, state) => ({
        ...tempMultiSelectStyles.control(base, state),
        minHeight: '36px',
        border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
        backgroundColor: 'var(--bg-secondary)',
        cursor: 'pointer',
    }),
}

export const getMonitoringToolIcon = (monitoringTools: MultiValue<OptionTypeWithIcon>, toolId: number): string => {
    return (
        MONITORING_TOOL_ICONS[monitoringTools.find((tool) => tool.value === toolId)?.label.toLowerCase()] || WebpageIcon
    )
}

export const sortByUpdatedOn = (uptA: ExternalLink, uptB: ExternalLink) => {
    return new Date(uptB.updatedOn).getTime() - new Date(uptA.updatedOn).getTime()
}

export const availableVariables = ['{appName}', '{appId}', '{envId}', '{namespace}', '{podName}', '{containerName}']

export const getParsedURL = (
    isAppLevel: boolean,
    url: string,
    appDetails: AppDetails | HelmAppDetails,
    podName?: string,
    containerName?: string,
): string => {
    let parsedUrl = url
        .replace(/{appName}/g, appDetails.appName)
        .replace(/{appId}/g, `${appDetails.appId}`)
        .replace(/{envId}/g, `${appDetails.environmentId}`)
        .replace(/{namespace}/g, appDetails.namespace)

    if (!isAppLevel) {
        parsedUrl = parsedUrl.replace(/{podName}/g, podName).replace(/{containerName}/g, containerName)
    }

    return parsedUrl
}

export const onImageLoadError = (e) => {
    if (e && e.target) {
        e.target.src = WebpageIcon
    }
}
