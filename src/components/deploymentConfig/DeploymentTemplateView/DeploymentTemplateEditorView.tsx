import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    DeploymentChartOptionType,
    DeploymentConfigContextType,
    DeploymentConfigStateActionTypes,
    DeploymentTemplateEditorViewProps,
    CompareApprovalAndDraftSelectedOption,
} from '../types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS, getApprovalPendingOption } from '../constants'
import { versionComparator } from '../../common'
import { SortingOrder } from '../../app/types'
import { getDefaultDeploymentTemplate, getDeploymentManisfest, getDeploymentTemplateData } from '../service'
import YAML from 'yaml'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DEPLOYMENT, MODES, ROLLOUT_DEPLOYMENT } from '../../../config'
import {
    CompareWithDropdown,
    CompareWithApprovalPendingAndDraft,
    getCodeEditorHeight,
    renderEditorHeading,
} from './DeploymentTemplateView.component'
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
    isValues,
    convertVariables,
    setConvertVariables,
    groupedData,
}: DeploymentTemplateEditorViewProps) {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const { isUnSet, state, environments, dispatch } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const [fetchingValues, setFetchingValues] = useState(false)
    const [optionOveriddeStatus, setOptionOveriddeStatus] = useState<Record<number, boolean>>()
    const [filteredEnvironments, setFilteredEnvironments] = useState<DeploymentChartOptionType[]>([])
    const [filteredCharts, setFilteredCharts] = useState<DeploymentChartOptionType[]>([])
    const [globalChartRef, setGlobalChartRef] = useState(null)
    const isDeleteDraftState = state.latestDraft?.action === 3 && state.selectedCompareOption?.id === +envId
    const baseDeploymentAbortController = useRef(null)

    const [showDraftData, setShowDraftData] = useState(false)
    const [draftManifestData, setDraftManifestData] = useState(null)
    const [draftLoading, setDraftLoading] = useState(false)
    const [selectedOptionDraft, setSelectedOptionDraft] = useState<CompareApprovalAndDraftSelectedOption>(
        getApprovalPendingOption(state.selectedChart?.version),
    )
    const [resolvedValuesLHS, setResolvedValuesLHS] = useState(null)
    const [resolvedValuesRHS, setResolvedValuesRHS] = useState(null)
    const [resolveLoading, setResolveLoading] = useState(false)

    const getLocalDaftManifest = async () => {
        const request = {
            appId: +appId,
            chartRefId: state.selectedChartRefId,
            valuesAndManifestFlag: 2,
            values: state.tempFormData ? state.tempFormData : state.draftValues,
        }

        const response = await getDeploymentManisfest(request)

        return response.result.data
    }

    const resolveVariables = async (value: string) => {
        const request = {
            appId: +appId,
            chartRefId: state.selectedChartRefId,
            values: value,
            valuesAndManifestFlag: 1,
        }
        const response = await getDeploymentManisfest(request)
        return response.result.resolvedData
    }

    useEffect(() => {
        if (!showDraftData || isValues) return // hit api only when manifest is selected, for values use local states.
        setDraftLoading(true)
        getLocalDaftManifest()
            .then((data) => {
                setDraftManifestData(data)
            })
            .catch((err) => {
                showError(err)
            })
            .finally(() => {
                setDraftLoading(false)
            })
    }, [showDraftData])

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
        if (state.selectedChart) {
            setSelectedOptionDraft(getApprovalPendingOption(state.selectedChart.version))
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

    const isCompareAndApprovalState =
        state.selectedTabIndex === 2 && !state.showReadme && state.latestDraft?.draftState === 4

    // fetch values for LHS (values/manifest) and save in corresponding caching stores, if not already fetched and in cache.
    useEffect(() => {
        baseDeploymentAbortController.current = new AbortController()
        if (
            state.selectedChart &&
            state.selectedCompareOption &&
            state.selectedCompareOption.id !== -1 &&
            (isValues
                ? !state.fetchedValues[state.selectedCompareOption.id]
                : !state.fetchedValuesManifest[state.selectedCompareOption.id]) && // check if present in respective cache
            !state.chartConfigLoading &&
            !fetchingValues &&
            !convertVariables
        ) {
            setFetchingValues(true)

            const isEnvOption = state.selectedCompareOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key
            const isChartVersionOption =
                state.selectedCompareOption.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.key
            const _getDeploymentTemplate = isChartVersionOption
                ? getDefaultDeploymentTemplate(appId, state.selectedCompareOption.value)
                : getDeploymentTemplateData(
                      +appId,
                      +state.selectedCompareOption.chartRefId,
                      isValues,
                      baseDeploymentAbortController.current.signal,
                      +state.selectedCompareOption.environmentId,
                      +state.selectedCompareOption.type,
                      +state.selectedCompareOption.deploymentTemplateHistoryId,
                      +state.selectedCompareOption.pipelineId,
                  )

            _getDeploymentTemplate
                .then(({ result }) => {
                    if (result) {
                        if (isValues) {
                            const _fetchedValues = {
                                ...state.fetchedValues,
                                [state.selectedCompareOption.id]: YAML.stringify(
                                    processFetchedValues(result, isChartVersionOption, isEnvOverride || isEnvOption),
                                ),
                            }
                            setFetchedValues(_fetchedValues)
                        } else {
                            const _fetchedValuesManifest = {
                                ...state.fetchedValuesManifest,
                                [state.selectedCompareOption.id]: processFetchedValues(
                                    result,
                                    isChartVersionOption,
                                    isEnvOverride || isEnvOption,
                                ),
                            }
                            setFetchedValuesManifest(_fetchedValuesManifest)
                        }
                    }

                    setFetchingValues(false)
                })
                .catch((err) => {
                    setFetchingValues(false)
                    if (!baseDeploymentAbortController.current.signal.aborted) {
                        showError(err)
                    }
                })
        }
        return () => {
            baseDeploymentAbortController.current.abort()
        }
    }, [state.selectedCompareOption, state.chartConfigLoading])

    useEffect(
        () => (): void => {
            setSelectedOption(null)
        },
        [state.openComparison],
    )

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
        }
        return isValues ? YAML.parse(result.data) : result.data
    }

    const setFetchedValues = (fetchedValues: Record<number | string, string>) => {
        if (!isValues) return
        dispatch({
            type: DeploymentConfigStateActionTypes.fetchedValues,
            payload: fetchedValues,
        })
    }

    const setFetchedValuesManifest = (fetchedValuesManifest: Record<number | string, string>) => {
        if (isValues) return
        dispatch({
            type: DeploymentConfigStateActionTypes.fetchedValuesManifest,
            payload: fetchedValuesManifest,
        })
    }

    const getOverrideClass = () => {
        if (isEnvOverride && state.latestDraft?.action !== 3) {
            if (state.duplicate) {
                return 'bcy-1'
            }
            return 'bcb-1'
        } else {
            return ''
        }
    }

    useEffect(() => {
        if (!convertVariables) return
        setResolveLoading(true)
        Promise.all([resolveVariables(valueLHS), resolveVariables(valueRHS)])
            .then(([lhs, rhs]) => {
                setResolvedValuesLHS(lhs)
                setResolvedValuesRHS(rhs)
            })
            .catch((err) => {
                showError(err)
            })
            .finally(() => {
                setResolveLoading(false)
            })
    }, [convertVariables, selectedOptionDraft])

    // choose LHS value for comparison
    const selectedOptionId = state.selectedCompareOption?.id
    const isIdMatch = selectedOptionId === -1
    const source = isValues ? state.fetchedValues : state.fetchedValuesManifest
    const valueLHS = isIdMatch ? defaultValue : source[selectedOptionId] // fetch LHS data from respective cache store

    // final value for LHS
    const lhs = convertVariables ? resolvedValuesLHS : valueLHS

    // choose RHS value for comparison
    const shouldUseDraftData = state.selectedTabIndex !== 3 && showDraftData
    const selectedData = isValues ? state.tempFormData || state.draftValues : draftManifestData
    const valueRHS = shouldUseDraftData ? selectedData : value

    // final value for RHS
    const rhs = convertVariables ? resolvedValuesRHS : valueRHS

    const renderCodeEditorHeading = () => (
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
                    isValues,
                )}
            </div>
        </CodeEditor.Header>
    )

    const renderCodeEditorCompareMode = () => (
        <CodeEditor.Header className="w-100 p-0-imp" hideDefaultSplitHeader={true}>
            <div className="flex column">
                <div className="code-editor__header flex left w-100 p-0-imp">
                    <div className="flex left fs-12 fw-6 cn-9 dc__border-right h-32 pl-12 pr-12">
                        <span className="fw-n" style={{ width: '85px' }}>
                            Compare with:{' '}
                        </span>
                        <CompareWithDropdown
                            envId={envId}
                            isEnvOverride={isEnvOverride}
                            environments={filteredEnvironments}
                            charts={filteredCharts}
                            selectedOption={state.selectedCompareOption}
                            setSelectedOption={setSelectedOption}
                            globalChartRef={globalChartRef}
                            isValues={isValues}
                            groupedData={groupedData}
                            setConvertVariables={setConvertVariables}
                        />
                        {!isDeleteDraftState &&
                            isEnvOverride &&
                            state.selectedCompareOption?.kind === DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.key &&
                            typeof optionOveriddeStatus?.[state.selectedCompareOption.id] !== 'undefined' && (
                                <span className="flex right flex-grow-1 fs-12 fw-4 lh-20 dc__italic-font-style w-44">
                                    {optionOveriddeStatus[state.selectedCompareOption.id]
                                        ? 'Overriden'
                                        : 'Inheriting from base'}
                                </span>
                            )}
                    </div>
                    <div className={`flex left fs-12 fw-6 cn-9 h-32 pl-12 pr-12 ${getOverrideClass()}`}>
                        {!isCompareAndApprovalState ? (
                            renderEditorHeading(
                                isEnvOverride,
                                !!state.duplicate,
                                readOnly,
                                environmentName,
                                state.selectedChart,
                                handleOverride,
                                state.latestDraft,
                                state.publishedState?.isOverride,
                                isDeleteDraftState,
                                isValues,
                            )
                        ) : (
                            <CompareWithApprovalPendingAndDraft
                                isEnvOverride={isEnvOverride}
                                overridden={!!state.duplicate}
                                readOnly={readOnly}
                                environmentName={environmentName}
                                selectedChart={state.selectedChart}
                                handleOverride={handleOverride}
                                latestDraft={state.latestDraft}
                                isPublishedOverriden={state.publishedState?.isOverride}
                                isDeleteDraftState={isDeleteDraftState}
                                setShowDraftData={setShowDraftData}
                                isValues={isValues}
                                selectedOptionDraft={selectedOptionDraft}
                                setSelectedOptionDraft={setSelectedOptionDraft}
                            />
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
    )

    const renderCodeEditor = (): JSX.Element => (
        <div
            className={`form__row--code-editor-container dc__border-top-n1 dc__border-bottom-imp ${
                isDeleteDraftState && !state.showReadme ? 'delete-override-state' : ''
            }`}
        >
            <CodeEditor
                defaultValue={lhs}
                value={rhs}
                onChange={editorOnChange}
                mode={MODES.YAML}
                validatorSchema={state.schema}
                loading={
                    state.chartConfigLoading ||
                    value === undefined ||
                    value === null ||
                    fetchingValues ||
                    draftLoading ||
                    resolveLoading
                }
                height={getCodeEditorHeight(isUnSet, isEnvOverride, state.openComparison, state.showReadme)}
                diffView={state.openComparison}
                readOnly={readOnly}
                noParsing
            >
                {isUnSet && !state.openComparison && !state.showReadme && (
                    <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
                )}
                {state.showReadme && renderCodeEditorHeading()}
                {state.openComparison && renderCodeEditorCompareMode()}
            </CodeEditor>
        </div>
    )

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
