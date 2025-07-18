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

import { generatePath, useHistory } from 'react-router-dom'

import {
    AppThemeType,
    getComponentSpecificThemeClass,
    K8S_EMPTY_GROUP,
    RESOURCE_BROWSER_ROUTES,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ArrowLeft } from '../../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as AllResourcesIcon } from '../../../assets/icons/ic-resource.svg'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { URLS } from '../../../config'
import { NodeDetailTabs } from '../../app/types'
import { ClusterMetaDataBarProps } from './types'

import './ClusterMetaData.scss'

export const ClusterMetaDataBar = ({
    clusterName,
    namespace,
    clusterId,
    isVirtualEnvironment,
}: ClusterMetaDataBarProps) => {
    const { isSuperAdmin } = useMainContext()
    const history = useHistory()
    const { pathname } = history.location
    const { appTheme } = useTheme()
    const darkTheme =
        pathname.includes(NodeDetailTabs.MANIFEST.toLowerCase()) ||
        pathname.includes(NodeDetailTabs.EVENTS.toLowerCase()) ||
        pathname.includes(NodeDetailTabs.TERMINAL.toLowerCase()) ||
        pathname.includes(NodeDetailTabs.LOGS.toLowerCase()) ||
        pathname.includes(URLS.APP_DETAILS_LOG)

    const renderNavigationToAllResources = () => (
        <a
            className={`${darkTheme ? 'icon-stroke__white resource-link__dark-theme text__white' : 'scn-9 cn-9 resource-link__white-theme'} fw-6 flex left dc__gap-6 cursor`}
            target="_blank"
            href={`${window.__BASE_URL__}${generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST, { clusterId, group: K8S_EMPTY_GROUP, kind: 'pod' })}?namespace=${namespace}`}
            rel="noreferrer"
        >
            <AllResourcesIcon />
            All resources
        </a>
    )

    const renderNavigationToAClusterTerminal = () => (
        <a
            className={`${darkTheme ? 'resource-link__dark-theme text__white' : 'cn-9 resource-link__white-theme'} fw-6 flex left dc__gap-6 cursor`}
            target="_blank"
            href={`${window.__BASE_URL__}${generatePath(RESOURCE_BROWSER_ROUTES.TERMINAL, { clusterId })}?namespace=${namespace}`}
            rel="noreferrer"
        >
            <TerminalIcon className={`${darkTheme ? 'icon-fill__white' : ''} icon-dim-16`} />
            Cluster terminal
        </a>
    )

    if (!isSuperAdmin || !clusterId || !namespace) {
        return null
    }

    return (
        <div className={getComponentSpecificThemeClass(darkTheme ? AppThemeType.dark : appTheme)}>
            <div
                className={`cluster-meta-data-wrapper ${darkTheme ? 'dark-theme cn-0' : 'cn-9 bg__primary resource-link__white-theme'} flex left dc__no-shrink pl-16 w-100 fs-12 dc__border-top dc__gap-6 pt-4 pb-4 lh-20 cn-9`}
            >
                <span className="dc__opacity-0_8"> Cluster: {clusterName}</span>
                <div className={`${darkTheme ? 'dc__border-left-n0' : 'dc__border-left-n9'} h-12 dc__opacity-0_2`} />
                <span className="dc__opacity-0_8">Namespace: {namespace || '-'}</span>
                {!isVirtualEnvironment && (
                    <>
                        <ArrowLeft
                            className="fcn-9 dc__opacity-0_5 rotate dc__gap-6 icon-dim-16 flex"
                            style={{ ['--rotateBy' as string]: '180deg' }}
                        />
                        {renderNavigationToAllResources()}
                        <div
                            className={`${darkTheme ? 'dc__border-left-n0' : 'dc__border-left-n9'} h-12 dc__opacity-0_2`}
                        />
                        {renderNavigationToAClusterTerminal()}
                    </>
                )}
            </div>
        </div>
    )
}
