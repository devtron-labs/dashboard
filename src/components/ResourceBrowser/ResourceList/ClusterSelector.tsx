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

import React from 'react'
import ReactSelect from 'react-select'
import { DOCUMENTATION } from '../../../config'
import { appSelectorStyle, DropdownIndicator } from '../../AppSelector/AppSelectorUtil'
import {
    clusterOverviewNodeText,
    ERROR_SCREEN_LEARN_MORE,
    ERROR_SCREEN_SUBTITLE,
    LEARN_MORE,
    SIDEBAR_KEYS,
} from '../Constants'
import { ClusterSelectorType } from '../Types'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'

const ClusterSelector: React.FC<ClusterSelectorType> = ({ onChange, clusterList, clusterId }) => {
    let filteredClusterList = clusterList
    if (window._env_.HIDE_DEFAULT_CLUSTER) {
        filteredClusterList = clusterList.filter((item) => Number(item.value) !== DEFAULT_CLUSTER_ID)
    }
    const defaultOption = filteredClusterList.find((item) => String(item.value) === clusterId)

    return (
        <ReactSelect
            classNamePrefix="cluster-select-header"
            options={filteredClusterList}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
                LoadingIndicator: null,
            }}
            value={defaultOption}
            styles={appSelectorStyle}
        />
    )
}

export default ClusterSelector

export const unauthorizedInfoText = (nodeType?: string) => {
    const emptyStateData = {
        text: ERROR_SCREEN_SUBTITLE,
        link: DOCUMENTATION.K8S_RESOURCES_PERMISSIONS,
        linkText: ERROR_SCREEN_LEARN_MORE,
    }

    if (nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()) {
        emptyStateData.text = clusterOverviewNodeText(true)
        emptyStateData.link = DOCUMENTATION.GLOBAL_CONFIG_PERMISSION
        emptyStateData.linkText = LEARN_MORE
    } else if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) {
        emptyStateData.text = clusterOverviewNodeText(false)
        emptyStateData.link = DOCUMENTATION.GLOBAL_CONFIG_PERMISSION
        emptyStateData.linkText = LEARN_MORE
    }

    return (
        <>
            {emptyStateData.text}&nbsp;
            <a className="dc__link" href={emptyStateData.link} target="_blank" rel="noreferrer noopener">
                {emptyStateData.linkText}
            </a>
        </>
    )
}
