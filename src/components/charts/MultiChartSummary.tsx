import React from 'react'
import { ReactComponent as Forward } from '../../assets/icons/ic-arrow-forward.svg'
import { Select, noop, Toggle, Pencil } from '../common'
import placeHolder from '../../assets/icons/ic-plc-chart.svg'
import { ChartGroupEntry, ChartSummaryHelpers, ChartValuesNativeType, ChartVersionType } from './charts.types'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as EmptyFolder } from '../../assets/icons/img-folder-empty.svg'
import DropDownFilled from '../../assets/icons/ic-dropdown-filled.svg'

interface MultiChartSummaryProps extends ChartSummaryHelpers {
    charts: ChartGroupEntry[]
    configureChartIndex: number
    hideDeployedValues?: boolean
    name?: string
    setChartDetailsUpdate?: React.Dispatch<React.SetStateAction<boolean>>
}

const MultiChartSummary: React.FC<MultiChartSummaryProps> = ({
    charts,
    getChartVersionsAndValues,
    toggleChart,
    configureChart,
    handleChartValueChange,
    handleChartVersionChange,
    chartListing,
    configureChartIndex,
    removeChart,
    hideDeployedValues,
    name,
    setChartDetailsUpdate,
}) => {
    return (
        <div className="chart-group--summary">
            {chartListing && (
                <div className="flex column left border-bottom mb-20">
                    <span className="flex flex-justify w-100 fs-14 cn-9">
                        Group name
                        <Pencil className="pointer" onClick={(e) => setChartDetailsUpdate(true)} />
                    </span>
                    <div className="flex left fw-6 fs-14 mt-8 mb-20">{name}</div>
                </div>
            )}
            {chartListing && (
                <div
                    className={`selected-chart-widget p-12 select-chart cursor ${
                        typeof configureChartIndex !== 'number' ? 'active' : ''
                    }`}
                    style={{ gridTemplateColumns: '40px 1fr 24px' }}
                    onClick={chartListing}
                >
                    <Forward className="rotate anchor" style={{ ['--rotateBy' as any]: '180deg' }} />
                    <div className="anchor ml-18">Select Charts</div>
                    <span />
                </div>
            )}
            {chartListing && (
                <div className="chart-count flex left column">
                    <b>{charts.length} charts selected</b>
                    <span>Set default chart version and values for each chart.</span>
                </div>
            )}
            {!chartListing && charts.length === 0 && (
                <div className="flex column" style={{ height: '100%' }}>
                    <EmptyFolder />
                    <p>No charts here.</p>
                    <p>Edit group to add charts.</p>
                </div>
            )}
            {charts.length > 0 && (
                <div className="overflow selected-widgets-container">
                    {charts?.map((chart: ChartGroupEntry, index) => (
                        <SelectedChartWidget
                            selectChart={configureChart ? (e) => configureChart(index) : null}
                            selectChartVersion={
                                handleChartVersionChange
                                    ? (e) => {
                                          handleChartVersionChange(index, e.target.value)
                                      }
                                    : null
                            }
                            selectChartValues={({ kind, id }) =>
                                id === chart.appStoreValuesVersionId ? noop : handleChartValueChange(index, kind, id)
                            }
                            key={index}
                            remove={removeChart ? (e) => removeChart(index) : null}
                            toggleChart={
                                toggleChart && configureChartIndex !== index ? (e) => toggleChart(index) : null
                            }
                            chart={chart}
                            selected={configureChartIndex === index}
                            getChartVersionsAndValues={
                                getChartVersionsAndValues ? () => getChartVersionsAndValues(chart.id, index) : null
                            }
                            hideDeployedValues={hideDeployedValues}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface SelectedChartWidget {
    chart: ChartGroupEntry
    remove?: (...args) => void
    selectChartVersion?: (...args) => void
    selectChartValues?: (...args) => void
    toggleChart?: (...args) => void
    selectChart?: (...args) => void
    getChartVersionsAndValues?: (...args) => Promise<void>
    selected: boolean
    hideDeployedValues?: boolean
}

const SelectedChartWidget: React.FC<SelectedChartWidget> = ({
    chart,
    remove,
    selectChart,
    selectChartVersion,
    selectChartValues,
    toggleChart,
    getChartVersionsAndValues,
    selected,
    hideDeployedValues,
}) => {
    const {
        chartMetaData: { chartName, chartRepoName, icon },
        kind,
        appStoreValuesVersionId,
        appStoreApplicationVersionId,
        appStoreValuesVersionName,
        availableChartVersions,
        isEnabled,
        availableChartValues,
        appStoreApplicationVersion,
        appStoreValuesChartVersion,
    } = chart

    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    function handleChartValues(e) {
        const [kind, id] = e.target.value.split('..')
        selectChartValues({ kind, id: Number(id) })
    }

    function configureChart(e) {
        const className = e.target.getAttribute('class') || ''
        e.stopPropagation()
        if (
            !(
                className.includes('popup-botton') ||
                className.includes('select-button') ||
                className.includes('select-button-sort-image') ||
                className.includes('select__option') ||
                className.includes('trash') ||
                className.includes('toggle__switch') ||
                className.includes('toggle__input') ||
                className.includes('toggle__slider') ||
                className.includes('values-option') ||
                className.includes('values-option__name-version') ||
                className.includes('values-option__env') ||
                className.includes('select__check-icon')
            )
        ) {
            selectChart()
        }
    }

    let availableChartValuesCopy = JSON.parse(JSON.stringify(chart.availableChartValues || []))
    let chartValuesDropDown = availableChartValuesCopy.map((chartValuesObj) => {
        if (chartValuesObj.kind === 'DEFAULT') {
            chartValuesObj.values = chartValuesObj.values.filter((e) => e.id === chart.appStoreApplicationVersionId)
        }
        return chartValuesObj
    })

    if (hideDeployedValues) {
        chartValuesDropDown = chartValuesDropDown.filter((arr) => arr.kind !== 'DEPLOYED')
    }

    let selectedChartValue: ChartValuesNativeType = {
        id: appStoreApplicationVersionId,
        name: appStoreValuesVersionName || 'Default',
        chartVersion: appStoreValuesChartVersion,
    }

    let selectecChartVersion: ChartVersionType = {
        id: appStoreApplicationVersionId,
        version: appStoreApplicationVersion,
    }

    //appStoreValuesVersionId does not exist in case of default chart Value
    //availableChartValues Async Call
    if (appStoreValuesVersionId && availableChartValues.length) {
        let chartValuesArr = availableChartValues.find(({ kind: k }) => kind === k)
        selectedChartValue = chartValuesArr?.values.find(({ id }) => id === appStoreValuesVersionId)
    }

    if (availableChartVersions.length) {
        selectecChartVersion = availableChartVersions.find(({ id }) => id === appStoreApplicationVersionId)
    }

    return (
        <div
            className={`selected-chart-widget pointer ${selected ? 'active' : ''} ${
                chart?.name?.error || chart?.environment?.error ? 'selected-chart-widget--error' : ''
            }`}
        >
            <div className="p-12 flex left" onClick={configureChart}>
                <div className="chart-bg">
                    <img className="chart-icon" src={icon || ''} alt="" onError={handleImageError} />
                    <Warning className="chart-warn" />
                </div>
                <div className="flex left column ml-18">
                    <b className="chart-name">
                        {chartRepoName}/{chartName}
                    </b>
                    {chart.isEnabled && (
                        <>
                            {selectChartValues && selectChartVersion ? (
                                <>
                                    <Select
                                        autoWidth={false}
                                        rootClassName="multi-chart-summary__versions-select"
                                        onChange={selectChartVersion}
                                        value={appStoreApplicationVersionId}
                                    >
                                        {!availableChartVersions?.length && (
                                            <Select.Async api={getChartVersionsAndValues} />
                                        )}
                                        <Select.Button arrowAsset={DropDownFilled}>
                                            Version:
                                            <span className="ml-5 select-button__selected-option">
                                                v{selectecChartVersion.version}
                                            </span>
                                        </Select.Button>
                                        {availableChartVersions?.map(({ id, version }) => (
                                            <Select.Option key={id} value={id}>
                                                {version}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <Select
                                        autoWidth={false}
                                        rootClassName="multi-chart-summary__versions-select"
                                        onChange={handleChartValues}
                                        value={`${kind}..${appStoreValuesVersionId}`}
                                    >
                                        {!chartValuesDropDown?.length && (
                                            <Select.Async api={getChartVersionsAndValues} />
                                        )}
                                        <Select.Button arrowAsset={DropDownFilled}>
                                            Values:
                                            <span
                                                className="ml-5 select-button__selected-option ellipsis-right"
                                                style={{ maxWidth: '95px' }}
                                            >
                                                {selectedChartValue.name} {selectedChartValue.chartVersion}
                                            </span>
                                        </Select.Button>
                                        {chartValuesDropDown?.map(({ kind, values }) => (
                                            <Select.OptGroup key={kind} label={kind === 'TEMPLATE' ? 'CUSTOM' : kind}>
                                                {values?.map(({ chartVersion, id, name, environmentName }) => (
                                                    <Select.Option key={`${kind}..${id}`} value={`${kind}..${id}`}>
                                                        <div className="flex left column values-option">
                                                            <span
                                                                style={{ color: 'var(--N900)', fontSize: '14px' }}
                                                                className="values-option__name-version "
                                                            >
                                                                {name} ({chartVersion})
                                                            </span>
                                                            {environmentName && (
                                                                <span
                                                                    style={{ color: '#404040', fontSize: '12px' }}
                                                                    className="values-option__env"
                                                                >
                                                                    ENV: {environmentName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Select.Option>
                                                ))}
                                                {(!values || values?.length === 0) && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="select__option-with-subtitle select__option-with-subtitle--empty-state"
                                                    >
                                                        No Results
                                                    </div>
                                                )}
                                            </Select.OptGroup>
                                        ))}
                                    </Select>
                                </>
                            ) : (
                                <div className="flex left column">
                                    <div className="version-values-label">Version: v{selectecChartVersion.version}</div>
                                    <div className="version-values-label">
                                        Values: {selectedChartValue.name} {selectedChartValue.chartVersion}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {!chart.isEnabled && <span>Enable to deploy</span>}
                </div>
            </div>
            {remove ? (
                <div className="trash-container">
                    <Trash className="icon-dim-20 cursor" onClick={remove} />
                </div>
            ) : toggleChart ? (
                <div className="toggle-container">
                    <Toggle onSelect={toggleChart} selected={isEnabled} />
                </div>
            ) : (
                <span />
            )}
        </div>
    )
}

export default MultiChartSummary
