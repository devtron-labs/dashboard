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
import { EMPTY_STATE_STATUS, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { UserRoleType } from '@Pages/GlobalConfigurations/Authorization/constants'
import CloudwatchlIcon from '@Icons/ic-cloudwatch.png'
import CoralogixlIcon from '@Icons/ic-coralogix.png'
import DatadogIcon from '@Icons/ic-datadog.svg'
import GrafanaIcon from '@Icons/ic-grafana.png'
import KibanaIcon from '@Icons/ic-kibana.png'
import LokiIcon from '@Icons/ic-loki.png'
import NewrelicIcon from '@Icons/ic-newrelic.svg'
import AlertsIcon from '@Icons/tools/ic-link-alerts.png'
import BugsIcon from '@Icons/tools/ic-link-bugs.png'
import ChatIcon from '@Icons/tools/ic-link-chat.png'
import ConfluenceIcon from '@Icons/tools/ic-link-confluence.png'
import DocumentIcon from '@Icons/tools/ic-link-document.png'
import FolderIcon from '@Icons/tools/ic-link-folder.png'
import JiraIcon from '@Icons/tools/ic-link-jira.png'
import PerformanceIcon from '@Icons/tools/ic-link-performance.png'
import ReportIcon from '@Icons/tools/ic-link-report.png'
import SwaggerIcon from '@Icons/tools/ic-link-swagger.png'
import WebpageIcon from '@Icons/tools/ic-link-webpage.png'
import { ExternalLink, ExternalLinkScopeType, OptionTypeWithIcon } from './ExternalLinks.type'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'
import { AppDetails } from '../app/types'
import { tempMultiSelectStyles } from '../ciConfig/CIConfig.utils'
import { AddLinkButton } from './AddLinkButton'
import { ExternalLinksLearnMore, RoleBasedInfoNote } from './ExternalLinks.component'
import EmptyExternalLinks from '../../assets/img/empty-externallinks@2x.png'

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

export const ToolSelectStyles = {
    menuList: (base) => ({
        ...base,
        maxHeight: '208px',
        borderRadius: '4px',
        padding: '14px',
    }),
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: 'auto',
        minHeight: '36px',
        border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
        backgroundColor: 'var(--bg-secondary)',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        boxShadow: 'none',
        marginTop: '0',
    }),
    control: (base) => ({
        ...base,
        minHeight: '36px',
        width: '40px',
        border: 'none',
        backgroundColor: 'var(--bg-primary)',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        boxShadow: 'none',
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
    valueContainer: (base) => ({
        ...base,
        padding: '0',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--N500)',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: '0',
        svg: {
            width: '16px',
            height: '16px',
        },
        color: 'var(--N400)',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
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

export const getMonitoringToolIcon = (monitoringTools: MultiValue<OptionTypeWithIcon>, toolId: number): string =>
    MONITORING_TOOL_ICONS[monitoringTools.find((tool) => tool.value === toolId)?.label.toLowerCase()] || WebpageIcon

export const sortByUpdatedOn = (uptA: ExternalLink, uptB: ExternalLink) =>
    new Date(uptB.updatedOn).getTime() - new Date(uptA.updatedOn).getTime()

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

export const NoExternalLinksView = ({
    handleAddLinkClick,
    isAppConfigView,
    userRole,
}: {
    handleAddLinkClick: () => void
    isAppConfigView: boolean
    userRole: UserRoleType
}): JSX.Element => {
    const handleButton = () => <AddLinkButton handleOnClick={handleAddLinkClick} />
    return (
        <GenericEmptyState
            image={EmptyExternalLinks}
            title={EMPTY_STATE_STATUS.EXTERNAL_LINK_COMPONENT.TITLE}
            heightToDeduct={120}
            subTitle={
                <>
                    {`Add frequently visited links (eg. Monitoring dashboards, documents, specs etc.) for
                    ${isAppConfigView ? ' this ' : ' any '}application. Links will be available on the app details
                    page. `}
                    <ExternalLinksLearnMore />
                </>
            }
            isButtonAvailable
            renderButton={handleButton}
        >
            {isAppConfigView && <RoleBasedInfoNote userRole={userRole} />}
        </GenericEmptyState>
    )
}

export const getScopeLabel = (link: ExternalLink): string => {
    const _identifiersLen = link.identifiers.length
    const _labelPostfix = `${link.type === ExternalLinkScopeType.ClusterLevel ? 'cluster' : 'application'}${
        _identifiersLen === 0 || _identifiersLen > 1 ? 's' : ''
    }`

    if (_identifiersLen === 0) {
        return `All ${_labelPostfix}`
    }
    return `${_identifiersLen} ${_labelPostfix}`
}
