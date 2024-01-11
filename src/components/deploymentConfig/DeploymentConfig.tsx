import React, { Reducer, createContext, useContext, useEffect, useReducer, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import {
    getDeploymentTemplate,
    updateDeploymentTemplate,
    saveDeploymentTemplate,
    getDeploymentManisfest,
    getOptions,
    getIfLockedConfigProtected,
    getIfLockedConfigNonProtected
} from './service'
import { getChartReferences } from '../../services/service'
import { useJsonYaml, importComponentFromFELibrary, FloatingVariablesSuggestions } from '../common'
import {
    showError,
    useEffectAfterMount,
    useAsync,
    Progressing,
    getLockedJSON,
    getUnlockedJSON,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    ConfigKeysWithLockType,
    DeploymentConfigContextType,
    DeploymentConfigProps,
    DeploymentConfigStateAction,
    DeploymentConfigStateActionTypes,
    DeploymentConfigStateWithDraft,
} from './types'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'
import YAML from 'yaml'
import './deploymentConfig.scss'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { DEPLOYMENT, ModuleNameMap, ROLLOUT_DEPLOYMENT } from '../../config'
import { InstallationType, ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { mainContext } from '../common/navigation/NavigationRoutes'
import {
    getBasicFieldValue,
    groupDataByType,
    handleConfigProtectionError,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from './DeploymentConfig.utils'
import { BASIC_FIELDS, EDITOR_VIEW } from './constants'
import DeploymentConfigFormCTA from './DeploymentTemplateView/DeploymentConfigFormCTA'
import DeploymentTemplateEditorView from './DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentTemplateOptionsTab from './DeploymentTemplateView/DeploymentTemplateOptionsTab'
import DeploymentConfigToolbar from './DeploymentTemplateView/DeploymentConfigToolbar'
import { SaveConfirmationDialog, SuccessToastBody } from './DeploymentTemplateView/DeploymentTemplateView.component'
import { deploymentConfigReducer, initDeploymentConfigState } from './DeploymentConfigReducer'
import DeploymentTemplateReadOnlyEditorView from './DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'
import CodeEditor from '../CodeEditor/CodeEditor'
const DeploymentTemplateLockedDiff = importComponentFromFELibrary('DeploymentTemplateLockedDiff')
const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DraftComments = importComponentFromFELibrary('DraftComments')
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')

export const DeploymentConfigContext = createContext<DeploymentConfigContextType>(null)

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    navItems,
    isCiPipeline,
    environments,
    isProtected,
    reloadEnvironments,
}: DeploymentConfigProps) {
    const history = useHistory()
    const { appId } = useParams<{ appId: string }>()
    const { currentServerInfo, isSuperAdmin } = useContext(mainContext)
    const [saveEligibleChangesCb, setSaveEligibleChangesCb] = useState(false)
    const [showLockedDiffForApproval, setShowLockedDiffForApproval] = useState(false)
    const [lockedConfigKeysWithLockType, setLockedConfigKeysWithLockType] = useState<ConfigKeysWithLockType>({
        config: [],
        allowed: false,
    })
    const [lockedOverride, setLockedOverride] = useState({})
    const [disableSaveEligibleChanges, setDisableSaveEligibleChanges] = useState(false)
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const readOnlyPublishedMode = state.selectedTabIndex === 1 && isProtected && !!state.latestDraft
    const baseDeploymentAbortController = new AbortController()

    const setIsValues = (value: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.isValues,
            payload: value,
        })
    }

    const setManifestDataRHS = (value: string) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.manifestDataRHS,
            payload: value,
        })
    }

    const setManifestDataLHS = (value: string) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.manifestDataLHS,
            payload: value,
        })
    }

    const setLoadingManifest = (value: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.loadingManifest,
            payload: value,
        })
    }

    const setGroupedOptionsData = (value: Array<Object>) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.groupedOptionsData,
            payload: value,
        })
    }

    const setConvertVariables = (value: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.convertVariables,
            payload: value,
        })
    }

    useEffect(() => {
        const fetchOptionsList = async () => {
            const res = await getOptions(+appId, -1) // -1 is for base deployment template
            const { result } = res
            const _groupedData = groupDataByType(result)
            setGroupedOptionsData(_groupedData)
        }

        fetchOptionsList()
    }, [environments])

    useEffect(() => {
        const abortController = new AbortController()
        reloadEnvironments()
        initialise()

        return () => {
            abortController.abort()
        }
    }, [])

    useEffectAfterMount(() => {
        if (state.selectedChart) {
            fetchDeploymentTemplate()
        }
    }, [state.selectedChart])

    const updateRefsData = (chartRefsData, clearPublishedState?) => {
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            payload.selectedTabIndex = state.selectedTabIndex === 3 ? 1 : state.selectedTabIndex
            payload.publishedState = null
            payload.showComments = false
            payload.latestDraft = null
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    async function initialise() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        getChartReferences(+appId)
            .then((chartRefResp) => {
                const { chartRefs, latestAppChartRef, latestChartRef, chartMetadata } = chartRefResp.result
                const selectedChartId: number = latestAppChartRef || latestChartRef
                const chart = chartRefs.find((chart) => chart.id === selectedChartId)
                const chartRefsData = {
                    charts: chartRefs,
                    chartsMetadata: chartMetadata,
                    selectedChartRefId: selectedChartId,
                    selectedChart: chart,
                }

                if (isProtected && typeof getDraftByResourceName === 'function') {
                    fetchAllDrafts(chartRefsData)
                } else {
                    updateRefsData(chartRefsData)
                }
            })
            .catch((err) => {
                showError(err)
                dispatch({
                    type: DeploymentConfigStateActionTypes.chartConfigLoading,
                    payload: false,
                })
            })
    }

    const fetchAllDrafts = (chartRefsData) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })

        getDraftByResourceName(appId, -1, 3, 'BaseDeploymentTemplate')
            .then((draftsResp) => {
                if (draftsResp.result && (draftsResp.result.draftState === 1 || draftsResp.result.draftState === 4)) {
                    processDraftData(draftsResp.result, chartRefsData)
                } else {
                    updateRefsData(chartRefsData, !!state.publishedState)
                }
            })
            .catch(() => {
                updateRefsData(chartRefsData)
            })
    }

    const processDraftData = (latestDraft, chartRefsData) => {
        const {
            valuesOverride,
            id,
            refChartTemplate,
            refChartTemplateVersion,
            isAppMetricsEnabled,
            chartRefId,
            isBasicViewLocked,
            currentViewEditor,
            readme,
            schema,
        } = JSON.parse(latestDraft.data)

        const _codeEditorStringifyData = YAML.stringify(valuesOverride, { indent: 2 })
        const isApprovalPending = latestDraft.draftState === 4
        const payload = {
            template: valuesOverride,
            chartConfig: {
                id,
                refChartTemplate,
                refChartTemplateVersion,
                chartRefId,
                readme,
            },
            isAppMetricsEnabled: isAppMetricsEnabled,
            tempFormData: _codeEditorStringifyData,
            draftValues: _codeEditorStringifyData,
            latestDraft: latestDraft,
            selectedTabIndex: isApprovalPending ? 2 : 3,
            openComparison: isApprovalPending,
            currentEditorView: currentViewEditor,
            readme,
            schema,
            ...{
                ...chartRefsData,
                selectedChartRefId: chartRefId,
                selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
            },
        }

        if (chartRefsData) {
            payload['publishedState'] = chartRefsData
        } else if (!state.publishedState) {
            payload['publishedState'] = state
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })

        if (payload.selectedChart.name === ROLLOUT_DEPLOYMENT || payload.selectedChart.name === DEPLOYMENT) {
            updateTemplateFromBasicValue(valuesOverride)
            parseDataForView(isBasicViewLocked, currentViewEditor, valuesOverride, payload, false)
        }
    }

    const toggleYamlMode = (yamlMode: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.yamlMode,
            payload: yamlMode,
        })
    }

    const parseDataForView = async (
        _isBasicViewLocked: boolean,
        _currentViewEditor: string,
        template,
        templateData,
        updatePublishedState: boolean,
    ): Promise<void> => {
        let abortController = new AbortController()
        if (_currentViewEditor === EDITOR_VIEW.UNDEFINED) {
            const {
                result: { defaultAppOverride },
            } = await getDeploymentTemplate(+appId, +state.selectedChart.id, abortController.signal, true)
            _isBasicViewLocked = isBasicValueChanged(defaultAppOverride, template)
        }

        if (abortController && !abortController.signal.aborted) {
            abortController.abort()
        }

        const statesToUpdate = {}
        if (!state.currentEditorView || !_currentViewEditor) {
            _currentViewEditor =
                _isBasicViewLocked ||
                currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE ||
                state.selectedTabIndex === 2 ||
                state.showReadme
                    ? EDITOR_VIEW.ADVANCED
                    : EDITOR_VIEW.BASIC

            statesToUpdate['isBasicLocked'] = _isBasicViewLocked
            statesToUpdate['currentEditorView'] = _currentViewEditor
            statesToUpdate['yamlMode'] = _currentViewEditor !== EDITOR_VIEW.BASIC
        }
        if (!_isBasicViewLocked) {
            const _basicFieldValues = getBasicFieldValue(template)
            if (
                _basicFieldValues[BASIC_FIELDS.HOSTS].length === 0 ||
                !_basicFieldValues[BASIC_FIELDS.PORT] ||
                !_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] ||
                !_basicFieldValues[BASIC_FIELDS.RESOURCES]
            ) {
                statesToUpdate['isBasicLocked'] = true
                statesToUpdate['currentEditorView'] = EDITOR_VIEW.ADVANCED
                statesToUpdate['yamlMode'] = true
            } else {
                statesToUpdate['basicFieldValues'] = _basicFieldValues
                statesToUpdate['basicFieldValuesErrorObj'] = validateBasicView(_basicFieldValues)
            }
        }

        if (updatePublishedState && templateData['publishedState']) {
            dispatch({
                type: DeploymentConfigStateActionTypes.publishedState,
                payload: {
                    ...templateData['publishedState'],
                    ...statesToUpdate,
                },
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: statesToUpdate,
            })
        }
    }

    async function fetchDeploymentTemplate() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        try {
            const {
                result: {
                    globalConfig: {
                        defaultAppOverride,
                        id,
                        refChartTemplate,
                        refChartTemplateVersion,
                        isAppMetricsEnabled,
                        chartRefId,
                        readme,
                        schema,
                        isBasicViewLocked,
                        currentViewEditor,
                    },
                },
            } = await getDeploymentTemplate(+appId, +state.selectedChart.id, baseDeploymentAbortController.signal)
            const _codeEditorStringifyData = YAML.stringify(defaultAppOverride, { indent: 2 })
            const templateData = {
                template: defaultAppOverride,
                schema,
                readme,
                currentEditorView: currentViewEditor,
                chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
                isAppMetricsEnabled: isAppMetricsEnabled,
                tempFormData: _codeEditorStringifyData,
                data: _codeEditorStringifyData,
            }

            let payload = {}
            if (state.publishedState) {
                payload['publishedState'] = {
                    ...state.publishedState,
                    ...templateData,
                }

                payload['readme'] = readme
                payload['schema'] = schema
                payload['chartConfig'] = {
                    ...state.chartConfig,
                    readme,
                }
            } else {
                payload = templateData
            }

            if (!state.isValues) {
                const _manifestCodeEditorData = await fetchManifestData(_codeEditorStringifyData)
                setManifestDataRHS(_manifestCodeEditorData)
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })

            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(defaultAppOverride)
                parseDataForView(isBasicViewLocked, currentViewEditor, defaultAppOverride, payload, true)
            }
        } catch (err) {
            showError(err)
            if (baseDeploymentAbortController && !baseDeploymentAbortController.signal.aborted) {
                baseDeploymentAbortController.abort()
            }
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.chartConfigLoading,
                payload: false,
            })
        }
    }

    const closeLockedDiffDrawerWithChildModal = () => {
        state.showConfirmation && handleConfirmationDialog(false)
        state.showSaveChangesModal && toggleSaveChangesModal()
        setSaveEligibleChangesCb(false)
        dispatch({
            type: DeploymentConfigStateActionTypes.toggleShowLockedTemplateDiff,
            payload: false,
        })
    }

    const handleLockedDiffDrawer = (value) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.toggleShowLockedTemplateDiff,
            payload: value,
        })
    }

    const handleSaveChanges = (e) => {
        e.preventDefault()
        if (!state.chartConfig.id) {
            //create flow
            save()
        } else if (isSuperAdmin) {
            //is superadmin 
            openConfirmationOrSaveChangesModal()
        } else checkForLockedChanges()
    }

    function openConfirmationOrSaveChangesModal() {
        if (!obj) {
            toast.error(error)
        } else if (
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            !state.yamlMode &&
            !state.basicFieldValuesErrorObj.isValid
        ) {
            toast.error('Some required fields are missing')
        } else if (isProtected) {
            toggleSaveChangesModal()
        } else if (state.chartConfig.id) {
            //update flow, might have overridden
            handleConfirmationDialog(true)
        }
    }

    const checkForLockedChanges = async () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.lockChangesLoading,
            payload: true,
        })
        try {
            const requestBody = prepareDataToSave(true)
            const deploymentTemplateResp = isProtected
                ? await checkForProtectedLockedChanges()
                : await getIfLockedConfigNonProtected(requestBody)
            if (deploymentTemplateResp.result.isLockConfigError) {
                setDisableSaveEligibleChanges(deploymentTemplateResp.result?.disableSaveEligibleChanges)
                setLockedOverride(deploymentTemplateResp.result?.lockedOverride)
                handleLockedDiffDrawer(true)
                return
            } else if (isProtected) {
                toggleSaveChangesModal()
                return
            }
            if (state.chartConfig.id) {
                handleConfirmationDialog(true)
            }
        } catch (err) {
            handleConfigProtectionError(2, err, dispatch, reloadEnvironments)
            if (!baseDeploymentAbortController.signal.aborted) {
                showError(err)
                baseDeploymentAbortController.abort()
            }
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.lockChangesLoading,
                payload: false,
            })
        }
    }

    const checkForProtectedLockedChanges = async () => {
        const data = prepareDataToSave()
        const action = data['id'] > 0 ? 2 : 1
        const requestPayload = {
            appId: Number(appId),
            envId: -1,
            action,
            data: JSON.stringify(data),
        }
        return await getIfLockedConfigProtected(requestPayload)
    }

    async function save() {
        dispatch({
            type: DeploymentConfigStateActionTypes.loading,
            payload: true,
        })
        try {
            const requestBody = prepareDataToSave(true)
            const api = state.chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            const deploymentTemplateResp = await api(requestBody, baseDeploymentAbortController.signal)
            if (deploymentTemplateResp.result.isLockConfigError) {
                setDisableSaveEligibleChanges(deploymentTemplateResp.result?.disableSaveEligibleChanges)
                setLockedOverride(deploymentTemplateResp.result?.lockedOverride)
                handleLockedDiffDrawer(true)
                return
            }
            reloadEnvironments()
            fetchDeploymentTemplate()
            respondOnSuccess()

            // Resetting the fetchedValues and fetchedValuesManifest caches to avoid showing the old data
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: { fetchedValues: {}, fetchedValuesManifest: {} },
            })

            toast.success(<SuccessToastBody chartConfig={state.chartConfig} />)

            if (!isCiPipeline) {
                const stageIndex = navItems.findIndex((item) => item.stage === STAGE_NAME.DEPLOYMENT_TEMPLATE)
                history.push(navItems[stageIndex + 1].href)
            }
        } catch (err) {
            handleConfigProtectionError(2, err, dispatch, reloadEnvironments)
            if (!baseDeploymentAbortController.signal.aborted) {
                showError(err)
                baseDeploymentAbortController.abort()
            }
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.loading,
                payload: false,
            })
            saveEligibleChangesCb && closeLockedDiffDrawerWithChildModal()
            state.showConfirmation && handleConfirmationDialog(false)
        }
    }

    const toggleAppMetrics = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.isAppMetricsEnabled,
            payload: !state.isAppMetricsEnabled,
        })
    }

    const isCompareAndApprovalState =
        state.selectedTabIndex === 2 && !state.showReadme && state.latestDraft?.draftState === 4

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        if (isCompareAndApprovalState) return

        if (state.isValues && !state.convertVariables) {
            dispatch({
                type: DeploymentConfigStateActionTypes.tempFormData,
                payload: str,
            })
        }
        try {
            const parsedValues = YAML.parse(str)

            // Unset unableToParseYaml flag when yaml is successfully parsed
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: false,
            })
            if (
                state.selectedChart &&
                (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
                str &&
                state.currentEditorView &&
                !state.isBasicLocked &&
                !fromBasic
            ) {
                dispatch({
                    type: DeploymentConfigStateActionTypes.isBasicLocked,
                    payload: isBasicValueChanged(parsedValues),
                })
            }
        } catch (error) {
            // Set unableToParseYaml flag when yaml is malformed
            if (!state.isValues) return // don't set flag when in manifest view
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: true,
            })
        }
    }

    const handleReadMeClick = () => {
        if (!state.showReadme && state.unableToParseYaml) return

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2,
            },
        })
    }

    const handleComparisonClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: { openComparison: !state.openComparison, showReadme: false },
        })
    }

    const changeEditorMode = (): void => {
        if (readOnlyPublishedMode) {
            if (state.publishedState && !state.publishedState.isBasicLocked) {
                toggleYamlMode(!state.yamlMode)
            }
            return
        } else if (state.basicFieldValuesErrorObj && !state.basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            toggleYamlMode(false)
            return
        } else if (state.isBasicLocked) {
            return
        }

        try {
            const parsedCodeEditorValue = YAML.parse(state.tempFormData)

            if (state.yamlMode) {
                const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: {
                        basicFieldValues: _basicFieldValues,
                        basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                    },
                })
            } else {
                const newTemplate = patchBasicData(parsedCodeEditorValue, state.basicFieldValues)
                updateTemplateFromBasicValue(newTemplate)
                editorOnChange(YAML.stringify(newTemplate), !state.yamlMode)
            }
            toggleYamlMode(!state.yamlMode)
        } catch (error) {}
    }

    const handleTabSelection = (index: number) => {
        if (state.unableToParseYaml) return

        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload:
                ((!state.latestDraft && state.selectedTabIndex === 1) || state.selectedTabIndex === 3) &&
                state.basicFieldValuesErrorObj &&
                !state.basicFieldValuesErrorObj.isValid
                    ? state.selectedTabIndex
                    : index,
        })

        setConvertVariables(false)

        switch (index) {
            case 1:
            case 3:
                setIsValues(true)
                const _isBasicLocked =
                    state.publishedState && index === 1 ? state.publishedState.isBasicLocked : state.isBasicLocked
                const defaultYamlMode =
                    state.selectedChart.name !== ROLLOUT_DEPLOYMENT && state.selectedChart.name !== DEPLOYMENT
                toggleYamlMode(
                    defaultYamlMode ||
                        _isBasicLocked ||
                        currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE,
                )
                if (state.selectedTabIndex === 2) {
                    handleComparisonClick()
                }
                break
            case 2:
                if (!state.openComparison) {
                    if (!state.yamlMode) {
                        if ((!state.latestDraft && state.selectedTabIndex === 1) || state.selectedTabIndex === 3) {
                            changeEditorMode()
                        } else {
                            toggleYamlMode(true)
                        }
                    }
                    handleComparisonClick()
                }
                break
            default:
                break
        }
    }

    const toggleSaveChangesModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })

    }
    const handleConfirmationDialog = (value:boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.showConfirmation,
            payload: value,
        })
    }
    
    const handleChangeCheckbox = () => {
        if (!saveEligibleChangesCb) {
            openConfirmationOrSaveChangesModal()
        } else {
            state.showSaveChangesModal && toggleSaveChangesModal()
            state.showConfirmation && handleConfirmationDialog(false)
        }
        setSaveEligibleChangesCb(!saveEligibleChangesCb)

    }

    const toggleDraftComments = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDraftComments })
    }

    const prepareDataToSave = (skipReadmeAndSchema?: boolean) => {
        let valuesOverride = obj

        if(state.showLockedTemplateDiff) {
            // if locked keys 
            if(!lockedConfigKeysWithLockType.allowed) {
                valuesOverride = getUnlockedJSON(lockedOverride, lockedConfigKeysWithLockType.config)
            } else {
                // if allowed keys
                valuesOverride = getLockedJSON(lockedOverride, lockedConfigKeysWithLockType.config)
            }
        }

        const requestData = {
            ...(state.chartConfig.chartRefId === state.selectedChart.id ? state.chartConfig : {}),
            appId: +appId,
            chartRefId: state.selectedChart.id,
            valuesOverride,
            defaultAppOverride: state.template,
            isAppMetricsEnabled: state.isAppMetricsEnabled,
            saveEligibleChanges: saveEligibleChangesCb,
        }
        if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
            requestData.isBasicViewLocked = state.isBasicLocked
            requestData.currentViewEditor = state.isBasicLocked ? EDITOR_VIEW.ADVANCED : state.currentEditorView
            if (!state.yamlMode) {
                requestData.valuesOverride = patchBasicData(obj, state.basicFieldValues)
            }
        }

        if (!skipReadmeAndSchema) {
            requestData['id'] = state.chartConfig.id
            requestData['readme'] = state.readme
            requestData['schema'] = state.schema
        }

        return requestData
    }

    useEffect(() => {
        if (state.isValues) return
        setLoadingManifest(true)
        const values = Promise.all([getValueRHS(), getValuesLHS()])
        values
            .then((res) => {
                setLoadingManifest(false)

                const [_manifestDataRHS, _manifestDataLHS] = res
                setManifestDataRHS(_manifestDataRHS)
                setManifestDataLHS(_manifestDataLHS)
            })
            .catch(() => {
                setIsValues(true)
                toast.error('Unable to fetch manifest data')
            })
            .finally(() => {
                setLoadingManifest(false)
            })
    }, [state.isValues])

    const fetchManifestData = async (data) => {
        const request = {
            appId: +appId,
            chartRefId: state.selectedChartRefId,
            valuesAndManifestFlag: 2,
            values: data,
        }
        setLoadingManifest(true)
        const response = await getDeploymentManisfest(request)
        setLoadingManifest(false)
        return response.result.data
    }

    const getValueRHS = async () => {
        let result = null
        if (isCompareAndApprovalState) {
            result = await fetchManifestData(state.draftValues)
        } else {
            result = await fetchManifestData(state.tempFormData)
        }
        return result
    }

    const getValuesLHS = async () => fetchManifestData(state.publishedState?.tempFormData ?? state.data)

    const renderEditorComponent = () => {
        if (readOnlyPublishedMode && !state.showReadme) {
            return <DeploymentTemplateReadOnlyEditorView value={state.publishedState?.tempFormData} />
        }

        if (state.loadingManifest) {
            return (
                <div className="h-100vh">
                    <Progressing pageLoader />
                </div>
            )
        }

        const valuesDataRHS = isCompareAndApprovalState ? state.draftValues : state.tempFormData

        return (
            <DeploymentTemplateEditorView
                defaultValue={state.isValues ? state.publishedState?.tempFormData ?? state.data : state.manifestDataLHS}
                value={state.isValues ? valuesDataRHS : state.manifestDataRHS}
                globalChartRefId={state.selectedChartRefId}
                editorOnChange={editorOnChange}
                readOnly={isCompareAndApprovalState || !state.isValues || state.convertVariables}
                isValues={state.isValues}
                convertVariables={state.convertVariables}
                setConvertVariables={setConvertVariables}
                groupedData={state.groupedOptionsData}
            />
        )
    }

    const renderValuesView = () => (
        <form
            action=""
            className={`white-card__deployment-config p-0 bcn-0 ${state.openComparison ? 'comparison-view' : ''} ${
                state.showReadme ? 'readme-view' : ''
            }`}
            onSubmit={handleSaveChanges}
        >
            <div className="variables-widget-position">
                <FloatingVariablesSuggestions zIndex={100} appId={appId} />
            </div>
            <DeploymentTemplateOptionsTab
                codeEditorValue={readOnlyPublishedMode ? state.publishedState?.tempFormData : state.tempFormData}
                disableVersionSelect={readOnlyPublishedMode}
                isValues={state.isValues}
            />
            {renderEditorComponent()}
            <DeploymentConfigFormCTA
                loading={state.loading || state.chartConfigLoading || state.lockChangesLoading}
                showAppMetricsToggle={
                    state.charts &&
                    state.selectedChart &&
                    window._env_?.APPLICATION_METRICS_ENABLED &&
                    grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
                    state.yamlMode
                }
                isAppMetricsEnabled={
                    readOnlyPublishedMode ? state.publishedState?.isAppMetricsEnabled : state.isAppMetricsEnabled
                }
                isCiPipeline={isCiPipeline}
                toggleAppMetrics={toggleAppMetrics}
                isPublishedMode={readOnlyPublishedMode}
                reload={initialise}
                isValues={state.isValues}
                convertVariables={state.convertVariables}
                isSuperAdmin={isSuperAdmin}
                handleLockedDiffDrawer={handleLockedDiffDrawer}
                setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                showLockedDiffForApproval={showLockedDiffForApproval}
                checkForProtectedLockedChanges={checkForProtectedLockedChanges}
                setLockedOverride={setLockedOverride}
            />
        </form>
    )

    const getValueForContext = () => ({
        isUnSet: readOnlyPublishedMode ? false : isUnSet,
        state,
        dispatch,
        isConfigProtectionEnabled: isProtected,
        environments: environments || [],
        changeEditorMode: changeEditorMode,
        reloadEnvironments: reloadEnvironments,
    })
    return (
        <DeploymentConfigContext.Provider value={getValueForContext()}>
            <div
                className={`app-compose__deployment-config dc__window-bg ${
                    state.openComparison || state.showReadme ? 'full-view' : ''
                } ${state.showComments ? 'comments-view' : ''}`}
            >
                <div className="dc__border br-4 m-8 dc__overflow-hidden" style={{ height: 'calc(100vh - 92px)' }}>
                    <ConfigToolbar
                        loading={state.loading || state.chartConfigLoading}
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        selectedTabIndex={state.selectedTabIndex}
                        handleTabSelection={handleTabSelection}
                        noReadme={!state.yamlMode}
                        showReadme={state.showReadme}
                        isReadmeAvailable={!!state.readme}
                        handleReadMeClick={handleReadMeClick}
                        handleCommentClick={toggleDraftComments}
                        commentsPresent={state.latestDraft?.commentsCount > 0}
                        isDraftMode={isProtected && !!state.latestDraft}
                        isApprovalPending={state.latestDraft?.draftState === 4}
                        approvalUsers={state.latestDraft?.approvers}
                        showValuesPostfix={true}
                        reload={initialise}
                        isValues={state.isValues}
                        setIsValues={setIsValues}
                        convertVariables={state.convertVariables}
                        setConvertVariables={setConvertVariables}
                        componentType={3}
                        setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                    />
                    {renderValuesView()}
                    {state.showConfirmation && (
                        <SaveConfirmationDialog
                            onSave={save}
                            showAsModal={!state.showLockedTemplateDiff}
                            closeLockedDiffDrawerWithChildModal={closeLockedDiffDrawerWithChildModal}
                        />
                    )}
                    {DeploymentTemplateLockedDiff && state.showLockedTemplateDiff && (
                        <DeploymentTemplateLockedDiff
                            CodeEditor={CodeEditor}
                            closeModal={closeLockedDiffDrawerWithChildModal}
                            handleChangeCheckbox={handleChangeCheckbox}
                            saveEligibleChangesCb={saveEligibleChangesCb}
                            showLockedDiffForApproval={showLockedDiffForApproval}
                            onSave={save}
                            lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                            lockedOverride={lockedOverride}
                            disableSaveEligibleChanges={disableSaveEligibleChanges}
                            setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                        />
                    )}
                    {SaveChangesModal && state.showSaveChangesModal && (
                        <SaveChangesModal
                            appId={Number(appId)}
                            envId={-1}
                            resourceType={3}
                            resourceName="BaseDeploymentTemplate"
                            prepareDataToSave={prepareDataToSave}
                            toggleModal={toggleSaveChangesModal}
                            latestDraft={state.latestDraft}
                            reload={initialise}
                            closeLockedDiffDrawerWithChildModal={closeLockedDiffDrawerWithChildModal}
                            showAsModal={!state.showLockedTemplateDiff}
                            saveEligibleChangesCb={saveEligibleChangesCb}
                        />
                    )}
                </div>
                {DraftComments && state.showComments && (
                    <DraftComments
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        toggleDraftComments={toggleDraftComments}
                    />
                )}
            </div>
        </DeploymentConfigContext.Provider>
    )
}
