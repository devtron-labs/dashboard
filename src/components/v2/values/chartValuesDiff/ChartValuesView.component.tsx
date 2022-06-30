import React, { useState, useEffect } from 'react'
import ReactSelect, { components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../common/ReactSelect.utils'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as ErrorExclamation } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Refetch } from '../../../../assets/icons/ic-restore.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled-prple.svg'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import { ChartValuesSelect } from '../../../charts/util/ChartValueSelect'
import { ConfirmationDialog, DeleteDialog, DetailsProgressing, Progressing, Select, showError } from '../../../common'
import {
    ChartEnvironmentSelectorType,
    ChartRepoSelectorType,
    ChartVersionSelectorType,
    ChartValuesSelectorType,
    ChartVersionValuesSelectorType,
    ChartValuesEditorType,
    ChartRepoDetailsType,
    ChartProjectSelectorType,
    ChartGroupOptionType,
    ChartValuesDiffOptionType,
    ChartRepoOptions,
    ChartKind,
    ChartValuesViewActionTypes,
    ChartValuesViewAction,
} from './ChartValuesView.type'
import { getChartsByKeyword, getChartValues } from '../../../charts/charts.service'
import CodeEditor from '../../../CodeEditor/CodeEditor'
import { NavLink } from 'react-router-dom'
import { Moment12HourFormat, URLS } from '../../../../config'
import Tippy from '@tippyjs/react'
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails'
import moment from 'moment'
import { getDeploymentManifestDetails } from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import YAML from 'yaml'
import EmptyState from '../../../EmptyState/EmptyState'

export const ChartEnvironmentSelector = ({
    isExternal,
    isDeployChartView,
    installedAppInfo,
    releaseInfo,
    isUpdate,
    selectedEnvironment,
    handleEnvironmentSelection,
    environments,
    invalidaEnvironment,
}: ChartEnvironmentSelectorType): JSX.Element => {
    return !isDeployChartView ? (
        <div className="chart-values__environment-container mb-12">
            <h2 className="chart-values__environment-label fs-13 fw-4 lh-20 cn-7">Environment</h2>
            {isExternal ? (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">
                    {installedAppInfo
                        ? installedAppInfo.environmentName
                        : releaseInfo.deployedAppDetail.environmentDetail.clusterName +
                          '__' +
                          releaseInfo.deployedAppDetail.environmentDetail.namespace}
                </span>
            ) : (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">{selectedEnvironment.label}</span>
            )}
        </div>
    ) : (
        <div className="form__row form__row--w-100 fw-4">
            <span className="form__label required-field">Deploy to environment</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                classNamePrefix="values-environment-select"
                placeholder="Select Environment"
                value={selectedEnvironment}
                styles={getCommonSelectStyle()}
                onChange={handleEnvironmentSelection}
                options={environments}
            />
            {invalidaEnvironment && renderValidationErrorLabel()}
        </div>
    )
}

export const ChartProjectSelector = ({
    isDeployChartView,
    selectedProject,
    handleProjectSelection,
    projects,
    invalidProject,
}: ChartProjectSelectorType): JSX.Element => {
    return !isDeployChartView ? (
        <div className="chart-values__project-container mb-12">
            <h2 className="chart-values__project-label fs-13 fw-4 lh-20 cn-7">Project</h2>
            <span className="chart-values__project-name fs-13 fw-6 lh-20 cn-9">{selectedProject.label}</span>
        </div>
    ) : (
        <label className="form__row form__row--w-100 fw-4">
            <span className="form__label required-field">Project</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                placeholder="Select Project"
                value={selectedProject}
                styles={getCommonSelectStyle()}
                onChange={handleProjectSelection}
                options={projects}
            />
            {invalidProject && renderValidationErrorLabel()}
        </label>
    )
}

export const ChartRepoSelector = ({
    isExternal,
    installedAppInfo,
    isUpdate,
    repoChartValue,
    handleRepoChartValueChange,
    chartDetails,
}: ChartRepoSelectorType) => {
    const [repoChartAPIMade, setRepoChartAPIMade] = useState(false)
    const [repoChartOptions, setRepoChartOptions] = useState<ChartRepoOptions[] | null>(
        isExternal && !installedAppInfo ? [] : [chartDetails],
    )
    const [refetchingCharts, setRefetchingCharts] = useState(false)

    async function handleRepoChartFocus(refetch: boolean) {
        if (!repoChartAPIMade || refetch) {
            try {
                const { result } = await getChartsByKeyword(chartDetails.chartName)
                filterMatchedCharts(result)
            } catch (e) {
                filterMatchedCharts([])
            } finally {
                setRepoChartAPIMade(true)
                setRefetchingCharts(false)
            }
        }
    }

    function refetchCharts() {
        setRefetchingCharts(true)
        handleRepoChartFocus(true)
    }

    function filterMatchedCharts(matchedCharts) {
        if (repoChartOptions !== null) {
            const deprecatedCharts = []
            const nonDeprecatedCharts = []
            for (let i = 0; i < matchedCharts.length; i++) {
                if (matchedCharts[i].deprecated) {
                    deprecatedCharts.push(matchedCharts[i])
                } else {
                    nonDeprecatedCharts.push(matchedCharts[i])
                }
            }
            setRepoChartOptions(nonDeprecatedCharts.concat(deprecatedCharts))
            return nonDeprecatedCharts.concat(deprecatedCharts)
        }
        return []
    }

    async function repoChartLoadOptions(inputValue: string, callback) {
        try {
            const { result } = await getChartsByKeyword(inputValue)
            callback(filterMatchedCharts(result))
        } catch (err) {
            callback(filterMatchedCharts([]))
        }
    }

    function repoChartSelectOptionLabel({ chartRepoName, chartName, version }: ChartRepoDetailsType) {
        return <div>{!chartRepoName ? `${chartName} (${version})` : `${chartRepoName}/${chartName}`}</div>
    }

    function repoChartOptionLabel(props: any) {
        const { innerProps, innerRef } = props
        const isCurrentlySelected = props.data.chartId === repoChartValue.chartId
        return (
            <div
                ref={innerRef}
                {...innerProps}
                className="repochart-dropdown-wrap"
                style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isCurrentlySelected ? 'var(--B100)' : props.isFocused ? 'var(--N100)' : 'white',
                    color: isCurrentlySelected ? 'var(--B500)' : 'var(--N900)',
                }}
            >
                <div className="flex left">
                    <span>
                        {props.data.chartRepoName}/{props.data.chartName}
                    </span>
                </div>
                {props.data.deprecated && <div className="dropdown__deprecated-text">Chart deprecated</div>}
            </div>
        )
    }

    function customMenuListItem(props: any): JSX.Element {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="flex react-select__bottom bcn-0">
                    <div className="sticky-information__bottom">
                        <div className="sticky-information__icon mt-2">
                            <Info className="icon-dim-16" />
                        </div>
                        <div className="sticky-information__note fs-13">
                            Unable to find the desired chart? To connect or re-sync a repo.&nbsp;
                            <NavLink to={URLS.GLOBAL_CONFIG_CHART} target="_blank" className="fw-6">
                                Go to chart repository
                            </NavLink>
                        </div>
                    </div>
                </div>
            </components.MenuList>
        )
    }

    return (
        (isExternal || isUpdate) && (
            <div className="form__row form__row--w-100">
                <div className="flex content-space">
                    <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart</span>
                    <Tippy
                        className="default-tt "
                        arrow={false}
                        content="Fetch latest charts from connected chart repositories"
                    >
                        <span
                            className={`refetch-charts cb-5 cursor text-underline ${
                                refetchingCharts ? 'refetching' : ''
                            }`}
                            onClick={refetchCharts}
                        >
                            {refetchingCharts ? <Refetch className="icon-dim-20" /> : 'Refetch Charts'}
                        </span>
                    </Tippy>
                </div>
                <div className="repo-chart-selector flex">
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={repoChartOptions}
                        isSearchable={false}
                        formatOptionLabel={repoChartSelectOptionLabel}
                        value={repoChartValue}
                        loadOptions={repoChartLoadOptions}
                        onFocus={() => handleRepoChartFocus(false)}
                        onChange={handleRepoChartValueChange}
                        noOptionsMessage={() => 'No matching results'}
                        isLoading={!repoChartAPIMade || refetchingCharts}
                        components={{
                            IndicatorSeparator: null,
                            LoadingIndicator: null,
                            Option: repoChartOptionLabel,
                            MenuList: customMenuListItem,
                        }}
                        styles={getCommonSelectStyle()}
                    />
                </div>
                {repoChartValue.deprecated && (
                    <div className="chart-deprecated-wrapper flex top left br-4 cn-9 bcy-1 mt-12">
                        <div className="icon-dim-16 mr-10">
                            <Error className="icon-dim-16 chart-deprecated-icon" />
                        </div>
                        <span className="chart-deprecated-text fs-12 fw-4">
                            This chart has been deprecated. Please select another chart to continue receiving updates.
                        </span>
                    </div>
                )}
                {isExternal && !installedAppInfo && !repoChartValue.chartRepoName && (
                    <div className="no-helm-chart-linked flex top left br-4 cn-9 bcr-1 mt-12">
                        <div className="icon-dim-16 mr-10">
                            <Error className="icon-dim-16" />
                        </div>
                        <span className="no-helm-chart-linked-text fs-12 fw-4 cn-9">
                            This app is not linked to a helm chart. Select a helm chart to keep up with latest chart
                            versions.
                        </span>
                    </div>
                )}
            </div>
        )
    )
}

export const ChartVersionSelector = ({
    selectedVersion,
    chartVersionObj,
    selectedVersionUpdatePage,
    handleVersionSelection,
    chartVersionsData,
}: ChartVersionSelectorType) => {
    return (
        <div className="w-100 mb-12">
            <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart Version</span>
            <Select
                tabIndex={4}
                rootClassName="select-button--default chart-values-selector"
                value={selectedVersionUpdatePage?.id || selectedVersion}
                onChange={(event) => {
                    handleVersionSelection(event.target.value, {
                        id: event.target.value,
                        version: event.target.innerText,
                    })
                }}
            >
                <Select.Button>{selectedVersionUpdatePage?.version || chartVersionObj?.version}</Select.Button>
                {chartVersionsData.map((_chartVersion) => (
                    <Select.Option key={_chartVersion.id} value={_chartVersion.id}>
                        {_chartVersion.version}
                    </Select.Option>
                ))}
            </Select>
        </div>
    )
}

export const ChartValuesSelector = ({
    chartValuesList,
    chartValues,
    redirectToChartValues,
    handleChartValuesSelection,
    hideVersionFromLabel,
}: ChartValuesSelectorType) => {
    return (
        <div className="w-100 mb-12">
            <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart Values</span>
            <ChartValuesSelect
                className="chart-values-selector"
                chartValuesList={chartValuesList}
                chartValues={chartValues}
                redirectToChartValues={redirectToChartValues}
                onChange={handleChartValuesSelection}
                hideVersionFromLabel={hideVersionFromLabel}
            />
        </div>
    )
}

export const ChartVersionValuesSelector = ({
    isUpdate,
    selectedVersion,
    selectedVersionUpdatePage,
    handleVersionSelection,
    chartVersionsData,
    chartVersionObj,
    chartValuesList,
    chartValues,
    redirectToChartValues,
    handleChartValuesSelection,
    hideVersionFromLabel,
}: ChartVersionValuesSelectorType) => {
    return (
        <>
            <ChartVersionSelector
                isUpdate={isUpdate}
                selectedVersion={selectedVersion}
                selectedVersionUpdatePage={selectedVersionUpdatePage}
                handleVersionSelection={handleVersionSelection}
                chartVersionsData={chartVersionsData}
                chartVersionObj={chartVersionObj}
            />
            <ChartValuesSelector
                chartValuesList={chartValuesList}
                chartValues={chartValues}
                redirectToChartValues={redirectToChartValues}
                handleChartValuesSelection={handleChartValuesSelection}
                hideVersionFromLabel={hideVersionFromLabel}
            />
        </>
    )
}

export const ActiveReadmeColumn = ({
    fetchingReadMe,
    activeReadMe,
}: {
    fetchingReadMe: boolean
    activeReadMe: string
}) => {
    return (
        <div className="chart-values-view__readme">
            <div className="code-editor__header flex left fs-12 fw-6 cn-7">Readme</div>
            {fetchingReadMe ? (
                <Progressing pageLoader />
            ) : (
                <MarkDown markdown={activeReadMe} className="chart-values-view__readme-markdown" />
            )}
        </div>
    )
}

const formatOptionLabel = (option: { label: string; value: number; info: string; version?: string }): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 ellipsis-right">
                {option.label}&nbsp;{option.version && `(${option.version})`}
            </span>
            {option.info && <small className="cn-6">{option.info}</small>}
        </div>
    )
}

const customValueContainer = (props: any): JSX.Element => {
    return (
        <components.ValueContainer {...props}>
            {props.selectProps.value?.label}&nbsp;
            {props.selectProps.value?.version && `(${props.selectProps.value.version})`}
            {React.cloneElement(props.children[1], {
                style: { position: 'absolute' },
            })}
        </components.ValueContainer>
    )
}

const CompareWithDropdown = ({
    deployedChartValues,
    defaultChartValues,
    deploymentHistoryOptionsList,
    selectedVersionForDiff,
    handleSelectedVersionForDiff,
}: {
    deployedChartValues: ChartValuesDiffOptionType[]
    defaultChartValues: ChartValuesDiffOptionType[]
    deploymentHistoryOptionsList: ChartValuesDiffOptionType[]
    selectedVersionForDiff: ChartValuesDiffOptionType
    handleSelectedVersionForDiff: (selected: ChartValuesDiffOptionType) => void
}) => {
    const [groupedOptions, setGroupedOptions] = useState<ChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])

    useEffect(() => {
        if (deploymentHistoryOptionsList.length > 0) {
            const _groupedOptions = [
                {
                    label: 'Previous deployments',
                    options: deploymentHistoryOptionsList,
                },
                {
                    label: 'Other apps using this chart',
                    options:
                        deployedChartValues.length > 0
                            ? deployedChartValues
                            : [{ label: 'No options', value: 0, info: '' }],
                },
                {
                    label: 'Default values',
                    options:
                        defaultChartValues.length > 0
                            ? defaultChartValues
                            : [{ label: 'No options', value: 0, info: '' }],
                },
            ]
            setGroupedOptions(_groupedOptions)
        } else {
            const _groupedOptions = [
                {
                    label: 'Other apps using this chart',
                    options:
                        deployedChartValues.length > 0
                            ? deployedChartValues
                            : [{ label: 'No options', value: 0, info: '' }],
                },
                {
                    label: 'Default values',
                    options:
                        defaultChartValues.length > 0
                            ? defaultChartValues
                            : [{ label: 'No options', value: 0, info: '' }],
                },
            ]
            setGroupedOptions(_groupedOptions)
        }
    }, [deployedChartValues, defaultChartValues, deploymentHistoryOptionsList])

    return (
        <ReactSelect
            options={groupedOptions}
            isMulti={false}
            isSearchable={false}
            value={selectedVersionForDiff}
            classNamePrefix="compare-values-select"
            isOptionDisabled={(option) => option.value === 0}
            formatOptionLabel={formatOptionLabel}
            components={{
                IndicatorSeparator: null,
                ValueContainer: customValueContainer,
                Option,
            }}
            styles={{
                control: (base) => ({
                    ...base,
                    backgroundColor: 'var(--N100)',
                    border: 'none',
                    boxShadow: 'none',
                    minHeight: '32px',
                }),
                option: (base, state) => ({
                    ...base,
                    color: 'var(--N900)',
                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                }),
                menu: (base) => ({
                    ...base,
                    marginTop: '2px',
                    minWidth: '240px',
                }),
                menuList: (base) => ({
                    ...base,
                    position: 'relative',
                    paddingBottom: 0,
                    paddingTop: 0,
                    maxHeight: '250px',
                }),
                dropdownIndicator: (base, state) => ({
                    ...base,
                    padding: 0,
                    color: 'var(--N400)',
                    transition: 'all .2s ease',
                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }),
                noOptionsMessage: (base) => ({
                    ...base,
                    color: 'var(--N600)',
                }),
            }}
            onChange={handleSelectedVersionForDiff}
        />
    )
}

export const ChartValuesEditor = ({
    loading,
    isExternalApp,
    isDeployChartView,
    appId,
    appName,
    valuesText,
    onChange,
    repoChartValue,
    chartValuesList,
    deploymentHistoryList,
    defaultValuesText,
    showEditorHeader,
    hasChartChanged,
    showInfoText,
    manifestView,
    generatedManifest,
    comparisonView,
    selectedChartValues,
}: ChartValuesEditorType) => {
    const [valuesForDiffState, setValuesForDiffState] = useState<{
        loadingValuesForDiff: boolean
        deployedChartValues: ChartValuesDiffOptionType[]
        defaultChartValues: ChartValuesDiffOptionType[]
        deploymentHistoryOptionsList: ChartValuesDiffOptionType[]
        selectedVersionForDiff: ChartValuesDiffOptionType
        deployedManifest: string
        valuesForDiff: Map<number, string>
        selectedValuesForDiff: string
    }>({
        loadingValuesForDiff: false,
        deployedChartValues: [],
        defaultChartValues: [],
        deploymentHistoryOptionsList: [],
        selectedValuesForDiff: defaultValuesText,
        deployedManifest: '',
        valuesForDiff: new Map<number, string>(),
        selectedVersionForDiff: null,
    })

    useEffect(() => {
        if (!manifestView && chartValuesList.length > 0 && (isDeployChartView || deploymentHistoryList.length > 0)) {
            const deployedChartValues = [],
                defaultChartValues = []
            for (let index = 0; index < chartValuesList.length; index++) {
                const _chartValue = chartValuesList[index]
                if (_chartValue.kind === ChartKind.DEPLOYED && _chartValue.name !== appName) {
                    deployedChartValues.push({
                        label: _chartValue.name,
                        value: _chartValue.id,
                        appStoreVersionId: _chartValue.appStoreVersionId,
                        info: `Deployed on: ${_chartValue.environmentName}`,
                        kind: _chartValue.kind,
                        version: _chartValue.chartVersion,
                    })
                } else if (_chartValue.kind === ChartKind.DEFAULT) {
                    defaultChartValues.push({
                        label: _chartValue.name,
                        value: _chartValue.id,
                        appStoreVersionId: 0,
                        info: '',
                        kind: _chartValue.kind,
                        version: _chartValue.chartVersion,
                    })
                }
            }
            const deploymentHistoryOptionsList = deploymentHistoryList.map((_deploymentHistory) => {
                return {
                    label: moment(new Date(_deploymentHistory.deployedAt.seconds * 1000)).format(Moment12HourFormat),
                    value: _deploymentHistory.version,
                    info: '',
                    version: _deploymentHistory.chartMetadata.chartVersion,
                }
            })

            setValuesForDiffState({
                ...valuesForDiffState,
                deployedChartValues,
                defaultChartValues,
                deploymentHistoryOptionsList,
                selectedVersionForDiff:
                    deploymentHistoryOptionsList.length > 0
                        ? deploymentHistoryOptionsList[0]
                        : deployedChartValues.length > 0
                        ? deployedChartValues[0]
                        : defaultChartValues[0],
            })
        }
    }, [chartValuesList, deploymentHistoryList])

    useEffect(() => {
        if (comparisonView && valuesForDiffState.selectedVersionForDiff) {
            setValuesForDiffState({
                ...valuesForDiffState,
                loadingValuesForDiff: true,
            })
            const selectedVersionForDiff = valuesForDiffState.selectedVersionForDiff
            const _version = manifestView ? deploymentHistoryList[0].version : selectedVersionForDiff.value
            const _currentValues = manifestView
                ? valuesForDiffState.deployedManifest
                : valuesForDiffState.valuesForDiff.get(_version)
            if (!_currentValues) {
                if (
                    selectedVersionForDiff.kind === ChartKind.DEPLOYED ||
                    selectedVersionForDiff.kind === ChartKind.DEFAULT
                ) {
                    getChartValues(_version, selectedVersionForDiff.kind)
                        .then((res) => {
                            const _valuesForDiff = valuesForDiffState.valuesForDiff
                            _valuesForDiff.set(_version, res.result.values)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                loadingValuesForDiff: false,
                                valuesForDiff: _valuesForDiff,
                                selectedValuesForDiff: res.result.values,
                            })
                        })
                        .catch((e) => {
                            showError(e)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                selectedValuesForDiff: '',
                                loadingValuesForDiff: false,
                            })
                        })
                } else {
                    getDeploymentManifestDetails(appId, _version, isExternalApp)
                        .then((res) => {
                            const _valuesForDiff = valuesForDiffState.valuesForDiff
                            const _selectedValues = isExternalApp
                                ? YAML.stringify(JSON.parse(res.result.valuesYaml))
                                : res.result.valuesYaml
                            _valuesForDiff.set(_version, _selectedValues)

                            const _valuesForDiffState = {
                                ...valuesForDiffState,
                                loadingValuesForDiff: false,
                                valuesForDiff: _valuesForDiff,
                                selectedValuesForDiff: _selectedValues,
                            }

                            if (_version === deploymentHistoryList[0].version) {
                                _valuesForDiffState.deployedManifest = res.result.manifest
                            }

                            setValuesForDiffState(_valuesForDiffState)
                        })
                        .catch((e) => {
                            showError(e)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                selectedValuesForDiff: '',
                                loadingValuesForDiff: false,
                            })
                        })
                }
            } else {
                setValuesForDiffState({
                    ...valuesForDiffState,
                    loadingValuesForDiff: false,
                    selectedValuesForDiff: _currentValues,
                })
            }
        }
    }, [comparisonView, valuesForDiffState.selectedVersionForDiff])

    useEffect(() => {
        if (
            (!comparisonView && valuesForDiffState.selectedVersionForDiff) ||
            (comparisonView && !valuesForDiffState.selectedVersionForDiff)
        ) {
            setValuesForDiffState({
                ...valuesForDiffState,
                selectedVersionForDiff:
                    valuesForDiffState.deploymentHistoryOptionsList.length > 0
                        ? valuesForDiffState.deploymentHistoryOptionsList[0]
                        : valuesForDiffState.deployedChartValues.length > 0
                        ? valuesForDiffState.deployedChartValues[0]
                        : valuesForDiffState.defaultChartValues[0],
            })
        }
    }, [comparisonView])

    const handleSelectedVersionForDiff = (selected: ChartValuesDiffOptionType) => {
        if (selected.value !== valuesForDiffState.selectedVersionForDiff.value) {
            setValuesForDiffState({
                ...valuesForDiffState,
                selectedVersionForDiff: selected,
            })
        }
    }

    const getDynamicHeight = () => {
        if (isDeployChartView && (!showInfoText || showEditorHeader)) {
            return 'height: calc(100vh - 130px)'
        } else if (isDeployChartView || (!isDeployChartView && (!showInfoText || showEditorHeader))) {
            return 'height: calc(100vh - 162px)'
        } else {
            return 'height: calc(100vh - 196px)'
        }
    }

    return (
        <div
            className={`code-editor-container ${
                showInfoText && (hasChartChanged || manifestView) ? 'code-editor__info-enabled' : ''
            }`}
        >
            {comparisonView && (
                <div className="code-editor__header chart-values-view__diff-view-header">
                    <div className="chart-values-view__diff-view-default flex left fs-12 fw-6 cn-7">
                        {manifestView ? (
                            <span>Deployed manifest</span>
                        ) : (
                            <>
                                <span style={{ width: '90px' }}>Compare with: </span>
                                <CompareWithDropdown
                                    deployedChartValues={valuesForDiffState.deployedChartValues}
                                    defaultChartValues={valuesForDiffState.defaultChartValues}
                                    deploymentHistoryOptionsList={valuesForDiffState.deploymentHistoryOptionsList}
                                    selectedVersionForDiff={valuesForDiffState.selectedVersionForDiff}
                                    handleSelectedVersionForDiff={handleSelectedVersionForDiff}
                                />
                            </>
                        )}
                    </div>
                    <div className="chart-values-view__diff-view-current flex left fs-12 fw-6 cn-7 pl-12">
                        {manifestView ? (
                            <span>Manifest output for YAML</span>
                        ) : (
                            <>
                                <Edit className="icon-dim-16 mr-10" />
                                values.yaml&nbsp;
                                {(selectedChartValues?.chartVersion || repoChartValue?.version) &&
                                    `(${selectedChartValues?.chartVersion || repoChartValue?.version})`}
                            </>
                        )}
                    </div>
                </div>
            )}
            <CodeEditor
                defaultValue={
                    comparisonView
                        ? manifestView
                            ? valuesForDiffState.deployedManifest
                            : valuesForDiffState.selectedValuesForDiff
                        : ''
                }
                value={manifestView ? generatedManifest : valuesText}
                diffView={comparisonView}
                noParsing
                mode="yaml"
                onChange={onChange}
                loading={loading || valuesForDiffState.loadingValuesForDiff}
                customLoader={
                    <DetailsProgressing size={32}>
                        {manifestView && !comparisonView && (
                            <span className="fs-13 fw-4 cn-7 mt-8 align-center">
                                Generating the manifest. <br /> Please wait...
                            </span>
                        )}
                    </DetailsProgressing>
                }
                height={getDynamicHeight()}
                readOnly={manifestView}
            >
                {showEditorHeader && (
                    <CodeEditor.Header>
                        <div className="flex fs-12 fw-6 cn-7">
                            <Edit className="icon-dim-16 mr-10" />
                            values.yaml
                        </div>
                    </CodeEditor.Header>
                )}
                {!manifestView && showInfoText && hasChartChanged && (
                    <CodeEditor.Warning
                        className="ellipsis-right"
                        text={`Please ensure that the values are compatible with "${repoChartValue.chartRepoName}/${repoChartValue.chartName}"`}
                    />
                )}
                {manifestView && showInfoText && (
                    <CodeEditor.Information
                        className="ellipsis-right"
                        text="Manifest is generated locally from the YAML."
                    >
                        <Tippy
                            className="default-tt w-250"
                            arrow={false}
                            placement="bottom"
                            content={
                                'This manifest is generated locally from the YAML. Server-side testing of chart validity (e.g. whether an API is supported) is NOT done. K8s version based templating may be different depending on cluster version.'
                            }
                        >
                            <span className="cursor cb-5 fw-6">&nbsp;Know more</span>
                        </Tippy>
                    </CodeEditor.Information>
                )}
            </CodeEditor>
        </div>
    )
}

export const DeleteChartDialog = ({
    appName,
    handleDelete,
    toggleConfirmation,
}: {
    appName: string
    handleDelete: (force?: boolean) => void
    toggleConfirmation: () => void
}) => {
    return (
        <DeleteDialog
            title={`Delete '${appName}' ?`}
            delete={() => handleDelete(false)}
            closeDelete={toggleConfirmation}
        >
            <DeleteDialog.Description>
                <p>This will delete all resources associated with this application.</p>
                <p>Deleted applications cannot be restored.</p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}

export const AppNotLinkedDialog = ({
    close,
    update,
}: {
    close: () => void
    update: (forceUpdate: boolean) => void
}) => {
    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warn} />
            <ConfirmationDialog.Body title="This app is not linked to a helm chart">
                <p className="fs-13 cn-7 lh-1-54">
                    We strongly recommend linking the app to a helm chart for better application management.
                </p>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <div className="flex right">
                    <button type="button" className="cta cancel" onClick={close}>
                        Go back
                    </button>
                    <button
                        type="button"
                        className="cta ml-12 no-decor"
                        onClick={() => {
                            close()
                            update(true)
                        }}
                    >
                        Deploy without linking helm chart
                    </button>
                </div>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

const renderValidationErrorLabel = (message?: string): JSX.Element => {
    return (
        <div className="error-label flex left align-start fs-11 fw-4 mt-6">
            <div className="error-label-icon">
                <Error className="icon-dim-16" />
            </div>
            <div className="ml-4 cr-5">{message ? message : 'This is a required field'}</div>
        </div>
    )
}

export const AppNameInput = ({
    appName,
    handleAppNameChange,
    handleAppNameOnBlur,
    invalidAppName,
    invalidAppNameMessage,
}: {
    appName: string
    handleAppNameChange: (newAppName: string) => void
    handleAppNameOnBlur: () => void
    invalidAppName: boolean
    invalidAppNameMessage: string
}) => {
    return (
        <label className="form__row form__row--w-100">
            <span className="form__label required-field">App Name</span>
            <input
                autoComplete="off"
                tabIndex={1}
                placeholder="Eg. app-name"
                className="form__input"
                value={appName}
                onChange={(e) => handleAppNameChange(e.target.value)}
                onBlur={() => handleAppNameOnBlur()}
            />
            {invalidAppName && renderValidationErrorLabel(invalidAppNameMessage)}
        </label>
    )
}

export const DeleteApplicationButton = ({
    isUpdateInProgress,
    isDeleteInProgress,
    dispatch,
}: {
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    dispatch: (action: ChartValuesViewAction) => void
}) => {
    return (
        <button
            className="chart-values-view__delete-cta cta delete"
            disabled={isUpdateInProgress || isDeleteInProgress}
            onClick={(e) =>
                dispatch({
                    type: ChartValuesViewActionTypes.showDeleteAppConfirmationDialog,
                    payload: true,
                })
            }
        >
            {isDeleteInProgress ? (
                <div className="flex">
                    <span>Deleting</span>
                    <span className="ml-10">
                        <Progressing />
                    </span>
                </div>
            ) : (
                'Delete Application'
            )}
        </button>
    )
}

export const UpdateApplicationButton = ({
    isUpdateInProgress,
    isDeleteInProgress,
    isDeployChartView,
    deployOrUpdateApplication,
}: {
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    isDeployChartView: boolean
    deployOrUpdateApplication: (forceUpdate?: boolean) => Promise<void>
}) => {
    return (
        <button
            type="button"
            tabIndex={6}
            disabled={isUpdateInProgress || isDeleteInProgress}
            className={`chart-values-view__update-cta cta ${
                isUpdateInProgress || isDeleteInProgress ? 'disabled' : ''
            }`}
            onClick={() => {
                deployOrUpdateApplication(false)
            }}
        >
            {isUpdateInProgress ? (
                <div className="flex">
                    <span>{isDeployChartView ? 'Deploying chart' : 'Updating and deploying'}</span>
                    <span className="ml-10">
                        <Progressing />
                    </span>
                </div>
            ) : isDeployChartView ? (
                'Deploy chart'
            ) : (
                'Update and deploy'
            )}
        </button>
    )
}

export const ErrorScreenWithInfo = ({ info }: { info: string }) => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <ErrorExclamation className="icon-dim-20 mb-10" />
            </EmptyState.Image>
            <EmptyState.Subtitle>{info}</EmptyState.Subtitle>
        </EmptyState>
    )
}
