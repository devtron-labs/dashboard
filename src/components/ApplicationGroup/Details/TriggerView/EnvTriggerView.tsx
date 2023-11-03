import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { BUILD_STATUS, DEFAULT_GIT_BRANCH_VALUE, NO_COMMIT_SELECTED, SourceTypeMap, ViewType } from '../../../../config'
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
} from '@devtron-labs/devtron-fe-common-lib'
import CDMaterial from '../../../app/details/triggerView/cdMaterial'
import { CIMaterial } from '../../../app/details/triggerView/ciMaterial'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { CIMaterialType } from '../../../app/details/triggerView/MaterialHistory'
import {
    CIMaterialRouterProps,
    MATERIAL_TYPE,
    NodeAttr,
    WorkflowNodeType,
    WorkflowType,
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
import {
    createGitCommitUrl,
    importComponentFromFELibrary,
    ISTTimeModal,
    preventBodyScroll,
    sortObjectArrayAlphabetically,
} from '../../../common'
import { ReactComponent as Pencil } from '../../../../assets/icons/ic-pencil.svg'
import { getWorkflows, getWorkflowStatus } from '../../AppGroup.service'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING, TIME_STAMP_ORDER } from '../../../app/details/triggerView/Constants'
import { toast } from 'react-toastify'
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
import Tippy from '@tippyjs/react'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { getDefaultConfig } from '../../../notifications/notifications.service'
import BulkSourceChange from './BulkSourceChange'
import { CIPipelineBuildType } from '../../../ciPipeline/types'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const getCIBlockState = importComponentFromFELibrary('getCIBlockState', null, 'function')

// FIXME: IN CIMaterials we are sending isCDLoading while in CD materials we are sending isCILoading
let inprogressStatusTimer
export default function EnvTriggerView({ filteredAppIds, isVirtualEnv }: AppGroupDetailDefaultType) {
    const { envId } = useParams<{ envId: string }>()
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch<CIMaterialRouterProps>()

    const [pageViewType, setPageViewType] = useState<string>(ViewType.LOADING)
    const [isCILoading, setCILoading] = useState(false)
    const [isCDLoading, setCDLoading] = useState(false)
    const [isBranchChangeLoading, setIsBranchChangeLoading] = useState(false)
    const [showPreDeployment, setShowPreDeployment] = useState(false)
    const [showPostDeployment, setShowPostDeployment] = useState(false)
    const [errorCode, setErrorCode] = useState(0)
    const [showCIModal, setShowCIModal] = useState(false)
    const [showCDModal, setShowCDModal] = useState(false)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [showBulkCDModal, setShowBulkCDModal] = useState(false)
    const [showBulkCIModal, setShowBulkCIModal] = useState(false)
    const [showBulkSourceChangeModal, setShowBulkSourceChangeModal] = useState(false)
    const [showWebhookModal, setShowWebhookModal] = useState(false)
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
    
    // ref to make sure that on initial mount after we fetch workflows we handle modal based on url
    const handledLocation = useRef(false)
    const abortControllerRef = useRef(new AbortController())

    useEffect(
        () => () => {
            handledLocation.current = false
        },
        [],
    )

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

    useEffect(()=>{
        if (!handledLocation.current && filteredWorkflows?.length) {
            handledLocation.current = true
            // Would have been better if filteredWorkflows had default value to null since we are using it as a flag
            // URL Encoding for Bulk is not planned as of now
            setShowBulkCDModal(false)
            if (location.search.includes('approval-node')) {
                getConfigs()
                const searchParams = new URLSearchParams(location.search)
                const nodeId = Number(searchParams.get('approval-node'))
                if (!isNaN(nodeId)) {
                    onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
                }
                else {
                    toast.error('Invalid node id')
                    history.push({
                        search: '',
                    })
                }
            }
            else if (location.search.includes('rollback-node')) {
                const searchParams = new URLSearchParams(location.search)
                const nodeId = Number(searchParams.get('rollback-node'))
                if (!isNaN(nodeId)) {
                    onClickRollbackMaterial(nodeId)
                }
                else {
                    toast.error('Invalid node id')
                    history.push({
                        search: '',
                    })
                }
            }
            else if (location.search.includes('cd-node')) {
                const searchParams = new URLSearchParams(location.search)
                const nodeId = Number(searchParams.get('cd-node'))
                const nodeType = searchParams.get('node-type') ?? DeploymentNodeType.CD

                if (nodeType !== DeploymentNodeType.CD && nodeType !== DeploymentNodeType.PRECD && nodeType !== DeploymentNodeType.POSTCD) {
                    toast.error('Invalid node type')
                    history.push({
                        search: '',
                    })
                }
                else if (!isNaN(nodeId)) {
                    onClickCDMaterial(nodeId, nodeType as DeploymentNodeType)
                }
                else {
                    toast.error('Invalid node id')
                    history.push({
                        search: '',
                    })
                }
            }
        }
    },[filteredWorkflows])

    const getConfigs = () => {
        getDefaultConfig().then((response) => {
            let isConfigPresent = response.result.isConfigured
            let _isDefaultConfig = response.result.is_default_configured
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
            if (showCIModal) {
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
        let _preNodeExist, _postNodeExist
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
        let _preNodeExist = false,
            _postNodeExist = false
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
        let _preNodeExist, _postNodeExist
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
        getGitMaterialByCommitHash(ciPipelineMaterialId.toString(), commitHash)
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
                            date: _result.Date ? ISTTimeModal(_result.Date, false) : '',
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
                setFilteredWorkflows(workflows)
            })
            .catch((error: ServerErrors) => {
                showError(error)
                _selectedMaterial.isMaterialLoading = false
                setFilteredWorkflows(workflows)
            })
    }

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
                } else return node
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
            abortControllerRef.current = new AbortController()
            getMaterialHistory(
                selectedCINode.id.toString(),
                abortControllerRef.current.signal,
                gitMaterialId,
                false,
            ).catch((errors: ServerErrors) => {
                if (!abortControllerRef.current.signal.aborted) {
                    showError(errors)
                }
            })
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
        abortControllerRef.current = new AbortController()
        getMaterialHistory(ciNodeId.toString(), abortControllerRef.current.signal, gitMaterialId, showExcluded).catch(
            (errors: ServerErrors) => {
                if (!abortControllerRef.current.signal.aborted) {
                    showError(errors)
                }
            },
        )
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
            showExcluded: showExcluded,
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
                            } else return mat
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
                setShowCIModal(!showRegexModal)
                setShowMaterialRegexModal(showRegexModal)
            }
            getWorkflowStatusData(_workflows)
            preventBodyScroll(true)
        })
    }

    //NOTE: GIT MATERIAL ID
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
        abortControllerRef.current = abortController ?? new AbortController()
        refreshGitMaterial(gitMaterialId.toString(), abortControllerRef.current.signal)
            .then((response) => {
                getMaterialHistory(
                    ciNodeId.toString(),
                    abortControllerRef.current.signal,
                    gitMaterialId,
                    showExcluded,
                ).catch((errors: ServerErrors) => {
                    if (!abortControllerRef.current.signal.aborted) {
                        showError(errors)
                    }
                })
            })
            .catch((error: ServerErrors) => {
                if (!abortControllerRef.current.signal.aborted) {
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
            let _workflowId,
                _appID,
                showRegexModal = false
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
                        } else node.inputMaterialList = response.result
                        return node
                    } else return node
                })
                return workflow
            })
            showRegexModal = isShowRegexModal(_appID, +ciNodeId, response.result)
            setFilteredWorkflows(_workflows)
            setErrorCode(response.code)
            setSelectedCINode({ id: +ciNodeId, name: ciPipelineName, type: WorkflowNodeType.CI })
            setMaterialType(MATERIAL_TYPE.inputMaterialList)
            if (!showBulkCIModal) {
                setShowCIModal(!showRegexModal)
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
        setShowCIModal(true)
        setMaterialType(MATERIAL_TYPE.inputMaterialList)
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
        abortControllerRef.current = new AbortController()
        let _appID
        for (const _wf of filteredWorkflows) {
            const nd = _wf.nodes.find((node) => +node.id == +ciNodeId && node.type === 'CI')
            if (nd) {
                _appID = _wf.appId
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
                  )
                : { result: null },
        ])
            .then((resp) => {
                // need to set result for getCIBlockState call only as for updateCIMaterialList
                // it's already being set inside the same function
                if (resp[1].result) {
                    const workflows = [...filteredWorkflows].map((workflow) => {
                        workflow.nodes.map((node) => {
                            if (node.type === 'CI' && node.id == ciNodeId) {
                                node.ciBlockState = processConsequenceData(resp[1].result)
                                node.isCITriggerBlocked = resp[1].result.isCITriggerBlocked
                                return node
                            }
                            return node
                        })

                        return workflow
                    })
                    setFilteredWorkflows(workflows)
                }
            })
            .catch((errors: ServerErrors) => {
                if (!abortControllerRef.current.signal.aborted) {
                    showError(errors)
                    setErrorCode(errors.code)
                }
            })
            .finally(() => {
                setCILoading(false)
            })
    }

    const onClickCDMaterial = (cdNodeId, nodeType: DeploymentNodeType, isApprovalNode: boolean = false): void => {
        ReactGA.event(
            isApprovalNode ? ENV_TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked : ENV_TRIGGER_VIEW_GA_EVENTS.ImageClicked,
        )

        let _workflowId, _appID
        let _selectedNode

        // FIXME: This needs to be replicated in rollback, env group since we need cipipelineid as 0 in external case
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (cdNodeId == node.id && node.type === nodeType) {
                    node.userApprovalConfig = workflow.approvalConfiguredIdsMap[cdNodeId]
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
            toast.error('Invalid node id')
            history.push({
                search: '',
            })
            return
        }

        setWorkflowID(_workflowId)
        setFilteredWorkflows(_workflows)
        setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
        setMaterialType(MATERIAL_TYPE.inputMaterialList)
        setShowCDModal(!isApprovalNode)
        setShowApprovalModal(isApprovalNode)
        preventBodyScroll(true)

        const newParams = new URLSearchParams(location.search)
        newParams.set(isApprovalNode ? 'approval-node' : 'cd-node', cdNodeId.toString())
        if (!isApprovalNode) {
            newParams.set('node-type', nodeType)
        }
        history.push({
            search: newParams.toString(),
        })
    }

    const onClickRollbackMaterial = (cdNodeId: number) => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.RollbackClicked)

        setShowCDModal(true)
        let _selectedNode

        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CD' && +node.id == cdNodeId) {
                    node.userApprovalConfig = workflow.approvalConfiguredIdsMap[cdNodeId]
                    _selectedNode = node
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })

        if (!_selectedNode) {
            toast.error('Invalid node id')
            history.push({
                search: '',
            })
            return
        }

        setFilteredWorkflows(_workflows)
        setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
        setMaterialType(MATERIAL_TYPE.rollbackMaterialList)
        setShowCDModal(true)
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
        let node, dockerfileConfiguredGitMaterialId
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
                if (_inputMaterial.value === DEFAULT_GIT_BRANCH_VALUE) continue
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
            toast.error(
                CI_CONFIGURED_GIT_MATERIAL_ERROR.replace(
                    '$GIT_MATERIAL_ID',
                    `"${gitMaterials[dockerfileConfiguredGitMaterialId][0]}"`,
                ),
            )
            setCDLoading(false)
            return
        }

        const payload = {
            pipelineId: +selectedCINode.id,
            ciPipelineMaterials: ciPipelineMaterials,
            invalidateCache: invalidateCache,
            pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
        }

        triggerCINode(payload)
            .then((response: any) => {
                if (response.result) {
                    toast.success('Pipeline Triggered')
                    setShowCIModal(false)
                    setCDLoading(false)
                    setErrorCode(response.code)
                    setInvalidateCache(false)
                    preventBodyScroll(false)
                    getWorkflowStatusData(workflows)
                }
            })
            .catch((errors: ServerErrors) => { 
                showError(errors)
                
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

    const changeBranch = (value): void => {
        let appIds = []
        let appNameMap = new Map()
        selectedAppList.map((app) => {
            appIds.push(app.id)
            appNameMap.set(app.id, app.name)
        })
        setIsBranchChangeLoading(true)
        triggerBranchChange(appIds, +envId, value)
            .then((response: any) => {
                const _responseList = []
                response.result.apps.map((res) => {
                    _responseList.push({
                        appId: res.appId,
                        appName: appNameMap.get(res.appId),
                        statusText: res.status,
                        status: GetBranchChangeStatus(res.status),
                        envId: +envId,
                        message: res.message,
                    })
                })
                updateResponseListData(_responseList)
                setCDLoading(false)
                setCILoading(false)
                preventBodyScroll(false)
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
                                if (hist.commit == hash) hist.showChanges = !hist.showChanges
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
        setShowCIModal(false)
        setShowMaterialRegexModal(false)
    }

    const closeCDModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        abortControllerRef.current.abort()
        preventBodyScroll(false)
        setCDLoading(false)
        setShowCDModal(false)
        history.push({
            search: '',
        })
    }

    const closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        preventBodyScroll(false)
        setShowApprovalModal(false)
        history.push({
            search: '',
        })
    }

    const hideWebhookModal = (e?) => {
        if (e) {
            stopPropagation(e)
        }
        setShowWebhookModal(false)
    }

    const onShowCIModal = () => {
        setShowCIModal(true)
    }

    const onClickWebhookTimeStamp = () => {
        if (webhookTimeStampOrder === TIME_STAMP_ORDER.DESCENDING) {
            setWebhookTimeStampOrder(TIME_STAMP_ORDER.ASCENDING)
        } else if (webhookTimeStampOrder === TIME_STAMP_ORDER.ASCENDING) {
            setWebhookTimeStampOrder(TIME_STAMP_ORDER.DESCENDING)
        }
    }

    const toggleWebhookModal = (id, _webhookTimeStampOrder) => {
        setWebhookPayloadLoading(true)
        getCIWebhookRes(id, _webhookTimeStampOrder).then((result) => {
            setShowWebhookModal(true)
            setWebhookPayloads(result?.result)
            setWebhookPayloadLoading(false)
        })
    }

    const onCloseBranchRegexModal = () => {
        setShowMaterialRegexModal(false)
    }

    const onClickShowBranchRegexModal = (isChangedBranch = false) => {
        setShowCIModal(false)
        setShowMaterialRegexModal(true)
        setChangeBranchClicked(isChangedBranch)
    }

    const hideBulkCDModal = () => {
        setCDLoading(false)
        setShowBulkCDModal(false)
        setResponseList([])

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
    }

    const onShowBulkCIModal = () => {
        setCILoading(true)
        //setShowBulkCIModal(true)
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
                let _selectedNode: NodeAttr
                const _materialData = cdMaterialResponse[_appId]

                if (bulkTriggerType === DeploymentNodeType.PRECD) {
                    _selectedNode = _cdNode.preNode
                } else if (bulkTriggerType === DeploymentNodeType.CD) {
                    _selectedNode = _cdNode
                    _selectedNode.approvalUsers = _materialData.approvalUsers
                    _selectedNode.requestedUserId = _materialData.requestedUserId
                    _selectedNode.userApprovalConfig = _materialData.userApprovalConfig
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

    const onClickTriggerBulkCD = (appsToRetry?: Record<string, boolean>) => {
        if (isCDLoading) {
            return
        }
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCDTriggered(bulkTriggerType))
        setCDLoading(true)

        const _appIdMap = new Map<string, string>(),
            nodeList: NodeAttr[] = [],
            triggeredAppList: { appId: number; envId?: number; appName: string }[] = []

        for (const _wf of filteredWorkflows) {
            if (_wf.isSelected && (!appsToRetry || appsToRetry[_wf.appId])) {
                const _cdNode = _wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CD && node.environmentId === +envId,
                )
                let _selectedNode: NodeAttr
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
        
        const _CDTriggerPromiseList = []
        nodeList.forEach((node, index) => {
            let ciArtifact = null
            node[materialType].forEach((artifact) => {
                if (artifact.isSelected == true) ciArtifact = artifact
            })
            if (ciArtifact) {
                _CDTriggerPromiseList.push(
                    triggerCDNode(node.id, ciArtifact.id, _appIdMap.get(node.id), bulkTriggerType),
                )
            } else {
                triggeredAppList.splice(index, 1)
            }
        })
        handleBulkTrigger(_CDTriggerPromiseList, triggeredAppList, WorkflowNodeType.CD)
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
        } else if (isVirtualEnv) {
            return VirtualStatus
        } else {
            return CDStatus
        }
    }

    const handleBulkTrigger = (
        promiseList: any[],
        triggeredAppList: { appId: number; envId?: number; appName: string }[],
        type: WorkflowNodeType,
    ): void => {
        if (promiseList.length) {
            Promise.allSettled(promiseList).then((responses: any) => {
                const _responseList = []
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
                        } else if (errorReason.code === 403) {
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
                preventBodyScroll(false)
                getWorkflowStatusData(workflows)
            })
        } else {
            setCDLoading(false)
            setShowBulkCDModal(false)
            setCILoading(false)
            setShowBulkCIModal(false)
            setResponseList([])
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
        if (isCILoading) return
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCITriggered)
        setCILoading(true)
        let node
        const nodeList: NodeAttr[] = [],
            triggeredAppList: { appId: number; appName: string }[] = []
        for (const _wf of filteredWorkflows) {
            if (_wf.isSelected && (!appsToRetry || appsToRetry[_wf.appId])) {
                node = _wf.nodes.find((node) => {
                    return node.type === WorkflowNodeType.CI
                })
                if (node && !node.isLinkedCI) {
                    triggeredAppList.push({ appId: _wf.appId, appName: _wf.name })
                    nodeList.push(node)
                }
            }
        }
        const _CITriggerPromiseList = []
        nodeList.forEach((node) => {
            const gitMaterials = new Map<number, string[]>()
            const ciPipelineMaterials = []
            for (let i = 0; i < node.inputMaterialList.length; i++) {
                gitMaterials[node.inputMaterialList[i].gitMaterialId] = [
                    node.inputMaterialList[i].gitMaterialName.toLowerCase(),
                    node.inputMaterialList[i].value,
                ]
                if (node.inputMaterialList[i].value === DEFAULT_GIT_BRANCH_VALUE) continue
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

            const payload = {
                pipelineId: +node.id,
                ciPipelineMaterials: ciPipelineMaterials,
                invalidateCache: appIgnoreCache[+node.id],
                pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
            }
            _CITriggerPromiseList.push(triggerCINode(payload))
        })
        handleBulkTrigger(_CITriggerPromiseList, triggeredAppList, WorkflowNodeType.CI)
    }

    // Would only set data no need to get data related to materials from it, we will get that in bulk trigger
    const createBulkCDTriggerData = (): BulkCDDetailTypeResponse => {
        let uniqueReleaseTags: string[] = []
        let uniqueTagsSet = new Set<string>()
        const _selectedAppWorkflowList: BulkCDDetailType[] = []

        filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                //extract unique tags for this workflow
                wf.appReleaseTags?.forEach((tag) => {
                    if (!uniqueTagsSet.has(tag)) {
                        uniqueReleaseTags.push(tag)
                    }
                    uniqueTagsSet.add(tag)
                })
                const _cdNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CD && node.environmentId === +envId,
                )
                let _selectedNode: NodeAttr
                if (bulkTriggerType === DeploymentNodeType.PRECD) {
                    _selectedNode = _cdNode.preNode
                } else if (bulkTriggerType === DeploymentNodeType.CD) {
                    _selectedNode = _cdNode
                } else if (bulkTriggerType === DeploymentNodeType.POSTCD) {
                    _selectedNode = _cdNode.postNode
                }
                if (_selectedNode) {
                    _selectedAppWorkflowList.push({
                        workFlowId: wf.id,
                        appId: wf.appId,
                        name: wf.name,
                        cdPipelineName: _cdNode.title,
                        cdPipelineId: _cdNode.id,
                        stageType: DeploymentNodeType[_selectedNode.type],
                        triggerType: _cdNode.triggerType,
                        envName: _selectedNode.environmentName,
                        envId: _selectedNode.environmentId,
                        parentPipelineId: _selectedNode.parentPipelineId,
                        parentPipelineType: WorkflowNodeType[_selectedNode.parentPipelineType],
                        parentEnvironmentName: _selectedNode.parentEnvironmentName,
                        material: _selectedNode.inputMaterialList,
                        approvalUsers: _selectedNode.approvalUsers,
                        userApprovalConfig: _selectedNode.userApprovalConfig,
                        requestedUserId: _selectedNode.requestedUserId,
                        appReleaseTags: wf.appReleaseTags,
                        tagsEditable: wf.tagsEditable,
                        ciPipelineId: _selectedNode.connectingCiPipelineId,
                        hideImageTaggingHardDelete: wf.hideImageTaggingHardDelete,
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
                        warningMessage: warningMessage,
                        envName: _cdNode.environmentName,
                        envId: _cdNode.environmentId,
                    })
                }
            }
        })
        _selectedAppWorkflowList.sort((a, b) => sortCallback('name', a, b))
        return {
            bulkCDDetailType: _selectedAppWorkflowList,
            uniqueReleaseTags: uniqueReleaseTags,
        }
    }

    const getWarningMessage = (_ciNode): string => {
        if (_ciNode.isLinkedCI) {
            return 'Has linked build pipeline'
        } else if (_ciNode.type === WorkflowNodeType.WEBHOOK) {
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
                    if (!_ciNode.isLinkedCI && _ciNode.type !== WorkflowNodeType.WEBHOOK) {
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
                        isWebhookCI: _ciNode.type === WorkflowNodeType.WEBHOOK,
                        parentAppId: _ciNode.parentAppId,
                        parentCIPipelineId: _ciNode.parentCiPipeline,
                        material: _ciNode.inputMaterialList,
                        warningMessage: getWarningMessage(_ciNode),
                        errorMessage: getErrorMessage(wf.appId, _ciNode),
                        hideSearchHeader: _ciNode.type === WorkflowNodeType.WEBHOOK || _ciNode.isLinkedCI,
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
    } else if (pageViewType === ViewType.ERROR) {
        return <ErrorScreenManager code={errorCode} />
    } else if (!filteredWorkflows.length) {
        return (
            <div>
                <AppNotConfigured />
            </div>
        )
    }

    const renderCIMaterial = (): JSX.Element | null => {
        if (showCIModal || showMaterialRegexModal) {
            let nd: NodeAttr, _appID
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
            return (
                <VisibleModal className="" close={closeCIModal}>
                    <div className="modal-body--ci-material h-100" onClick={stopPropagation}>
                        {isCILoading ? (
                            <>
                                <div className="trigger-modal__header flex right">
                                    <button type="button" className="dc__transparent" onClick={closeCIModal}>
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div style={{ height: 'calc(100% - 55px)' }}>
                                    <Progressing pageLoader size={32} />
                                </div>
                            </>
                        ) : (
                            <CIMaterial
                                workflowId={workflowID}
                                history={history}
                                location={location}
                                match={match}
                                material={material}
                                pipelineName={selectedCINode?.name}
                                isLoading={isCDLoading}
                                title={selectedCINode?.name}
                                pipelineId={selectedCINode?.id}
                                showWebhookModal={showWebhookModal}
                                hideWebhookModal={hideWebhookModal}
                                toggleWebhookModal={toggleWebhookModal}
                                webhookPayloads={webhookPayloads}
                                isWebhookPayloadLoading={isWebhookPayloadLoading}
                                onClickWebhookTimeStamp={onClickWebhookTimeStamp}
                                webhhookTimeStampOrder={webhookTimeStampOrder}
                                showMaterialRegexModal={showMaterialRegexModal}
                                onCloseBranchRegexModal={onCloseBranchRegexModal}
                                filteredCIPipelines={filteredCIPipelines.get(_appID)}
                                onClickShowBranchRegexModal={onClickShowBranchRegexModal}
                                showCIModal={showCIModal}
                                onShowCIModal={onShowCIModal}
                                isChangeBranchClicked={isChangeBranchClicked}
                                getWorkflows={getWorkflowsData}
                                loader={isCILoading}
                                setLoader={setCILoading}
                                isFirstTrigger={nd?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED}
                                isCacheAvailable={nd?.storageConfigured}
                                fromAppGrouping={true}
                                appId={_appID?.toString()}
                                isCITriggerBlocked={nd?.isCITriggerBlocked}
                                ciBlockState={nd?.ciBlockState}
                                isJobCI={!!nd?.isJobCI}    
                            />
                        )}
                    </div>
                </VisibleModal>
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
        const uniqueReleaseTags = bulkCDDetailTypeResponse.uniqueReleaseTags

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
                showWebhookModal={showWebhookModal}
                hideWebhookModal={hideWebhookModal}
                toggleWebhookModal={toggleWebhookModal}
                webhookPayloads={webhookPayloads}
                isWebhookPayloadLoading={isWebhookPayloadLoading}
                isShowRegexModal={isShowRegexModal}
                responseList={responseList}
                isLoading={isCILoading}
                setLoading={setCILoading}
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

    const renderCDMaterial = (): JSX.Element | null => {
        if (showCDModal) {
            let node: NodeAttr, _appID
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
            const material = node?.[materialType] || []

            return (
                <VisibleModal className="" parentClassName="dc__overflow-hidden" close={closeCDModal}>
                    <div
                        className={`modal-body--cd-material h-100 contains-diff-view ${
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
                            <CDMaterial
                                materialType={materialType}
                                appId={_appID}
                                envId={node?.environmentId}
                                pipelineId={selectedCDNode?.id}
                                stageType={DeploymentNodeType[selectedCDNode?.type]}
                                envName={node?.environmentName}
                                closeCDModal={closeCDModal}
                                triggerType={node?.triggerType}
                                history={history}
                                isVirtualEnvironment={isVirtualEnv}
                                parentEnvironmentName={node?.parentEnvironmentName}
                                // Wont need it and it might be isCDLoading
                                isLoading={isCILoading}
                                ciPipelineId={node?.connectingCiPipelineId}
                                // Not Even using the below props
                                location={location}
                                match={match}
                                deploymentAppType={node?.deploymentAppType}
                            />
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    const renderApprovalMaterial = () => {
        if (ApprovalMaterialModal && showApprovalModal) {
            let node: NodeAttr, _appID
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
                    node={node ?? ({} as NodeAttr)}
                    materialType={materialType}
                    stageType={DeploymentNodeType[selectedCDNode?.type]}
                    closeApprovalModal={closeApprovalModal}
                    appId={_appID}
                    pipelineId={selectedCDNode?.id}
                    onClickCDMaterial={onClickCDMaterial}
                    getModuleInfo={getModuleInfo}
                    GitCommitInfoGeneric={GitCommitInfoGeneric}
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
                            data-trigger-type={'PRECD'}
                            onClick={onShowBulkCDModal}
                            data-testid="pre-deploy-popup-button"
                        >
                            Trigger Pre-deployment stage
                        </div>
                    )}
                    <div
                        className="flex left p-10 dc__hover-n50 pointer fs-13"
                        data-trigger-type={'CD'}
                        onClick={onShowBulkCDModal}
                        data-testid="deploy-popup-button"
                    >
                        Trigger Deployment
                    </div>
                    {showPostDeployment && (
                        <div
                            className="flex left p-10 dc__hover-n50 pointer fs-13"
                            data-trigger-type={'POSTCD'}
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
                <span className="filter-divider-env"></span>
                <button
                    className="cta flex h-36 mr-12"
                    data-testid="bulk-build-image-button"
                    onClick={onShowBulkCIModal}
                >
                    {isCILoading ? <Progressing /> : 'Build image'}
                </button>
                <button
                    className={`cta flex h-36 ${_showPopupMenu ? 'dc__no-right-radius' : ''}`}
                    data-trigger-type={'CD'}
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
                    <Close className="icon-dim-18 scr-5 mr-16 cursor mw-18" onClick={clearAppList} />
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
                            fromAppGrouping={true}
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
            </>
        )
    }
    return (
        <div
            className="svg-wrapper-trigger app-group-trigger-view-container"
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
            <TriggerViewContext.Provider
                value={{
                    invalidateCache: invalidateCache,
                    refreshMaterial: refreshMaterial,
                    onClickTriggerCINode: onClickTriggerCINode,
                    onClickCIMaterial: onClickCIMaterial,
                    onClickCDMaterial: onClickCDMaterial,
                    onClickRollbackMaterial: onClickRollbackMaterial,
                    closeCIModal: closeCIModal,
                    selectCommit: selectCommit,
                    selectMaterial: selectMaterial,
                    toggleChanges: toggleChanges,
                    toggleInvalidateCache: toggleInvalidateCache,
                    getMaterialByCommit: getMaterialByCommit,
                    getFilteredMaterial: getFilteredMaterial,
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
            <div></div>
        </div>
    )
}
