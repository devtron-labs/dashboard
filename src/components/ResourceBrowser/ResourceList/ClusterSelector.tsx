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
import { ClusterOptionType } from '../Types'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'

interface ClusterSelectorType {
    onChange: ({ label, value }) => void
    clusterList: ClusterOptionType[]
    clusterId: string
}

export default function ClusterSelector({ onChange, clusterList, clusterId }: ClusterSelectorType) {
    let filteredClusterList = clusterList
    if (window._env_.HIDE_DEFAULT_CLUSTER) {
        filteredClusterList = clusterList.filter((item) => Number(item.value) !== DEFAULT_CLUSTER_ID)
    }
    const defaultOption = filteredClusterList.find((item) => item.value == clusterId)

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
