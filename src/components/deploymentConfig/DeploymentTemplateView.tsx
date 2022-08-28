import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { NavLink } from 'react-router-dom'
import ReactSelect, { components } from 'react-select'
import { MODES, URLS } from '../../config'
import { ConditionalWrap, Progressing, showError, sortObjectArrayAlphabetically } from '../common'
import { DropdownIndicator, Option } from '../v2/common/ReactSelect.utils'
import { ReactComponent as Upload } from '../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as Arrows } from '../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import CodeEditor from '../CodeEditor/CodeEditor'
import { OptionType } from '../app/types'
import { getDeploymentTemplate } from '../EnvironmentOverride/service'
import YAML from 'yaml'

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
            ? `Compare values with values on other environments or previous deployments on ${environmentName}`
            : 'Compare values with values on other environments'
    }

    return (
        <>
            <h2 className="fs-12 fw-6 lh-18 m-0">Nothing to compare with</h2>
            <p className="fs-12 fw-4 lh-18 m-0">
                {isEnvOverride
                    ? 'No other environments or previous deployments available'
                    : 'No other environments available'}
            </p>
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
    charts,
    selectedChart,
    selectChart,
    selectedChartRefId,
}: {
    isUnSet: boolean
    charts: { id: number; version: string; name: string }[]
    selectedChart: { id: number; version: string; name: string }
    selectChart: React.Dispatch<React.SetStateAction<{ id: number; version: string; name: string }>>
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
                    onChange={(selected) => selectChart(selected as { id: number; version: string; name: string })}
                />
            </div>
        </div>
    )
}

const CompareOptions = ({
    isComparisonAvailable,
    environmentName,
    isEnvOverride,
    openComparison,
    handleComparisonClick,
    fetchingReadMe,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
}: {
    isComparisonAvailable: boolean
    environmentName: string
    isEnvOverride?: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    fetchingReadMe: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
}) => {
    return (
        <div className="flex">
            <Tippy
                className="default-tt w-200"
                arrow={false}
                placement="bottom"
                content={getComparisonTippyContent(isComparisonAvailable, environmentName, isEnvOverride)}
            >
                {renderComparisonOption(openComparison, handleComparisonClick, !isComparisonAvailable)}
            </Tippy>
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
    charts: {
        id: number
        version: string
        name: string
    }[]
    selectedChart: {
        id: number
        version: string
        name: string
    }
    selectChart: React.Dispatch<
        React.SetStateAction<{
            id: number
            version: string
            name: string
        }>
    >
    selectedChartRefId: number
}) => {
    return (
        <div className="dt-options-tab-container flex content-space pl-16 pr-16 pt-8 pb-8">
            {!openComparison && !openReadMe ? (
                <ChartTypeVersionOptions
                    isUnSet={isUnSet}
                    charts={charts}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={selectedChartRefId}
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

const CompareWithDropdown = ({ environments, selectedEnvironment, setSelectedEnvironment }) => {
    useEffect(() => {
        if (!selectedEnvironment) {
            setSelectedEnvironment(environments[0])
        }
    }, [])

    return (
        <ReactSelect
            options={environments}
            isMulti={false}
            // getOptionLabel={(option) => `${option.environmentName}`}
            // getOptionValue={(option) => `${option.environmentId}`}
            value={selectedEnvironment}
            isSearchable={false}
            onChange={(selected) => setSelectedEnvironment(selected)}
            components={{
                IndicatorSeparator: null,
                Option,
                DropdownIndicator,
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

const getCodeEditorHeight = (isUnSet: boolean, openComparison: boolean, showReadme: boolean) => {
    if (openComparison || showReadme) {
        return 'calc(100vh - 158px)'
    }

    return isUnSet ? 'calc(100vh - 242px)' : 'calc(100vh - 210px)'
}

export const DeploymentTemplateEditorView = ({
    appId,
    isUnSet,
    openComparison,
    showReadme,
    chartConfigLoading,
    readme,
    tempFormData,
    editorOnChange,
    schemas,
    selectedChart,
    environments,
    fetchedValues,
    setFetchedValues,
}) => {
    const [fetchingValues, setFetchingValues] = useState(false)
    const [selectedEnvironment, setSelectedEnvironment] = useState<OptionType>()

    useEffect(() => {
        if (selectedEnvironment && !fetchedValues[selectedEnvironment.value]) {
            setFetchingValues(true)
            getDeploymentTemplate(appId, selectedEnvironment.value, selectedChart.id)
                .then(({ result }) => {
                    const _fetchedValues = {
                        ...fetchedValues,
                        [selectedEnvironment.value]: YAML.stringify(result?.environmentConfig?.envOverrideValues || result?.globalConfig),
                    }
                    setFetchedValues(_fetchedValues)
                    setFetchingValues(false)
                })
                .catch((err) => {
                    showError(err)
                    setFetchingValues(false)
                })
        }
    }, [selectedEnvironment])

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
                    defaultValue={fetchedValues[selectedEnvironment?.value] || ''}
                    value={tempFormData}
                    onChange={editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={schemas}
                    loading={chartConfigLoading || !tempFormData || fetchingValues}
                    height={getCodeEditorHeight(isUnSet, openComparison, showReadme)}
                    diffView={openComparison}
                >
                    {isUnSet && !openComparison && !showReadme && (
                        <CodeEditor.Warning text={'Chart type cannot be changed once saved.'} />
                    )}
                    {showReadme && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <div className="flex fs-12 fw-6 cn-9">
                                <Edit className="icon-dim-16 mr-10" />
                                Base deployment template {selectedChart ? `(${selectedChart.version})` : ''}
                            </div>
                        </CodeEditor.Header>
                    )}
                    {openComparison && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <>
                                <div className="flex left fs-12 fw-6 cn-9 border-right h-32">
                                    <span style={{ width: '85px' }}>Compare with: </span>
                                    <CompareWithDropdown
                                        environments={environments.map((env) => ({
                                            label: env.environmentName,
                                            value: env.environmentId,
                                        }))}
                                        selectedEnvironment={selectedEnvironment}
                                        setSelectedEnvironment={setSelectedEnvironment}
                                    />
                                </div>
                                <div className="flex left fs-12 fw-6 cn-9 pl-16 h-32">
                                    <Edit className="icon-dim-16 mr-10" />
                                    Base deployment template {selectedChart ? `(${selectedChart.version})` : ''}
                                </div>
                            </>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        </>
    )
}
