import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { NavLink } from 'react-router-dom'
import ReactSelect, { components } from 'react-select'
import { MODES, ROLLOUT_DEPLOYMENT, URLS } from '../../config'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ConditionalWrap,
    isVersionLessThanOrEqualToTarget,
    Progressing,
    showError,
    sortObjectArrayAlphabetically,
} from '../common'
import { DropdownIndicator, Option } from '../v2/common/ReactSelect.utils'
import { ReactComponent as Upload } from '../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as Arrows } from '../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Next } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import CodeEditor from '../CodeEditor/CodeEditor'
import { getDeploymentTemplate } from '../EnvironmentOverride/service'
import YAML from 'yaml'
import { DeploymentChartGroupOptionType, DeploymentChartOptionType, DeploymentChartVersionType } from './types'
import { getTriggerHistory } from '../app/details/cdDetails/service'
import { getCDConfig } from '../../services/service'

const renderReadMeOption = (
    fetchingReadMe: boolean,
    openReadMe: boolean,
    handleReadMeClick: () => void,
    disabled?: boolean,
) => {
    const handleReadMeOptionClick = () => {
        if (fetchingReadMe || disabled) {
            return
        }

        handleReadMeClick()
    }

    return (
        <span
            className={`dt-view-option flex cursor fs-13 fw-6 cn-7 ${openReadMe ? 'opened' : ''} ${
                disabled ? 'disabled' : ''
            }`}
            onClick={handleReadMeOptionClick}
        >
            {openReadMe ? (
                <>
                    <Close className="option-close-icon icon-dim-16 mr-8" />
                    Hide README
                </>
            ) : (
                <>
                    <File className="option-open-icon icon-dim-16 mr-8" />
                    README
                </>
            )}
        </span>
    )
}

const renderComparisonOption = (openComparison: boolean, handleComparisonClick: () => void, disabled: boolean) => {
    const handleComparisonOptionClick = () => {
        if (disabled) {
            return
        }

        handleComparisonClick()
    }

    return (
        <span
            className={`dt-view-option flex cursor fs-13 fw-6 cn-7 mr-10 ${openComparison ? 'opened' : ''} ${
                disabled ? 'disabled' : ''
            }`}
            onClick={handleComparisonOptionClick}
        >
            {openComparison ? (
                <>
                    <Close className="option-close-icon icon-dim-16 mr-8" />
                    Hide comparison
                </>
            ) : (
                <>
                    <Arrows className="option-open-icon icon-dim-16 mr-8" />
                    Compare values
                </>
            )}
        </span>
    )
}

const getComparisonTippyContent = (
    isComparisonAvailable: boolean,
    environmentName: string,
    isEnvOverride?: boolean,
) => {
    if (isComparisonAvailable) {
        return isEnvOverride
            ? `Compare ${environmentName} values with base template values, values on other environments or previous deployments on ${environmentName}`
            : 'Compare base template values with values on other environments'
    }

    return (
        <>
            <h2 className="fs-12 fw-6 lh-18 m-0">Nothing to compare with</h2>
            <p className="fs-12 fw-4 lh-18 m-0">No other environments available</p>
        </>
    )
}

const ChartMenuList = (props) => {
    return (
        <components.MenuList {...props}>
            {props.children}
            <NavLink
                to={URLS.GLOBAL_CONFIG_CUSTOM_CHARTS}
                className="upload-custom-chart-link cb-5 select__sticky-bottom fw-4 fs-13 no-decor bottom-radius-4"
                target="_blank"
                rel="noreferrer noopener"
            >
                <Upload className="icon-dim-16 mr-8 vertical-align-bottom upload-icon-stroke" />
                Upload custom chart
            </NavLink>
        </components.MenuList>
    )
}

export const ChartTypeVersionOptions = ({
    isUnSet,
    disableVersionSelect,
    charts,
    selectedChart,
    selectChart,
    selectedChartRefId,
}: {
    isUnSet: boolean
    disableVersionSelect?: boolean
    charts: DeploymentChartVersionType[]
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    selectedChartRefId: number
}) => {
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

    const groupedChartOptions = [
        {
            label: 'Charts by Devtron',
            options: devtronCharts,
        },
        {
            label: 'Custom charts',
            options: customCharts.length === 0 ? [{ name: 'No options' }] : customCharts,
        },
    ]
    const filteredCharts = selectedChart
        ? charts.filter((cv) => cv.name == selectedChart.name).sort((a, b) => b.id - a.id)
        : []

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                columnGap: '16px',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '75px 1fr',
                    alignItems: 'center',
                }}
            >
                <span className="fs-13 fw-4 cn-9">Chart type:</span>
                {isUnSet ? (
                    <ReactSelect
                        options={groupedChartOptions}
                        isMulti={false}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.name}`}
                        value={selectedChart}
                        classNamePrefix="chart_select"
                        isOptionDisabled={(option) => !option.id}
                        isSearchable={false}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                            MenuList: ChartMenuList,
                        }}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                minHeight: '32px',
                                boxShadow: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }),
                            valueContainer: (base, state) => ({
                                ...base,
                                padding: '0',
                                fontWeight: '600',
                            }),
                            option: (base, state) => {
                                return {
                                    ...base,
                                    color: 'var(--N900)',
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                }
                            },
                            container: (base, state) => {
                                return {
                                    ...base,
                                    width: '100%',
                                }
                            },
                            menu: (base, state) => ({
                                ...base,
                                margin: '0',
                                width: '250px',
                            }),
                            menuList: (base) => {
                                return {
                                    ...base,
                                    position: 'relative',
                                    paddingBottom: '0px',
                                    maxHeight: '250px',
                                }
                            },
                            dropdownIndicator: (base, state) => ({
                                ...base,
                                color: 'var(--N400)',
                                padding: '0 8px',
                                transition: 'all .2s ease',
                                transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            }),
                        }}
                        onChange={(selected) => {
                            let filteredCharts = charts.filter((chart) => chart.name == selected.name)
                            let selectedChart = filteredCharts.find((chart) => chart.id == selectedChartRefId)
                            if (selectedChart) {
                                selectChart(selectedChart)
                            } else {
                                let sortedFilteredCharts = filteredCharts.sort((a, b) => a.id - b.id)
                                selectChart(
                                    sortedFilteredCharts[
                                        sortedFilteredCharts.length ? sortedFilteredCharts.length - 1 : 0
                                    ],
                                )
                            }
                        }}
                    />
                ) : (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.name}</span>
                )}
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '94px 1fr',
                    alignItems: 'center',
                }}
            >
                <span className="fs-13 fw-4 cn-9">Chart version:</span>
                {disableVersionSelect ? (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.version}</span>
                ) : (
                    <ReactSelect
                        options={filteredCharts}
                        isMulti={false}
                        getOptionLabel={(option) => `${option.version}`}
                        getOptionValue={(option) => `${option.id}`}
                        value={selectedChart}
                        isSearchable={false}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            DropdownIndicator,
                        }}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                minHeight: '32px',
                                boxShadow: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }),
                            valueContainer: (base, state) => ({
                                ...base,
                                padding: '0',
                                fontWeight: '600',
                            }),
                            menu: (base, state) => ({
                                ...base,
                                margin: '0',
                                width: '120px',
                            }),
                            option: (base, state) => {
                                return {
                                    ...base,
                                    color: 'var(--N900)',
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                }
                            },
                            container: (base, state) => {
                                return {
                                    ...base,
                                    width: '100%',
                                }
                            },
                            dropdownIndicator: (base, state) => ({
                                ...base,
                                padding: '0 8px',
                                transition: 'all .2s ease',
                                transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            }),
                            loadingMessage: (base) => ({
                                ...base,
                                color: 'var(--N600)',
                            }),
                            noOptionsMessage: (base) => ({
                                ...base,
                                color: 'var(--N600)',
                            }),
                        }}
                        onChange={(selected) => selectChart(selected as DeploymentChartVersionType)}
                    />
                )}
            </div>
        </div>
    )
}

const CompareOptions = ({
    isComparisonAvailable,
    environmentName,
    isEnvOverride,
    showComparisonOption,
    openComparison,
    handleComparisonClick,
    fetchingReadMe,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
}: {
    isComparisonAvailable: boolean
    environmentName: string
    isEnvOverride: boolean
    showComparisonOption: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    fetchingReadMe: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
}) => {
    return (
        <div className="flex">
            {showComparisonOption && (
                <Tippy
                    className="default-tt w-200"
                    arrow={false}
                    placement="bottom"
                    content={getComparisonTippyContent(isComparisonAvailable, environmentName, isEnvOverride)}
                >
                    {renderComparisonOption(openComparison, handleComparisonClick, !isComparisonAvailable)}
                </Tippy>
            )}
            <ConditionalWrap
                condition={
                    !openReadMe && (fetchingReadMe || !isReadMeAvailable)
                    // ||!fetchedReadMe.get(commonState.selectedVersionUpdatePage?.id || 0)
                }
                wrap={() => (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={fetchingReadMe ? 'Fetching...' : 'Readme is not available'}
                    >
                        {renderReadMeOption(fetchingReadMe, openReadMe, handleReadMeClick, !isReadMeAvailable)}
                    </Tippy>
                )}
            >
                {renderReadMeOption(fetchingReadMe, openReadMe, handleReadMeClick)}
            </ConditionalWrap>
        </div>
    )
}

export const DeploymentTemplateOptionsTab = ({
    isComparisonAvailable,
    environmentName,
    isEnvOverride,
    openComparison,
    handleComparisonClick,
    fetchingReadMe,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
    isUnSet,
    charts,
    selectedChart,
    selectChart,
    selectedChartRefId,
    disableVersionSelect,
}: {
    isComparisonAvailable: boolean
    environmentName?: string
    isEnvOverride?: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    fetchingReadMe: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
    isUnSet: boolean
    charts: DeploymentChartVersionType[]
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    selectedChartRefId: number
    disableVersionSelect?: boolean
}) => {
    return (
        <div className="dt-options-tab-container flex content-space pl-16 pr-16 pt-14 pb-14">
            {!openComparison && !openReadMe ? (
                <ChartTypeVersionOptions
                    isUnSet={isUnSet}
                    charts={charts}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={selectedChartRefId}
                    disableVersionSelect={disableVersionSelect}
                />
            ) : (
                <span className="flex fs-13 fw-6 cn-9 h-32">
                    {openComparison ? 'Comparing deployment template' : 'Showing README.md'}
                </span>
            )}
            <CompareOptions
                isComparisonAvailable={isComparisonAvailable}
                environmentName={environmentName}
                isEnvOverride={isEnvOverride}
                showComparisonOption={!disableVersionSelect}
                openComparison={openComparison}
                handleComparisonClick={handleComparisonClick}
                fetchingReadMe={fetchingReadMe}
                openReadMe={openReadMe}
                isReadMeAvailable={isReadMeAvailable}
                handleReadMeClick={handleReadMeClick}
            />
        </div>
    )
}

const formatOptionLabel = (option: DeploymentChartOptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 ellipsis-right">
                {option.label}&nbsp;{option.version && `(${option.version})`}
            </span>
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

const CompareWithDropdown = ({ isEnvOverride, environments, selectedOption, setSelectedOption }) => {
    const [groupedOptions, setGroupedOptions] = useState<DeploymentChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])
    const baseTemplateOption = {
        id: -1,
        value: '',
        label: 'Base deployment template',
    }

    useEffect(() => {
        if (isEnvOverride) {
            setGroupedOptions([
                {
                    label: '',
                    options: [baseTemplateOption],
                },
                {
                    label: 'values on other environments',
                    options: environments.length > 0 ? environments : [{ label: 'No options', value: 0, info: '' }],
                },
            ])

            if (!selectedOption) {
                setSelectedOption(baseTemplateOption)
            }
        } else {
            setGroupedOptions([
                {
                    label: '',
                    options: environments,
                },
            ])

            if (!selectedOption) {
                setSelectedOption(environments[0])
            }
        }
    }, [environments])

    const onChange = (selected: DeploymentChartOptionType) => {
        setSelectedOption(selected)
    }

    return (
        <ReactSelect
            options={groupedOptions}
            isMulti={false}
            value={selectedOption}
            classNamePrefix="compare-template-values-select"
            formatOptionLabel={formatOptionLabel}
            isOptionDisabled={(option) => option.value === 0}
            isSearchable={false}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                Option,
                DropdownIndicator,
                ValueContainer: customValueContainer,
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
        />
    )
}

const getCodeEditorHeight = (
    isUnSet: boolean,
    isEnvOverride: boolean,
    openComparison: boolean,
    showReadme: boolean,
) => {
    if (openComparison || showReadme) {
        return 'calc(100vh - 158px)'
    } else if (isEnvOverride) {
        return 'calc(100vh - 282px)'
    }

    return isUnSet ? 'calc(100vh - 256px)' : 'calc(100vh - 224px)'
}

export const DeploymentTemplateEditorView = ({
    appId,
    envId,
    isUnSet,
    isEnvOverride = false,
    environmentName = '',
    openComparison,
    showReadme,
    chartConfigLoading,
    readme,
    value,
    defaultValue = '',
    editorOnChange,
    schemas,
    selectedChart,
    environments,
    fetchedValues,
    setFetchedValues,
    readOnly = false,
}) => {
    const [fetchingValues, setFetchingValues] = useState(false)
    const [selectedOption, setSelectedOption] = useState<DeploymentChartOptionType>()
    const [filteredEnvironments, setFilteredEnvironments] = useState<DeploymentChartOptionType[]>([])

    useEffect(() => {
        if (environments.length > 0) {
            let _filteredEnvironments = environments
            if (isEnvOverride) {
                _filteredEnvironments = environments.filter((env) => envId !== env.environmentId)
            }

            setFilteredEnvironments(
                (_filteredEnvironments = _filteredEnvironments.map((env) => ({
                    id: env.environmentId,
                    label: env.environmentName,
                    value: env.environmentId,
                }))),
            )
        }
    }, [environments])

    useEffect(() => {
        if (selectedOption && selectedOption.id !== -1 && !fetchedValues[selectedOption.id]) {
            setFetchingValues(true)
            getDeploymentTemplate(appId, selectedOption.value, selectedChart.id)
                .then(({ result }) => {
                    const _fetchedValues = {
                        ...fetchedValues,
                        [selectedOption.id]: YAML.stringify(
                            result?.environmentConfig?.envOverrideValues || result?.globalConfig,
                        ),
                    }
                    setFetchedValues(_fetchedValues)
                    setFetchingValues(false)
                })
                .catch((err) => {
                    showError(err)
                    setFetchingValues(false)
                })
        }
    }, [selectedOption])

    return (
        <>
            {showReadme && (
                <div className="dt-readme border-right">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                    {chartConfigLoading ? (
                        <Progressing pageLoader />
                    ) : (
                        <MarkDown markdown={readme} className="dt-readme-markdown" />
                    )}
                </div>
            )}
            <div className="form__row form__row--code-editor-container border-top border-bottom">
                <CodeEditor
                    defaultValue={(selectedOption?.id === -1 ? defaultValue : fetchedValues[selectedOption?.id]) || ''}
                    value={value}
                    onChange={editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={schemas}
                    loading={chartConfigLoading || !value || fetchingValues}
                    height={getCodeEditorHeight(isUnSet, isEnvOverride, openComparison, showReadme)}
                    diffView={openComparison}
                    readOnly={readOnly}
                >
                    {isUnSet && !openComparison && !showReadme && (
                        <CodeEditor.Warning text={'Chart type cannot be changed once saved.'} />
                    )}
                    {showReadme && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <div className="flex fs-12 fw-6 cn-9">
                                <Edit className="icon-dim-16 mr-10" />
                                {`${isEnvOverride ? environmentName : 'Base deployment template'} ${
                                    selectedChart ? `(${selectedChart.version})` : ''
                                }`}
                            </div>
                        </CodeEditor.Header>
                    )}
                    {openComparison && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <>
                                <div className="flex left fs-12 fw-6 cn-9 border-right h-32">
                                    <span style={{ width: '85px' }}>Compare with: </span>
                                    <CompareWithDropdown
                                        isEnvOverride={isEnvOverride}
                                        environments={filteredEnvironments}
                                        selectedOption={selectedOption}
                                        setSelectedOption={setSelectedOption}
                                    />
                                </div>
                                <div className="flex left fs-12 fw-6 cn-9 pl-16 h-32">
                                    <Edit className="icon-dim-16 mr-10" />
                                    {`${isEnvOverride ? environmentName : 'Base deployment template'} ${
                                        selectedChart ? `(${selectedChart.version})` : ''
                                    }`}
                                </div>
                            </>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        </>
    )
}

export const DeploymentConfigFormCTA = ({
    loading,
    showAppMetricsToggle,
    isAppMetricsEnabled,
    isEnvOverride,
    isCiPipeline,
    disableCheckbox,
    disableButton,
    currentChart,
    toggleAppMetrics,
}: {
    loading: boolean
    showAppMetricsToggle: boolean
    isAppMetricsEnabled: boolean
    isEnvOverride?: boolean
    isCiPipeline?: boolean
    disableCheckbox?: boolean
    disableButton?: boolean
    currentChart: DeploymentChartVersionType
    toggleAppMetrics: () => void
}) => {
    const isUnSupportedChartVersion =
        showAppMetricsToggle &&
        currentChart.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(currentChart.version, [3, 7, 0])
    return (
        <div className="form-cta-section flex right pt-16 pb-16 pr-20 pl-20">
            {showAppMetricsToggle && (
                <div className="form-app-metrics-cta flex top left">
                    {loading ? (
                        <Progressing
                            styles={{
                                width: 'auto',
                                marginRight: '16px',
                            }}
                        />
                    ) : (
                        <Checkbox
                            rootClassName="mt-2 mr-8"
                            isChecked={isAppMetricsEnabled}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={toggleAppMetrics}
                            disabled={disableCheckbox || isUnSupportedChartVersion}
                        />
                    )}
                    <div className="flex column left">
                        <b className="fs-13 fw-6 cn-9 mb-4">Show application metrics</b>
                        <div className={`fs-13 fw-4 ${isUnSupportedChartVersion ? 'cr-5' : 'cn-7'}`}>
                            {isUnSupportedChartVersion
                                ? 'Application metrics is not supported for the selected chart version. Select a different chart version.'
                                : 'Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).'}
                        </div>
                    </div>
                </div>
            )}
            <button className="form-submit-cta cta flex h-32" type="submit" disabled={disableButton || loading}>
                {loading ? (
                    <Progressing />
                ) : (
                    <>
                        {!isEnvOverride && !isCiPipeline ? (
                            <>
                                Save & Next
                                <Next className={`icon-dim-16 ml-5 ${disableButton || loading ? 'scn-4' : 'scn-0'}`} />
                            </>
                        ) : (
                            <>
                                <Check
                                    className={`icon-dim-16 mr-5 no-svg-fill ${
                                        disableButton || loading ? 'scn-4' : 'scn-0'
                                    }`}
                                />
                                Save changes
                            </>
                        )}
                    </>
                )}
            </button>
        </div>
    )
}
