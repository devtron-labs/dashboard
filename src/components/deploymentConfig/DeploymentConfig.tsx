/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Reducer, useEffect, useReducer, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    showError,
    useEffectAfterMount,
    useAsync,
    useMainContext,
    YAMLStringify,
    ModuleNameMap,
    ModuleStatus,
    useUrlFilters,
    DeploymentTemplateQueryParamsType,
    DeploymentTemplateTabsType,
    ConfigurationType,
    DeploymentConfigStateActionTypes,
    DeploymentTemplateProvider,
    DeploymentConfigStateAction,
    DeploymentConfigStateWithDraft,
    ConfigKeysWithLockType,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { Operation, compare as jsonpatchCompare } from 'fast-json-patch'
import { useAppConfigurationContext } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfiguration.provider'
import {
    getDeploymentTemplate,
    updateDeploymentTemplate,
    saveDeploymentTemplate,
    getOptions,
    getIfLockedConfigProtected,
} from './service'
import { getChartReferences } from '../../services/service'
import { useJsonYaml, importComponentFromFELibrary, FloatingVariablesSuggestions } from '../common'
import { DeploymentConfigProps } from './types'
import './deploymentConfig.scss'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { groupDataByType, handleConfigProtectionError } from './DeploymentConfig.utils'
import DeploymentConfigFormCTA from './DeploymentTemplateView/DeploymentConfigFormCTA'
import DeploymentTemplateEditorView from './DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentTemplateOptionsTab from './DeploymentTemplateView/DeploymentTemplateOptionsTab'
import DeploymentConfigToolbar from './DeploymentTemplateView/DeploymentConfigToolbar'
import { SaveConfirmationDialog, SuccessToastBody } from './DeploymentTemplateView/DeploymentTemplateView.component'
import { deploymentConfigReducer, initDeploymentConfigState } from './DeploymentConfigReducer'
import DeploymentTemplateReadOnlyEditorView from './DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'
import { applyCompareDiffOfTempFormDataOnOriginalData, getDeploymentTemplateQueryParser } from './utils'
import DeploymentTemplateForm from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/DeploymentTemplate/DeploymentTemplateForm'

const DeploymentTemplateLockedDiff = importComponentFromFELibrary('DeploymentTemplateLockedDiff')
const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DraftComments = importComponentFromFELibrary('DraftComments')
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const getLockedJSON = importComponentFromFELibrary('getLockedJSON', null, 'function')
const getUnlockedJSON = importComponentFromFELibrary('getUnlockedJSON', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    isCiPipeline,
    environments,
    isProtected,
    reloadEnvironments,
}: DeploymentConfigProps) {
    // Create a useParam type containing only appId for devtron apps
    const { appId } = useParams<{ appId: string }>()
    const { isSuperAdmin } = useMainContext()

    /**
     * State to derive whether to save eligible changes after applying lock config.
     * TODO: Move to DeploymentTemplateLockedDiff
     */
    const [saveEligibleChangesCb, setSaveEligibleChangesCb] = useState<boolean>(false)
    /**
     * State to show locked changes modal in case user is non super admin and is changing locked keys
     * TODO: Should be part of showLockedTemplateDiff
     */
    const [showLockedDiffForApproval, setShowLockedDiffForApproval] = useState<boolean>(false)
    /**
     * Can remove this state since we calculate this at FE itself
     */
    const [disableSaveEligibleChanges, setDisableSaveEligibleChanges] = useState<boolean>(false)
    /**
     * TODO: Can move to fe-lib at mount of provider currently multiple calls are getting called
     */
    const [lockedConfigKeysWithLockType, setLockedConfigKeysWithLockType] = useState<ConfigKeysWithLockType>({
        config: [],
        allowed: false,
    })

    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        { ...initDeploymentConfigState, yamlMode: isSuperAdmin },
    )

    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const isGuiModeRef = useRef(state.yamlMode)
    const hideLockKeysToggled = useRef(false)

    const readOnlyPublishedMode = state.selectedTabIndex === 1 && isProtected && !!state.latestDraft
    const isCompareAndApprovalState =
        state.selectedTabIndex === 2 && !state.showReadme && state.latestDraft?.draftState === 4
    const baseDeploymentAbortController = new AbortController()
    const removedPatches = useRef<Array<Operation>>([])
    const { fetchEnvConfig } = useAppConfigurationContext()

    const {
        clearFilters,
        hideLockedKeys,
        selectedTab,
        resolveScopedVariables,
        updateSearchParams,
        showReadMe,
        editMode,
    } = useUrlFilters<never, DeploymentTemplateQueryParamsType>({
        parseSearchParams: getDeploymentTemplateQueryParser(isSuperAdmin),
    })

    const handleUpdateRemovedPatches = (patches: Operation[]) => {
        removedPatches.current = patches
    }

    // TODO: Rename this method
    const setHideLockedKeys = (value: boolean) => {
        updateSearchParams({ hideLockedKeys: value })
    }

    const handleSetHideLockedKeys = (value: boolean) => {
        if (!state.wasGuiOrHideLockedKeysEdited) {
            dispatch({ type: DeploymentConfigStateActionTypes.wasGuiOrHideLockedKeysEdited, payload: true })
        }
        // NOTE: since we are removing/patching for hide locked keys feature during the render
        // of EditorView, through getLockFilteredTemplate, we need to set the following ref to true
        // for hide logic to work. Therefore, whenever hideLockedKeys is changed we should update
        // the following ref to true. Internally getLockFilteredTemplate will set it to false.
        hideLockKeysToggled.current = true
        setHideLockedKeys(value)
    }

    const setGroupedOptionsData = (value: Array<Object>) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.groupedOptionsData,
            payload: value,
        })
    }

    const setConvertVariables = (value: boolean) => {
        updateSearchParams({
            resolveScopedVariables: value,
        })

        // FIXME: Remove this dispatch
        dispatch({
            type: DeploymentConfigStateActionTypes.convertVariables,
            payload: value,
        })
    }

    const handleDisableResolveScopedVariables = () => {
        setConvertVariables(false)
    }

    // TODO: use async
    useEffect(() => {
        // TODO: No error/loading state for this
        const fetchOptionsList = async () => {
            const res = await getOptions(+appId, -1) // -1 is for base deployment template
            const { result } = res
            const _groupedData = groupDataByType(result)
            setGroupedOptionsData(_groupedData)
        }

        fetchOptionsList()
    }, [environments])

    useEffect(() => {
        reloadEnvironments()
        initialise()
    }, [])

    // FIXME: Ideally should be inside code editor
    useEffectAfterMount(() => {
        if (state.selectedChart) {
            fetchDeploymentTemplate()
        }
    }, [state.selectedChart])

    const updateRefsData = (
        chartRefsData: Pick<
            DeploymentConfigStateWithDraft,
            'charts' | 'chartsMetadata' | 'selectedChartRefId' | 'selectedChart'
        >,
        clearPublishedState: boolean = false,
    ) => {
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            const updatedPayload: Partial<DeploymentConfigStateWithDraft> = {
                ...payload,
                selectedTabIndex: state.selectedTabIndex === 3 ? 1 : state.selectedTabIndex,
                publishedState: null,
                showComments: false,
                latestDraft: null,
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: updatedPayload,
            })

            return
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
                    // TODO: Look into it when doing moving to approval
                    fetchAllDrafts(chartRefsData)
                } else {
                    updateRefsData(chartRefsData)
                }
            })
            .catch((err) => {
                // TODO: Need error screen for this
                showError(err)
                dispatch({
                    type: DeploymentConfigStateActionTypes.chartConfigLoading,
                    payload: false,
                })
            })
            .finally(() => {
                dispatch({
                    type: DeploymentConfigStateActionTypes.loading,
                    payload: false,
                })
            })
    }

    const fetchAllDrafts = (chartRefsData: Parameters<typeof updateRefsData>[0]) => {
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
            readme,
            schema,
        } = JSON.parse(latestDraft.data)

        const _codeEditorStringifyData = YAMLStringify(valuesOverride)
        const isApprovalPending = latestDraft.draftState === 4
        const payload: Partial<DeploymentConfigStateWithDraft> = {
            template: valuesOverride,
            chartConfig: {
                id,
                refChartTemplate,
                refChartTemplateVersion,
                chartRefId,
                readme,
            },
            isAppMetricsEnabled,
            tempFormData: _codeEditorStringifyData,
            draftValues: _codeEditorStringifyData,
            latestDraft,
            openComparison: isApprovalPending,
            readme,
            schema,
            ...{
                ...chartRefsData,
                selectedChartRefId: chartRefId,
                selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
            },
        }

        handleTabSelection(isApprovalPending ? 2 : 3)

        if (chartRefsData) {
            payload['publishedState'] = chartRefsData
        } else if (!state.publishedState) {
            payload['publishedState'] = state
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    const toggleYamlMode = (yamlMode: boolean) => {
        // NOTE: if we are on invalid yaml then this will fail thus wrapping it with try catch
        if (!state.yamlMode && yamlMode) {
            try {
                if (state.wasGuiOrHideLockedKeysEdited) {
                    applyCompareDiffOfTempFormDataOnOriginalData(state.data, state.tempFormData, editorOnChange)
                }
            } catch {}
        }
        dispatch({
            type: DeploymentConfigStateActionTypes.yamlMode,
            payload: yamlMode,
        })
    }

    const handleChangeToYAMLMode = () => {
        updateSearchParams({ editMode: ConfigurationType.YAML })
    }

    const handleChangeToGUIMode = () => {
        updateSearchParams({ editMode: ConfigurationType.GUI })
    }

    const reload = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.loading,
            payload: {
                loading: true,
            },
        })
        handleSetHideLockedKeys(false)
        clearFilters()
        initialise()
        fetchEnvConfig(-1)
    }

    async function fetchDeploymentTemplate() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })

        try {
            // TODO: Error state
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
                    },
                    guiSchema,
                },
            } = await getDeploymentTemplate(
                +appId,
                +state.selectedChart.id,
                baseDeploymentAbortController.signal,
                state.selectedChart.name,
            )

            const _codeEditorStringifyData = YAMLStringify(defaultAppOverride)
            const templateData: Partial<DeploymentConfigStateWithDraft> = {
                template: defaultAppOverride,
                schema,
                readme,
                guiSchema,
                chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
                isAppMetricsEnabled,
                tempFormData: _codeEditorStringifyData,
                // TODO: move to updateSearchParams
                ...(guiSchema === '{}' ? { yamlMode: true } : {}),
                // NOTE: temp form data is temp data updated by the code editor while data is the original
                data: _codeEditorStringifyData,

                // New keys addition
                baseDeploymentTemplate: _codeEditorStringifyData,
                originalTemplate: _codeEditorStringifyData,
                editorTemplate: _codeEditorStringifyData,
            }

            let payload = {}
            if (state.publishedState) {
                payload['publishedState'] = {
                    ...state.publishedState,
                    ...templateData,
                }
                payload['guiSchema'] = guiSchema
                if (templateData.yamlMode) {
                    payload['yamlMode'] = templateData.yamlMode
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

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })
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
        if (!state.chartConfig.id || !isSuperAdmin) {
            // create flow
            save()
        } else {
            // is super admin
            openConfirmationOrSaveChangesModal()
        }
    }

    function openConfirmationOrSaveChangesModal() {
        if (!obj) {
            toast.error(error)
        } else if (state.chartConfig.id) {
            // update flow, might have overridden
            handleConfirmationDialog(true)
        }
    }

    // TODO: This should be inside fe-lib
    const checkForProtectedLockedChanges = async (data: object) => {
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
        const actionType = isProtected ? 'lockChangesLoading' : 'loading'
        dispatch({
            type: DeploymentConfigStateActionTypes[actionType],
            payload: true,
        })
        const unprotectedApi = state.chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
        const api = isProtected ? checkForProtectedLockedChanges : unprotectedApi
        try {
            const requestBody = prepareDataToSave(true)
            const deploymentTemplateResp = await api(requestBody, baseDeploymentAbortController.signal)
            if (deploymentTemplateResp.result.isLockConfigError) {
                // TODO: Remove this check
                // TODO: Remove lock validate api call
                setDisableSaveEligibleChanges(deploymentTemplateResp.result?.disableSaveEligibleChanges)
                handleLockedDiffDrawer(true)
                return
            }
            if (isProtected) {
                // NOTE: if isProtected is true then we only have sent a validate call
                // thus open the saveChangesModal
                toggleSaveChangesModal()
                return
            }
            reloadEnvironments()
            fetchDeploymentTemplate()
            respondOnSuccess(!isCiPipeline)

            // Resetting the fetchedValues and fetchedValuesManifest caches to avoid showing the old data
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: { fetchedValues: {}, fetchedValuesManifest: {} },
            })

            toast.success(<SuccessToastBody chartConfig={state.chartConfig} />)
        } catch (err) {
            handleConfigProtectionError(2, err, dispatch, reloadEnvironments)
            if (!baseDeploymentAbortController.signal.aborted) {
                showError(err)
                baseDeploymentAbortController.abort()
            }
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes[actionType],
                payload: false,
            })
            saveEligibleChangesCb && closeLockedDiffDrawerWithChildModal()
            state.showConfirmation && handleConfirmationDialog(false)
            handleSetHideLockedKeys(false)
        }
    }

    const toggleAppMetrics = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.isAppMetricsEnabled,
            payload: !state.isAppMetricsEnabled,
        })
    }

    const editorOnChange = (str: string): void => {
        if (isCompareAndApprovalState) {
            return
        }

        if (!resolveScopedVariables) {
            dispatch({
                type: DeploymentConfigStateActionTypes.editorTemplate,
                payload: str,
            })
        }
        try {
            // Unset unableToParseYaml flag when yaml is successfully parsed
            const _ = YAML.parse(str)
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: false,
            })
        } catch (error) {
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: true,
            })
        }
    }

    const handleReadMeClick = () => {
        // TODO: Can give tooltip on button as well
        if (!state.showReadme && state.unableToParseYaml) {
            return
        }

        updateSearchParams({ showReadMe: !showReadMe })

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2,
            },
        })
        hideLockKeysToggled.current = true
    }

    const handleComparisonClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: { openComparison: !state.openComparison, showReadme: false },
        })
    }

    const changeEditorMode = (): void => {
        // NOTE: this ref decides if hide lock keys logic applies
        // In this case we want it to do it's calculation when we switch toggles
        hideLockKeysToggled.current = true
        toggleYamlMode(!state.yamlMode)
    }

    const handleTabSelection = (index: number) => {
        const isDraftMode = isProtected && !!state.latestDraft

        // setting true to update code editor values with current locked keys checkbox value
        if (state.selectedTabIndex !== index) {
            hideLockKeysToggled.current = true
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload: index,
        })

        setConvertVariables(false)

        // NOTE: if we are on invalid yaml then this will fail thus wrapping it with try catch
        try {
            if (state.wasGuiOrHideLockedKeysEdited) {
                applyCompareDiffOfTempFormDataOnOriginalData(state.data, state.tempFormData, editorOnChange)
            }
        } catch {}

        switch (index) {
            // 1 is published in case of draft else current values in case of normal
            case 1:
                if (state.selectedTabIndex === 2) {
                    toggleYamlMode(isGuiModeRef.current)
                    handleComparisonClick()
                }
                // FIXME: The enums should correspond to case values directly
                updateSearchParams({
                    selectedTab: isDraftMode ? DeploymentTemplateTabsType.PUBLISHED : DeploymentTemplateTabsType.EDIT,
                })
                break
            case 3:
                if (state.selectedTabIndex === 2) {
                    toggleYamlMode(isGuiModeRef.current)
                    handleComparisonClick()
                }
                updateSearchParams({ selectedTab: DeploymentTemplateTabsType.EDIT })
                break
            // 2 is compared
            case 2:
                if (state.selectedTabIndex !== 2) {
                    isGuiModeRef.current = state.yamlMode
                }
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

                updateSearchParams({
                    selectedTab: DeploymentTemplateTabsType.COMPARE,
                })
                break
            default:
                break
        }
    }

    const toggleSaveChangesModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
    }

    const handleConfirmationDialog = (value: boolean) => {
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
        const shouldReapplyRemovedLockedKeys = hideLockedKeys && reapplyRemovedLockedKeysToYaml

        // TODO: Can look if we can move this to a hook and send removedPatches inside it.
        if (shouldReapplyRemovedLockedKeys) {
            valuesOverride = reapplyRemovedLockedKeysToYaml(valuesOverride, removedPatches.current)
        }

        if (state.wasGuiOrHideLockedKeysEdited) {
            valuesOverride = applyCompareDiffOfTempFormDataOnOriginalData(
                state.publishedState?.tempFormData ?? state.data,
                YAMLStringify(valuesOverride),
                // NOTE: if shouldReapplyRemovedLockedKeys is true we don't want to save these changes to state.tempFormData
                // thus sending in null; because in this case we reapply only to make the payload for save
                shouldReapplyRemovedLockedKeys ? null : editorOnChange,
            )
        }

        // NOTE: toggleLockedTemplateDiff in the reducer will trigger this
        if (state.showLockedTemplateDiff) {
            const edited = YAML.parse(state.tempFormData)
            const unedited = YAML.parse(state.data)
            const documentsNPatches = {
                edited,
                unedited,
                patches: jsonpatchCompare(unedited, edited),
            }
            if (!lockedConfigKeysWithLockType.allowed) {
                // NOTE: need to send only the changed parts from the yaml as json
                valuesOverride = getUnlockedJSON(documentsNPatches, lockedConfigKeysWithLockType.config)
            } else {
                valuesOverride = getLockedJSON(documentsNPatches, lockedConfigKeysWithLockType.config)
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

        if (!skipReadmeAndSchema) {
            requestData['id'] = state.chartConfig.id
            requestData['readme'] = state.readme
            requestData['schema'] = state.schema
        }

        return requestData
    }

    const renderEditorComponent = () => {
        // Move to fe-lib
        if (readOnlyPublishedMode && !state.showReadme) {
            return (
                <DeploymentTemplateReadOnlyEditorView
                    value={state.publishedState?.tempFormData}
                    uneditedDocument={state.publishedState?.tempFormData}
                    editedDocument={state.publishedState?.tempFormData}
                    lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                    hideLockedKeys={hideLockedKeys}
                />
            )
        }

        const valuesDataRHS = isCompareAndApprovalState ? state.draftValues : state.tempFormData
        const isReadOnlyView = isCompareAndApprovalState || resolveScopedVariables

        if (state.chartConfigLoading) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
            )
        }

        // TODO: Should be default case
        if (selectedTab === DeploymentTemplateTabsType.EDIT) {
            return (
                <DeploymentTemplateForm
                    editMode={editMode}
                    hideLockedKeys={hideLockedKeys}
                    lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                    readOnly={isReadOnlyView}
                    resolveScopedVariables={resolveScopedVariables}
                />
            )
        }

        // TODO: Won;t reach here
        return (
            <DeploymentTemplateEditorView
                defaultValue={state.publishedState?.tempFormData ?? state.data}
                value={valuesDataRHS}
                globalChartRefId={state.selectedChartRefId}
                editorOnChange={editorOnChange}
                readOnly={isReadOnlyView}
                // FIXME: Remove
                isValues
                convertVariables={state.convertVariables}
                setConvertVariables={setConvertVariables}
                groupedData={state.groupedOptionsData}
                hideLockedKeys={hideLockedKeys}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                hideLockKeysToggled={hideLockKeysToggled}
                removedPatches={removedPatches}
                uneditedDocument={state.publishedState?.tempFormData || state.data}
                editedDocument={state.tempFormData}
            />
        )
    }

    const renderValuesView = () => (
        <div
            className={`white-card__deployment-config p-0 bcn-0 ${state.openComparison ? 'comparison-view' : ''} ${
                state.showReadme ? 'readme-view' : ''
            }`}
        >
            {window._env_.ENABLE_SCOPED_VARIABLES && (
                <div className="variables-widget-position">
                    <FloatingVariablesSuggestions zIndex={100} appId={appId} hideObjectVariables={false} />
                </div>
            )}

            <DeploymentTemplateOptionsTab
                disableVersionSelect={readOnlyPublishedMode}
                // FIXME: Remove
                isValues
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
                reload={reload}
                // FIXME: Remove
                isValues
                convertVariables={state.convertVariables}
                handleLockedDiffDrawer={handleLockedDiffDrawer}
                setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                showLockedDiffForApproval={showLockedDiffForApproval}
                checkForProtectedLockedChanges={() => checkForProtectedLockedChanges(prepareDataToSave())}
                handleSaveChanges={handleSaveChanges}
            />
        </div>
    )

    // TODO: Should be memoized
    const getValueForContext = () => ({
        isUnSet: readOnlyPublishedMode ? false : isUnSet,
        state,
        dispatch,
        isConfigProtectionEnabled: isProtected,
        environments: environments || [],
        changeEditorMode,
        reloadEnvironments,
        // TODO: New Keys, handle in override
        handleChangeToYAMLMode,
        handleChangeToGUIMode,
        editorOnChange,
        handleDisableResolveScopedVariables,
        lockedConfigKeysWithLockType,
        removedPatches,
        handleUpdateRemovedPatches,
    })

    return (
        <DeploymentTemplateProvider value={getValueForContext()}>
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
                        showValuesPostfix
                        reload={reload}
                        convertVariables={state.convertVariables}
                        setConvertVariables={setConvertVariables}
                        componentType={3}
                        setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                        setHideLockedKeys={handleSetHideLockedKeys}
                        hideLockedKeys={hideLockedKeys}
                        setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                        lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                        hideLockKeysToggled={hideLockKeysToggled}
                        inValidYaml={state.unableToParseYaml}
                        appId={appId}
                        envId={-1}
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
                            closeModal={closeLockedDiffDrawerWithChildModal}
                            handleChangeCheckbox={handleChangeCheckbox}
                            saveEligibleChangesCb={saveEligibleChangesCb}
                            showLockedDiffForApproval={showLockedDiffForApproval}
                            onSave={save}
                            lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                            documents={{
                                edited: reapplyRemovedLockedKeysToYaml(
                                    YAML.parse(isCompareAndApprovalState ? state.draftValues : state.tempFormData),
                                    removedPatches.current,
                                ),
                                unedited: YAML.parse(state.publishedState?.tempFormData ?? state.data),
                            }}
                            disableSaveEligibleChanges={disableSaveEligibleChanges}
                            setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                            appId={appId}
                            envId={-1}
                        />
                    )}
                    {/* In case of protect */}
                    {SaveChangesModal && state.showSaveChangesModal && (
                        <SaveChangesModal
                            appId={Number(appId)}
                            envId={-1}
                            resourceType={3}
                            resourceName="BaseDeploymentTemplate"
                            prepareDataToSave={prepareDataToSave}
                            toggleModal={toggleSaveChangesModal}
                            latestDraft={state.latestDraft}
                            reload={reload}
                            closeLockedDiffDrawerWithChildModal={closeLockedDiffDrawerWithChildModal}
                            showAsModal={!state.showLockedTemplateDiff}
                            saveEligibleChangesCb={saveEligibleChangesCb}
                        />
                    )}
                </div>

                {/* In case of protect */}
                {DraftComments && state.showComments && (
                    <DraftComments
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        toggleDraftComments={toggleDraftComments}
                    />
                )}
            </div>
        </DeploymentTemplateProvider>
    )
}
