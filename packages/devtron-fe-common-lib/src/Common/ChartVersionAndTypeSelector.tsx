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

import { useEffect, useState } from 'react'
import { SelectPicker, SelectPickerVariantType } from '@Shared/Components'
import { fetchChartTemplateVersions } from './Common.service'
import { ChartVersionAndTypeSelectorProps } from './Types'
import { getFilteredChartVersions, showError } from './Helper'

interface DeploymentChartVersionType {
    chartRefId: number
    chartVersion: string
    chartType: string
    type: number
}

// @TODO: Generalize this component to be used in CodeEditor as Chart selector toolbar
// when the Code Editor is moved to the fe-common-lib
const ChartVersionAndTypeSelector = ({ setSelectedChartRefId }: ChartVersionAndTypeSelectorProps) => {
    const [charts, setCharts] = useState<DeploymentChartVersionType[]>([])
    const [selectedChartType, setSelectedChartType] = useState(null)
    const [chartVersionOptions, setChartVersionOptions] = useState([])
    const [chartTypeOptions, setChartTypeOptions] = useState([])
    const [selectedChartVersion, setSelectedChartVersion] = useState(null)

    useEffect(() => {
        fetchChartTemplateVersions()
            .then((res) => {
                const charts = res?.result || []
                setCharts(charts)
                // Extract unique chart types from the data
                const chartTypeOptions = [...new Set(charts.map((item) => item.chartType))].map((type) => ({
                    value: type,
                    label: type,
                }))
                setChartTypeOptions(chartTypeOptions)
                const filteredVersions = getFilteredChartVersions(charts, chartTypeOptions[0])
                selectFirstChartVersion(filteredVersions)
            })
            .catch((err) => {
                showError(err)
            })
    }, [])

    const selectFirstChartVersion = (filteredVersions) => {
        setChartVersionOptions(filteredVersions)
        setSelectedChartVersion(filteredVersions[0]) // Select the first chart version by default
        setSelectedChartRefId(filteredVersions[0]?.chartRefId)
    }

    // Function to update chart version options based on selected chart type
    const handleChartTypeChange = (selectedOption) => {
        setSelectedChartType(selectedOption)
        const filteredVersions = getFilteredChartVersions(charts, selectedOption)
        selectFirstChartVersion(filteredVersions)
    }

    // Function to handle the change of the selected chart version
    const handleChartVersionChange = (selectedOption) => {
        setSelectedChartVersion(selectedOption)
        setSelectedChartRefId(selectedOption.chartRefId)
    }

    return (
        <div className="flex">
            <div className="chart-type-options flex" data-testid="chart-type-options">
                <span className="cn-7 mr-4">Chart Type</span>
                <SelectPicker
                    inputId="chart-type-select"
                    value={selectedChartType ?? chartTypeOptions[0]}
                    options={chartTypeOptions}
                    onChange={handleChartTypeChange}
                    variant={SelectPickerVariantType.BORDER_LESS}
                />
            </div>
            <div className="chart-version-options flex" data-testid="chart-version-options">
                <span className="cn-7 mr-4">Chart Version</span>
                <SelectPicker
                    inputId="chart-version-select"
                    value={selectedChartVersion ?? chartVersionOptions[0]}
                    options={chartVersionOptions}
                    onChange={handleChartVersionChange}
                    variant={SelectPickerVariantType.BORDER_LESS}
                />
            </div>
        </div>
    )
}

export default ChartVersionAndTypeSelector
