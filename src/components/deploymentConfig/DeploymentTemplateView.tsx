import React, { useEffect, useRef, useState } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect, { components } from 'react-select'
import { DEPLOYMENT, DOCUMENTATION, MODES, ROLLOUT_DEPLOYMENT } from '../../config'
import { RadioGroup, versionComparator } from '../common'
import {
    Checkbox,
    CHECKBOX_VALUE,
    showError,
    Progressing,
    ConditionalWrap,
    InfoColourBar,
    Toggle,
} from '@devtron-labs/devtron-fe-common-lib'
import { DropdownIndicator, Option } from '../v2/common/ReactSelect.utils'
import { ReactComponent as Arrows } from '../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Next } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as Locked } from '../../assets/icons/ic-locked.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import CodeEditor from '../CodeEditor/CodeEditor'
import { getDefaultDeploymentTemplate, getDeploymentTemplate } from './service'
import { getDeploymentTemplate as getEnvDeploymentTemplate } from '../EnvironmentOverride/service'
import YAML from 'yaml'
import {
    ChartTypeVersionOptionsProps,
    CompareOptionsProps,
    CompareWithDropdownProps,
    DeploymentChartGroupOptionType,
    DeploymentChartOptionType,
    DeploymentChartVersionType,
    DeploymentConfigFormCTAProps,
    DeploymentTemplateEditorViewProps,
    DeploymentTemplateOptionsTabProps,
} from './types'
import {
    BASIC_FIELDS,
    BASIC_VIEW_TIPPY_CONTENT,
    COMPARE_VALUES_TIPPY_CONTENT,
    DEPLOYMENT_TEMPLATE_LABELS_KEYS,
    getCommonSelectStyles,
    README_TIPPY_CONTENT,
} from './constants'
import { SortingOrder } from '../app/types'
import { validateBasicView } from './DeploymentConfig.utils'
import ChartSelectorDropdown from './ChartSelectorDropdown'

const renderReadMeOption = (openReadMe: boolean, handleReadMeClick: () => void, disabled?: boolean) => {
    const handleReadMeOptionClick = () => {
        if (disabled) {
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
            data-testid={`base-deployment-template-${!openReadMe ? 'readme' : 'hidereadme'}-button`}
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
            data-testid={`base-deployment-template-${!openComparison ? 'comparevalues' : 'hidecomparison'}-button`}
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

const getComparisonTippyContent = (isComparisonAvailable: boolean, isEnvOverride?: boolean) => {
    if (isComparisonAvailable) {
        return isEnvOverride
            ? COMPARE_VALUES_TIPPY_CONTENT.compareEnvValueWithOtherValues
            : COMPARE_VALUES_TIPPY_CONTENT.compareBaseValueWithOtherValues
    }

    return (
        <>
            <h2 className="fs-12 fw-6 lh-18 m-0">{COMPARE_VALUES_TIPPY_CONTENT.nothingToCompare}</h2>
            <p className="fs-12 fw-4 lh-18 m-0">{COMPARE_VALUES_TIPPY_CONTENT.noCDPipelineCreated}</p>
        </>
    )
}

export const ChartTypeVersionOptions = ({
    isUnSet,
    disableVersionSelect,
    charts,
    chartsMetadata,
    selectedChart,
    selectChart,
    selectedChartRefId,
}: ChartTypeVersionOptionsProps) => {
    const filteredCharts = selectedChart
        ? charts
              .filter((cv) => cv.name == selectedChart.name)
              .sort((a, b) =>
                  versionComparator(a, b, DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.version, SortingOrder.DESC),
              )
        : []

    const onSelectChartVersion = (selected) => {
        selectChart(selected)
    }

    return (
        <div
            className={`chart-type-version-options pr-16 pt-8 pb-8 ${
                disableVersionSelect ||
                (selectedChart?.name !== ROLLOUT_DEPLOYMENT && selectedChart?.name !== DEPLOYMENT)
                    ? ''
                    : 'dc__border-right'
            }`}
        >
            <div className="chart-type-options">
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
            <div className="chart-version-options">
                <span className="fs-13 fw-4 cn-9">Chart version:</span>
                {disableVersionSelect ? (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.version}</span>
                ) : (
                    <ReactSelect
                        options={filteredCharts}
                        isMulti={false}
                        classNamePrefix="select-chart-version"
                        getOptionLabel={(option) => `${option.version}`}
                        getOptionValue={(option) => `${option.id}`}
                        value={selectedChart}
                        isSearchable={false}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            DropdownIndicator,
                        }}
                        styles={getCommonSelectStyles({
                            menu: (base, state) => ({
                                ...base,
                                margin: '0',
                                width: '120px',
                            }),
                        })}
                        onChange={onSelectChartVersion}
                    />
                )}
            </div>
        </div>
    )
}

const CompareOptions = ({
    isComparisonAvailable,
    isEnvOverride,
    openComparison,
    handleComparisonClick,
    chartConfigLoading,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
}: CompareOptionsProps) => {
    return (
        <div className="flex">
            <ConditionalWrap
                condition={!openComparison && !chartConfigLoading}
                wrap={(children) => (
                    <Tippy
                        className="default-tt w-200"
                        arrow={false}
                        placement="bottom"
                        content={getComparisonTippyContent(isComparisonAvailable, isEnvOverride)}
                    >
                        {children}
                    </Tippy>
                )}
            >
                {renderComparisonOption(
                    openComparison,
                    handleComparisonClick,
                    chartConfigLoading || !isComparisonAvailable,
                )}
            </ConditionalWrap>
            <ConditionalWrap
                condition={!openReadMe && (chartConfigLoading || !isReadMeAvailable)}
                wrap={(children) => (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={chartConfigLoading ? README_TIPPY_CONTENT.fetching : README_TIPPY_CONTENT.notAvailable}
                    >
                        {children}
                    </Tippy>
                )}
            >
                {renderReadMeOption(openReadMe, handleReadMeClick, chartConfigLoading || !isReadMeAvailable)}
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
    chartConfigLoading,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
    isUnSet,
    charts,
    chartsMetadata,
    selectedChart,
    selectChart,
    selectedChartRefId,
    disableVersionSelect,
    yamlMode,
    isBasicViewLocked,
    codeEditorValue,
    basicFieldValuesErrorObj,
    changeEditorMode,
}: DeploymentTemplateOptionsTabProps) => {
    return (
        <div className="dt-options-tab-container flex dc__content-space pl-16 pr-16">
            {!openComparison && !openReadMe ? (
                <div className="flex">
                    <ChartTypeVersionOptions
                        isUnSet={isUnSet}
                        charts={charts}
                        chartsMetadata={chartsMetadata}
                        selectedChart={selectedChart}
                        selectChart={selectChart}
                        selectedChartRefId={selectedChartRefId}
                        disableVersionSelect={disableVersionSelect}
                    />
                    {(selectedChart?.name === ROLLOUT_DEPLOYMENT || selectedChart?.name === DEPLOYMENT) && (
                        <RadioGroup
                            className="gui-yaml-switch pl-16"
                            name="yaml-mode"
                            initialTab={yamlMode ? 'yaml' : 'gui'}
                            disabled={isBasicViewLocked}
                            onChange={changeEditorMode}
                        >
                            <RadioGroup.Radio
                                dataTestid="base-deployment-template-basic-button"
                                value="gui"
                                canSelect={!chartConfigLoading && !isBasicViewLocked && codeEditorValue}
                                isDisabled={isBasicViewLocked}
                                showTippy={isBasicViewLocked}
                                tippyClass="default-white no-content-padding tippy-shadow"
                                dataTestId="base-deployment-template-basic-button"
                                tippyContent={
                                    <>
                                        <div className="flexbox fw-6 p-12 dc__border-bottom-n1">
                                            <Locked className="icon-dim-20 mr-6 fcy-7" />
                                            <span className="fs-14 fw-6 cn-9">{BASIC_VIEW_TIPPY_CONTENT.title}</span>
                                        </div>
                                        <div className="fs-13 fw-4 cn-9 p-12">{BASIC_VIEW_TIPPY_CONTENT.infoText}</div>
                                    </>
                                }
                            >
                                {isBasicViewLocked && <Locked className="icon-dim-12 mr-6" />}
                                Basic
                            </RadioGroup.Radio>
                            <RadioGroup.Radio
                                value="yaml"
                                canSelect={
                                    disableVersionSelect &&
                                    chartConfigLoading &&
                                    codeEditorValue &&
                                    basicFieldValuesErrorObj?.isValid
                                }
                                dataTestId="base-deployment-template-advanced-button"
                            >
                                Advanced (YAML)
                            </RadioGroup.Radio>
                        </RadioGroup>
                    )}
                </div>
            ) : (
                <span
                    className="flex fs-13 fw-6 cn-9 h-32"
                    data-testid={`${
                        openComparison ? 'compare-deployment-template-heading' : 'readme-deployment-template-heading'
                    }`}
                >
                    {openComparison ? COMPARE_VALUES_TIPPY_CONTENT.comparing : README_TIPPY_CONTENT.showing}
                </span>
            )}
            {yamlMode && (
                <CompareOptions
                    isComparisonAvailable={isComparisonAvailable}
                    isEnvOverride={isEnvOverride}
                    openComparison={openComparison}
                    handleComparisonClick={handleComparisonClick}
                    chartConfigLoading={chartConfigLoading}
                    openReadMe={openReadMe}
                    isReadMeAvailable={isReadMeAvailable}
                    handleReadMeClick={handleReadMeClick}
                />
            )}
        </div>
    )
}

const formatOptionLabel = (option: DeploymentChartOptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">
                {option.label}&nbsp;{option.version && `(${option.version})`}
            </span>
        </div>
    )
}

const customValueContainer = (props): JSX.Element => {
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
    isEnvOverride,
    environments,
    charts,
    selectedOption,
    setSelectedOption,
    globalChartRef,
}: CompareWithDropdownProps) => {
    const [groupedOptions, setGroupedOptions] = useState<DeploymentChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])
    const baseTemplateOption = {
        id: -1,
        value: '',
        label: DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label,
        version: globalChartRef?.version || '',
        kind: DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.key,
    }

    useEffect(() => {
        _initOptions()
    }, [environments, charts])

    const _initOptions = () => {
        const _groupOptions = []

        // Push base template option if in environment override view
        if (isEnvOverride) {
            _groupOptions.push({
                label: '',
                options: [baseTemplateOption],
            })
        }

        // Push all environment & other version options
        _groupOptions.push({
            label: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.label,
            options: environments.length > 0 ? environments : [DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.noOptions],
        })
        _groupOptions.push({
            label: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.label,
            options: charts.length > 0 ? charts : [DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.noOptions],
        })

        setGroupedOptions(_groupOptions)
        if (!selectedOption) {
            setSelectedOption(
                isEnvOverride
                    ? (baseTemplateOption as DeploymentChartOptionType)
                    : environments.length > 0
                    ? environments[0]
                    : charts[0],
            )
        }
    }

    const onChange = (selected: DeploymentChartOptionType) => {
        setSelectedOption(selected)
    }

    return (
        <ReactSelect
            options={groupedOptions}
            isMulti={false}
            value={selectedOption}
            isOptionSelected={(option, selected) => option.id === selected[0].id}
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
                    cursor: 'pointer',
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
        return isEnvOverride ? 'calc(100vh - 216px)' : 'calc(100vh - 158px)'
    } else if (isEnvOverride) {
        return 'calc(100vh - 266px)'
    }

    return isUnSet ? 'calc(100vh - 236px)' : 'calc(100vh - 204px)'
}

const renderEditorHeading = (
    isEnvOverride: boolean,
    readOnly: boolean,
    environmentName: string,
    selectedChart: DeploymentChartVersionType,
) => {
    return (
        <>
            {!readOnly && <Edit className="icon-dim-16 mr-10" />}
            {`${isEnvOverride ? environmentName : DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label} ${
                selectedChart ? `(${selectedChart.version})` : ''
            }`}
            {isEnvOverride && readOnly && (
                <Tippy
                    className="default-tt w-200"
                    arrow={false}
                    placement="top"
                    content={DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText}
                >
                    <Locked className="icon-dim-16 fcn-6 ml-10" />
                </Tippy>
            )}
        </>
    )
}

export const DeploymentTemplateEditorView = ({
    appId,
    envId,
    isUnSet,
    isEnvOverride,
    environmentName,
    openComparison,
    showReadme,
    chartConfigLoading,
    readme,
    value,
    defaultValue,
    editorOnChange,
    schemas,
    charts,
    selectedChart,
    environments,
    fetchedValues,
    setFetchedValues,
    readOnly,
    globalChartRefId,
    yamlMode,
    basicFieldValues,
    setBasicFieldValues,
    basicFieldValuesErrorObj,
    setBasicFieldValuesErrorObj,
    changeEditorMode,
}: DeploymentTemplateEditorViewProps) => {
    const envVariableSectionRef = useRef(null)
    const [fetchingValues, setFetchingValues] = useState(false)
    const [selectedOption, setSelectedOption] = useState<DeploymentChartOptionType>()
    const [filteredEnvironments, setFilteredEnvironments] = useState<DeploymentChartOptionType[]>([])
    const [filteredCharts, setFilteredCharts] = useState<DeploymentChartOptionType[]>([])
    const [globalChartRef, setGlobalChartRef] = useState(null)

    useEffect(() => {
        if (selectedChart && environments.length > 0) {
            let _filteredEnvironments = environments.sort((a, b) => a.environmentName.localeCompare(b.environmentName))
            if (isEnvOverride) {
                _filteredEnvironments = environments.filter((env) => +envId !== env.environmentId)
            }

            setFilteredEnvironments(
                _filteredEnvironments.map((env) => ({
                    id: env.environmentId,
                    label: env.environmentName,
                    value: env.chartRefId,
                    version: charts.find((chart) => chart.id === env.chartRefId)?.version || '',
                    kind: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key,
                })) as DeploymentChartOptionType[],
            )
        }
    }, [selectedChart, environments])

    useEffect(() => {
        if (selectedChart && charts.length > 0) {
            const _filteredCharts = charts
                .filter((chart) => {
                    if (!globalChartRef && chart.id === globalChartRefId) {
                        setGlobalChartRef(chart)
                    }
                    return chart.name === selectedChart.name
                })
                .sort((a, b) =>
                    versionComparator(a, b, DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.version, SortingOrder.DESC),
                )

            setFilteredCharts(
                _filteredCharts.map((chart) => ({
                    id: `${DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.version}-${chart.version}`,
                    label: chart.version,
                    value: chart.id,
                    kind: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.key,
                })) as DeploymentChartOptionType[],
            )
        }
    }, [selectedChart, charts])

    useEffect(() => {
        if (selectedChart && selectedOption && selectedOption.id !== -1 && !fetchedValues[selectedOption.id]) {
            setFetchingValues(true)
            const isEnvOption = selectedOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key
            const isChartVersionOption = selectedOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.key

            const _getDeploymentTemplate = isChartVersionOption
                ? getDefaultDeploymentTemplate(appId, selectedOption.value)
                : isEnvOverride || isEnvOption
                ? getEnvDeploymentTemplate(appId, isEnvOption ? selectedOption.id : envId, selectedOption.value)
                : getDeploymentTemplate(+appId, +selectedOption.value)

            _getDeploymentTemplate
                .then(({ result }) => {
                    if (result) {
                        const _fetchedValues = {
                            ...fetchedValues,
                            [selectedOption.id]: YAML.stringify(
                                isChartVersionOption
                                    ? result.defaultAppOverride
                                    : isEnvOverride || isEnvOption
                                    ? result.environmentConfig?.envOverrideValues || result?.globalConfig
                                    : result.globalConfig.defaultAppOverride,
                            ),
                        }
                        setFetchedValues(_fetchedValues)
                    }
                    setFetchingValues(false)
                })
                .catch((err) => {
                    showError(err)
                    setFetchingValues(false)
                })
        }
    }, [selectedOption])

    useEffect(() => {
        return (): void => {
            setSelectedOption(null)
        }
    }, [openComparison])

    const renderActionButton = () => {
        return (
            <span
                data-testid="base-deployment-template-switchtoadvanced-button"
                className="cb-5 cursor fw-6"
                onClick={changeEditorMode}
            >
                Switch to Advanced
            </span>
        )
    }

    const renderLabel = (title: string, description: string, isMandatory?: boolean): JSX.Element => {
        return (
            <label className="cn-7 mb-0 lh-32">
                <Tippy
                    className="default-tt"
                    arrow={false}
                    content={<span className="dc__mxw-200 dc__block fw-4">{description}</span>}
                    interactive={true}
                >
                    <span className="text-underline-dashed">
                        {title}
                        {isMandatory && <span className="cr-5"> *</span>}
                    </span>
                </Tippy>
            </label>
        )
    }

    const handleInputChange = (e) => {
        const _basicFieldValues = { ...basicFieldValues }
        if (e.target.name === BASIC_FIELDS.PORT) {
            e.target.value = e.target.value.replace(/\D/g, '')
            _basicFieldValues[BASIC_FIELDS.PORT] = e.target.value && Number(e.target.value)
        } else if (e.target.name === BASIC_FIELDS.HOST) {
            _basicFieldValues[BASIC_FIELDS.HOSTS][0][BASIC_FIELDS.HOST] = e.target.value
        } else if (e.target.name === BASIC_FIELDS.PATH) {
            _basicFieldValues[BASIC_FIELDS.HOSTS][0][BASIC_FIELDS.PATHS][e.target.dataset.index] = e.target.value
        } else if (e.target.name === BASIC_FIELDS.RESOURCES_CPU || e.target.name === BASIC_FIELDS.RESOURCES_MEMORY) {
            const resource = _basicFieldValues[BASIC_FIELDS.RESOURCES]
            resource[BASIC_FIELDS.LIMITS][
                e.target.name === BASIC_FIELDS.RESOURCES_CPU ? BASIC_FIELDS.CPU : BASIC_FIELDS.MEMORY
            ] = e.target.value
            resource[BASIC_FIELDS.REQUESTS] = { ...resource[BASIC_FIELDS.LIMITS] }
            _basicFieldValues[BASIC_FIELDS.RESOURCES] = resource
        } else if (e.target.name.indexOf(BASIC_FIELDS.ENV_VARIABLES + '_') >= 0) {
            const envVariable = _basicFieldValues[BASIC_FIELDS.ENV_VARIABLES][e.target.dataset.index]
            envVariable[e.target.name.indexOf(BASIC_FIELDS.NAME) >= 0 ? BASIC_FIELDS.NAME : BASIC_FIELDS.VALUE] =
                e.target.value
            _basicFieldValues[BASIC_FIELDS.ENV_VARIABLES][e.target.dataset.index] = envVariable
        }
        setBasicFieldValues(_basicFieldValues)
        setBasicFieldValuesErrorObj(validateBasicView(_basicFieldValues))
    }

    const addRow = (e): void => {
        if (readOnly) return
        const _basicFieldValues = { ...basicFieldValues }
        if (e.currentTarget.dataset.name === BASIC_FIELDS.PATH) {
            _basicFieldValues[BASIC_FIELDS.HOSTS][0][BASIC_FIELDS.PATHS].unshift('')
        } else {
            _basicFieldValues[BASIC_FIELDS.ENV_VARIABLES].unshift({ name: '', value: '' })
        }
        setBasicFieldValues(_basicFieldValues)
        if (e.currentTarget.dataset.name === BASIC_FIELDS.ENV_VARIABLES) {
            const _basicFieldValuesErrorObj = { ...basicFieldValuesErrorObj }
            _basicFieldValuesErrorObj.envVariables.unshift({ isValid: true, message: null })
            setBasicFieldValuesErrorObj(_basicFieldValuesErrorObj)
            if (_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES].length <= 2) {
                setTimeout(() => {
                    envVariableSectionRef.current.scrollIntoView()
                }, 0)
            }
        }
    }

    const removeRow = (name: string, index: number): void => {
        if (readOnly) return
        const _basicFieldValues = { ...basicFieldValues }
        const _currentValue =
            name === BASIC_FIELDS.ENV_VARIABLES
                ? _basicFieldValues[BASIC_FIELDS.ENV_VARIABLES]
                : _basicFieldValues[BASIC_FIELDS.HOSTS][0][BASIC_FIELDS.PATHS]
        if (_currentValue.length === 1) {
            _currentValue.length = 0
        } else {
            _currentValue.splice(index, 1)
        }
        if (name === BASIC_FIELDS.PATH) {
            _basicFieldValues[BASIC_FIELDS.HOSTS][0][BASIC_FIELDS.PATHS] = _currentValue
        } else {
            _basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] = _currentValue
        }
        setBasicFieldValues(_basicFieldValues)
        if (name === BASIC_FIELDS.ENV_VARIABLES) {
            setBasicFieldValuesErrorObj(validateBasicView(_basicFieldValues))
        }
    }

    const handleIngressEnabledToggle = (): void => {
        const _basicFieldValues = { ...basicFieldValues }
        _basicFieldValues[BASIC_FIELDS.ENABLED] = !_basicFieldValues[BASIC_FIELDS.ENABLED]
        setBasicFieldValues(_basicFieldValues)
    }

    const displayCodeEditor = (): JSX.Element => {
        return (
            <div className="form__row--code-editor-container dc__border-top dc__border-bottom">
                <CodeEditor
                    defaultValue={(selectedOption?.id === -1 ? defaultValue : fetchedValues[selectedOption?.id]) || ''}
                    value={value}
                    onChange={editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={schemas}
                    loading={chartConfigLoading || value === undefined || value === null || fetchingValues}
                    height={getCodeEditorHeight(isUnSet, isEnvOverride, openComparison, showReadme)}
                    diffView={openComparison}
                    readOnly={readOnly}
                >
                    {isUnSet && !openComparison && !showReadme && (
                        <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
                    )}
                    {showReadme && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <div className="flex fs-12 fw-6 cn-9">
                                {renderEditorHeading(isEnvOverride, readOnly, environmentName, selectedChart)}
                            </div>
                        </CodeEditor.Header>
                    )}
                    {openComparison && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <>
                                <div className="flex left fs-12 fw-6 cn-9 dc__border-right h-32">
                                    <span style={{ width: '85px' }}>Compare with: </span>
                                    <CompareWithDropdown
                                        isEnvOverride={isEnvOverride}
                                        environments={filteredEnvironments}
                                        charts={filteredCharts}
                                        selectedOption={selectedOption}
                                        setSelectedOption={setSelectedOption}
                                        globalChartRef={globalChartRef}
                                    />
                                </div>
                                <div className="flex left fs-12 fw-6 cn-9 pl-16 h-32">
                                    {renderEditorHeading(isEnvOverride, readOnly, environmentName, selectedChart)}
                                </div>
                            </>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        )
    }

    return yamlMode || (selectedChart.name !== ROLLOUT_DEPLOYMENT && selectedChart?.name !== DEPLOYMENT) ? (
        <>
            {showReadme ? (
                <>
                <div className="dt-readme dc__border-right">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                    {chartConfigLoading ? (
                        <Progressing pageLoader />
                    ) : (
                        <MarkDown markdown={readme} className="dt-readme-markdown" />
                    )}
                </div>
                {displayCodeEditor()}
                </>
            )
                :
                displayCodeEditor()
            }
            
        </>
    ) : (
        <>
            {isUnSet && (
                <div className="bcy-1 fs-12 fw-4 cn-9 en-2 bw-1 dc__no-left-border dc__no-right-border flexbox pt-8 pr-16 pb-8 pl-16 h-32 lh-16">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-8" />
                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning}
                </div>
            )}
            <div
                className={`form__row--gui-container pt-20 pr-20 pl-20 scrollable mb-0-imp ${
                    !isUnSet ? ' gui dc__border-top' : ' gui-with-warning'
                }`}
            >
                {chartConfigLoading || !value || fetchingValues ? (
                    <div className="flex h-100">
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <div className="w-650-px">
                        <div className="fw-6 fs-14 cn-9 mb-12">Container Port</div>
                        <div className="row-container mb-16">
                            {renderLabel('Port', 'Port for the container', true)}
                            <div>
                                <input
                                    type="text"
                                    name={BASIC_FIELDS.PORT}
                                    value={basicFieldValues?.[BASIC_FIELDS.PORT]}
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    data-testid="containerport-textbox"
                                    onChange={handleInputChange}
                                    readOnly={readOnly}
                                    autoComplete="off"
                                />
                                {basicFieldValuesErrorObj?.port && !basicFieldValuesErrorObj.port.isValid && (
                                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{basicFieldValuesErrorObj.port.message}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            className={`row-container ${basicFieldValues?.[BASIC_FIELDS.ENABLED] ? ' mb-8' : ' mb-16'}`}
                        >
                            <label className="fw-6 fs-14 cn-9 mb-8">HTTP Requests Routes</label>
                            <div
                                className="mt-4"
                                data-testid="httprequests-routes-toggle"
                                style={{ width: '32px', height: '20px' }}
                            >
                                <Toggle
                                    selected={basicFieldValues?.[BASIC_FIELDS.ENABLED]}
                                    onSelect={handleIngressEnabledToggle}
                                    disabled={readOnly || basicFieldValues?.[BASIC_FIELDS.HOSTS].length === 0}
                                />
                            </div>
                        </div>
                        {basicFieldValues?.[BASIC_FIELDS.ENABLED] && (
                            <div className="mb-12">
                                <div className="row-container mb-12">
                                    {renderLabel('Host', 'Host name')}
                                    <input
                                        type="text"
                                        data-testid="httprequests-routes-host-textbox"
                                        name={BASIC_FIELDS.HOST}
                                        value={basicFieldValues?.[BASIC_FIELDS.HOSTS]?.[0][BASIC_FIELDS.HOST]}
                                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                        onChange={handleInputChange}
                                        readOnly={readOnly}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="row-container mb-4">
                                    {renderLabel('Path', 'Path where this component will listen for HTTP requests')}
                                    <div
                                        data-testid="httprequests-routes-addpath-button"
                                        className="pointer cb-5 fw-6 fs-13 flexbox lh-32 w-120"
                                        data-name={BASIC_FIELDS.PATH}
                                        onClick={addRow}
                                    >
                                        <Add className="icon-dim-20 fcb-5 mt-6 mr-6" />
                                        Add path
                                    </div>
                                </div>
                                {basicFieldValues?.[BASIC_FIELDS.HOSTS]?.[0]?.[BASIC_FIELDS.PATHS]?.map(
                                    (path: string, index: number) => (
                                        <div className="row-container mb-4" key={`${BASIC_FIELDS.PATH}-${index}`}>
                                            <div />
                                            <input
                                                type="text"
                                                data-testid="httprequests-routes-path-textbox"
                                                name={BASIC_FIELDS.PATH}
                                                data-index={index}
                                                value={path}
                                                className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                                onChange={handleInputChange}
                                                readOnly={readOnly}
                                                autoComplete="off"
                                            />
                                            <Close
                                                className="option-close-icon icon-dim-16 mt-8 mr-8 pointer"
                                                onClick={(e) => removeRow(BASIC_FIELDS.PATH, index)}
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                        <div className="fw-6 fs-14 cn-9 mb-8">Resources (CPU & RAM)</div>
                        <div className="row-container mb-8">
                            {renderLabel('CPU', 'CPU available to the application', true)}
                            <div>
                                <input
                                    type="text"
                                    data-testid="resources-cpu-textbox"
                                    name={BASIC_FIELDS.RESOURCES_CPU}
                                    value={
                                        basicFieldValues?.[BASIC_FIELDS.RESOURCES][BASIC_FIELDS.LIMITS][
                                            BASIC_FIELDS.CPU
                                        ]
                                    }
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    onChange={handleInputChange}
                                    readOnly={readOnly}
                                    autoComplete="off"
                                />
                                {basicFieldValuesErrorObj?.cpu && !basicFieldValuesErrorObj.cpu.isValid && (
                                    <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{basicFieldValuesErrorObj.cpu.message}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="row-container mb-16">
                            {renderLabel('Memory', 'Memory available to the application', true)}
                            <div>
                                <input
                                    data-testid="resources-memory-textbox"
                                    type="text"
                                    name={BASIC_FIELDS.RESOURCES_MEMORY}
                                    value={
                                        basicFieldValues?.[BASIC_FIELDS.RESOURCES][BASIC_FIELDS.LIMITS][
                                            BASIC_FIELDS.MEMORY
                                        ]
                                    }
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    onChange={handleInputChange}
                                    readOnly={readOnly}
                                    autoComplete="off"
                                />
                                {basicFieldValuesErrorObj?.memory && !basicFieldValuesErrorObj.memory.isValid && (
                                    <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{basicFieldValuesErrorObj.memory.message}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="fw-6 fs-14 cn-9 mb-8">Environment Variables</div>
                        <div className="row-container mb-4">
                            {renderLabel(
                                'Name/Value',
                                'Set environment variables as name:value for containers that run in the Pod.',
                            )}
                            <div
                                className="pointer cb-5 fw-6 fs-13 flexbox lh-32 w-120"
                                data-testid="environment-variable-addvariable-button"
                                data-name={BASIC_FIELDS.ENV_VARIABLES}
                                onClick={addRow}
                            >
                                <Add className="icon-dim-20 fcb-5 mt-6 mr-6" />
                                Add variable
                            </div>
                        </div>
                        {basicFieldValues?.[BASIC_FIELDS.ENV_VARIABLES]?.map((envVariable: string, index: number) => (
                            <div className="row-container mb-4" key={`${BASIC_FIELDS.ENV_VARIABLES}-${index}`}>
                                <div />
                                <div>
                                    <input
                                        type="text"
                                        data-testid="environment-variable-name"
                                        name={`${BASIC_FIELDS.ENV_VARIABLES}_${BASIC_FIELDS.NAME}-${index}`}
                                        data-index={index}
                                        value={envVariable[BASIC_FIELDS.NAME]}
                                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5 dc__no-bottom-radius"
                                        onChange={handleInputChange}
                                        placeholder={BASIC_FIELDS.NAME}
                                        readOnly={readOnly}
                                        autoComplete="off"
                                    />
                                    <textarea
                                        data-testid="environment-variable-value"
                                        name={`${BASIC_FIELDS.ENV_VARIABLES}_${BASIC_FIELDS.VALUE}-${index}`}
                                        data-index={index}
                                        value={envVariable[BASIC_FIELDS.VALUE]}
                                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5 dc__no-top-radius dc__no-top-border"
                                        onChange={handleInputChange}
                                        rows={2}
                                        placeholder={BASIC_FIELDS.VALUE}
                                        readOnly={readOnly}
                                    ></textarea>

                                    {basicFieldValuesErrorObj?.envVariables[index] &&
                                        !basicFieldValuesErrorObj.envVariables[index].isValid && (
                                            <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                                <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                                <span>{basicFieldValuesErrorObj.envVariables[index].message}</span>
                                            </span>
                                        )}
                                </div>
                                <Close
                                    className="option-close-icon icon-dim-16 mt-8 mr-8 pointer"
                                    onClick={(e) => removeRow(BASIC_FIELDS.ENV_VARIABLES, index)}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <div ref={envVariableSectionRef}></div>
            </div>
            <InfoColourBar
                message="To modify additional configurations"
                classname="dc__content-start en-2 bw-1 dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 switch-to-advance-info-bar"
                Icon={Help}
                iconClass="fcv-5 icon-dim-20"
                renderActionButton={renderActionButton}
            />
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
    toggleAppMetrics,
    selectedChart,
}: DeploymentConfigFormCTAProps) => {
    const _disabled = disableButton || loading

    return (
        selectedChart && (
            <div
                className={`form-cta-section flex pt-16 pb-16 pr-20 pl-20 ${
                    showAppMetricsToggle ? 'dc__content-space' : 'right'
                }`}
            >
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
                                rootClassName={`mt-2 mr-8 ${
                                    !selectedChart.isAppMetricsSupported ? 'dc__opacity-0_5' : ''
                                }`}
                                isChecked={isAppMetricsEnabled}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={toggleAppMetrics}
                                disabled={disableCheckbox || !selectedChart.isAppMetricsSupported}
                            />
                        )}
                        <div className="flex column left">
                            <div className="fs-13 mb-4">
                                <b className="fw-6 cn-9 mr-8">
                                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.label}
                                </b>
                                <a
                                    href={DOCUMENTATION.APP_METRICS}
                                    target="_blank"
                                    className="fw-4 cb-5 dc__underline-onhover"
                                >
                                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.learnMore}
                                </a>
                            </div>
                            <div className={`fs-13 fw-4 ${!selectedChart.isAppMetricsSupported ? 'cr-5' : 'cn-7'}`}>
                                {!selectedChart.isAppMetricsSupported
                                    ? DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.notSupported(
                                          selectedChart.name,
                                      )
                                    : DEPLOYMENT_TEMPLATE_LABELS_KEYS.applicationMetrics.supported}
                            </div>
                        </div>
                    </div>
                )}
                <ConditionalWrap
                    condition={isEnvOverride && disableButton}
                    wrap={(children) => (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top"
                            content={DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText}
                        >
                            {children}
                        </Tippy>
                    )}
                >
                    <button
                        className={`form-submit-cta cta flex h-36 ${_disabled ? 'disabled' : ''}`}
                        type={_disabled ? 'button' : 'submit'}
                        data-testid={`${
                            !isEnvOverride && !isCiPipeline
                                ? 'base-deployment-template-save-and-next-button'
                                : 'base-deployment-template-save-changes-button'
                        }`}
                    >
                        {loading ? (
                            <Progressing />
                        ) : (
                            <>
                                {!isEnvOverride && !isCiPipeline ? (
                                    <>
                                        Save & Next
                                        <Next className={`icon-dim-16 ml-5 ${_disabled ? 'scn-4' : 'scn-0'}`} />
                                    </>
                                ) : (
                                    'Save changes'
                                )}
                            </>
                        )}
                    </button>
                </ConditionalWrap>
            </div>
        )
    )
}
