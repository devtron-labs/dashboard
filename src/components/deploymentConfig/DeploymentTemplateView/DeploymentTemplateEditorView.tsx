import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    BasicFieldErrorObj,
    DeploymentChartOptionType,
    DeploymentConfigContextType,
    DeploymentConfigStateActionTypes,
    DeploymentTemplateEditorViewProps,
} from '../types'
import { BASIC_FIELDS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { versionComparator } from '../../common'
import { SortingOrder } from '../../app/types'
import { getDefaultDeploymentTemplate, getDeploymentTemplate } from '../service'
import { getDeploymentTemplate as getEnvDeploymentTemplate } from '../../EnvironmentOverride/service'
import YAML from 'yaml'
import { InfoColourBar, Progressing, Toggle, showError } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { validateBasicView } from '../DeploymentConfig.utils'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DEPLOYMENT, MODES, ROLLOUT_DEPLOYMENT } from '../../../config'
import { CompareWithDropdown, getCodeEditorHeight, renderEditorHeading } from './DeploymentTemplateView.component'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { useParams } from 'react-router-dom'
import { DeploymentConfigContext } from '../DeploymentConfig'

export default function DeploymentTemplateEditorView({
    isEnvOverride,
    globalChartRefId,
    readOnly,
    value,
    defaultValue,
    environmentName,
    editorOnChange,
    handleOverride,
    isDraftMode,
}: DeploymentTemplateEditorViewProps) {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const envVariableSectionRef = useRef(null)
    const { isUnSet, state, environments, dispatch, changeEditorMode } =
        useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const [fetchingValues, setFetchingValues] = useState(false)
    const [selectedOption, setSelectedOption] = useState<DeploymentChartOptionType>()
    const [filteredEnvironments, setFilteredEnvironments] = useState<DeploymentChartOptionType[]>([])
    const [filteredCharts, setFilteredCharts] = useState<DeploymentChartOptionType[]>([])
    const [globalChartRef, setGlobalChartRef] = useState(null)

    useEffect(() => {
        if (state.selectedChart && environments.length > 0) {
            let _filteredEnvironments = environments.sort((a, b) => a.environmentName.localeCompare(b.environmentName))
            if (isEnvOverride) {
                _filteredEnvironments = environments.filter((env) => +envId !== env.environmentId)
            }

            setFilteredEnvironments(
                _filteredEnvironments.map((env) => ({
                    id: env.environmentId,
                    label: env.environmentName,
                    value: env.chartRefId,
                    version: state.charts.find((chart) => chart.id === env.chartRefId)?.version || '',
                    kind: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key,
                })) as DeploymentChartOptionType[],
            )
        }
    }, [state.selectedChart, environments])

    useEffect(() => {
        if (state.selectedChart && state.charts.length > 0) {
            const _filteredCharts = state.charts
                .filter((chart) => {
                    if (!globalChartRef && chart.id === globalChartRefId) {
                        setGlobalChartRef(chart)
                    }
                    return chart.name === state.selectedChart.name
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
    }, [state.selectedChart, state.charts])

    useEffect(() => {
        if (
            state.selectedChart &&
            selectedOption &&
            selectedOption.id !== -1 &&
            !state.fetchedValues[selectedOption.id]
        ) {
            setFetchingValues(true)
            const isEnvOption = selectedOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key
            const isChartVersionOption = selectedOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.key
            const _isEnvOption = isEnvOverride || isEnvOption
            const _chartVersionOption = isChartVersionOption
                ? getDefaultDeploymentTemplate(appId, selectedOption.value)
                : _isEnvOption
            const _getDeploymentTemplate = _chartVersionOption
                ? getEnvDeploymentTemplate(appId, isEnvOption ? selectedOption.id : envId, selectedOption.value)
                : getDeploymentTemplate(+appId, +selectedOption.value)

            _getDeploymentTemplate
                .then(({ result }) => {
                    if (result) {
                        const _fetchedValues = {
                            ...state.fetchedValues,
                            [selectedOption.id]: YAML.stringify(
                                processFetchedValues(result, isChartVersionOption, _isEnvOption),
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
    }, [state.openComparison])

    const processFetchedValues = (result, isChartVersionOption, _isEnvOption) => {
        if (isChartVersionOption) {
            return result.defaultAppOverride
        } else if (_isEnvOption) {
            return result.environmentConfig?.envOverrideValues || result?.globalConfig
        } else {
            return result.globalConfig.defaultAppOverride
        }
    }

    const setFetchedValues = (fetchedValues: Record<number | string, string>) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.fetchedValues,
            payload: fetchedValues,
        })
    }

    const setBasicFieldValues = (basicFieldValues: Record<string, any>) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.basicFieldValues,
            payload: basicFieldValues,
        })
    }

    const setBasicFieldValuesErrorObj = (basicFieldValuesErrorObj: BasicFieldErrorObj) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.basicFieldValuesErrorObj,
            payload: basicFieldValuesErrorObj,
        })
    }

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
        const _basicFieldValues = { ...state.basicFieldValues }
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
        const _basicFieldValues = { ...state.basicFieldValues }
        if (e.currentTarget.dataset.name === BASIC_FIELDS.PATH) {
            _basicFieldValues[BASIC_FIELDS.HOSTS][0][BASIC_FIELDS.PATHS].unshift('')
        } else {
            _basicFieldValues[BASIC_FIELDS.ENV_VARIABLES].unshift({ name: '', value: '' })
        }
        setBasicFieldValues(_basicFieldValues)
        if (e.currentTarget.dataset.name === BASIC_FIELDS.ENV_VARIABLES) {
            const _basicFieldValuesErrorObj = { ...state.basicFieldValuesErrorObj }
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
        const _basicFieldValues = { ...state.basicFieldValues }
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
        const _basicFieldValues = { ...state.basicFieldValues }
        _basicFieldValues[BASIC_FIELDS.ENABLED] = !_basicFieldValues[BASIC_FIELDS.ENABLED]
        setBasicFieldValues(_basicFieldValues)
    }

    const getOverrideClass = () => {
        if (isEnvOverride) {
            if (!!state.duplicate) {
                return 'bcy-1'
            }
            return 'bcb-1'
        } else {
            return ''
        }
    }

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="form__row--code-editor-container dc__border-top dc__border-bottom">
                <CodeEditor
                    defaultValue={
                        (selectedOption?.id === -1 ? defaultValue : state.fetchedValues[selectedOption?.id]) || ''
                    }
                    value={value}
                    onChange={editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={state.schema}
                    loading={state.chartConfigLoading || value === undefined || value === null || fetchingValues}
                    height={getCodeEditorHeight(isUnSet, isEnvOverride, state.openComparison, state.showReadme)}
                    diffView={state.openComparison}
                    readOnly={readOnly}
                >
                    {isUnSet && !state.openComparison && !state.showReadme && (
                        <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
                    )}
                    {state.showReadme && (
                        <CodeEditor.Header
                            className={`code-editor__header flex left p-0-imp ${getOverrideClass()}`}
                            hideDefaultSplitHeader={true}
                        >
                            <div className="flex fs-12 fw-6 cn-9 pl-12 pr-12 w-100">
                                {renderEditorHeading(
                                    isEnvOverride,
                                    !!state.duplicate,
                                    readOnly,
                                    environmentName,
                                    state.selectedChart,
                                    handleOverride,
                                )}
                            </div>
                        </CodeEditor.Header>
                    )}
                    {state.openComparison && (
                        <CodeEditor.Header
                            className="code-editor__header flex left p-0-imp"
                            hideDefaultSplitHeader={true}
                        >
                            <>
                                <div className="flex left fs-12 fw-6 cn-9 dc__border-right h-32 pl-12 pr-12">
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
                                <div className={`flex left fs-12 fw-6 cn-9 h-32 pl-12 pr-12 ${getOverrideClass()}`}>
                                    {renderEditorHeading(
                                        isEnvOverride,
                                        !!state.duplicate,
                                        readOnly,
                                        environmentName,
                                        state.selectedChart,
                                        handleOverride,
                                    )}
                                </div>
                            </>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        )
    }

    return state.yamlMode ||
        (state.selectedChart?.name !== ROLLOUT_DEPLOYMENT && state.selectedChart?.name !== DEPLOYMENT) ? (
        <>
            {state.showReadme ? (
                <>
                    <div className="dt-readme dc__border-right">
                        <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                        {state.chartConfigLoading ? (
                            <Progressing pageLoader />
                        ) : (
                            <MarkDown markdown={state.readme} className="dt-readme-markdown" />
                        )}
                    </div>
                    {renderCodeEditor()}
                </>
            ) : (
                renderCodeEditor()
            )}
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
                {state.chartConfigLoading || !value || fetchingValues ? (
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
                                    value={state.basicFieldValues?.[BASIC_FIELDS.PORT]}
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    data-testid="containerport-textbox"
                                    onChange={handleInputChange}
                                    readOnly={readOnly}
                                    autoComplete="off"
                                />
                                {state.basicFieldValuesErrorObj?.port && !state.basicFieldValuesErrorObj.port.isValid && (
                                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{state.basicFieldValuesErrorObj.port.message}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            className={`row-container ${
                                state.basicFieldValues?.[BASIC_FIELDS.ENABLED] ? ' mb-8' : ' mb-16'
                            }`}
                        >
                            <label className="fw-6 fs-14 cn-9 mb-8">HTTP Requests Routes</label>
                            <div
                                className="mt-4"
                                data-testid="httprequests-routes-toggle"
                                style={{ width: '32px', height: '20px' }}
                            >
                                <Toggle
                                    selected={state.basicFieldValues?.[BASIC_FIELDS.ENABLED]}
                                    onSelect={handleIngressEnabledToggle}
                                    disabled={readOnly || state.basicFieldValues?.[BASIC_FIELDS.HOSTS].length === 0}
                                />
                            </div>
                        </div>
                        {state.basicFieldValues?.[BASIC_FIELDS.ENABLED] && (
                            <div className="mb-12">
                                <div className="row-container mb-12">
                                    {renderLabel('Host', 'Host name')}
                                    <input
                                        type="text"
                                        data-testid="httprequests-routes-host-textbox"
                                        name={BASIC_FIELDS.HOST}
                                        value={state.basicFieldValues?.[BASIC_FIELDS.HOSTS]?.[0][BASIC_FIELDS.HOST]}
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
                                {state.basicFieldValues?.[BASIC_FIELDS.HOSTS]?.[0]?.[BASIC_FIELDS.PATHS]?.map(
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
                                        state.basicFieldValues?.[BASIC_FIELDS.RESOURCES][BASIC_FIELDS.LIMITS][
                                            BASIC_FIELDS.CPU
                                        ]
                                    }
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    onChange={handleInputChange}
                                    readOnly={readOnly}
                                    autoComplete="off"
                                />
                                {state.basicFieldValuesErrorObj?.cpu && !state.basicFieldValuesErrorObj.cpu.isValid && (
                                    <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{state.basicFieldValuesErrorObj.cpu.message}</span>
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
                                        state.basicFieldValues?.[BASIC_FIELDS.RESOURCES][BASIC_FIELDS.LIMITS][
                                            BASIC_FIELDS.MEMORY
                                        ]
                                    }
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    onChange={handleInputChange}
                                    readOnly={readOnly}
                                    autoComplete="off"
                                />
                                {state.basicFieldValuesErrorObj?.memory &&
                                    !state.basicFieldValuesErrorObj.memory.isValid && (
                                        <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                            <span>{state.basicFieldValuesErrorObj.memory.message}</span>
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
                        {state.basicFieldValues?.[BASIC_FIELDS.ENV_VARIABLES]?.map(
                            (envVariable: string, index: number) => (
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

                                        {state.basicFieldValuesErrorObj?.envVariables[index] &&
                                            !state.basicFieldValuesErrorObj.envVariables[index].isValid && (
                                                <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                                    <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                                    <span>
                                                        {state.basicFieldValuesErrorObj.envVariables[index].message}
                                                    </span>
                                                </span>
                                            )}
                                    </div>
                                    <Close
                                        className="option-close-icon icon-dim-16 mt-8 mr-8 pointer"
                                        onClick={(e) => removeRow(BASIC_FIELDS.ENV_VARIABLES, index)}
                                    />
                                </div>
                            ),
                        )}
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
