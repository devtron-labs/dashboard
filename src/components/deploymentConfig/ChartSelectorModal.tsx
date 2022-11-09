import React, { useState } from 'react'
import { RadioGroup, sortObjectArrayAlphabetically, versionComparator, VisibleModal } from '../common'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'
import { DeploymentChartVersionType } from './types'
import { SortingOrder } from '../app/types'

interface ChartSelectorModalType {
    charts: DeploymentChartVersionType[]
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    toggleChartSelectorModal: () => void
}

export default function ChartSelectorModal({
    charts,
    selectedChartRefId,
    selectedChart,
    selectChart,
    toggleChartSelectorModal,
}: ChartSelectorModalType) {
    const chartTypeTabKeys = { DEVTRON_CHART: 'devtronChart', CUSTOM_CHARTS: 'customCharts' }
    const chartTypeTab = { devtronChart: 'Charts by Devtron', customCharts: 'Custom charts' }
    const recommendedChartName = 'Rollout Deployment'
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

    const onSelectChartType = (e) => {
        const filteredCharts = charts.filter((chart) => chart.name == e.target.dataset.chartName)
        const selectedChart = filteredCharts.find((chart) => chart.id == selectedChartRefId)
        if (selectedChart) {
            selectChart(selectedChart)
        } else {
            const sortedFilteredCharts = filteredCharts.sort((a, b) =>
                versionComparator(a, b, 'version', SortingOrder.DESC),
            )
            selectChart(sortedFilteredCharts[sortedFilteredCharts.length ? sortedFilteredCharts.length - 1 : 0])
        }
        toggleChartSelectorModal()
    }

    const changeSelectedTab = (e): void => {
        setSelectedChartTypeTab(e.target.value)
    }
    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body mt-0 p-0 dc__no-top-radius chart-selector-modal">
                <div className="flexbox dc__content-space p-16 dc__border-bottom">
                    <div className="fw-6 fs-16">Select chart</div>
                    <Close className="icon-dim-24 pointer" onClick={toggleChartSelectorModal} />
                </div>
                <div>
                    {customCharts.length > 0 && (
                        <div className="p-16">
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
                    <div className="chart-selector-row-list">
                        {(selectedChartTypeTab === chartTypeTabKeys.DEVTRON_CHART ? devtronCharts : customCharts).map(
                            (chart, index) => (
                                <div
                                    key={`${selectedChartTypeTab}-${index}`}
                                    className={`flex dc__content-space pt-12 pr-16 pb-12 pl-16 chart-row ${
                                        chart.name === selectedChart?.name ? ' bcb-1' : ''
                                    }`}
                                >
                                    <div className="w-80">
                                        <div>
                                            <span className="fs-13 fw-6 cn-9">{chart.name}</span>
                                            {recommendedChartName === chart.name && (
                                                <span className="">Recommended</span>
                                            )}
                                        </div>
                                        <div className="fs-12 fw-4 cn-7">
                                            {chart.description ||
                                                'case actually while we installed argocd and gitops not configure in between that time user created any app so that time user will face that issue , but in no gitops it is working fine'}
                                        </div>
                                    </div>
                                    <div className="w-20">
                                        {chart.name === selectedChart?.name ? (
                                            <Check className="icon-dim-24 pointer blue-tick" />
                                        ) : (
                                            <button
                                                className="use-chart bcn-0 bw-1 en-2 br-4 h-28 cb-5 fs-13 fw-6"
                                                data-chart-name={chart.name}
                                                onClick={onSelectChartType}
                                            >
                                                Use chart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </VisibleModal>
    )
}
