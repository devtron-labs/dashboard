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

import React, { useRef } from 'react'
import ReactSelect, { SelectInstance, Props as SelectProps } from 'react-select'
import { AppSelectorDropdownIndicator, APP_SELECTOR_STYLES } from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '../../../config'
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
    const selectRef = useRef<SelectInstance>(null)

    let filteredClusterList = clusterList
    if (window._env_.HIDE_DEFAULT_CLUSTER) {
        filteredClusterList = clusterList.filter((item) => Number(item.value) !== DEFAULT_CLUSTER_ID)
    }
    const defaultOption = filteredClusterList.find((item) => String(item.value) === clusterId)

    const handleOnKeyDown: SelectProps['onKeyDown'] = (event) => {
        if (event.key === 'Escape') {
            selectRef.current?.inputRef.blur()
        }
    }

    return (
        <div className="flexbox dc__align-items-center dc__gap-12">
            <ReactSelect
                classNamePrefix="cluster-select-header"
                options={filteredClusterList}
                ref={selectRef}
                onChange={onChange}
                blurInputOnSelect
                onKeyDown={handleOnKeyDown}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator: AppSelectorDropdownIndicator,
                    LoadingIndicator: null,
                }}
                value={defaultOption}
                styles={APP_SELECTOR_STYLES}
            />
            {defaultOption?.isProd && <span className="px-6 py-2 br-4 bcb-1 cb-7 fs-12 lh-16 fw-5">Production</span>}
        </div>
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
