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

import React, { useState, useEffect, useRef } from 'react'
import { Prompt, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import ReactGA from 'react-ga4'
import {
    CDMaterialResponseType,
    DeploymentNodeType,
    ServerErrors,
    ErrorScreenManager,
    PopupMenu,
    Progressing,
    showError,
    stopPropagation,
    sortCallback,
    Checkbox,
    CHECKBOX_VALUE,
    VisibleModal,
    WorkflowNodeType,
    CommonNodeAttr,
    WorkflowType,
    getDefaultConfig,
    abortPreviousRequests,
    getIsRequestAborted,
    handleUTCTime,
    createGitCommitUrl,
    CIMaterialType,
    ApiQueuingWithBatch,
    usePrompt,
    SourceTypeMap,
    preventBodyScroll,
    ToastManager,
    ToastVariantType,
    BlockedStateData,
    getStageTitle,
    TriggerBlockType,
    RuntimePluginVariables,
    CIPipelineNodeType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import {
    BUILD_STATUS,
    DEFAULT_GIT_BRANCH_VALUE,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    NO_COMMIT_SELECTED,
    URLS,
    ViewType,
} from '../../../../config'
import CDMaterial from '../../../app/details/triggerView/cdMaterial'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import {
    CIMaterialProps,
    CIMaterialRouterProps,
    MATERIAL_TYPE,
    RuntimeParamsErrorState,
} from '../../../app/details/triggerView/types'
import { Workflow } from '../../../app/details/triggerView/workflow/Workflow'
import {
    getCIMaterialList,
    getGitMaterialByCommitHash,
    refreshGitMaterial,
    triggerCDNode,
    triggerCINode,
    triggerBranchChange,
} from '../../../app/service'
import { getCDPipelineURL, importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../../common'
import { ReactComponent as Pencil } from '../../../../assets/icons/ic-pencil.svg'
import { getWorkflows, getWorkflowStatus } from '../../AppGroup.service'
import {
    CI_MATERIAL_EMPTY_STATE_MESSAGING,
    TIME_STAMP_ORDER,
    TRIGGER_VIEW_PARAMS,
} from '../../../app/details/triggerView/Constants'
import { CI_CONFIGURED_GIT_MATERIAL_ERROR } from '../../../../config/constantMessaging'
import { getCIWebhookRes } from '../../../app/details/triggerView/ciWebhook.service'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import {
    BULK_CI_RESPONSE_STATUS_TEXT,
    BulkResponseStatus,
    ENV_TRIGGER_VIEW_GA_EVENTS,
    BULK_CD_RESPONSE_STATUS_TEXT,
    BULK_VIRTUAL_RESPONSE_STATUS,
    GetBranchChangeStatus,
    SKIPPED_RESOURCES_STATUS_TEXT,
    SKIPPED_RESOURCES_MESSAGE,
} from '../../Constants'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import './EnvTriggerView.scss'
import BulkCDTrigger from './BulkCDTrigger'
import BulkCITrigger from './BulkCITrigger'
import {
    AppGroupDetailDefaultType,
    BulkCDDetailType,
    BulkCDDetailTypeResponse,
    BulkCIDetailType,
    ProcessWorkFlowStatusType,
    ResponseRowType,
    WorkflowAppSelectionType,
    WorkflowNodeSelectionType,
} from '../../AppGroup.types'
import {
    getBranchValues,
    handleSourceNotConfigured,
    processConsequenceData,
    processWorkflowStatuses,
} from '../../AppGroup.utils'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import BulkSourceChange from './BulkSourceChange'
import { CIPipelineBuildType } from '../../../ciPipeline/types'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import CIMaterialModal from '../../../app/details/triggerView/CIMaterialModal'
import { RenderCDMaterialContentProps } from './types'
import { WebhookReceivedPayloadModal } from '@Components/app/details/triggerView/WebhookReceivedPayloadModal'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const getCIBlockState: (...props) => Promise<BlockedStateData> = importComponentFromFELibrary(
    'getCIBlockState',
    null,
    'function',
)
const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')
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

// FIXME: IN CIMaterials we are sending isCDLoading while in CD materials we are sending isCILoading
let inprogressStatusTimer
export default function EnvTriggerView({ filteredAppIds, isVirtualEnv }: AppGroupDetailDefaultType) {
    const { envId } = useParams<{ envId: string }>()
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch<CIMaterialRouterProps>()
    const { url } = useRouteMatch()

    // ref to make sure that on initial mount after we fetch workflows we handle modal based on url
    const handledLocation = useRef(false)
    const abortControllerRef = useRef(new AbortController())
    const abortCIBuildRef = useRef(new AbortController())

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
    const [isWebhookPayloadLoading, setWebhookPayloadLoading] = useState(false)
    const [invalidateCache, setInvalidateCache] = useState(false)
    const [webhookPayloads, setWebhookPayloads] = useState(null)
    const [isChangeBranchClicked, setChangeBranchClicked] = useState(false)
    const [webhookTimeStampOrder, setWebhookTimeStampOrder] = useState('')
    const [showMaterialRegexModal, setShowMaterialRegexModal] = useState(false)
    const [workflowID, setWorkflowID] = useState<number>()
    const [selectedAppList, setSelectedAppList] = useState<WorkflowAppSelectionType[]>([])
    const [workflows, setWorkflows] = useState<WorkflowType[]>([])
    const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowType[]>([])
    const [selectedCDNode, setSelectedCDNode] = useState<WorkflowNodeSelectionType>(null)
    const [selectedCINode, setSelectedCINode] = useState<WorkflowNodeSelectionType>(null)
    const [filteredCIPipelines, setFilteredCIPipelines] = useState(null)
    const [bulkTriggerType, setBulkTriggerType] = useState<DeploymentNodeType>(null)
    const [materialType, setMaterialType] = useState(MATERIAL_TYPE.inputMaterialList)
    const [responseList, setResponseList] = useState<ResponseRowType[]>([])
    const [isSelectAll, setSelectAll] = useState(false)
    const [selectAllValue, setSelectAllValue] = useState<CHECKBOX_VALUE>(CHECKBOX_VALUE.CHECKED)
    const [isConfigPresent, setConfigPresent] = useState<boolean>(false)
    const [isDefaultConfigPresent, setDefaultConfig] = useState<boolean>(false)
    // Mapping pipelineId (in case of CI) and appId (in case of CD) to runtime params
    const [runtimeParams, setRuntimeParams] = useState<Record<string, RuntimePluginVariables[]>>({})
    const [runtimeParamsErrorState, setRuntimeParamsErrorState] = useState<Record<string, RuntimeParamsErrorState>>({})
    const [isBulkTriggerLoading, setIsBulkTriggerLoading] = useState<boolean>(false)

    const enableRoutePrompt = isBranchChangeLoading || isBulkTriggerLoading
    usePrompt({ shouldPrompt: enableRoutePrompt })

    useEffect(() => {
        if (ApprovalMaterialModal) {
            getConfigs()
        }

        return () => {
            handledLocation.current = false
        }
    }, [])

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

    useEffect(() => {
        if (!handledLocation.current && filteredWorkflows?.length) {
            handledLocation.current = true
            // Would have been better if filteredWorkflows had default value to null since we are using it as a flag
            // URL Encoding for Bulk is not planned as of now
            setShowBulkCDModal(false)
            if (location.search.includes('approval-node')) {
                const searchParams = new URLSearchParams(location.search)
                const nodeId = Number(searchParams.get('approval-node'))
                if (!isNaN(nodeId)) {
                    onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: 'Invalid node id',
                    })
                    history.push({
                        search: '',
                    })
                }
            } else if (location.search.includes('rollback-node')) {
                const searchParams = new URLSearchParams(location.search)
                const nodeId = Number(searchParams.get('rollback-node'))
                if (!isNaN(nodeId)) {
                    onClickRollbackMaterial(nodeId)
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: 'Invalid node id',
                    })
                    history.push({
                        search: '',
                    })
                }
            } else if (location.search.includes('cd-node')) {
                const searchParams = new URLSearchParams(location.search)
                const nodeId = Number(searchParams.get('cd-node'))
                const nodeType = searchParams.get('node-type') ?? DeploymentNodeType.CD

                if (
                    nodeType !== DeploymentNodeType.CD &&
                    nodeType !== DeploymentNodeType.PRECD &&
                    nodeType !== DeploymentNodeType.POSTCD
                ) {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: 'Invalid node type',
                    })
                    history.push({
                        search: '',
                    })
                } else if (!isNaN(nodeId)) {
                    onClickCDMaterial(nodeId, nodeType as DeploymentNodeType)
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: 'Invalid node id',
                    })
                    history.push({
                        search: '',
                    })
                }
            } else if (location.pathname.includes('build')) {
                const ciNodeId = location.pathname.match(/build\/(\d+)/)?.[1] ?? null
                const ciNode = filteredWorkflows
                    .flatMap((workflow) => workflow.nodes)
                    .find((node) => node.type === CIPipelineNodeType.CI && node.id === ciNodeId)
                const pipelineName = ciNode?.title

                if (!isNaN(+ciNodeId) && !!pipelineName) {
                    onClickCIMaterial(ciNodeId, pipelineName, false)
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: 'Invalid Node',
                    })
                }
            }
        }
    }, [filteredWorkflows])

    // TODO: This call should not be here rather inside ApprovalMaterialModal
    const getConfigs = () => {
        getDefaultConfig().then((response) => {
            const isConfigPresent = response.result.isConfigured
            const _isDefaultConfig = response.result.is_default_configured
            setDefaultConfig(_isDefaultConfig)
            setConfigPresent(isConfigPresent)
        })
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

    const getWorkflowsData = async (): Promise<void> => {
        try {
            const { workflows: _workflows, filteredCIPipelines } = await getWorkflows(envId, filteredAppIds)
            if (processDeploymentWindowStateAppGroup && _workflows.length) {
                await processDeploymentWindowStateAppGroup(_workflows)
            }
            if (selectedCINode?.id) {
                _workflows.forEach((wf) =>
                    wf.nodes.forEach((n) => {
                        if (+n.id === selectedCINode.id) {
                            workflows.forEach((sw) =>
                                sw.nodes.forEach((sn) => {
                                    if (+sn.id === selectedCINode.id) {
                                        n.inputMaterialList = sn.inputMaterialList
                                    }
                                }),
                            )
                        }
                    }),
                )
            }
            preserveSelection(_workflows)
            setWorkflows(_workflows)
            setFilteredCIPipelines(filteredCIPipelines)
            setErrorCode(0)
            setPageViewType(ViewType.FORM)
            getWorkflowStatusData(_workflows)
            processFilteredData(_workflows)
        } catch (error) {
            showError(error)
            setErrorCode(error['code'])
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

    const getWorkflowStatusData = (workflowsList: WorkflowType[]) => {
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

    const getCommitHistory = (
        ciPipelineMaterialId: number,
        commitHash: string,
        workflows: WorkflowType[],
        _selectedMaterial: CIMaterialType,
    ) => {
        abortPreviousRequests(
            () =>
                getGitMaterialByCommitHash(
                    ciPipelineMaterialId.toString(),
                    commitHash,
                    abortControllerRef.current.signal,
                ),
            abortControllerRef,
        )
            .then((response) => {
                const _result = response.result
                if (_result) {
                    _selectedMaterial.history = [
                        {
                            commitURL: _selectedMaterial.gitURL
                                ? createGitCommitUrl(_selectedMaterial.gitURL, _result.Commit)
                                : '',
                            commit: _result.Commit || '',
                            author: _result.Author || '',
                            date: _result.Date ? handleUTCTime(_result.Date, false) : '',
                            message: _result.Message || '',
                            changes: _result.Changes || [],
                            showChanges: true,
                            webhookData: _result.WebhookData,
                            isSelected: !_result.Excluded,
                            excluded: _result.Excluded,
                        },
                    ]
                    _selectedMaterial.isMaterialLoading = false
                    _selectedMaterial.showAllCommits = false
                    _selectedMaterial.isMaterialSelectionError = _selectedMaterial.history[0].excluded
                    _selectedMaterial.materialSelectionErrorMsg = _selectedMaterial.history[0].excluded
                        ? NO_COMMIT_SELECTED
                        : ''
                } else {
                    _selectedMaterial.history = []
                    _selectedMaterial.noSearchResultsMsg = `Commit not found for ‘${commitHash}’ in branch ‘${_selectedMaterial.value}’`
                    _selectedMaterial.noSearchResult = true
                    _selectedMaterial.isMaterialLoading = false
                    _selectedMaterial.showAllCommits = false
                    _selectedMaterial.isMaterialSelectionError = true
                    _selectedMaterial.materialSelectionErrorMsg = NO_COMMIT_SELECTED
                }
                setFilteredWorkflows([...workflows])
            })
            .catch((error: ServerErrors) => {
                if (!getIsRequestAborted(error)) {
                    showError(error)
                    _selectedMaterial.isMaterialLoading = false
                    setFilteredWorkflows([...workflows])
                }
            })
    }

    const getMaterialHistoryWrapper = (nodeId: string, gitMaterialId: number, showExcluded: boolean) =>
        abortPreviousRequests(
            () => getMaterialHistory(nodeId, abortControllerRef.current.signal, gitMaterialId, showExcluded),
            abortControllerRef,
        ).catch((errors: ServerErrors) => {
            if (!getIsRequestAborted(errors)) {
                showError(errors)
            }
        })

    const getMaterialByCommit = async (
        _ciNodeId: number,
        ciPipelineMaterialId: number,
        gitMaterialId: number,
        commitHash = null,
    ) => {
        let _selectedMaterial
        const _workflows = [...filteredWorkflows].map((workflow) => {
            workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == _ciNodeId) {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.isSelected && material.searchText !== commitHash) {
                            material.isMaterialLoading = true
                            material.showAllCommits = false
                            material.searchText = commitHash
                            _selectedMaterial = material
                        }
                        return material
                    })
                    return node
                }
                return node
            })
            return workflow
        })

        if (commitHash && _selectedMaterial) {
            const commitInLocalHistory = _selectedMaterial.history.find((material) => material.commit === commitHash)
            if (commitInLocalHistory) {
                _selectedMaterial.history = [{ ...commitInLocalHistory, isSelected: !commitInLocalHistory.excluded }]
                _selectedMaterial.isMaterialLoading = false
                _selectedMaterial.showAllCommits = false
                setFilteredWorkflows(_workflows)
            } else {
                setFilteredWorkflows(_workflows)
                getCommitHistory(ciPipelineMaterialId, commitHash, _workflows, _selectedMaterial)
            }
        } else {
            setFilteredWorkflows(_workflows)
            getMaterialHistoryWrapper(selectedCINode.id.toString(), gitMaterialId, false)
        }
    }

    const getFilteredMaterial = async (ciNodeId: number, gitMaterialId: number, showExcluded: boolean) => {
        const _workflows = [...filteredWorkflows].map((wf) => {
            wf.nodes = wf.nodes.map((node) => {
                if (node.id === ciNodeId.toString() && node.type === 'CI') {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.gitMaterialId === gitMaterialId) {
                            material.isMaterialLoading = true
                            material.showAllCommits = showExcluded
                        }
                        return material
                    })
                    return node
                }
                return node
            })
            return wf
        })
        setFilteredWorkflows(_workflows)
        getMaterialHistoryWrapper(ciNodeId.toString(), gitMaterialId, showExcluded)
    }

    const getMaterialHistory = (
        ciNodeId: string,
        abortSignal: AbortSignal,
        gitMaterialId?: number,
        showExcluded?: boolean,
    ) => {
        const params = {
            pipelineId: ciNodeId,
            materialId: gitMaterialId,
            showExcluded,
        }
        return getCIMaterialList(params, abortSignal).then((response) => {
            let showRegexModal = false
            const _workflows = [...filteredWorkflows].map((wf) => {
                wf.nodes.map((node) => {
                    if (node.type === 'CI' && node.id == ciNodeId) {
                        const selectedCIPipeline = filteredCIPipelines
                            .get(wf.appId)
                            ?.find((_ci) => _ci.id === +ciNodeId)
                        if (selectedCIPipeline?.ciMaterial) {
                            for (const mat of selectedCIPipeline.ciMaterial) {
                                if (mat.isRegex && mat.gitMaterialId === response.result[0].gitMaterialId) {
                                    node.isRegex = !!response.result[0].regex
                                    if (response.result[0].value) {
                                        node.branch = response.result[0].value
                                    } else {
                                        showRegexModal = !response.result[0].value
                                    }
                                    break
                                }
                            }
                        }
                        node.inputMaterialList = node.inputMaterialList.map((mat) => {
                            if (mat.id === response.result[0].id) {
                                return {
                                    ...response.result[0],
                                    isSelected: mat.isSelected,
                                    isMaterialLoading: false,
                                    searchText: mat.searchText,
                                    showAllCommits: showExcluded,
                                }
                            }
                            return mat
                        })
                    }
                    return node
                })
                wf.tagsEditable = response.result.tagsEditable
                wf.appReleaseTags = response.result.appReleaseTags
                return wf
            })
            setFilteredWorkflows(_workflows)
            if (!showBulkCIModal) {
                setShowMaterialRegexModal(showRegexModal)
            }
            getWorkflowStatusData(_workflows)
            preventBodyScroll(true)
        })
    }

    // NOTE: GIT MATERIAL ID
    const refreshMaterial = (ciNodeId: number, gitMaterialId: number, abortController?: AbortController) => {
        let showExcluded = false
        const _workflows = [...filteredWorkflows].map((wf) => {
            wf.nodes = wf.nodes.map((node) => {
                if (node.id === ciNodeId.toString() && node.type === 'CI') {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.gitMaterialId === gitMaterialId) {
                            material.isMaterialLoading = true
                            showExcluded = material.showAllCommits
                        }
                        return material
                    })
                    return node
                }
                return node
            })
            return wf
        })
        setFilteredWorkflows(_workflows)

        // Would be only aborting the calls before refreshGitMaterial and not the subsequent calls
        abortPreviousRequests(
            () => refreshGitMaterial(gitMaterialId.toString(), abortControllerRef.current.signal),
            abortControllerRef,
        )
            .then((response) => {
                getMaterialHistory(
                    ciNodeId.toString(),
                    abortControllerRef.current.signal,
                    gitMaterialId,
                    showExcluded,
                ).catch((errors: ServerErrors) => {
                    if (!getIsRequestAborted(errors)) {
                        showError(errors)
                    }
                })
            })
            .catch((error: ServerErrors) => {
                if (!getIsRequestAborted(error)) {
                    showError(error)
                }
            })
    }

    const updateCIMaterialList = async (
        ciNodeId: string,
        ciPipelineName: string,
        preserveMaterialSelection: boolean,
        abortSignal: AbortSignal,
    ): Promise<void> => {
        const params = {
            pipelineId: ciNodeId,
        }
        return getCIMaterialList(params, abortSignal).then((response) => {
            let _workflowId
            let _appID
            let showRegexModal = false
            const _workflows = [...filteredWorkflows].map((workflow) => {
                workflow.nodes.map((node) => {
                    if (node.type === 'CI' && node.id == ciNodeId) {
                        _workflowId = workflow.id
                        _appID = workflow.appId
                        const selectedCIPipeline = filteredCIPipelines.get(_appID)?.find((_ci) => _ci.id === +ciNodeId)
                        if (selectedCIPipeline?.ciMaterial) {
                            for (const mat of selectedCIPipeline.ciMaterial) {
                                const gitMaterial = response.result.find(
                                    (_mat) => _mat.gitMaterialId === mat.gitMaterialId,
                                )
                                if (mat.isRegex && gitMaterial) {
                                    node.branch = gitMaterial.value
                                    node.isRegex = !!gitMaterial.regex
                                }
                            }
                        }
                        if (preserveMaterialSelection) {
                            const selectMaterial = node.inputMaterialList.find((mat) => mat.isSelected)
                            node.inputMaterialList = response.result.map((material) => {
                                return {
                                    ...material,
                                    isSelected: selectMaterial.id === material.id,
                                }
                            })
                        } else {
                            node.inputMaterialList = response.result
                        }
                        return node
                    }
                    return node
                })
                return workflow
            })
            showRegexModal = isShowRegexModal(_appID, +ciNodeId, response.result)
            setFilteredWorkflows(_workflows)
            setErrorCode(response.code)
            setSelectedCINode({ id: +ciNodeId, name: ciPipelineName, type: WorkflowNodeType.CI })
            setMaterialType(MATERIAL_TYPE.inputMaterialList)
            if (!showBulkCIModal) {
                setShowMaterialRegexModal(showRegexModal)
            }
            setWorkflowID(_workflowId)
            getWorkflowStatusData(_workflows)
            preventBodyScroll(true)
        })
    }

    const isShowRegexModal = (_appId: number, ciNodeId: number, inputMaterialList: any[]): boolean => {
        let showRegexModal = false
        const selectedCIPipeline = filteredCIPipelines.get(_appId).find((_ci) => _ci.id === ciNodeId)
        if (selectedCIPipeline?.ciMaterial) {
            for (const mat of selectedCIPipeline.ciMaterial) {
                showRegexModal = inputMaterialList.some((_mat) => {
                    return _mat.gitMaterialId === mat.gitMaterialId && mat.isRegex && !_mat.value
                })
                if (showRegexModal) {
                    break
                }
            }
        }
        return showRegexModal
    }

    const onClickCIMaterial = (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) => {
        setCILoading(true)
        history.push(`${url}${URLS.BUILD}/${ciNodeId}`)
        setMaterialType(MATERIAL_TYPE.inputMaterialList)
        setWebhookPayloads(null)
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
        abortControllerRef.current.abort()
        abortControllerRef.current = new AbortController()
        let _appID
        let _appName
        for (const _wf of filteredWorkflows) {
            const nd = _wf.nodes.find((node) => +node.id == +ciNodeId && node.type === 'CI')
            if (nd) {
                _appID = _wf.appId
                _appName = _wf.name
                break
            }
        }
        Promise.all([
            updateCIMaterialList(
                ciNodeId,
                ciPipelineName,
                preserveMaterialSelection,
                abortControllerRef.current.signal,
            ),
            getCIBlockState
                ? getCIBlockState(
                      ciNodeId,
                      _appID,
                      getBranchValues(ciNodeId, filteredWorkflows, filteredCIPipelines.get(_appID)),
                      _appName,
                  )
                : null,
            getRuntimeParams ? getRuntimeParams(ciNodeId) : null,
        ])
            .then((resp) => {
                // need to set result for getCIBlockState call only as for updateCIMaterialList
                // it's already being set inside the same function
                if (resp[1]) {
                    const workflows = [...filteredWorkflows].map((workflow) => {
                        workflow.nodes.map((node) => {
                            if (node.type === 'CI' && node.id == ciNodeId) {
                                node.pluginBlockState = processConsequenceData(resp[1])
                                node.isTriggerBlocked = resp[1].isCITriggerBlocked
                                return node
                            }
                            return node
                        })

                        return workflow
                    })
                    setFilteredWorkflows(workflows)
                }

                if (resp[2]) {
                    // Not handling error state since we are change viewType to error in catch block
                    setRuntimeParams({
                        [ciNodeId]: resp[2],
                    })
                }
            })
            .catch((errors: ServerErrors) => {
                if (!getIsRequestAborted(errors)) {
                    showError(errors)
                }
                closeCIModal()
            })
            .finally(() => {
                setCILoading(false)
            })
    }

    const onClickCDMaterial = (cdNodeId, nodeType: DeploymentNodeType, isApprovalNode: boolean = false): void => {
        ReactGA.event(
            isApprovalNode ? ENV_TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked : ENV_TRIGGER_VIEW_GA_EVENTS.ImageClicked,
        )

        let _workflowId
        let _appID
        let _selectedNode

        // FIXME: This needs to be replicated in rollback, env group since we need cipipelineid as 0 in external case
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (cdNodeId == node.id && node.type === nodeType) {
                    // TODO: Ig not using this, can remove it
                    node.approvalConfigData = workflow.approvalConfiguredIdsMap[cdNodeId]
                    _selectedNode = node
                    _workflowId = workflow.id
                    _appID = workflow.appId
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })

        if (!_selectedNode) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid node id',
            })
            history.push({
                search: '',
            })
            return
        }

        setWorkflowID(_workflowId)
        setFilteredWorkflows(_workflows)
        setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
        setMaterialType(MATERIAL_TYPE.inputMaterialList)
        preventBodyScroll(true)

        const newParams = new URLSearchParams(location.search)
        newParams.set(isApprovalNode ? 'approval-node' : 'cd-node', cdNodeId.toString())
        if (!isApprovalNode) {
            newParams.set('node-type', nodeType)
        } else {
            const currentApprovalState = newParams.get(TRIGGER_VIEW_PARAMS.APPROVAL_STATE)
            // If the current state is pending, then we should change the state to pending
            const approvalState =
                currentApprovalState === TRIGGER_VIEW_PARAMS.PENDING
                    ? TRIGGER_VIEW_PARAMS.PENDING
                    : TRIGGER_VIEW_PARAMS.APPROVAL

            newParams.set(TRIGGER_VIEW_PARAMS.APPROVAL_STATE, approvalState)
            newParams.delete(TRIGGER_VIEW_PARAMS.CD_NODE)
            newParams.delete(TRIGGER_VIEW_PARAMS.NODE_TYPE)
        }
        history.push({
            search: newParams.toString(),
        })
    }

    const onClickRollbackMaterial = (cdNodeId: number) => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.RollbackClicked)

        let _selectedNode

        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CD' && +node.id == cdNodeId) {
                    node.approvalConfigData = workflow.approvalConfiguredIdsMap[cdNodeId]
                    _selectedNode = node
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })

        if (!_selectedNode) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid node id',
            })
            history.push({
                search: '',
            })
            return
        }

        setFilteredWorkflows(_workflows)
        setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
        setMaterialType(MATERIAL_TYPE.rollbackMaterialList)
        preventBodyScroll(true)
        getWorkflowStatusData(_workflows)

        const newParams = new URLSearchParams(location.search)
        newParams.set('rollback-node', cdNodeId.toString())
        history.push({
            search: newParams.toString(),
        })
    }

    const onClickTriggerCINode = () => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.CITriggered)
        setCDLoading(true)
        let node
        let dockerfileConfiguredGitMaterialId
        for (const wf of filteredWorkflows) {
            node = wf.nodes.find((node) => {
                return node.type === selectedCINode.type && +node.id == selectedCINode.id
            })

            if (node) {
                dockerfileConfiguredGitMaterialId = wf.ciConfiguredGitMaterialId
                break
            }
        }

        const gitMaterials = new Map<number, string[]>()
        const ciPipelineMaterials = []
        for (const _inputMaterial of node.inputMaterialList) {
            gitMaterials[_inputMaterial.gitMaterialId] = [
                _inputMaterial.gitMaterialName.toLowerCase(),
                _inputMaterial.value,
            ]
            if (_inputMaterial) {
                if (_inputMaterial.value === DEFAULT_GIT_BRANCH_VALUE) {
                    continue
                }
                const history = _inputMaterial.history.filter((hstry) => hstry.isSelected)
                if (!history.length) {
                    history.push(_inputMaterial.history[0])
                }

                history.forEach((element) => {
                    const historyItem = {
                        Id: _inputMaterial.id,
                        GitCommit: {
                            Commit: element.commit,
                        },
                    }
                    if (!element.commit) {
                        historyItem.GitCommit['WebhookData'] = {
                            id: element.webhookData.id,
                        }
                    }
                    ciPipelineMaterials.push(historyItem)
                })
            }
        }
        if (gitMaterials[dockerfileConfiguredGitMaterialId][1] === DEFAULT_GIT_BRANCH_VALUE) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: CI_CONFIGURED_GIT_MATERIAL_ERROR.replace(
                    '$GIT_MATERIAL_ID',
                    `"${gitMaterials[dockerfileConfiguredGitMaterialId][0]}"`,
                ),
            })
            setCDLoading(false)
            return
        }

        // For this block validation is handled in CIMaterial
        const runtimeParamsPayload = getRuntimeParamsPayload?.(runtimeParams?.[selectedCINode?.id] ?? [])

        const payload = {
            pipelineId: +selectedCINode.id,
            ciPipelineMaterials,
            invalidateCache,
            pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
            ...(getRuntimeParamsPayload ? runtimeParamsPayload : {}),
        }

        triggerCINode(payload, abortCIBuildRef.current.signal)
            .then((response: any) => {
                if (response.result) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Pipeline Triggered',
                    })
                    setCDLoading(false)
                    closeCIModal()
                    setErrorCode(response.code)
                    setInvalidateCache(false)
                    preventBodyScroll(false)
                    getWorkflowStatusData(workflows)
                }
            })
            .catch((errors: ServerErrors) => {
                if (!getIsRequestAborted(errors)) {
                    showError(errors)
                }

                setCDLoading(false)

                setErrorCode(errors.code)
            })
    }

    const selectCommit = (materialId: string, hash: string, ciPipelineId?: string): void => {
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === WorkflowNodeType.CI && +node.id == (ciPipelineId ?? selectedCINode.id)) {
                    node.inputMaterialList.map((material) => {
                        if (material.id == materialId && material.isSelected) {
                            material.history.map((hist) => {
                                if (!hist.excluded) {
                                    if (material.type == SourceTypeMap.WEBHOOK) {
                                        if (hist?.webhookData && hist.webhookData?.id && hash == hist.webhookData.id) {
                                            hist.isSelected = true
                                        } else {
                                            hist.isSelected = false
                                        }
                                    } else {
                                        hist.isSelected = hash == hist.commit
                                    }
                                } else {
                                    hist.isSelected = false
                                }
                            })
                        }
                    })
                    return node
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })
        setFilteredWorkflows(_workflows)
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
            preventBodyScroll(true)
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
                preventBodyScroll(true)
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setIsBranchChangeLoading(false)
            })
    }

    const selectMaterial = (materialId, pipelineId?: number): void => {
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === WorkflowNodeType.CI && +node.id == (pipelineId ?? selectedCINode.id)) {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        return {
                            ...material,
                            searchText: material.searchText || '',
                            isSelected: material.id == materialId,
                        }
                    })
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })
        setFilteredWorkflows(_workflows)
    }

    const toggleChanges = (materialId: string, hash: string): void => {
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === selectedCINode.type && +node.id == selectedCINode.id) {
                    node.inputMaterialList.map((material) => {
                        if (material.id == materialId) {
                            material.history.map((hist) => {
                                if (hist.commit == hash) {
                                    hist.showChanges = !hist.showChanges
                                }
                            })
                        }
                    })
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })

        setFilteredWorkflows(_workflows)
    }

    const toggleInvalidateCache = (): void => {
        setInvalidateCache(!invalidateCache)
    }

    const closeCIModal = (): void => {
        abortControllerRef.current.abort()
        preventBodyScroll(false)
        setShowMaterialRegexModal(false)
        setRuntimeParams({})
        setRuntimeParamsErrorState({})
        history.push(url)
    }

    const closeCDModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        abortControllerRef.current.abort()
        setCDLoading(false)
        history.push({
            search: '',
        })
        getWorkflowStatusData(workflows)
        preventBodyScroll(false)
    }

    const closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        history.push({
            search: '',
        })
        getWorkflowStatusData(workflows)
        preventBodyScroll(false)
    }

    const hideWebhookModal = (e?) => {
        if (e) {
            stopPropagation(e)
        }
    }

    const onClickWebhookTimeStamp = () => {
        if (webhookTimeStampOrder === TIME_STAMP_ORDER.DESCENDING) {
            setWebhookTimeStampOrder(TIME_STAMP_ORDER.ASCENDING)
        } else if (webhookTimeStampOrder === TIME_STAMP_ORDER.ASCENDING) {
            setWebhookTimeStampOrder(TIME_STAMP_ORDER.DESCENDING)
        }
    }

    const getWebhookPayload = (id, _webhookTimeStampOrder) => {
        setWebhookPayloadLoading(true)
        getCIWebhookRes(id, _webhookTimeStampOrder).then((result) => {
            setWebhookPayloads(result?.result)
            setWebhookPayloadLoading(false)
        })
    }

    const onCloseBranchRegexModal = () => {
        setShowMaterialRegexModal(false)
    }

    const onClickShowBranchRegexModal = (isChangedBranch = false) => {
        setShowMaterialRegexModal(true)
        setChangeBranchClicked(isChangedBranch)
    }

    const hideBulkCDModal = () => {
        setCDLoading(false)
        setShowBulkCDModal(false)
        setResponseList([])

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
        setWebhookPayloads(null)
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
        preventBodyScroll(false)
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

    const onClickTriggerBulkCD = (appsToRetry?: Record<string, boolean>) => {
        if (isCDLoading || !validateBulkRuntimeParams()) {
            return
        }

        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCDTriggered(bulkTriggerType))
        setCDLoading(true)
        const _appIdMap = new Map<string, string>()
        const nodeList: CommonNodeAttr[] = []
        const triggeredAppList: { appId: number; envId?: number; appName: string }[] = []

        for (const _wf of filteredWorkflows) {
            if (_wf.isSelected && (!appsToRetry || appsToRetry[_wf.appId])) {
                const _cdNode = _wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CD && node.environmentId === +envId,
                )
                let _selectedNode: CommonNodeAttr
                if (bulkTriggerType === DeploymentNodeType.PRECD) {
                    _selectedNode = _cdNode.preNode
                } else if (bulkTriggerType === DeploymentNodeType.CD) {
                    _selectedNode = _cdNode
                } else if (bulkTriggerType === DeploymentNodeType.POSTCD) {
                    _selectedNode = _cdNode.postNode
                }

                if (_selectedNode?.[materialType]?.length) {
                    nodeList.push(_selectedNode)
                    _appIdMap.set(_selectedNode.id, _wf.appId.toString())
                    triggeredAppList.push({ appId: _wf.appId, appName: _wf.name, envId: _selectedNode.environmentId })
                }
            }
        }

        const _CDTriggerPromiseFunctionList = []
        nodeList.forEach((node, index) => {
            let ciArtifact = null
            const currentAppId = _appIdMap.get(node.id)

            node[materialType].forEach((artifact) => {
                if (artifact.isSelected == true) {
                    ciArtifact = artifact
                }
            })
            if (ciArtifact) {
                _CDTriggerPromiseFunctionList.push(() =>
                    triggerCDNode({
                        pipelineId: node.id,
                        ciArtifactId: ciArtifact.id,
                        appId: currentAppId,
                        stageType: bulkTriggerType,
                        runtimeParams: runtimeParams[currentAppId] || [],
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
                        _responseList.push({
                            appId: triggeredAppList[index].appId,
                            appName: triggeredAppList[index].appName,
                            statusText: statusType,
                            status: BulkResponseStatus.PASS,
                            envId: triggeredAppList[index].envId,
                            message: '',
                        })
                    } else {
                        const errorReason = response.reason
                        if (errorReason.code === 409) {
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
                                message: errorReason.errors[0].internalMessage,
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
                preventBodyScroll(false)
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

    const updateBulkCIInputMaterial = (materialList: Record<string, any[]>): void => {
        const _workflows = [...filteredWorkflows].map((wf) => {
            const _appId = wf.appId
            const _ciNode = wf.nodes.find((node) => node.type === WorkflowNodeType.CI)
            if (_ciNode) {
                _ciNode.inputMaterialList = materialList[_appId]
            }
            return wf
        })
        setFilteredWorkflows(_workflows)
    }

    const onClickTriggerBulkCI = (appIgnoreCache: Record<number, boolean>, appsToRetry?: Record<string, boolean>) => {
        if (isCILoading || !validateBulkRuntimeParams()) {
            return
        }

        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCITriggered)
        setCILoading(true)
        let node
        const skippedResources = []
        const nodeList: CommonNodeAttr[] = []
        const triggeredAppList: { appId: number; appName: string }[] = []
        for (const _wf of filteredWorkflows) {
            if (_wf.isSelected && (!appsToRetry || appsToRetry[_wf.appId])) {
                node = _wf.nodes.find((node) => {
                    return node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK
                })

                if (node && isBuildAndBranchTriggerAllowed(node)) {
                    triggeredAppList.push({ appId: _wf.appId, appName: _wf.name })
                    nodeList.push(node)
                } else if (node && !isBuildAndBranchTriggerAllowed(node)) {
                    // skipped can never be in appsToRetry
                    skippedResources.push({
                        appId: _wf.appId,
                        appName: _wf.name,
                        statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                        status: BulkResponseStatus.SKIP,
                        message: SKIPPED_RESOURCES_MESSAGE,
                    })
                }
            }
        }
        const _CITriggerPromiseFunctionList = []

        nodeList.forEach((node) => {
            const gitMaterials = new Map<number, string[]>()
            const ciPipelineMaterials = []
            for (let i = 0; i < node.inputMaterialList.length; i++) {
                gitMaterials[node.inputMaterialList[i].gitMaterialId] = [
                    node.inputMaterialList[i].gitMaterialName.toLowerCase(),
                    node.inputMaterialList[i].value,
                ]
                if (node.inputMaterialList[i].value === DEFAULT_GIT_BRANCH_VALUE) {
                    continue
                }
                const history = node.inputMaterialList[i].history.filter((hstry) => hstry.isSelected)
                if (!history.length) {
                    history.push(node.inputMaterialList[i].history[0])
                }

                history.forEach((element) => {
                    const historyItem = {
                        Id: node.inputMaterialList[i].id,
                        GitCommit: {
                            Commit: element.commit,
                        },
                    }
                    if (!element.commit) {
                        historyItem.GitCommit['WebhookData'] = {
                            id: element.webhookData.id,
                        }
                    }
                    ciPipelineMaterials.push(historyItem)
                })
            }

            const runtimeParamsPayload = getRuntimeParamsPayload?.(runtimeParams?.[node.id] ?? [])

            const payload = {
                pipelineId: +node.id,
                ciPipelineMaterials,
                invalidateCache: appIgnoreCache[+node.id],
                pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
                ...(getRuntimeParamsPayload ? runtimeParamsPayload : {}),
            }
            _CITriggerPromiseFunctionList.push(() => triggerCINode(payload))
        })

        if (!_CITriggerPromiseFunctionList.length && !skippedResources.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'No valid CI pipeline found',
            })
            setCDLoading(false)
            setCILoading(false)
            return
        }

        handleBulkTrigger(_CITriggerPromiseFunctionList, triggeredAppList, WorkflowNodeType.CI, skippedResources)
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

    const getWarningMessage = (_ciNode): string => {
        if (_ciNode.isLinkedCD) {
            return 'Uses another environment as image source'
        }

        if (_ciNode.isLinkedCI) {
            return 'Has linked build pipeline'
        }

        if (_ciNode.type === WorkflowNodeType.WEBHOOK) {
            return 'Has webhook build pipeline'
        }
    }

    const getErrorMessage = (_appId, _ciNode): string => {
        let errorMessage = ''
        if (_ciNode.inputMaterialList?.length > 0) {
            if (isShowRegexModal(_appId, +_ciNode.id, _ciNode.inputMaterialList)) {
                errorMessage = 'Primary branch is not set'
            } else {
                const selectedCIPipeline = filteredCIPipelines.get(_appId).find((_ci) => _ci.id === +_ciNode.id)
                if (selectedCIPipeline?.ciMaterial) {
                    const invalidInputMaterial = _ciNode.inputMaterialList.find((_mat) => {
                        return (
                            _mat.isBranchError ||
                            _mat.isRepoError ||
                            _mat.isDockerFileError ||
                            _mat.isMaterialSelectionError ||
                            (_mat.type === SourceTypeMap.WEBHOOK && _mat.history.length === 0)
                        )
                    })
                    if (invalidInputMaterial) {
                        if (invalidInputMaterial.isRepoError) {
                            errorMessage = invalidInputMaterial.repoErrorMsg
                        } else if (invalidInputMaterial.isDockerFileError) {
                            errorMessage = invalidInputMaterial.dockerFileErrorMsg
                        } else if (invalidInputMaterial.isBranchError) {
                            errorMessage = invalidInputMaterial.branchErrorMsg
                        } else if (invalidInputMaterial.isMaterialSelectionError) {
                            errorMessage = invalidInputMaterial.materialSelectionErrorMsg
                        } else {
                            errorMessage = CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFound
                        }
                    }
                }
            }
        }
        return errorMessage
    }

    /**
     * Acting only for single build trigger
     */
    const handleRuntimeParamChange: CIMaterialProps['handleRuntimeParamChange'] = (updatedRuntimeParams) => {
        if (selectedCINode?.id) {
            setRuntimeParams({ [selectedCINode.id]: updatedRuntimeParams })
        }
    }

    const createBulkCITriggerData = (): BulkCIDetailType[] => {
        const _selectedAppWorkflowList: BulkCIDetailType[] = []
        filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                const _ciNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )
                if (_ciNode) {
                    const configuredMaterialList = new Map<number, Set<number>>()
                    configuredMaterialList[wf.name] = new Set<number>()
                    if (!_ciNode[MATERIAL_TYPE.inputMaterialList]) {
                        _ciNode[MATERIAL_TYPE.inputMaterialList] = []
                    }
                    if (!_ciNode.isLinkedCI && _ciNode.type !== WorkflowNodeType.WEBHOOK && !_ciNode.isLinkedCD) {
                        const gitMaterials = new Map<number, string[]>()
                        for (const _inputMaterial of _ciNode.inputMaterialList) {
                            gitMaterials[_inputMaterial.gitMaterialId] = [
                                _inputMaterial.gitMaterialName.toLowerCase(),
                                _inputMaterial.value,
                            ]
                        }
                        handleSourceNotConfigured(
                            configuredMaterialList,
                            wf,
                            _ciNode[MATERIAL_TYPE.inputMaterialList],
                            !gitMaterials[wf.ciConfiguredGitMaterialId],
                        )
                    }
                    _selectedAppWorkflowList.push({
                        workFlowId: wf.id,
                        appId: wf.appId,
                        name: wf.name,
                        ciPipelineName: _ciNode.title,
                        ciPipelineId: _ciNode.id,
                        isFirstTrigger: _ciNode.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED,
                        isCacheAvailable: _ciNode.storageConfigured,
                        isLinkedCI: _ciNode.isLinkedCI,
                        isLinkedCD: _ciNode.isLinkedCD,
                        title: _ciNode.title,
                        isWebhookCI: _ciNode.type === WorkflowNodeType.WEBHOOK,
                        parentAppId: _ciNode.parentAppId,
                        parentCIPipelineId: _ciNode.parentCiPipeline,
                        material: _ciNode.inputMaterialList,
                        warningMessage: getWarningMessage(_ciNode),
                        errorMessage: getErrorMessage(wf.appId, _ciNode),
                        hideSearchHeader:
                            _ciNode.type === WorkflowNodeType.WEBHOOK || _ciNode.isLinkedCI || _ciNode.isLinkedCD,
                        filteredCIPipelines: filteredCIPipelines.get(wf.appId),
                        isJobCI: !!_ciNode.isJobCI,
                    })
                }
            }
        })
        return _selectedAppWorkflowList.sort((a, b) => sortCallback('name', a, b))
    }

    if (pageViewType === ViewType.LOADING) {
        return <Progressing pageLoader />
    }
    if (pageViewType === ViewType.ERROR) {
        return <ErrorScreenManager code={errorCode} />
    }
    if (!filteredWorkflows.length) {
        return (
            <div>
                <AppNotConfigured />
            </div>
        )
    }

    const resetAbortController = () => {
        abortCIBuildRef.current = new AbortController()
    }

    const renderCIMaterial = (): JSX.Element | null => {
        let nd: CommonNodeAttr
        let _appID
        if (selectedCINode?.id) {
            const configuredMaterialList = new Map<number, Set<number>>()
            for (const _wf of filteredWorkflows) {
                nd = _wf.nodes.find((node) => +node.id == selectedCINode.id && node.type === selectedCINode.type)
                if (nd) {
                    if (!nd[materialType]) {
                        nd[materialType] = []
                    }

                    const gitMaterials = new Map<number, string[]>()
                    for (const _inputMaterial of nd.inputMaterialList) {
                        gitMaterials[_inputMaterial.gitMaterialId] = [
                            _inputMaterial.gitMaterialName.toLowerCase(),
                            _inputMaterial.value,
                        ]
                    }
                    configuredMaterialList[_wf.name] = new Set<number>()
                    _appID = _wf.appId
                    handleSourceNotConfigured(
                        configuredMaterialList,
                        _wf,
                        nd[materialType],
                        !gitMaterials[_wf.ciConfiguredGitMaterialId],
                    )
                    break
                }
            }
        }
        const material = nd?.[materialType] || []
        if (selectedCINode?.id) {
            return (
                <Switch>
                    <Route path={`${url}${URLS.BUILD}/:ciNodeId/${URLS.WEBHOOK_MODAL}`}>
                        <WebhookReceivedPayloadModal
                            workflowId={workflowID}
                            webhookPayloads={webhookPayloads}
                            isWebhookPayloadLoading={isWebhookPayloadLoading}
                            material={material}
                            pipelineId={selectedCINode?.id?.toString()}
                            title={selectedCINode?.name}
                            isJobView={!!nd?.isJobCI}
                            getWebhookPayload={getWebhookPayload}
                            appId={_appID?.toString()}
                        />
                    </Route>
                    <Route path={`${url}${URLS.BUILD}/:ciNodeId`}>
                        <CIMaterialModal
                            workflowId={workflowID}
                            history={history}
                            location={location}
                            match={match}
                            material={material}
                            pipelineName={selectedCINode?.name}
                            isLoading={isCDLoading}
                            title={selectedCINode?.name}
                            pipelineId={selectedCINode?.id?.toString()}
                            getWebhookPayload={getWebhookPayload}
                            onClickWebhookTimeStamp={onClickWebhookTimeStamp}
                            showMaterialRegexModal={showMaterialRegexModal}
                            onCloseBranchRegexModal={onCloseBranchRegexModal}
                            filteredCIPipelines={filteredCIPipelines.get(_appID)}
                            onClickShowBranchRegexModal={onClickShowBranchRegexModal}
                            isChangeBranchClicked={isChangeBranchClicked}
                            getWorkflows={getWorkflowsData}
                            loader={isCILoading}
                            setLoader={setCILoading}
                            isFirstTrigger={nd?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED}
                            isCacheAvailable={nd?.storageConfigured}
                            fromAppGrouping
                            appId={_appID?.toString()}
                            isCITriggerBlocked={nd?.isTriggerBlocked}
                            ciBlockState={nd?.pluginBlockState}
                            isJobCI={!!nd?.isJobCI}
                            runtimeParams={runtimeParams[nd?.id] ?? []}
                            handleRuntimeParamChange={handleRuntimeParamChange}
                            closeCIModal={closeCIModal}
                            abortController={abortCIBuildRef.current}
                            resetAbortController={resetAbortController}
                        />
                    </Route>
                </Switch>
            )
        }
        return null
    }

    const renderBulkCDMaterial = (): JSX.Element | null => {
        if (!showBulkCDModal) {
            return null
        }

        const bulkCDDetailTypeResponse = createBulkCDTriggerData()
        const _selectedAppWorkflowList: BulkCDDetailType[] = bulkCDDetailTypeResponse.bulkCDDetailType
        const { uniqueReleaseTags } = bulkCDDetailTypeResponse

        // Have to look for its each prop carefully
        // No need to send uniqueReleaseTags will get those in BulkCDTrigger itself
        return (
            <BulkCDTrigger
                stage={bulkTriggerType}
                appList={_selectedAppWorkflowList}
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
            />
        )
    }

    const renderBulkCIMaterial = (): JSX.Element | null => {
        if (!showBulkCIModal) {
            return null
        }
        const _selectedAppWorkflowList: BulkCIDetailType[] = createBulkCITriggerData()
        return (
            <BulkCITrigger
                appList={_selectedAppWorkflowList}
                closePopup={hideBulkCIModal}
                updateBulkInputMaterial={updateBulkCIInputMaterial}
                onClickTriggerBulkCI={onClickTriggerBulkCI}
                getWebhookPayload={getWebhookPayload}
                webhookPayloads={webhookPayloads}
                setWebhookPayloads={setWebhookPayloads}
                isWebhookPayloadLoading={isWebhookPayloadLoading}
                isShowRegexModal={isShowRegexModal}
                responseList={responseList}
                isLoading={isCILoading}
                setLoading={setCILoading}
                runtimeParams={runtimeParams}
                setRuntimeParams={setRuntimeParams}
                runtimeParamsErrorState={runtimeParamsErrorState}
                setRuntimeParamsErrorState={setRuntimeParamsErrorState}
                setPageViewType={setPageViewType}
            />
        )
    }

    const renderBulkSourchChange = (): JSX.Element | null => {
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

        return (
            <CDMaterial
                materialType={materialType}
                appId={appId}
                envId={node?.environmentId}
                pipelineId={selectedCDNode?.id}
                stageType={DeploymentNodeType[selectedCDNode?.type]}
                envName={node?.environmentName}
                closeCDModal={closeCDModal}
                triggerType={node?.triggerType}
                isVirtualEnvironment={isVirtualEnv}
                parentEnvironmentName={node?.parentEnvironmentName}
                // Wont need it and it might be isCDLoading
                isLoading={isCILoading}
                ciPipelineId={node?.connectingCiPipelineId}
                deploymentAppType={node?.deploymentAppType}
                selectedAppName={selectedAppName}
                showPluginWarningBeforeTrigger={node?.showPluginWarning}
                consequence={node?.pluginBlockState}
                configurePluginURL={configurePluginURL}
                isTriggerBlockedDueToPlugin={node?.showPluginWarning && node?.isTriggerBlocked}
            />
        )
    }

    const renderCDMaterial = (): JSX.Element | null => {
        if (!selectedCDNode?.id) {
            return null
        }

        if (location.search.includes('cd-node') || location.search.includes('rollback-node')) {
            let node: CommonNodeAttr
            let _appID
            let selectedAppName: string
            let workflowId: string
            let selectedCINode: CommonNodeAttr

            if (selectedCDNode?.id) {
                for (const _wf of filteredWorkflows) {
                    node = _wf.nodes.find((el) => {
                        return +el.id == selectedCDNode.id && el.type == selectedCDNode.type
                    })
                    if (node) {
                        selectedCINode = _wf.nodes.find(
                            (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                        )
                        workflowId = _wf.id
                        _appID = _wf.appId
                        selectedAppName = _wf.name
                        break
                    }
                }
            }
            const material = node?.[materialType] || []

            return (
                <VisibleModal className="" parentClassName="dc__overflow-hidden" close={closeCDModal}>
                    <div
                        className={`modal-body--cd-material h-100 contains-diff-view flexbox-col ${
                            material.length > 0 ? '' : 'no-material'
                        }`}
                        onClick={stopPropagation}
                    >
                        {isCDLoading ? (
                            <>
                                <div className="trigger-modal__header flex right">
                                    <button type="button" className="dc__transparent" onClick={closeCDModal}>
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div style={{ height: 'calc(100% - 55px)' }}>
                                    <Progressing pageLoader size={32} />
                                </div>
                            </>
                        ) : (
                            renderCDMaterialContent({
                                node,
                                appId: _appID,
                                selectedAppName,
                                workflowId,
                                doesWorkflowContainsWebhook: selectedCINode?.type === WorkflowNodeType.WEBHOOK,
                                ciNodeId: selectedCINode?.id,
                            })
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    const renderApprovalMaterial = () => {
        if (ApprovalMaterialModal && location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            let node: CommonNodeAttr
            let _appID
            if (selectedCDNode?.id) {
                for (const _wf of filteredWorkflows) {
                    node = _wf.nodes.find((el) => {
                        return +el.id == selectedCDNode.id && el.type == selectedCDNode.type
                    })
                    if (node) {
                        _appID = _wf.appId
                        break
                    }
                }
            }

            return (
                <ApprovalMaterialModal
                    isLoading={isCDLoading}
                    node={node ?? ({} as CommonNodeAttr)}
                    materialType={materialType}
                    stageType={DeploymentNodeType[selectedCDNode?.type]}
                    closeApprovalModal={closeApprovalModal}
                    appId={_appID}
                    pipelineId={selectedCDNode?.id}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node?.connectingCiPipelineId}
                    configs={isConfigPresent}
                    isDefaultConfigPresent={isDefaultConfigPresent}
                    history={history}
                />
            )
        }

        return null
    }

    const renderDeployPopupMenu = (): JSX.Element => {
        return (
            <PopupMenu autoClose>
                <PopupMenu.Button
                    isKebab
                    rootClassName="h-36 popup-button-kebab dc__border-left-b4 pl-8 pr-8 dc__no-left-radius flex bcb-5"
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
    }

    const renderBulkTriggerActionButtons = (): JSX.Element => {
        const _showPopupMenu = showPreDeployment || showPostDeployment
        return (
            <div className="flex dc__min-width-fit-content">
                <button
                    className="dc__edit_button h-36 lh-36"
                    type="button"
                    style={{ marginRight: 'auto' }}
                    onClick={onShowChangeSourceModal}
                >
                    <span className="flex dc__align-items-center">
                        <Pencil className="icon-dim-16 scb-5 mr-4" />
                        Change branch
                    </span>
                </button>
                <span className="filter-divider-env" />
                <button
                    className="cta flex h-36 mr-12"
                    data-testid="bulk-build-image-button"
                    onClick={onShowBulkCIModal}
                >
                    {isCILoading ? <Progressing /> : 'Build image'}
                </button>
                <button
                    className={`cta flex h-36 ${_showPopupMenu ? 'dc__no-right-radius' : ''}`}
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
        )
    }

    const renderSelectedApps = (): JSX.Element => {
        return (
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
                            <span key={`selected-app-${app['id']}`}>
                                {app['name']}
                                {index !== selectedAppList.length - 1 && <span>, </span>}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const handleModalClose = () => {
        history.push(match.url)
    }

    const renderWorkflow = (): JSX.Element => {
        return (
            <>
                {filteredWorkflows.map((workflow, index) => {
                    return (
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
                        />
                    )
                })}
                {!!selectedAppList.length && (
                    <div
                        className="flexbox dc__content-space dc__position-fixed dc__bottom-0 dc__border-top w-100 bcn-0 pt-12 pr-20 pb-12 pl-20 dc__right-0"
                        style={{ width: 'calc(100vw - 56px)' }}
                    >
                        {renderSelectedApps()}
                        {renderBulkTriggerActionButtons()}
                    </div>
                )}
                <LinkedCIDetail workflows={filteredWorkflows} handleClose={handleModalClose} />
            </>
        )
    }

    return (
        <div
            className="svg-wrapper-trigger app-group-trigger-view-container bcn-0"
            style={{ paddingBottom: selectedAppList.length ? '68px' : '16px' }}
        >
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
                    invalidateCache,
                    refreshMaterial,
                    onClickTriggerCINode,
                    onClickCIMaterial,
                    onClickCDMaterial,
                    onClickRollbackMaterial,
                    closeCIModal,
                    selectCommit,
                    selectMaterial,
                    toggleChanges,
                    toggleInvalidateCache,
                    getMaterialByCommit,
                    getFilteredMaterial,
                    reloadTriggerView,
                }}
            >
                {renderWorkflow()}
                {renderCIMaterial()}
                {renderCDMaterial()}
                {renderBulkCDMaterial()}
                {renderBulkCIMaterial()}
                {renderApprovalMaterial()}
                {renderBulkSourchChange()}
            </TriggerViewContext.Provider>
            <div />
        </div>
    )
}
