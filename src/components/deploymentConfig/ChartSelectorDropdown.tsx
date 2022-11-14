import React, { useState } from 'react'
import { PopupMenu, RadioGroup, sortObjectArrayAlphabetically, versionComparator, VisibleModal } from '../common'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ChartSelectorModalType } from './types'
import { SortingOrder } from '../app/types'
import { chartDocumentationLink, chartTypeTab, chartTypeTabKeys, recommendedChartName } from './constants'

export default function ChartSelectorDropdown({
    charts,
    chartsMetadata,
    selectedChartRefId,
    selectedChart,
    selectChart,
    isUnSet,
}: ChartSelectorModalType) {
    const [popupOpen, togglePopup] = useState(false)
    const [selectedChartTypeTab, setSelectedChartTypeTab] = useState(
        selectedChart?.['userUploaded'] ? chartTypeTabKeys.CUSTOM_CHARTS : chartTypeTabKeys.DEVTRON_CHART,
    )
    const uniqueChartsByDevtron = new Map<string, boolean>(),
        uniqueCustomCharts = new Map<string, boolean>()
    let devtronCharts = [],
        customCharts = []

    for (let chart of charts) {
        const chartName = chart.name
        if (chart['userUploaded']) {
            if (!uniqueCustomCharts.get(chartName)) {
                uniqueCustomCharts.set(chartName, true)
                customCharts.push(chart)
            }
        } else if (!uniqueChartsByDevtron.get(chartName)) {
            uniqueChartsByDevtron.set(chartName, true)
            devtronCharts.push(chart)
        }
    }
    devtronCharts = sortObjectArrayAlphabetically(devtronCharts, 'name')
    customCharts = sortObjectArrayAlphabetically(customCharts, 'name')

    const onSelectChartType = (selectedChartName: string): void => {
        const filteredCharts = charts.filter((chart) => chart.name == selectedChartName)
        const selectedChart = filteredCharts.find((chart) => chart.id == selectedChartRefId)
        if (selectedChart) {
            selectChart(selectedChart)
        } else {
            const sortedFilteredCharts = filteredCharts.sort((a, b) =>
                versionComparator(a, b, 'version', SortingOrder.DESC),
            )
            selectChart(sortedFilteredCharts[sortedFilteredCharts.length ? sortedFilteredCharts.length - 1 : 0])
        }
    }

    const changeSelectedTab = (event): void => {
        setSelectedChartTypeTab(event.target.value)
    }

    const stopPropagation = (event): void => {
        event.stopPropagation()
    }

    const setPopupState = (isOpen: boolean): void => {
        togglePopup(isOpen)
    }

    if (!isUnSet) {
        return <span className="fs-13 fw-6 cn-9 flex pointer">{selectedChart?.name}</span>
    } else {
        return (
            <PopupMenu onToggleCallback={setPopupState} autoClose>
                <PopupMenu.Button isKebab>
                    <span className="fs-13 fw-6 cn-9 flex pointer">
                        {selectedChart?.name || 'Select Chart'}
                        <Dropdown
                            className="icon-dim-20 ml-2 rotate fcn-9 pointer"
                            style={{ ['--rotateBy' as any]: popupOpen ? '180deg' : '0deg' }}
                        />
                    </span>
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="chart-selector-container dc__border br-4">
                    <>
                        {customCharts.length > 0 && (
                            <div
                                className="pt-12 pr-12 pb-8 pl-12 dc__position-sticky bcn-0 top-0 dc__top-radius-4"
                                onClick={stopPropagation}
                            >
                                <RadioGroup
                                    className="gui-yaml-switch dc__content-start"
                                    name="chartTypeTab"
                                    initialTab={selectedChartTypeTab}
                                    disabled={false}
                                    onChange={changeSelectedTab}
                                >
                                    <RadioGroup.Radio
                                        value={chartTypeTabKeys.DEVTRON_CHART}
                                        canSelect={selectedChartTypeTab !== chartTypeTabKeys.DEVTRON_CHART}
                                    >
                                        {chartTypeTab[chartTypeTabKeys.DEVTRON_CHART]}
                                    </RadioGroup.Radio>
                                    <RadioGroup.Radio
                                        value={chartTypeTabKeys.CUSTOM_CHARTS}
                                        canSelect={selectedChartTypeTab !== chartTypeTabKeys.CUSTOM_CHARTS}
                                    >
                                        {chartTypeTab[chartTypeTabKeys.CUSTOM_CHARTS]}
                                    </RadioGroup.Radio>
                                </RadioGroup>
                            </div>
                        )}
                        <div className="pt-4 pb-4">
                            {(selectedChartTypeTab === chartTypeTabKeys.DEVTRON_CHART
                                ? devtronCharts
                                : customCharts
                            ).map((chart, index) => (
                                <div
                                    key={`${selectedChartTypeTab}-${index}`}
                                    className={`p-12 pointer ${
                                        chart.name === selectedChart?.name ? ' bcb-1' : ''
                                    }`}
                                    onClick={() => onSelectChartType(chart.name)}
                                >
                                    <div>
                                        <span
                                            className={`fs-13 fw-6 ${
                                                chart.name === selectedChart?.name ? ' cb-5' : 'cn-9'
                                            }`}
                                        >
                                            {chart.name}
                                        </span>
                                        {recommendedChartName === chart.name && (
                                            <span className="pl-6 pr-6 bw-1 ev-2 br-4 bcv-1 ml-12">Recommended</span>
                                        )}
                                    </div>
                                    {(chartsMetadata?.[chart.name]?.['chartDescription'] || chart.description) && (
                                        <div className="fs-12 fw-4 cn-7">
                                            {chartsMetadata?.[chart.name]?.['chartDescription'] || chart.description}
                                            &nbsp;
                                            {chartDocumentationLink[chart.name] && (
                                                <a
                                                    className="dc__no-decor"
                                                    href={chartDocumentationLink[chart.name]}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    onClick={stopPropagation}
                                                >
                                                    Learn more
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                </PopupMenu.Body>
            </PopupMenu>
        )
    }
}
