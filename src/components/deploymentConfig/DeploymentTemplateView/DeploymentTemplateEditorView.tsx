import React, { useContext, useEffect, useState } from 'react'
import {
    DeploymentChartOptionType,
    DeploymentConfigContextType,
    DeploymentConfigStateActionTypes,
    DeploymentTemplateEditorViewProps,
} from '../types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { versionComparator } from '../../common'
import { SortingOrder } from '../../app/types'
import { getDefaultDeploymentTemplate, getDeploymentTemplate } from '../service'
import { getDeploymentTemplate as getEnvDeploymentTemplate } from '../../EnvironmentOverride/service'
import YAML from 'yaml'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DEPLOYMENT, MODES, ROLLOUT_DEPLOYMENT } from '../../../config'
import { CompareWithDropdown, getCodeEditorHeight, renderEditorHeading } from './DeploymentTemplateView.component'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { useParams } from 'react-router-dom'
import { DeploymentConfigContext } from '../DeploymentConfig'
import DeploymentTemplateGUIView from './DeploymentTemplateGUIView'

export default function DeploymentTemplateEditorView({
    isEnvOverride,
    globalChartRefId,
    readOnly,
    value,
    defaultValue,
    environmentName,
    editorOnChange,
    handleOverride,
}: DeploymentTemplateEditorViewProps) {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const { isUnSet, state, environments, dispatch } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const [fetchingValues, setFetchingValues] = useState(false)
    const [optionOveriddeStatus, setOptionOveriddeStatus] = useState<Record<number, boolean>>()
    const [filteredEnvironments, setFilteredEnvironments] = useState<DeploymentChartOptionType[]>([])
    const [filteredCharts, setFilteredCharts] = useState<DeploymentChartOptionType[]>([])
    const [globalChartRef, setGlobalChartRef] = useState(null)
    const isDeleteDraftState = state.latestDraft?.action === 3 && state.selectedCompareOption?.id === +envId
    const baseDeploymentAbortController = new AbortController()

    useEffect(() => {
        if (state.selectedChart && environments.length > 0) {
            const _filteredEnvironments = environments.sort((a, b) =>
                a.environmentName.localeCompare(b.environmentName),
            )
            setFilteredEnvironments(
                _filteredEnvironments.map((env) => ({
                    id: env.environmentId,
                    label: env.environmentName,
                    value: env.chartRefId || globalChartRefId,
                    version:
                        state.charts.find((chart) => chart.id === (env.chartRefId || globalChartRefId))?.version || '',
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
                    label: `v${chart.version} (Default)`,
                    value: chart.id,
                    kind: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.key,
                })) as DeploymentChartOptionType[],
            )
        }
    }, [state.selectedChart, state.charts])

    useEffect(() => {
        if (
            state.selectedChart &&
            state.selectedCompareOption &&
            state.selectedCompareOption.id !== -1 &&
            state.selectedCompareOption?.id !== Number(envId) &&
            !state.fetchedValues[state.selectedCompareOption.id] &&
            !state.chartConfigLoading &&
            !fetchingValues
        ) {
            setFetchingValues(true)
            const isEnvOption = state.selectedCompareOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key
            const isChartVersionOption =
                state.selectedCompareOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.key
            const _getDeploymentTemplate = isChartVersionOption
                ? getDefaultDeploymentTemplate(appId, state.selectedCompareOption.value)
                : isEnvOverride || isEnvOption
                ? getEnvDeploymentTemplate(
                      appId,
                      isEnvOption ? state.selectedCompareOption.id : envId,
                      state.selectedCompareOption.value,
                  )
                : getDeploymentTemplate(+appId, +state.selectedCompareOption.value, baseDeploymentAbortController.signal)

            _getDeploymentTemplate
                .then(({ result }) => {
                    if (result) {
                        const _fetchedValues = {
                            ...state.fetchedValues,
                            [state.selectedCompareOption.id]: YAML.stringify(
                                processFetchedValues(result, isChartVersionOption, isEnvOverride || isEnvOption),
                            ),
                        }
                        setFetchedValues(_fetchedValues)
                    }
                    setFetchingValues(false)
                })
                .catch((err) => {
                    showError(err)
                    setFetchingValues(false)
                    if (!baseDeploymentAbortController.signal.aborted) {
                        showError(err)
                    }
                })
        }
    }, [state.selectedCompareOption, state.chartConfigLoading])

    useEffect(() => {
        return (): void => {
            setSelectedOption(null)
        }
    }, [state.openComparison])

    const setSelectedOption = (selectedOption: DeploymentChartOptionType) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.selectedCompareOption,
            payload: selectedOption,
        })
    }

    const processFetchedValues = (result, isChartVersionOption, _isEnvOption) => {
        if (isChartVersionOption) {
            return result.defaultAppOverride
        } else if (_isEnvOption) {
            setOptionOveriddeStatus((prevStatus) => ({
                ...prevStatus,
                [state.selectedCompareOption.id]: result.IsOverride,
            }))
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

    const getOverrideClass = () => {
        if (isEnvOverride && state.latestDraft?.action !== 3) {
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
            <div
                className={`form__row--code-editor-container dc__border-top-n1 dc__border-bottom-imp ${
                    isDeleteDraftState && !state.showReadme ? 'delete-override-state' : ''
                }`}
            >
                <CodeEditor
                    defaultValue={
                        (state.selectedCompareOption?.id === -1 || state.selectedCompareOption?.id === Number(envId)
                            ? defaultValue
                            : state.fetchedValues[state.selectedCompareOption?.id]) || ''
                    }
                    value={value}
                    chartVersion={state.selectedChart?.version.replace(/\./g, '-')}
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
                                    state.latestDraft,
                                    state.publishedState?.isOverride,
                                    isDeleteDraftState,
                                )}
                            </div>
                        </CodeEditor.Header>
                    )}
                    {state.openComparison && (
                        <CodeEditor.Header className="w-100 p-0-imp" hideDefaultSplitHeader={true}>

                            <div className="flex column">
                                <div className="code-editor__header flex left w-100 p-0-imp">
                                    <div className="flex left fs-12 fw-6 cn-9 dc__border-right h-32 pl-12 pr-12">
                                        <span style={{ width: '85px' }}>Compare with: </span>
                                        <CompareWithDropdown
                                            envId={envId}
                                            isEnvOverride={isEnvOverride}
                                            environments={filteredEnvironments}
                                            charts={filteredCharts}
                                            selectedOption={state.selectedCompareOption}
                                            setSelectedOption={setSelectedOption}
                                            globalChartRef={globalChartRef}
                                        />
                                        {!isDeleteDraftState &&
                                            isEnvOverride &&
                                            state.selectedCompareOption?.kind ===
                                                DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key &&
                                            typeof optionOveriddeStatus?.[state.selectedCompareOption.id] !==
                                                'undefined' && (
                                                <span className="flex right flex-grow-1 fs-12 fw-4 lh-20 dc__italic-font-style w-44">
                                                    {optionOveriddeStatus[state.selectedCompareOption.id]
                                                        ? 'Overriden'
                                                        : 'Inheriting from base'}
                                                </span>
                                            )}
                                    </div>
                                    <div className={`flex left fs-12 fw-6 cn-9 h-32 pl-12 pr-12 ${getOverrideClass()}`}>
                                        {renderEditorHeading(
                                            isEnvOverride,
                                            !!state.duplicate,
                                            readOnly,
                                            environmentName,
                                            state.selectedChart,
                                            handleOverride,
                                            state.latestDraft,
                                            state.publishedState?.isOverride,
                                            isDeleteDraftState,
                                        )}
                                    </div>
                                </div>
                                {isDeleteDraftState && (
                                    <div className="code-editor__header flex left w-100 p-0-imp">
                                        <div className="bcr-1 pt-8 pb-8 pl-16 pr-16">
                                            <div className="fs-12 fw-4 cn-7 lh-16">Configuration</div>
                                            <div className="fs-13 fw-4 cn-9 lh-20">Override base</div>
                                        </div>
                                        <div className="bcg-1 pt-8 pb-8 pl-16 pr-16">
                                            <div className="fs-12 fw-4 cn-7 lh-16">Configuration</div>
                                            <div className="fs-13 fw-4 cn-9 lh-20">Inherit from base</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        )
    }

    const renderCodeEditorView = () => {
        if (state.showReadme) {
            return (
                <>
                    <div className="dt-readme dc__border-right dc__border-bottom-imp">
                        <div className="code-editor__header flex left fs-12 fw-6 cn-9">{`Readme ${
                            state.selectedChart ? `(v${state.selectedChart.version})` : ''
                        }`}</div>
                        {state.chartConfigLoading ? (
                            <Progressing pageLoader />
                        ) : (
                            <MarkDown markdown={state.readme} className="dt-readme-markdown" />
                        )}
                    </div>
                    {renderCodeEditor()}
                </>
            )
        }
        return renderCodeEditor()
    }

    return state.yamlMode ||
        (state.selectedChart?.name !== ROLLOUT_DEPLOYMENT && state.selectedChart?.name !== DEPLOYMENT) ? (
        renderCodeEditorView()
    ) : (
        <DeploymentTemplateGUIView fetchingValues={fetchingValues} value={value} readOnly={readOnly} />
    )
}
