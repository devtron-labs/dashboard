import React, { useState, useEffect, useRef } from 'react'
import ReactSelect, { components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { menuList } from '../../../charts/charts.util'
import { DropdownIndicator, styles } from '../../common/ReactSelect.utils'
import { ReactComponent as AlertTriangle } from '../../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Refetch } from '../../../../assets/icons/ic-restore.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled.svg'
import checkIcon from '../../../../assets/icons/appstatus/ic-check.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import { ChartValuesSelect } from '../../../charts/util/ChartValueSelect'
import { ConfirmationDialog, DeleteDialog, Progressing, Select } from '../../../common'
import {
    ChartEnvironmentSelectorType,
    ChartRepoSelectorType,
    ChartDeprecatedType,
    ChartVersionSelectorType,
    ChartValuesSelectorType,
    ChartVersionValuesSelectorType,
    ChartValuesEditorType,
    ChartRepoDetailsType,
    ChartSelectorType,
} from './chartValuesSelectors.type'
import { getChartsByKeyword } from '../../../charts/charts.service'
import { ChartRepoOtions } from '../DeployChart'
import ReadmeColumn from './ReadmeColumn.component'
import CodeEditor from '../../../CodeEditor/CodeEditor'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../../../config'
import { getChartRelatedReadMe } from './chartValues.api'
import { ChartVersionType } from '../../../charts/charts.types'
import Tippy from '@tippyjs/react'
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails'

export const ChartEnvironmentSelector = ({
    isExternal,
    installedAppInfo,
    releaseInfo,
    isUpdate,
    selectedEnvironment,
    selectEnvironment,
    environments,
}: ChartEnvironmentSelectorType): JSX.Element => {
    return isExternal ? (
        <div className="chart-values__environment-container mb-12">
            <h2 className="chart-values__environment-label fs-13 fw-4 lh-20 cn-7">Environment</h2>
            <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">
                {installedAppInfo
                    ? installedAppInfo.environmentName
                    : releaseInfo.deployedAppDetail.environmentDetail.clusterName +
                      '__' +
                      releaseInfo.deployedAppDetail.environmentDetail.namespace}
            </span>
        </div>
    ) : (
        <div className="form__row form__row--w-100">
            <span className="form__label">Environment</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                }}
                isDisabled={!!isUpdate}
                placeholder="Select Environment"
                value={selectedEnvironment}
                styles={{
                    ...styles,
                    ...menuList,
                }}
                onChange={selectEnvironment}
                options={environments}
            />
        </div>
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
    const [repoChartOptions, setRepoChartOptions] = useState<ChartRepoOtions[] | null>(
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
                            Unable to find the desired chart? To connect a chart repo or Re-sync connected repos.&nbsp;
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
                    <span className="form__label fs-13 fw-4 lh-20 cn-7">{isExternal ? 'Chart' : 'Repo/Chart'}</span>
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
                            IndicatorSeparator: () => null,
                            LoadingIndicator: () => null,
                            Option: repoChartOptionLabel,
                            MenuList: customMenuListItem,
                        }}
                        styles={{
                            menuList: (base) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: '32px',
                                boxShadow: 'none',
                                backgroundColor: 'var(--N50)',
                                border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                                cursor: 'pointer',
                            }),
                            option: (base, state) => {
                                return {
                                    ...base,
                                    color: 'var(--N900)',
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                    padding: '10px 12px',
                                }
                            },
                            dropdownIndicator: (base, state) => {
                                return {
                                    ...base,
                                    color: 'var(--N400)',
                                    padding: '0 8px',
                                    transition: 'all .2s ease',
                                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                }
                            },
                            valueContainer: (base, state) => {
                                return {
                                    ...base,
                                    padding: '0 8px',
                                }
                            },
                            loadingMessage: (base) => {
                                return {
                                    ...base,
                                    color: 'var(--N600)',
                                }
                            },
                            noOptionsMessage: (base) => {
                                return {
                                    ...base,
                                    color: 'var(--N600)',
                                }
                            },
                        }}
                    />
                </div>
                {repoChartValue.deprecated && (
                    <div className="chart-deprecated-wrapper flex top left br-4 cn-9 bcy-1 mt-12">
                        <div className="icon-dim-16 mr-10">
                            <AlertTriangle className="icon-dim-16 chart-deprecated-icon" />
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
                        <span className="no-helm-chart-linked-text fs-12 fw-4">
                            This app is not linked to a helm chart. Select a helm chart to keep up with latest chart
                            versions.
                        </span>
                    </div>
                )}
            </div>
        )
    )
}

export const ChartDeprecated = ({ isUpdate, deprecated, chartName, name }: ChartDeprecatedType): JSX.Element => {
    return (
        isUpdate &&
        deprecated && (
            <div className="info__container--update-chart">
                <div className="flex left">
                    <AlertTriangle className="icon-dim-24 update-chart" />
                    <div className="info__container--update-chart-text">
                        {chartName}/{name} is deprecated
                    </div>
                </div>
                <div className="info__container--update-chart-disclaimer">
                    Selected chart has been deprecated. Please select another chart to continue receiving updates in
                    future.
                </div>
            </div>
        )
    )
}

export const ChartVersionSelector = ({
    isUpdate,
    selectedVersion,
    selectVersion,
    chartVersionObj,
    versions,
    selectedVersionUpdatePage,
    setSelectedVersionUpdatePage,
    chartVersionsData,
}: ChartVersionSelectorType) => {
    return !isUpdate ? (
        <div className="w-100 mb-12">
            <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart Version</span>
            <Select
                tabIndex={4}
                rootClassName="select-button--default chart-values-selector"
                value={selectedVersion}
                onChange={(event) => selectVersion(event.target.value)}
            >
                <Select.Button>{chartVersionObj ? chartVersionObj.version : 'Select Version'}</Select.Button>
                {Array.from(versions).map(([versionId, versionData], idx) => (
                    <Select.Option key={versionId} value={versionId}>
                        {versionData.version}
                    </Select.Option>
                ))}
            </Select>
        </div>
    ) : (
        <div className="w-100 mb-12">
            <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart Version</span>
            <Select
                tabIndex={4}
                rootClassName="select-button--default chart-values-selector"
                value={selectedVersionUpdatePage?.id}
                onChange={(event) =>
                    setSelectedVersionUpdatePage({
                        id: event.target.value,
                        version: event.target.innerText,
                    })
                }
            >
                <Select.Button>{selectedVersionUpdatePage?.version}</Select.Button>
                {chartVersionsData.map(({ version, id }) => (
                    <Select.Option key={id} value={id}>
                        {version}
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
    setChartValues,
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
                onChange={setChartValues}
                hideVersionFromLabel={hideVersionFromLabel}
            />
        </div>
    )
}

export const ChartVersionValuesSelector = ({
    isUpdate,
    selectedVersion,
    selectVersion,
    chartVersionObj,
    versions,
    selectedVersionUpdatePage,
    setSelectedVersionUpdatePage,
    chartVersionsData,
    chartValuesList,
    chartValues,
    redirectToChartValues,
    setChartValues,
    hideVersionFromLabel,
}: ChartVersionValuesSelectorType) => {
    return (
        <div className="form__row form__row--flex form__row--w-100">
            <ChartVersionSelector
                isUpdate={isUpdate}
                selectedVersion={selectedVersion}
                selectVersion={selectVersion}
                chartVersionObj={chartVersionObj}
                versions={versions}
                selectedVersionUpdatePage={selectedVersionUpdatePage}
                setSelectedVersionUpdatePage={setSelectedVersionUpdatePage}
                chartVersionsData={chartVersionsData}
            />
            <span className="mr-16"></span>
            <ChartValuesSelector
                chartValuesList={chartValuesList}
                chartValues={chartValues}
                redirectToChartValues={redirectToChartValues}
                setChartValues={setChartValues}
                hideVersionFromLabel={hideVersionFromLabel}
            />
        </div>
    )
}

export const ActiveReadmeColumn = ({
    readmeCollapsed,
    toggleReadmeCollapsed,
    defaultReadme,
    selectedVersionUpdatePage,
}: {
    readmeCollapsed: boolean
    toggleReadmeCollapsed: React.Dispatch<React.SetStateAction<boolean>>
    defaultReadme: string
    selectedVersionUpdatePage: ChartVersionType
}) => {
    const [activeReadMe, setActiveReadMe] = useState<string>(defaultReadme)
    const [fetchingReadMe, setFetchingReadMe] = useState<boolean>(false)

    useEffect(() => {
        if (selectedVersionUpdatePage && selectedVersionUpdatePage.id) {
            getChartRelatedReadMe(selectedVersionUpdatePage.id, setFetchingReadMe, setActiveReadMe)
        }
    }, [selectedVersionUpdatePage])

    return fetchingReadMe ? (
        <Progressing pageLoader />
    ) : (
        <MarkDown markdown={activeReadMe} className="chart-values-view__readme-markdown" />
    )
}

export const ChartValuesEditor = ({
    loading,
    valuesText,
    onChange,
    repoChartValue,
    hasChartChanged,
    parentRef,
    autoFocus,
}: ChartValuesEditorType) => {
    return (
        <div className="code-editor-container">
            <CodeEditor value={valuesText} noParsing mode="yaml" onChange={onChange} loading={loading}>
                {/* <CodeEditor.Header>
                    <span className="bold">values.yaml</span>
                </CodeEditor.Header> */}
                {hasChartChanged && (
                    <CodeEditor.Warning
                        text={`Please ensure that the values are compatible with "${repoChartValue.chartRepoName}/${repoChartValue.chartName}"`}
                    />
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
    toggleConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    return (
        <DeleteDialog
            title={`Delete '${appName}' ?`}
            delete={() => handleDelete(false)}
            closeDelete={() => toggleConfirmation(false)}
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
