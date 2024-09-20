import { useState } from 'react'
import {
    PopupMenu,
    SortingOrder,
    stopPropagation,
    StyledRadioGroup as RadioGroup,
    DeploymentChartVersionType,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { sortObjectArrayAlphabetically, versionComparator } from '@Components/common'
import { DEPLOYMENT } from '@Config/constants'
import { ReactComponent as Dropdown } from '@Icons/ic-chevron-down.svg'
import { ChartSelectorDropdownProps, DTChartSelectorProps } from './types'
import {
    CHART_TYPE_TAB_KEYS,
    CHART_TYPE_TAB,
    CHART_DOCUMENTATION_LINK,
    DEPLOYMENT_TEMPLATE_LABELS_KEYS,
} from './constants'

// NOTE: Have migrated directly
const ChartSelectorDropdown = ({
    charts,
    chartsMetadata,
    selectedChartRefId,
    selectedChart,
    selectChart,
    isUnSet,
}: ChartSelectorDropdownProps) => {
    const [popupOpen, togglePopup] = useState(false)
    const [selectedChartTypeTab, setSelectedChartTypeTab] = useState(
        selectedChart?.userUploaded ? CHART_TYPE_TAB_KEYS.CUSTOM_CHARTS : CHART_TYPE_TAB_KEYS.DEVTRON_CHART,
    )
    const uniqueChartsByDevtron = new Map<string, boolean>()
    const uniqueCustomCharts = new Map<string, boolean>()
    let devtronCharts = []
    let customCharts = []

    charts.forEach((chart) => {
        const chartName = chart.name
        if (chart.userUploaded) {
            if (!uniqueCustomCharts.get(chartName)) {
                uniqueCustomCharts.set(chartName, true)
                customCharts.push(chart)
            }
        } else if (!uniqueChartsByDevtron.get(chartName)) {
            uniqueChartsByDevtron.set(chartName, true)
            devtronCharts.push(chart)
        }
    })

    devtronCharts = sortObjectArrayAlphabetically(devtronCharts, 'name')
    customCharts = sortObjectArrayAlphabetically(customCharts, 'name')

    const onSelectChartType = (selectedChartName: string): void => {
        const filteredCharts = charts.filter((chart) => chart.name === selectedChartName)
        const targetChart = filteredCharts.find((chart) => chart.id === selectedChartRefId)
        if (targetChart) {
            selectChart(targetChart)
        } else {
            const sortedFilteredCharts = filteredCharts.sort((a, b) =>
                versionComparator(a, b, 'version', SortingOrder.DESC),
            )
            selectChart(sortedFilteredCharts[0])
        }
    }

    const changeSelectedTab = (event): void => {
        setSelectedChartTypeTab(event.target.value)
    }

    const setPopupState = (isOpen: boolean): void => {
        togglePopup(isOpen)
    }

    if (!isUnSet) {
        return (
            <span className="fs-13 fw-6 cn-9 flex" data-testid="select-chart-type-dropdown">
                {selectedChart?.name}
            </span>
        )
    }
    return (
        <PopupMenu onToggleCallback={setPopupState} autoClose>
            <PopupMenu.Button isKebab dataTestId="select-chart-type-dropdown">
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
                                    value={CHART_TYPE_TAB_KEYS.DEVTRON_CHART}
                                    canSelect={selectedChartTypeTab !== CHART_TYPE_TAB_KEYS.DEVTRON_CHART}
                                    dataTestId="select-chartversion-menu-list"
                                >
                                    {CHART_TYPE_TAB[CHART_TYPE_TAB_KEYS.DEVTRON_CHART]}
                                </RadioGroup.Radio>
                                <RadioGroup.Radio
                                    value={CHART_TYPE_TAB_KEYS.CUSTOM_CHARTS}
                                    canSelect={selectedChartTypeTab !== CHART_TYPE_TAB_KEYS.CUSTOM_CHARTS}
                                >
                                    {CHART_TYPE_TAB[CHART_TYPE_TAB_KEYS.CUSTOM_CHARTS]}
                                </RadioGroup.Radio>
                            </RadioGroup>
                        </div>
                    )}
                    <div className="pt-4 pb-4" data-testid="select-chart-type-menu-list">
                        {(selectedChartTypeTab === CHART_TYPE_TAB_KEYS.DEVTRON_CHART
                            ? devtronCharts
                            : customCharts
                        ).map((chart: DeploymentChartVersionType, index: number) => (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={`${selectedChartTypeTab}-${index}`}
                                className={`p-12 pointer chart-row ${
                                    chart.name === selectedChart?.name ? ' bcb-1' : ''
                                }`}
                                data-testid={`select-chart-type-menu-${index}`}
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
                                    {chart.name === DEPLOYMENT && (
                                        <span className="pl-6 pr-6 bw-1 ev-2 br-4 bcv-1 ml-12">Recommended</span>
                                    )}
                                </div>
                                {(chartsMetadata?.[chart.name]?.chartDescription || chart.description) && (
                                    <div className="fs-12 fw-4 cn-7 lh-18 mt-4">
                                        {chartsMetadata?.[chart.name]?.chartDescription ||
                                            chart.description.substring(0, 250)}
                                        &nbsp;
                                        {CHART_DOCUMENTATION_LINK[chart.name] && (
                                            <a
                                                className="dc__no-decor"
                                                href={CHART_DOCUMENTATION_LINK[chart.name]}
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

// Mostly migrated just changed react-select to SelectPicker
const DTChartSelector = ({
    isUnSet,
    disableVersionSelect,
    charts,
    chartsMetadata,
    selectedChart,
    selectChart,
    selectedChartRefId,
}: DTChartSelectorProps) => {
    const filteredCharts = selectedChart
        ? charts
              .filter((cv) => cv.name === selectedChart.name)
              .sort((a, b) =>
                  versionComparator(a, b, DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.version, SortingOrder.DESC),
              )
        : []

    const onSelectChartVersion = (selected: SelectPickerOptionType) => {
        selectChart(charts.find((chart) => chart.id === selected.value) || selectedChart)
    }

    const options: SelectPickerOptionType[] = filteredCharts.map((chart) => ({
        label: chart.version,
        // Need to confirm once this is truthful
        value: chart.id,
    }))

    const selectedOption: SelectPickerOptionType = selectChart
        ? {
              label: selectedChart?.version,
              value: selectedChart?.id,
          }
        : null

    return (
        <div className="flexbox dc__gap-16 pr-16 py-8">
            <div className="flexbox dc__gap-8 dc__align-items-center">
                <span className="fs-13 fw-4 cn-9">Chart type:</span>
                <ChartSelectorDropdown
                    charts={charts}
                    chartsMetadata={chartsMetadata}
                    selectedChartRefId={selectedChartRefId}
                    selectChart={selectChart}
                    selectedChart={selectedChart}
                    isUnSet={isUnSet}
                />
            </div>
            <div className="flexbox dc__gap-8 dc__align-items-center">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="fs-13 fw-4 cn-9 m-0" id="dt-chart-version-select">
                    Chart version:
                </label>
                {disableVersionSelect ? (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.version}</span>
                ) : (
                    <SelectPicker
                        // TODO: When label is extended
                        inputId="dt-chart-version-select"
                        classNamePrefix="select-chart-version"
                        options={options}
                        value={selectedOption}
                        onChange={onSelectChartVersion}
                        isSearchable={false}
                        variant={SelectPickerVariantType.BORDER_LESS}
                    />
                )}
            </div>
        </div>
    )
}

export default DTChartSelector
