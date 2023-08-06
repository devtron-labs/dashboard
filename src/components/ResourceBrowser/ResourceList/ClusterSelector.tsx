import React from 'react'
import ReactSelect from 'react-select'
import { appSelectorStyle, DropdownIndicator } from '../../AppSelector/AppSelectorUtil'
import { ClusterOptionType } from '../Types'

interface ClusterSelectorType {
    onChange: ({ label, value }) => void
    clusterList: ClusterOptionType[]
    clusterId: string
}

export default function ClusterSelector({ onChange, clusterList, clusterId }: ClusterSelectorType) {
    const defaultOption = clusterList.find((item) => item.value == clusterId)

    return (
        <ReactSelect
            classNamePrefix="cluster-select-header"
            options={clusterList}
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
