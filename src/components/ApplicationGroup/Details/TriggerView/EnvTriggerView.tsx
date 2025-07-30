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

import React, { useEffect, useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import { Prompt, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'

import {
    API_STATUS_CODES,
    ApiQueuingWithBatch,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CDMaterialResponseType,
    Checkbox,
    CHECKBOX_VALUE,
    CommonNodeAttr,
    ComponentSizeType,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    DeploymentNodeType,
    DeploymentStrategyTypeWithDefault,
    ErrorScreenManager,
    getStageTitle,
    handleAnalyticsEvent,
    PipelineIdsVsDeploymentStrategyMap,
    PopupMenu,
    Progressing,
    RuntimePluginVariables,
    ServerErrors,
    showError,
    sortCallback,
    ToastManager,
    ToastVariantType,
    TriggerBlockType,
    triggerCDNode,
    usePrompt,
    WorkflowNodeType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BuildImageModal, BulkBuildImageModal } from '@Components/app/details/triggerView/BuildImageModal'
import { shouldRenderWebhookAddImageModal } from '@Components/app/details/triggerView/TriggerView.utils'
import { getExternalCIConfig } from '@Components/ciPipeline/Webhook/webhook.service'

import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as Pencil } from '../../../../assets/icons/ic-pencil.svg'
import { URLS, ViewType } from '../../../../config'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { TRIGGER_VIEW_PARAMS } from '../../../app/details/triggerView/Constants'
import { CIMaterialRouterProps, MATERIAL_TYPE, RuntimeParamsErrorState } from '../../../app/details/triggerView/types'
import { Workflow } from '../../../app/details/triggerView/workflow/Workflow'
import { triggerBranchChange } from '../../../app/service'
import { getCDPipelineURL, importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../../common'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { getWorkflows, getWorkflowStatus } from '../../AppGroup.service'
import {
    AppGroupDetailDefaultType,
    BulkCDDetailType,
    BulkCDDetailTypeResponse,
    ProcessWorkFlowStatusType,
    ResponseRowType,
    TriggerVirtualEnvResponseRowType,
    WorkflowAppSelectionType,
} from '../../AppGroup.types'
import { processWorkflowStatuses } from '../../AppGroup.utils'
import {
    BULK_CD_RESPONSE_STATUS_TEXT,
    BULK_CI_RESPONSE_STATUS_TEXT,
    BULK_VIRTUAL_RESPONSE_STATUS,
    BulkResponseStatus,
    ENV_TRIGGER_VIEW_GA_EVENTS,
    GetBranchChangeStatus,
    SKIPPED_RESOURCES_MESSAGE,
    SKIPPED_RESOURCES_STATUS_TEXT,
} from '../../Constants'
import BulkCDTrigger from './BulkCDTrigger'
import BulkSourceChange from './BulkSourceChange'
import { RenderCDMaterialContentProps } from './types'
import { getSelectedCDNode, getSelectedNodeAndAppId, getSelectedNodeAndMeta } from './utils'

import './EnvTriggerView.scss'
import { DeployImageModal } from '@Components/app/details/triggerView/DeployImageModal'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const processDeploymentWindowStateAppGroup = importComponentFromFELibrary(
    'processDeploymentWindowStateAppGroup',
    null,
    'function',
)
const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)
const ChangeImageSource = importComponentFromFELibrary('ChangeImageSource', null, 'function')
const WebhookAddImageModal = importComponentFromFELibrary('WebhookAddImageModal', null, 'function')

// FIXME: IN CIMaterials we are sending isCDLoading while in CD materials we are sending isCILoading
let inprogressStatusTimer
const EnvTriggerView = ({ filteredAppIds, isVirtualEnv }: AppGroupDetailDefaultType) => {
    const { envId } = useParams<{ envId: string }>()
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch<CIMaterialRouterProps>()
    const { url } = useRouteMatch()

    const abortControllerRef = useRef(new AbortController())

    const [pageViewType, setPageViewType] = useState<string>(ViewType.LOADING)
    const [isCILoading, setCILoading] = useState(false)
    const [isCDLoading, setCDLoading] = useState(false)
    const [isBranchChangeLoading, setIsBranchChangeLoading] = useState(false)
    const [showPreDeployment, setShowPreDeployment] = useState(false)
    const [showPostDeployment, setShowPostDeployment] = useState(false)
    const [errorCode, setErrorCode] = useState(0)
    const [showBulkCDModal, setShowBulkCDModal] = useState(false)
    const [showBulkCIModal, setShowBulkCIModal] = useState(false)
    const [showBulkSourceChangeModal, setShowBulkSourceChangeModal] = useState(false)
    const [selectedAppList, setSelectedAppList] = useState<WorkflowAppSelectionType[]>([])
    const [workflows, setWorkflows] = useState<WorkflowType[]>([])
    const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowType[]>([])
    const [filteredCIPipelines, setFilteredCIPipelines] = useState(null)
    const [bulkTriggerType, setBulkTriggerType] = useState<DeploymentNodeType>(null)
    // TODO: Not needed
    const [materialType, setMaterialType] = useState(MATERIAL_TYPE.inputMaterialList)
    const [responseList, setResponseList] = useState<ResponseRowType[]>([])
    const [isSelectAll, setSelectAll] = useState(false)
    const [selectAllValue, setSelectAllValue] = useState<CHECKBOX_VALUE>(CHECKBOX_VALUE.CHECKED)
    // Mapping pipelineId (in case of CI) and appId (in case of CD) to runtime params
    const [runtimeParams, setRuntimeParams] = useState<Record<string, RuntimePluginVariables[]>>({})
    const [runtimeParamsErrorState, setRuntimeParamsErrorState] = useState<Record<string, RuntimeParamsErrorState>>({})
    const [isBulkTriggerLoading, setIsBulkTriggerLoading] = useState<boolean>(false)
    const [selectedWebhookNode, setSelectedWebhookNode] = useState<{ appId: number; id: number }>(null)
    const [bulkDeploymentStrategy, setBulkDeploymentStrategy] = useState<DeploymentStrategyTypeWithDefault>('DEFAULT')

    const enableRoutePrompt = isBranchChangeLoading || isBulkTriggerLoading
    usePrompt({ shouldPrompt: enableRoutePrompt })

    useEffect(() => {
        if (envId) {
            setPageViewType(ViewType.LOADING)
            setSelectedAppList([])
            getWorkflowsData()
        }
        return () => {
            inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        }
    }, [filteredAppIds])

    const reloadTriggerView = () => {
        setPageViewType(ViewType.LOADING)
        inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        getWorkflowsData()
    }

    const preserveSelection = (_workflows: WorkflowType[]) => {
        if (!workflows || !_workflows) {
            return
        }
        const workflowMap = new Map()
        workflows.forEach((wf) => {
            workflowMap.set(wf.id, wf.isSelected)
        })
        _workflows.forEach((wf) => {
            wf.isSelected = workflowMap.get(wf.id)
        })
    }

    const getWorkflowsData = async (): Promise<WorkflowType[]> => {
        try {
            const { workflows: _workflows, filteredCIPipelines } = await getWorkflows(envId, filteredAppIds)
            if (processDeploymentWindowStateAppGroup && _workflows.length) {
                await processDeploymentWindowStateAppGroup(_workflows)
            }
            preserveSelection(_workflows)
            setWorkflows(_workflows)
            setFilteredCIPipelines(filteredCIPipelines)
            setErrorCode(0)
            setPageViewType(ViewType.FORM)
            getWorkflowStatusData(_workflows)
            processFilteredData(_workflows)

            return _workflows
        } catch (error) {
            showError(error)
            setErrorCode(error.code)
            setPageViewType(ViewType.ERROR)
        }
    }

    const processFilteredData = (_filteredWorkflows: WorkflowType[]): void => {
        const _selectedAppList = []
        let _preNodeExist
        let _postNodeExist
        _filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                const _currentAppDetail = {
                    id: wf.appId,
                    name: wf.name,
                    preNodeAvailable: false,
                    postNodeAvailable: false,
                }
                for (const node of wf.nodes) {
                    if (node.environmentId === +envId && node.type === WorkflowNodeType.CD) {
                        _preNodeExist = _preNodeExist || !!node.preNode
                        _postNodeExist = _postNodeExist || !!node.postNode
                        _currentAppDetail.preNodeAvailable = !!node.preNode
                        _currentAppDetail.postNodeAvailable = !!node.postNode
                        break
                    }
                }
                _selectedAppList.push(_currentAppDetail)
            }
        })
        setShowPreDeployment(_preNodeExist)
        setShowPostDeployment(_postNodeExist)
        setSelectedAppList(_selectedAppList)
        setSelectAll(_selectedAppList.length !== 0)
        setSelectAllValue(
            _filteredWorkflows.length === _selectedAppList.length
                ? CHECKBOX_VALUE.CHECKED
                : CHECKBOX_VALUE.INTERMEDIATE,
        )
        _filteredWorkflows.sort((a, b) => sortCallback('name', a, b))
        setFilteredWorkflows(_filteredWorkflows)
    }

    const pollWorkflowStatus = (_processedWorkflowsData: ProcessWorkFlowStatusType) => {
        inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        inprogressStatusTimer = setTimeout(
            () => {
                getWorkflowStatusData(_processedWorkflowsData.workflows)
            },
            _processedWorkflowsData.cicdInProgress ? 10000 : 30000,
        )
    }

    const getWorkflowStatusData = (workflowsList: WorkflowType[] = workflows) => {
        getWorkflowStatus(envId, filteredAppIds)
            .then((response) => {
                const _processedWorkflowsData = processWorkflowStatuses(
                    response?.result?.ciWorkflowStatus ?? [],
                    response?.result?.cdWorkflowStatus ?? [],
                    workflowsList,
                )
                pollWorkflowStatus(_processedWorkflowsData)
                setWorkflows(_processedWorkflowsData.workflows)
                processFilteredData(_processedWorkflowsData.workflows)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                // If ci cd is in progress then call the api after every 10sec
                pollWorkflowStatus({ cicdInProgress: true, workflows: workflowsList })
            })
    }

    const clearAppList = (): void => {
        setSelectedAppList([])
        const _workflows = filteredWorkflows.map((wf) => {
            wf.isSelected = false
            return wf
        })
        setSelectAll(false)
        setFilteredWorkflows(_workflows)
    }

    const handleSelectAll = (): void => {
        const _selectedAppList = []
        let _preNodeExist = false
        let _postNodeExist = false
        const _workflows = filteredWorkflows.map((wf) => {
            if (!isSelectAll) {
                const _currentAppDetail = {
                    id: wf.appId,
                    name: wf.name,
                    preNodeAvailable: false,
                    postNodeAvailable: false,
                    appReleaseTags: wf.appReleaseTags,
                    tagsEditable: wf.tagsEditable,
                }
                for (const node of wf.nodes) {
                    if (node.environmentId === +envId && node.type === WorkflowNodeType.CD) {
                        _preNodeExist = _preNodeExist || !!node.preNode
                        _postNodeExist = _postNodeExist || !!node.postNode
                        _currentAppDetail.preNodeAvailable = !!node.preNode
                        _currentAppDetail.postNodeAvailable = !!node.postNode
                        break
                    }
                }
                _selectedAppList.push(_currentAppDetail)
            }
            wf.isSelected = !isSelectAll
            return wf
        })
        setSelectAll(!isSelectAll)
        setSelectAllValue(CHECKBOX_VALUE.CHECKED)
        setShowPreDeployment(_preNodeExist)
        setShowPostDeployment(_postNodeExist)
        setFilteredWorkflows(_workflows)
        setSelectedAppList(_selectedAppList)
    }

    const handleSelectionChange = (_appId: number): void => {
        const _selectedAppList = [...selectedAppList]
        let _preNodeExist
        let _postNodeExist
        const _workflows = filteredWorkflows.map((wf) => {
            if (_appId === wf.appId) {
                const selectedAppIndex = selectedAppList.findIndex((app) => app.id === _appId)
                if (wf.isSelected) {
                    _selectedAppList.splice(selectedAppIndex, 1)
                    wf.isSelected = false
                    for (const app of _selectedAppList) {
                        if (!_preNodeExist && app.preNodeAvailable) {
                            _preNodeExist = true
                        }
                        if (!_postNodeExist && app.postNodeAvailable) {
                            _postNodeExist = true
                        }
                        if (_preNodeExist && _postNodeExist) {
                            break
                        }
                    }
                } else {
                    const _currentAppDetail = {
                        id: _appId,
                        name: wf.name,
                        preNodeAvailable: false,
                        postNodeAvailable: false,
                    }
                    for (const node of wf.nodes) {
                        if (node.environmentId === +envId && node.type === WorkflowNodeType.CD) {
                            _preNodeExist = showPreDeployment || !!node.preNode
                            _postNodeExist = showPostDeployment || !!node.postNode
                            _currentAppDetail.preNodeAvailable = !!node.preNode
                            _currentAppDetail.postNodeAvailable = !!node.postNode
                            break
                        }
                    }
                    _selectedAppList.push(_currentAppDetail)
                    wf.isSelected = true
                }
            }
            return wf
        })
        setShowPreDeployment(_preNodeExist)
        setShowPostDeployment(_postNodeExist)
        setFilteredWorkflows(_workflows)
        setSelectedAppList(_selectedAppList)
        setSelectAll(_selectedAppList.length !== 0)
        setSelectAllValue(
            _workflows.length === _selectedAppList.length ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
        )
    }

    const onClickApprovalNode = (cdNodeId: number) => {
        handleAnalyticsEvent(ENV_TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked)

        const newParams = new URLSearchParams([
            [TRIGGER_VIEW_PARAMS.APPROVAL_NODE, cdNodeId.toString()],
            [TRIGGER_VIEW_PARAMS.APPROVAL_STATE, TRIGGER_VIEW_PARAMS.APPROVAL],
        ])
        history.push({ search: newParams.toString() })
    }

    const onClickCDMaterial = (cdNodeId: number, nodeType: DeploymentNodeType) => {
        handleAnalyticsEvent(ENV_TRIGGER_VIEW_GA_EVENTS.ImageClicked)

        const newParams = new URLSearchParams([
            [TRIGGER_VIEW_PARAMS.CD_NODE, cdNodeId.toString()],
            [TRIGGER_VIEW_PARAMS.NODE_TYPE, nodeType],
        ])
        history.push({
            search: newParams.toString(),
        })
    }

    // Assuming that rollback has only CD as nodeType
    const onClickRollbackMaterial = (cdNodeId: number) => {
        handleAnalyticsEvent(ENV_TRIGGER_VIEW_GA_EVENTS.RollbackClicked)

        const newParams = new URLSearchParams([[TRIGGER_VIEW_PARAMS.ROLLBACK_NODE, cdNodeId.toString()]])
        history.push({
            search: newParams.toString(),
        })
    }

    const isBuildAndBranchTriggerAllowed = (node: CommonNodeAttr): boolean =>
        !node.isLinkedCI && !node.isLinkedCD && node.type !== WorkflowNodeType.WEBHOOK

    const changeBranch = (value): void => {
        const appIds = []
        const skippedResources = []
        const appNameMap = new Map()

        filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                const _ciNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )
                if (_ciNode) {
                    if (isBuildAndBranchTriggerAllowed(_ciNode)) {
                        appIds.push(wf.appId)
                        appNameMap.set(wf.appId, wf.name)
                    } else {
                        skippedResources.push({
                            appId: wf.appId,
                            appName: wf.name,
                            statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                            status: BulkResponseStatus.SKIP,
                            envId: +envId,
                            message: SKIPPED_RESOURCES_MESSAGE,
                        })
                    }
                }
            }
        })

        if (!appIds.length && !skippedResources.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'No valid application present',
            })
            return
        }
        setIsBranchChangeLoading(true)

        if (!appIds.length) {
            updateResponseListData(skippedResources)
            setIsBranchChangeLoading(false)
            setCDLoading(false)
            setCILoading(false)
            return
        }

        triggerBranchChange(appIds, +envId, value)
            .then((response: any) => {
                const _responseList = []
                response.map((res) => {
                    _responseList.push({
                        appId: res.appId,
                        appName: appNameMap.get(res.appId),
                        statusText: res.status,
                        status: GetBranchChangeStatus(res.status),
                        envId: +envId,
                        message: res.message,
                    })
                })
                updateResponseListData([..._responseList, ...skippedResources])
                setCDLoading(false)
                setCILoading(false)
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setIsBranchChangeLoading(false)
            })
    }

    const closeCDModal = (): void => {
        abortControllerRef.current.abort()
        setCDLoading(false)
        history.push({
            search: '',
        })
    }

    const closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        history.push({
            search: '',
        })
        getWorkflowStatusData(workflows)
    }

    const hideBulkCDModal = () => {
        setCDLoading(false)
        setShowBulkCDModal(false)
        setResponseList([])
        setBulkDeploymentStrategy('DEFAULT')
        setRuntimeParams({})
        setRuntimeParamsErrorState({})

        history.push({
            search: '',
        })
    }

    const onShowBulkCDModal = (e) => {
        setCDLoading(true)
        setBulkTriggerType(e.currentTarget.dataset.triggerType)
        setMaterialType(MATERIAL_TYPE.inputMaterialList)
        setTimeout(() => {
            setShowBulkCDModal(true)
        }, 100)
    }

    const hideBulkCIModal = () => {
        setCILoading(false)
        setShowBulkCIModal(false)
        setResponseList([])

        setRuntimeParams({})
        setRuntimeParamsErrorState({})
    }

    const onShowBulkCIModal = () => {
        setCILoading(true)
        setTimeout(() => {
            setShowBulkCIModal(true)
        }, 100)
    }

    const hideChangeSourceModal = () => {
        if (responseList.length > 0) {
            setPageViewType(ViewType.LOADING)
            inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
            getWorkflowsData()
        }
        setIsBranchChangeLoading(false)
        setShowBulkSourceChangeModal(false)
        setResponseList([])
    }

    const handleCloseChangeImageSource = () => {
        setPageViewType(ViewType.LOADING)
        getWorkflowsData()
    }

    const onShowChangeSourceModal = () => {
        setShowBulkSourceChangeModal(true)
    }

    const updateBulkCDInputMaterial = (cdMaterialResponse: Record<string, CDMaterialResponseType>): void => {
        const _workflows = filteredWorkflows.map((wf) => {
            if (wf.isSelected && cdMaterialResponse[wf.appId]) {
                const _appId = wf.appId
                const _cdNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CD && node.environmentId === +envId,
                )
                let _selectedNode: CommonNodeAttr
                const _materialData = cdMaterialResponse[_appId]

                if (bulkTriggerType === DeploymentNodeType.PRECD) {
                    _selectedNode = _cdNode.preNode
                } else if (bulkTriggerType === DeploymentNodeType.CD) {
                    _selectedNode = _cdNode
                    _selectedNode.requestedUserId = _materialData.requestedUserId
                    _selectedNode.approvalConfigData = _materialData.deploymentApprovalInfo?.approvalConfigData
                } else if (bulkTriggerType === DeploymentNodeType.POSTCD) {
                    _selectedNode = _cdNode.postNode
                }

                if (_selectedNode) {
                    _selectedNode.inputMaterialList = _materialData.materials
                }
                wf.appReleaseTags = _materialData?.appReleaseTagNames
                wf.tagsEditable = _materialData?.tagsEditable
                wf.canApproverDeploy = _materialData?.canApproverDeploy ?? false
                wf.isExceptionUser = _materialData?.deploymentApprovalInfo?.approvalConfigData?.isExceptionUser ?? false
            }

            return wf
        })
        setFilteredWorkflows(_workflows)
    }

    const validateBulkRuntimeParams = (): boolean => {
        let isRuntimeParamErrorPresent = false

        const updatedRuntimeParamsErrorState = Object.keys(runtimeParams).reduce((acc, key) => {
            const validationState = validateRuntimeParameters(runtimeParams[key])
            acc[key] = validationState
            isRuntimeParamErrorPresent = !isRuntimeParamErrorPresent && !validationState.isValid
            return acc
        }, {})
        setRuntimeParamsErrorState(updatedRuntimeParamsErrorState)

        if (isRuntimeParamErrorPresent) {
            setCDLoading(false)
            setCILoading(false)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the runtime parameter errors before triggering the pipeline',
            })
            return false
        }

        return true
    }

    // Helper to get selected CD nodes
    const getSelectedCDNodesWithArtifacts = (
        selectedWorkflows: WorkflowType[],
    ): { node: CommonNodeAttr; wf: WorkflowType }[] =>
        selectedWorkflows
            .filter((wf) => wf.isSelected)
            .map((wf) => {
                const _cdNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CD && node.environmentId === +envId,
                )
                if (!_cdNode) return null

                const _selectedNode: CommonNodeAttr | undefined = getSelectedCDNode(bulkTriggerType, _cdNode)

                const selectedArtifacts = _selectedNode?.[materialType]?.filter((artifact) => artifact.isSelected) ?? []
                if (selectedArtifacts.length > 0) {
                    return { node: _selectedNode, wf }
                }
                return null
            })
            .filter(Boolean)

    const onClickTriggerBulkCD = (
        skipIfHibernated: boolean,
        pipelineIdVsStrategyMap: PipelineIdsVsDeploymentStrategyMap,
        appsToRetry?: Record<string, boolean>,
    ) => {
        if (isCDLoading || !validateBulkRuntimeParams()) {
            return
        }

        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCDTriggered(bulkTriggerType))
        setCDLoading(true)
        const _appIdMap = new Map<string, string>()
        const nodeList: CommonNodeAttr[] = []
        const triggeredAppList: { appId: number; envId?: number; appName: string }[] = []

        const eligibleNodes = getSelectedCDNodesWithArtifacts(
            filteredWorkflows.filter((wf) => !appsToRetry || appsToRetry[wf.appId]),
        )
        eligibleNodes.forEach(({ node: eligibleNode, wf }) => {
            nodeList.push(eligibleNode)
            _appIdMap.set(eligibleNode.id, wf.appId.toString())
            triggeredAppList.push({ appId: wf.appId, appName: wf.name, envId: eligibleNode.environmentId })
        })

        const _CDTriggerPromiseFunctionList = []
        nodeList.forEach((node, index) => {
            let ciArtifact = null
            const currentAppId = _appIdMap.get(node.id)

            node[materialType].forEach((artifact) => {
                if (artifact.isSelected == true) {
                    ciArtifact = artifact
                }
            })
            const pipelineId = Number(node.id)
            const strategy = pipelineIdVsStrategyMap[pipelineId]

            // skip app if bulkDeploymentStrategy is not default and strategy is not configured for app
            if (ciArtifact && (bulkDeploymentStrategy === 'DEFAULT' || !!strategy)) {
                _CDTriggerPromiseFunctionList.push(() =>
                    triggerCDNode({
                        pipelineId,
                        ciArtifactId: Number(ciArtifact.id),
                        appId: Number(currentAppId),
                        stageType: bulkTriggerType,
                        ...(getRuntimeParamsPayload
                            ? { runtimeParamsPayload: getRuntimeParamsPayload(runtimeParams[currentAppId] ?? []) }
                            : {}),
                        skipIfHibernated,
                        // strategy DEFAULT means custom chart
                        ...(strategy && strategy !== 'DEFAULT' ? { strategy } : {}),
                    }),
                )
            } else {
                triggeredAppList.splice(index, 1)
            }
        })
        handleBulkTrigger(_CDTriggerPromiseFunctionList, triggeredAppList, WorkflowNodeType.CD)
    }

    const updateResponseListData = (_responseList) => {
        setResponseList((prevList) => {
            const resultMap = new Map(_responseList.map((data) => [data.appId, data]))
            const updatedArray = prevList?.map((prevItem) => resultMap.get(prevItem.appId) || prevItem)
            return (updatedArray?.length > 0 ? updatedArray : _responseList).sort((a, b) =>
                sortCallback('appName', a, b),
            )
        })
    }

    const filterStatusType = (
        type: WorkflowNodeType,
        CIStatus: string,
        VirtualStatus: string,
        CDStatus: string,
    ): string => {
        if (type === WorkflowNodeType.CI) {
            return CIStatus
        }
        if (isVirtualEnv) {
            return VirtualStatus
        }
        return CDStatus
    }

    const handleBulkTrigger = (
        promiseFunctionList: any[],
        triggeredAppList: { appId: number; envId?: number; appName: string }[],
        type: WorkflowNodeType,
        skippedResources: ResponseRowType[] = [],
    ): void => {
        setIsBulkTriggerLoading(true)
        const _responseList = skippedResources
        if (promiseFunctionList.length) {
            ApiQueuingWithBatch(promiseFunctionList).then((responses: any[]) => {
                responses.forEach((response, index) => {
                    if (response.status === 'fulfilled') {
                        const statusType = filterStatusType(
                            type,
                            BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.PASS],
                            BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.PASS],
                            BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.PASS],
                        )

                        const virtualEnvResponseRowType: TriggerVirtualEnvResponseRowType =
                            [DeploymentNodeType.CD, DeploymentNodeType.POSTCD, DeploymentNodeType.PRECD].includes(
                                bulkTriggerType,
                            ) && isVirtualEnv
                                ? {
                                      isVirtual: true,
                                      helmPackageName: response.value?.result?.helmPackageName,
                                      cdWorkflowType: bulkTriggerType,
                                  }
                                : {}

                        _responseList.push({
                            appId: triggeredAppList[index].appId,
                            appName: triggeredAppList[index].appName,
                            statusText: statusType,
                            status: BulkResponseStatus.PASS,
                            envId: triggeredAppList[index].envId,
                            message: '',
                            ...virtualEnvResponseRowType,
                        })
                    } else {
                        const errorReason = response.reason
                        if (errorReason.code === API_STATUS_CODES.EXPECTATION_FAILED) {
                            const statusType = filterStatusType(
                                type,
                                BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.SKIP],
                                BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.SKIP],
                                BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.SKIP],
                            )
                            _responseList.push({
                                appId: triggeredAppList[index].appId,
                                appName: triggeredAppList[index].appName,
                                statusText: statusType,
                                status: BulkResponseStatus.SKIP,
                                message: errorReason.errors[0].userMessage,
                            })
                        } else if (errorReason.code === 403 || errorReason.code === 422) {
                            // Adding 422 to handle the unauthorized state due to deployment window
                            const statusType = filterStatusType(
                                type,
                                BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.UNAUTHORIZE],
                                BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.UNAUTHORIZE],
                                BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.UNAUTHORIZE],
                            )
                            _responseList.push({
                                appId: triggeredAppList[index].appId,
                                appName: triggeredAppList[index].appName,
                                statusText: statusType,
                                status: BulkResponseStatus.UNAUTHORIZE,
                                message: errorReason.errors[0].userMessage,
                            })
                        } else {
                            const statusType = filterStatusType(
                                type,
                                BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.FAIL],
                                BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.FAIL],
                                BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.FAIL],
                            )
                            _responseList.push({
                                appId: triggeredAppList[index].appId,
                                appName: triggeredAppList[index].appName,
                                statusText: statusType,
                                status: BulkResponseStatus.FAIL,
                                message: errorReason.errors[0].userMessage,
                            })
                        }
                    }
                })
                updateResponseListData(_responseList)
                setCDLoading(false)
                setCILoading(false)
                setIsBulkTriggerLoading(false)
                getWorkflowStatusData(workflows)
            })
        } else {
            setCDLoading(false)
            setCILoading(false)
            setIsBulkTriggerLoading(false)

            if (!skippedResources.length) {
                hideBulkCIModal()
                hideBulkCDModal()
            } else {
                updateResponseListData(_responseList)
            }
        }
    }

    // Would only set data no need to get data related to materials from it, we will get that in bulk trigger
    const createBulkCDTriggerData = (): BulkCDDetailTypeResponse => {
        const uniqueReleaseTags: string[] = []
        const uniqueTagsSet = new Set<string>()
        const _selectedAppWorkflowList: BulkCDDetailType[] = []

        filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                // extract unique tags for this workflow
                wf.appReleaseTags?.forEach((tag) => {
                    if (!uniqueTagsSet.has(tag)) {
                        uniqueReleaseTags.push(tag)
                    }
                    uniqueTagsSet.add(tag)
                })
                const _cdNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CD && node.environmentId === +envId,
                )
                const selectedCINode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )
                const doesWorkflowContainsWebhook = selectedCINode?.type === WorkflowNodeType.WEBHOOK

                let _selectedNode: CommonNodeAttr
                if (bulkTriggerType === DeploymentNodeType.PRECD) {
                    _selectedNode = _cdNode.preNode
                } else if (bulkTriggerType === DeploymentNodeType.CD) {
                    _selectedNode = _cdNode
                } else if (bulkTriggerType === DeploymentNodeType.POSTCD) {
                    _selectedNode = _cdNode.postNode
                }
                if (_selectedNode) {
                    const stageType = DeploymentNodeType[_selectedNode.type]
                    const isTriggerBlockedDueToPlugin =
                        _selectedNode.isTriggerBlocked && _selectedNode.showPluginWarning
                    const isTriggerBlockedDueToMandatoryTags =
                        _selectedNode.isTriggerBlocked &&
                        _selectedNode.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG
                    const stageText = getStageTitle(stageType)

                    _selectedAppWorkflowList.push({
                        workFlowId: wf.id,
                        appId: wf.appId,
                        name: wf.name,
                        cdPipelineName: _cdNode.title,
                        cdPipelineId: _cdNode.id,
                        stageType,
                        triggerType: _cdNode.triggerType,
                        envName: _selectedNode.environmentName,
                        envId: _selectedNode.environmentId,
                        parentPipelineId: _selectedNode.parentPipelineId,
                        parentPipelineType: WorkflowNodeType[_selectedNode.parentPipelineType],
                        parentEnvironmentName: _selectedNode.parentEnvironmentName,
                        material: _selectedNode.inputMaterialList,
                        approvalConfigData: _selectedNode.approvalConfigData,
                        requestedUserId: _selectedNode.requestedUserId,
                        appReleaseTags: wf.appReleaseTags,
                        tagsEditable: wf.tagsEditable,
                        ciPipelineId: _selectedNode.connectingCiPipelineId,
                        hideImageTaggingHardDelete: wf.hideImageTaggingHardDelete,
                        showPluginWarning: _selectedNode.showPluginWarning,
                        isTriggerBlockedDueToPlugin,
                        configurePluginURL: getCDPipelineURL(
                            String(wf.appId),
                            wf.id,
                            doesWorkflowContainsWebhook ? '0' : selectedCINode?.id,
                            doesWorkflowContainsWebhook,
                            _selectedNode.id,
                            true,
                        ),
                        consequence: _selectedNode.pluginBlockState,
                        warningMessage:
                            isTriggerBlockedDueToPlugin || isTriggerBlockedDueToMandatoryTags
                                ? `${stageText} is blocked`
                                : '',
                        triggerBlockedInfo: _selectedNode.triggerBlockedInfo,
                        isExceptionUser: wf.isExceptionUser,
                    })
                } else {
                    let warningMessage = ''
                    if (bulkTriggerType === DeploymentNodeType.PRECD) {
                        warningMessage = 'No pre-deployment stage'
                    } else if (bulkTriggerType === DeploymentNodeType.CD) {
                        warningMessage = 'No deployment stage'
                    } else if (bulkTriggerType === DeploymentNodeType.POSTCD) {
                        warningMessage = 'No post-deployment stage'
                    }
                    _selectedAppWorkflowList.push({
                        workFlowId: wf.id,
                        appId: wf.appId,
                        name: wf.name,
                        warningMessage,
                        envName: _cdNode.environmentName,
                        envId: _cdNode.environmentId,
                    })
                }
            }
        })
        _selectedAppWorkflowList.sort((a, b) => sortCallback('name', a, b))
        return {
            bulkCDDetailType: _selectedAppWorkflowList,
            uniqueReleaseTags,
        }
    }

    if (pageViewType === ViewType.LOADING) {
        return <Progressing pageLoader />
    }
    if (pageViewType === ViewType.ERROR) {
        return <ErrorScreenManager code={errorCode} />
    }
    if (!filteredWorkflows.length) {
        return (
            <div className="flex-grow-1">
                <AppNotConfigured />
            </div>
        )
    }

    const renderBulkCDMaterial = (): JSX.Element | null => {
        if (!showBulkCDModal) {
            return null
        }

        const bulkCDDetailTypeResponse = createBulkCDTriggerData()
        const _selectedAppWorkflowList: BulkCDDetailType[] = bulkCDDetailTypeResponse.bulkCDDetailType

        const { uniqueReleaseTags } = bulkCDDetailTypeResponse

        const feasiblePipelineIds = new Set(
            getSelectedCDNodesWithArtifacts(filteredWorkflows).map(({ node }) => +node.id),
        )

        // Have to look for its each prop carefully
        // No need to send uniqueReleaseTags will get those in BulkCDTrigger itself
        return (
            <BulkCDTrigger
                stage={bulkTriggerType}
                appList={_selectedAppWorkflowList}
                feasiblePipelineIds={feasiblePipelineIds}
                closePopup={hideBulkCDModal}
                updateBulkInputMaterial={updateBulkCDInputMaterial}
                onClickTriggerBulkCD={onClickTriggerBulkCD}
                responseList={responseList}
                isLoading={isCDLoading}
                setLoading={setCDLoading}
                isVirtualEnv={isVirtualEnv}
                uniqueReleaseTags={uniqueReleaseTags}
                runtimeParams={runtimeParams}
                setRuntimeParams={setRuntimeParams}
                runtimeParamsErrorState={runtimeParamsErrorState}
                setRuntimeParamsErrorState={setRuntimeParamsErrorState}
                bulkDeploymentStrategy={bulkDeploymentStrategy}
                setBulkDeploymentStrategy={setBulkDeploymentStrategy}
            />
        )
    }

    const renderBulkCIMaterial = (): JSX.Element | null => {
        if (!showBulkCIModal) {
            return null
        }

        return (
            <BulkBuildImageModal
                handleClose={hideBulkCIModal}
                workflows={filteredWorkflows}
                reloadWorkflows={getWorkflowsData}
                filteredCIPipelineMap={filteredCIPipelines}
                reloadWorkflowStatus={getWorkflowStatusData}
            />
        )
    }

    const renderBulkSourceChange = (): JSX.Element | null => {
        if (!showBulkSourceChangeModal) {
            return null
        }

        return (
            <BulkSourceChange
                closePopup={hideChangeSourceModal}
                responseList={responseList}
                changeBranch={changeBranch}
                loading={isBranchChangeLoading}
                selectedAppCount={selectedAppList.length}
            />
        )
    }

    const renderCDMaterialContent = ({
        node,
        appId,
        workflowId,
        selectedAppName,
        doesWorkflowContainsWebhook,
        ciNodeId,
    }: RenderCDMaterialContentProps) => {
        const configurePluginURL = getCDPipelineURL(
            String(appId),
            workflowId,
            doesWorkflowContainsWebhook ? '0' : ciNodeId,
            doesWorkflowContainsWebhook,
            node?.id,
            true,
        )

        const cdMaterialType = location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE)
            ? MATERIAL_TYPE.inputMaterialList
            : MATERIAL_TYPE.rollbackMaterialList

        return (
            <DeployImageModal
                appId={appId}
                envId={node?.environmentId}
                appName={selectedAppName}
                stageType={node.type as DeploymentNodeType}
                envName={node?.environmentName}
                pipelineId={+node.id}
                materialType={cdMaterialType}
                handleClose={closeCDModal}
                handleSuccess={getWorkflowStatusData}
                deploymentAppType={node?.deploymentAppType}
                isVirtualEnvironment={isVirtualEnv}
                showPluginWarningBeforeTrigger={node?.showPluginWarning}
                consequence={node?.pluginBlockState}
                configurePluginURL={configurePluginURL}
                isTriggerBlockedDueToPlugin={node?.showPluginWarning && node?.isTriggerBlocked}
                triggerType={node?.triggerType}
                isRedirectedFromAppDetails={false}
                parentEnvironmentName={node?.parentEnvironmentName}
            />
        )
    }

    const renderCDMaterial = (): JSX.Element | null => {
        if (
            location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE) ||
            location.search.includes(TRIGGER_VIEW_PARAMS.ROLLBACK_NODE)
        ) {
            const { node, appId, workflowId, appName, selectedCINode } = getSelectedNodeAndMeta(
                filteredWorkflows,
                location.search,
            )

            if (!node?.id) {
                return null
            }

            return renderCDMaterialContent({
                node,
                appId,
                selectedAppName: appName,
                workflowId,
                doesWorkflowContainsWebhook: selectedCINode?.type === WorkflowNodeType.WEBHOOK,
                ciNodeId: selectedCINode?.id,
            })
        }

        return null
    }

    const renderApprovalMaterial = () => {
        if (ApprovalMaterialModal && location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const { node, appId } = getSelectedNodeAndAppId(filteredWorkflows, location.search)

            if (!node?.id || !appId) {
                showError('Invalid node id')
                return null
            }

            return (
                <ApprovalMaterialModal
                    isLoading={isCDLoading}
                    node={node ?? ({} as CommonNodeAttr)}
                    materialType={materialType}
                    stageType={DeploymentNodeType.CD}
                    closeApprovalModal={closeApprovalModal}
                    appId={appId}
                    pipelineId={node.id}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node?.connectingCiPipelineId}
                    history={history}
                />
            )
        }

        return null
    }

    const renderDeployPopupMenu = (): JSX.Element => (
        <PopupMenu autoClose>
            <PopupMenu.Button
                isKebab
                rootClassName="h-32 popup-button-kebab dc__border-left-b4 pl-8 pr-8 dc__no-left-radius flex bcb-5"
                dataTestId="deploy-popup"
            >
                <Dropdown className="icon-dim-20 fcn-0" />
            </PopupMenu.Button>
            <PopupMenu.Body rootClassName=" dc__border pt-4 pb-4 mb-8">
                {showPreDeployment && (
                    <div
                        className="flex left p-10 dc__hover-n50 pointer fs-13"
                        data-trigger-type="PRECD"
                        onClick={onShowBulkCDModal}
                        data-testid="pre-deploy-popup-button"
                    >
                        Trigger Pre-deployment stage
                    </div>
                )}
                <div
                    className="flex left p-10 dc__hover-n50 pointer fs-13"
                    data-trigger-type="CD"
                    onClick={onShowBulkCDModal}
                    data-testid="deploy-popup-button"
                >
                    Trigger Deployment
                </div>
                {showPostDeployment && (
                    <div
                        className="flex left p-10 dc__hover-n50 pointer fs-13"
                        data-trigger-type="POSTCD"
                        onClick={onShowBulkCDModal}
                        data-testid="post-deploy-popup-button"
                    >
                        Trigger Post-deployment stage
                    </div>
                )}
            </PopupMenu.Body>
        </PopupMenu>
    )

    const renderBulkTriggerActionButtons = (): JSX.Element => {
        const selectedWorkflows = filteredWorkflows.filter((wf) => wf.isSelected)
        const _showPopupMenu = showPreDeployment || showPostDeployment
        return (
            <div className="flex dc__min-width-fit-content dc__gap-12">
                {ChangeImageSource && (
                    <ChangeImageSource
                        selectedWorkflows={selectedWorkflows}
                        handleCloseChangeImageSource={handleCloseChangeImageSource}
                    />
                )}
                <Button
                    dataTestId="change-branch-bulk"
                    text="Change branch"
                    startIcon={<Pencil />}
                    onClick={onShowChangeSourceModal}
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.neutral}
                    variant={ButtonVariantType.secondary}
                />
                <span className="filter-divider-env" />
                <Button
                    dataTestId="bulk-build-image-button"
                    text="Build image"
                    onClick={onShowBulkCIModal}
                    size={ComponentSizeType.medium}
                    isLoading={isCILoading}
                />
                <div className="flex">
                    <button
                        className={`cta flex h-32 ${_showPopupMenu ? 'dc__no-right-radius' : ''}`}
                        data-trigger-type="CD"
                        data-testid="bulk-deploy-button"
                        onClick={onShowBulkCDModal}
                    >
                        {isCDLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                <DeployIcon className="icon-dim-16 dc__no-svg-fill mr-8" />
                                Deploy
                            </>
                        )}
                    </button>
                    {_showPopupMenu && renderDeployPopupMenu()}
                </div>
            </div>
        )
    }

    const renderSelectedApps = (): JSX.Element => (
        <div className="flex">
            <Tippy className="default-tt" arrow={false} placement="top" content="Clear selection">
                <div className="flex">
                    <Close className="icon-dim-18 scr-5 mr-16 cursor mw-18" onClick={clearAppList} />
                </div>
            </Tippy>
            <div>
                <div data-testid="selected-application-text" className="fs-13 fw-6 cn-9">
                    {selectedAppList.length} application{selectedAppList.length > 1 ? 's' : ''} selected
                </div>
                <div className="fs-13 fw-4 cn-7 dc__ellipsis-right__2nd-line" data-testid="selected-apps-name">
                    {sortObjectArrayAlphabetically(selectedAppList, 'name').map((app, index) => (
                        <span key={`selected-app-${app.id}`}>
                            {app.name}
                            {index !== selectedAppList.length - 1 && <span>, </span>}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )

    const revertToPreviousURL = () => {
        history.push(match.url)
    }

    const getWebhookDetails = () => getExternalCIConfig(selectedWebhookNode.appId, selectedWebhookNode.id, false)

    const handleWebhookAddImageClick = (appId: number) => (id: number) => {
        setSelectedWebhookNode({ appId, id })
    }

    const handleWebhookAddImageModalClose = () => {
        setSelectedWebhookNode(null)
    }

    const openCIMaterialModal = (ciNodeId: string) => {
        history.push(`${match.url}${URLS.BUILD}/${ciNodeId}`)
    }

    const renderWebhookAddImageModal = () => {
        if (
            WebhookAddImageModal &&
            shouldRenderWebhookAddImageModal(location) &&
            !location.pathname.includes('bulk-deploy/request') &&
            selectedWebhookNode
        ) {
            return (
                <WebhookAddImageModal getWebhookDetails={getWebhookDetails} onClose={handleWebhookAddImageModalClose} />
            )
        }

        return null
    }

    const renderWorkflow = (): JSX.Element => (
        <>
            {filteredWorkflows.map((workflow, index) => (
                <Workflow
                    key={workflow.id}
                    id={workflow.id}
                    name={workflow.name}
                    startX={workflow.startX}
                    startY={workflow.startY}
                    height={workflow.height}
                    width={workflow.width}
                    nodes={workflow.nodes}
                    appId={workflow.appId}
                    isSelected={workflow.isSelected ?? false}
                    handleSelectionChange={handleSelectionChange}
                    fromAppGrouping
                    history={history}
                    location={location}
                    match={match}
                    index={index}
                    handleWebhookAddImageClick={handleWebhookAddImageClick(workflow.appId)}
                    openCIMaterialModal={openCIMaterialModal}
                />
            ))}
            <LinkedCIDetail workflows={filteredWorkflows} handleClose={revertToPreviousURL} />
            {renderWebhookAddImageModal()}
        </>
    )

    return (
        <div className="dc__overflow-auto flex-grow-1 dc__content-space flexbox-col app-group-trigger-view-container bg__primary">
            <div className="flexbox-col flex-grow-1 dc__overflow-auto py-16 px-20">
                <div className="flex left mb-14">
                    <Checkbox
                        rootClassName="fs-13 app-group-checkbox"
                        isChecked={isSelectAll}
                        value={selectAllValue}
                        onChange={handleSelectAll}
                        dataTestId="select-all-apps"
                    >
                        Select all apps
                    </Checkbox>
                </div>

                <Prompt when={enableRoutePrompt} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />

                <TriggerViewContext.Provider
                    value={{
                        onClickCDMaterial,
                        onClickRollbackMaterial,
                        reloadTriggerView,
                        onClickApprovalNode,
                    }}
                >
                    {renderWorkflow()}

                    <Switch>
                        <Route path={`${url}${URLS.BUILD}/:ciNodeId`}>
                            <BuildImageModal
                                handleClose={revertToPreviousURL}
                                isJobView={false}
                                filteredCIPipelineMap={filteredCIPipelines}
                                workflows={workflows}
                                reloadWorkflows={getWorkflowsData}
                                reloadWorkflowStatus={getWorkflowStatusData}
                                environmentLists={[]}
                            />
                        </Route>
                    </Switch>
                    {renderCDMaterial()}
                    {renderBulkCDMaterial()}
                    {renderBulkCIMaterial()}
                    {renderApprovalMaterial()}
                    {renderBulkSourceChange()}
                </TriggerViewContext.Provider>
                <div />
            </div>
            {!!selectedAppList.length && (
                <div className="flexbox dc__gap-8 dc__content-space dc__border-top w-100 bg__primary px-20 py-12">
                    {renderSelectedApps()}
                    {renderBulkTriggerActionButtons()}
                </div>
            )}
        </div>
    )
}

export default EnvTriggerView
