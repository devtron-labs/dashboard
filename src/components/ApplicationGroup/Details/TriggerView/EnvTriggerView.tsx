import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { BUILD_STATUS, DEFAULT_GIT_BRANCH_VALUE, SourceTypeMap, ViewType } from '../../../../config'
import {
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
import { CDMaterial } from '../../../app/details/triggerView/cdMaterial'
import { CIMaterial } from '../../../app/details/triggerView/ciMaterial'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { CIMaterialType } from '../../../app/details/triggerView/MaterialHistory'
import {
    CIMaterialRouterProps,
    DeploymentNodeType,
    MATERIAL_TYPE,
    NodeAttr,
    WorkflowNodeType,
    WorkflowType,
} from '../../../app/details/triggerView/types'
import { Workflow } from '../../../app/details/triggerView/workflow/Workflow'
import {
    CDModalTab,
    getCDMaterialList,
    getCIMaterialList,
    getGitMaterialByCommitHash,
    getRollbackMaterialList,
    refreshGitMaterial,
    triggerCDNode,
    triggerCINode,
} from '../../../app/service'
import { createGitCommitUrl, ISTTimeModal, preventBodyScroll, sortObjectArrayAlphabetically } from '../../../common'
import { getWorkflows, getWorkflowStatus } from '../../AppGroup.service'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING, TIME_STAMP_ORDER } from '../../../app/details/triggerView/Constants'
import { toast } from 'react-toastify'
import { CI_CONFIGURED_GIT_MATERIAL_ERROR } from '../../../../config/constantMessaging'
import { getLastExecutionByArtifactAppEnv } from '../../../../services/service'
import { getCIWebhookRes } from '../../../app/details/triggerView/ciWebhook.service'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import {
    BULK_CI_RESPONSE_STATUS_TEXT,
    BulkResponseStatus,
    ENV_TRIGGER_VIEW_GA_EVENTS,
    BULK_CD_RESPONSE_STATUS_TEXT,
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
    BulkCIDetailType,
    ProcessWorkFlowStatusType,
    ResponseRowType,
    WorkflowAppSelectionType,
    WorkflowNodeSelectionType,
} from '../../AppGroup.types'
import { handleSourceNotConfigured, processWorkflowStatuses } from '../../AppGroup.utils'
import Tippy from '@tippyjs/react'

let inprogressStatusTimer
export default function EnvTriggerView({ filteredAppIds }: AppGroupDetailDefaultType) {
    const { envId } = useParams<{ envId: string }>()
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch<CIMaterialRouterProps>()
    const [pageViewType, setPageViewType] = useState<string>(ViewType.LOADING)
    const [isCILoading, setCILoading] = useState(false)
    const [isCDLoading, setCDLoading] = useState(false)
    const [showPreDeployment, setShowPreDeployment] = useState(false)
    const [showPostDeployment, setShowPostDeployment] = useState(false)
    const [errorCode, setErrorCode] = useState(0)
    const [showCIModal, setShowCIModal] = useState(false)
    const [showCDModal, setShowCDModal] = useState(false)
    const [showBulkCDModal, setShowBulkCDModal] = useState(false)
    const [showBulkCIModal, setShowBulkCIModal] = useState(false)
    const [showWebhookModal, setShowWebhookModal] = useState(false)
    const [isWebhookPayloadLoading, setWebhookPayloadLoading] = useState(false)
    const [invalidateCache, setInvalidateCache] = useState(false)
    const [webhookPayloads, setWebhookPayloads] = useState(null)
    const [isChangeBranchClicked, setChangeBranchClicked] = useState(false)
    const [webhookTimeStampOrder, setWebhookTimeStampOrder] = useState('')
    const [showMaterialRegexModal, setShowMaterialRegexModal] = useState(false)
    const [workflowID, setWorkflowID] = useState<number>()
    const [selectedAppID, setSelectedAppID] = useState<number>()
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
    const abortControllerRef = useRef(new AbortController())

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
                            isSelected: _result.Excluded,
                            excluded: _result.Excluded,
                        },
                    ]
                    _selectedMaterial.isMaterialLoading = false
                    _selectedMaterial.showAllCommits = false
                } else {
                    _selectedMaterial.history = []
                    _selectedMaterial.noSearchResultsMsg = `Commit not found for ‘${commitHash}’ in branch ‘${_selectedMaterial.value}’`
                    _selectedMaterial.noSearchResult = true
                    _selectedMaterial.isMaterialLoading = false
                    _selectedMaterial.showAllCommits = false
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
        pipelineName: string,
        ciPipelineMaterialId: number,
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
            updateCIMaterialList(
                selectedCINode.id.toString(),
                pipelineName,
                true,
                abortControllerRef.current.signal,
            ).catch((errors: ServerErrors) => {
                showError(errors)
                setErrorCode(errors.code)
            })
        }
    }

    const getFilteredMaterial = async (ciNodeId: number, ciPipelineMaterialId: number, showExcluded: boolean) => {
        const _workflows = [...filteredWorkflows].map((wf) => {
            wf.nodes = wf.nodes.map((node) => {
                if (node.id === ciNodeId.toString() && node.type === 'CI') {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.gitMaterialId === ciPipelineMaterialId) {
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
        getMaterialHistory(
            ciNodeId.toString(),
            abortControllerRef.current.signal,
            ciPipelineMaterialId,
            showExcluded,
        ).catch((errors: ServerErrors) => {
            if (!abortControllerRef.current.signal.aborted) {
                showError(errors)
            }
        })
    }

    const getMaterialHistory = (
        ciNodeId: string,
        abortSignal: AbortSignal,
        materialId?: number,
        showExcluded?: boolean,
    ) => {
        const params = {
            pipelineId: ciNodeId,
            materialId: materialId,
            showExcluded: showExcluded,
        }
        return getCIMaterialList(params, abortSignal).then((response) => {
            let showRegexModal = false
            const _workflows = [...filteredWorkflows].map((wf) => {
                wf.nodes.map((node) => {
                    if (node.type === 'CI' && +node.id == +ciNodeId) {
                        const selectedCIPipeline = filteredCIPipelines.get(wf.appId)?.find((_ci) => _ci.id === +ciNodeId)
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
    const refreshMaterial = (
        ciNodeId: number,
        pipelineName: string,
        gitMaterialId: number,
        abortController?: AbortController,
    ) => {
        const _workflows = [...filteredWorkflows].map((wf) => {
            wf.nodes = wf.nodes.map((node) => {
                if (node.id === ciNodeId.toString() && node.type === 'CI') {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        material.isMaterialLoading =
                            material.gitMaterialId === gitMaterialId ? true : material.isMaterialLoading
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
                updateCIMaterialList(ciNodeId.toString(), pipelineName, true, abortControllerRef.current.signal).catch(
                    (errors: ServerErrors) => {
                        if (!abortControllerRef.current.signal.aborted) {
                            showError(errors)
                            setErrorCode(errors.code)
                        }
                    },
                )
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
                    if (node.type === 'CI' && +node.id == +ciNodeId) {
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
            setSelectedAppID(_appID)
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
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
        abortControllerRef.current = new AbortController()
        updateCIMaterialList(ciNodeId, ciPipelineName, preserveMaterialSelection, abortControllerRef.current.signal)
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

    const onClickCDMaterial = (cdNodeId, nodeType: DeploymentNodeType) => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.ImageClicked)
        let _workflowId, _appID
        setCDLoading(true)
        setShowCDModal(true)
        abortControllerRef.current = new AbortController()
        getCDMaterialList(cdNodeId, nodeType, abortControllerRef.current.signal)
            .then((data) => {
                let _selectedNode
                const _workflows = [...filteredWorkflows].map((workflow) => {
                    const nodes = workflow.nodes.map((node) => {
                        if (cdNodeId == node.id && node.type === nodeType) {
                            node[MATERIAL_TYPE.inputMaterialList] = data
                            _selectedNode = node
                            _workflowId = workflow.id
                            _appID = workflow.appId
                        }
                        return node
                    })
                    workflow.nodes = nodes
                    return workflow
                })
                setWorkflowID(_workflowId)
                setSelectedAppID(_appID)
                setFilteredWorkflows(_workflows)
                setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
                setMaterialType(MATERIAL_TYPE.inputMaterialList)
                setShowCDModal(true)
                setCDLoading(false)
                preventBodyScroll(true)
            })
            .catch((errors: ServerErrors) => {
                if (!abortControllerRef.current.signal.aborted) {
                    showError(errors)
                    setErrorCode(errors.code)
                }
            })
    }

    const onClickRollbackMaterial = (
        cdNodeId: number,
        offset?: number,
        size?: number,
        callback?: (loadingMore: boolean, noMoreImages?: boolean) => void,
    ) => {
        if (!offset && !size) {
            ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.RollbackClicked)
        }
        setCDLoading(true)
        setShowCDModal(true)

        const _offset = offset || 1
        const _size = size || 20

        abortControllerRef.current = new AbortController()
        getRollbackMaterialList(cdNodeId, _offset, _size, abortControllerRef.current.signal)
            .then((response) => {
                let _selectedNode
                const _workflows = [...filteredWorkflows].map((workflow) => {
                    const nodes = workflow.nodes.map((node) => {
                        if (response.result && node.type === 'CD' && +node.id == cdNodeId) {
                            _selectedNode = node
                            if (!offset && !size) {
                                node.rollbackMaterialList = response.result
                            } else {
                                node.rollbackMaterialList = node.rollbackMaterialList.concat(response.result)
                            }
                        }
                        return node
                    })
                    workflow.nodes = nodes
                    return workflow
                })
                setFilteredWorkflows(_workflows)
                setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
                setMaterialType(MATERIAL_TYPE.rollbackMaterialList)
                setShowCDModal(true)
                setCDLoading(false)
                preventBodyScroll(true)
                getWorkflowStatusData(_workflows)
                if (callback && response.result) {
                    callback(false, response.result.length < 20)
                }
            })
            .catch((errors: ServerErrors) => {
                if (!abortControllerRef.current.signal.aborted) {
                    showError(errors)
                    setErrorCode(errors.code)

                    if (callback) {
                        callback(false)
                    }
                }
            })
    }

    const onClickTriggerCDNode = (
        nodeType: DeploymentNodeType,
        _appId: number,
        deploymentWithConfig?: string,
        wfrId?: number,
    ): void => {
        let node
        for (const _wf of filteredWorkflows) {
            node = _wf.nodes.find((nd) => +nd.id == selectedCDNode.id && nd.type == selectedCDNode.type)
            if (node) break
        }

        const pipelineId = node.id
        const ciArtifact = node[materialType].find((artifact) => artifact.isSelected)
        if (_appId && pipelineId && ciArtifact.id) {
            ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
            setCILoading(true)
            triggerCDNode(pipelineId, ciArtifact.id, _appId.toString(), nodeType, deploymentWithConfig, wfrId)
                .then((response: any) => {
                    if (response.result) {
                        const msg =
                            materialType == MATERIAL_TYPE.rollbackMaterialList
                                ? 'Rollback Initiated'
                                : 'Deployment Initiated'
                        toast.success(msg)
                        setShowCDModal(false)
                        setCILoading(false)
                        setErrorCode(response.code)
                        preventBodyScroll(false)
                        getWorkflowStatusData(workflows)
                    }
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    setCILoading(false)
                    setErrorCode(errors.code)
                })
        } else {
            let message = _appId ? '' : 'app id missing '
            message += pipelineId ? '' : 'pipeline id missing '
            message += ciArtifact.id ? '' : 'Artifact id missing '
            toast.error(message)
        }
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
                                        hist.isSelected =
                                            hist.webhookData && hist.webhookData.id && hash == hist.webhookData.id
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

    const selectImage = (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ): void => {
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (
                    (selectedCDDetail && selectedCDDetail.id === +node.id && selectedCDDetail.type === node.type) ||
                    (selectedCDNode && selectedCDNode.id == +node.id && node.type === selectedCDNode.type)
                ) {
                    const artifacts = node[materialType].map((artifact, i) => {
                        return {
                            ...artifact,
                            isSelected: i === index,
                        }
                    })
                    node[materialType] = artifacts
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

    const toggleSourceInfo = (
        materialIndex: number,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ): void => {
        const _workflows = [...filteredWorkflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (
                    (selectedCDDetail && selectedCDDetail.id === +node.id && selectedCDDetail.type === node.type) ||
                    (selectedCDNode && selectedCDNode.id == +node.id && node.type === selectedCDNode.type)
                ) {
                    node[materialType][materialIndex].showSourceInfo = !node[materialType][materialIndex].showSourceInfo
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

    //TODO: refactor
    const changeTab = (
        materialIndex,
        artifactId: number,
        tab,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
        appId?: number,
    ): void => {
        if (tab === CDModalTab.Changes) {
            const _workflows = [...filteredWorkflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (
                        (selectedCDDetail && selectedCDDetail.id === +node.id && selectedCDDetail.type === node.type) ||
                        (selectedCDNode && selectedCDNode.id == +node.id && node.type === selectedCDNode.type)
                    ) {
                        node[materialType][materialIndex].tab = tab
                    }
                    return node
                })
                workflow.nodes = nodes
                return workflow
            })
            setFilteredWorkflows(_workflows)
            return
        }

        let targetNode
        for (const _wf of filteredWorkflows) {
            targetNode = _wf.nodes.find(
                (node) =>
                    (selectedCDDetail && selectedCDDetail.id === +node.id && selectedCDDetail.type === node.type) ||
                    (selectedCDNode && selectedCDNode.id == +node.id && node.type === selectedCDNode.type),
            )
            if (targetNode) break
        }

        if (targetNode || targetNode.scanned || targetNode.scanEnabled) {
            getLastExecutionByArtifactAppEnv(artifactId, appId || selectedAppID, targetNode.environmentId)
                .then((response) => {
                    const _workflows = [...filteredWorkflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (
                                (selectedCDDetail &&
                                    selectedCDDetail.id === +node.id &&
                                    selectedCDDetail.type === node.type) ||
                                (selectedCDNode && selectedCDNode.id == +node.id && node.type === selectedCDNode.type)
                            ) {
                                node[materialType][materialIndex].tab = tab
                                node[materialType][materialIndex]['vulnerabilities'] = response.result.vulnerabilities
                                node[materialType][materialIndex]['lastExecution'] = response.result.lastExecution
                                node[materialType][materialIndex]['vulnerabilitiesLoading'] = false
                            }
                            return node
                        })
                        workflow.nodes = nodes
                        return workflow
                    })
                    setFilteredWorkflows(_workflows)
                })
                .catch((error) => {
                    showError(error)
                    const _workflows = [...filteredWorkflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (
                                (selectedCDDetail &&
                                    selectedCDDetail.id === +node.id &&
                                    selectedCDDetail.type === node.type) ||
                                (selectedCDNode && selectedCDNode.id == +node.id && node.type === selectedCDNode.type)
                            ) {
                                node[materialType][materialIndex].tab = tab
                                node[materialType][materialIndex]['vulnerabilitiesLoading'] = false
                            }
                            return node
                        })
                        workflow.nodes = nodes
                        return workflow
                    })
                    setFilteredWorkflows(_workflows)
                })
        }
    }

    const closeCIModal = (): void => {
        abortControllerRef.current.abort()
        preventBodyScroll(false)
        setShowCIModal(false)
        setShowMaterialRegexModal(false)
    }

    const closeCDModal = (e): void => {
        abortControllerRef.current.abort()
        preventBodyScroll(false)
        setCDLoading(false)
        setShowCDModal(false)
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
        setShowBulkCIModal(true)
    }

    const updateBulkCDInputMaterial = (materialList: Record<string, any[]>): void => {
        const _workflows = filteredWorkflows.map((wf) => {
            if (wf.isSelected) {
                const _appId = wf.appId
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
                    _selectedNode.inputMaterialList = materialList[_appId]
                }
            }
            return wf
        })
        setFilteredWorkflows(_workflows)
    }

    const onClickTriggerBulkCD = (appsToRetry?: Record<string, boolean>) => {
        if (isCDLoading) return
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCDTriggered(bulkTriggerType))
        setCDLoading(true)
        const _appIdMap = new Map<string, string>(),
            nodeList: NodeAttr[] = [],
            triggeredAppList: { appId: number; appName: string }[] = []
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

                if (_selectedNode && _selectedNode[materialType]) {
                    nodeList.push(_selectedNode)
                    _appIdMap.set(_selectedNode.id, _wf.appId.toString())
                    triggeredAppList.push({ appId: _wf.appId, appName: _wf.name })
                }
            }
        }
        const _CDTriggerPromiseList = []
        nodeList.forEach((node) => {
            const ciArtifact = node[materialType].find((artifact) => artifact.isSelected == true)
            if (ciArtifact) {
                _CDTriggerPromiseList.push(
                    triggerCDNode(node.id, ciArtifact.id, _appIdMap.get(node.id), bulkTriggerType),
                )
            }
        })
        handleBulkTrigger(_CDTriggerPromiseList, triggeredAppList, WorkflowNodeType.CD)
    }

    const handleBulkTrigger = (
        promiseList: any[],
        triggeredAppList: { appId: number; appName: string }[],
        type: WorkflowNodeType,
    ): void => {
        if (promiseList.length) {
            Promise.allSettled(promiseList).then((responses: any) => {
                const _responseList = []
                responses.forEach((response, index) => {
                    if (response.status === 'fulfilled') {
                        _responseList.push({
                            appId: triggeredAppList[index].appId,
                            appName: triggeredAppList[index].appName,
                            statusText:
                                type === WorkflowNodeType.CI
                                    ? BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.PASS]
                                    : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.PASS],
                            status: BulkResponseStatus.PASS,
                            message: '',
                        })
                    } else {
                        const errorReason = response.reason
                        if (errorReason.code === 403) {
                            _responseList.push({
                                appId: triggeredAppList[index].appId,
                                appName: triggeredAppList[index].appName,
                                statusText:
                                    type === WorkflowNodeType.CI
                                        ? BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.UNAUTHORIZE]
                                        : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.UNAUTHORIZE],
                                status: BulkResponseStatus.UNAUTHORIZE,
                                message: errorReason.errors[0].userMessage,
                            })
                        } else {
                            _responseList.push({
                                appId: triggeredAppList[index].appId,
                                appName: triggeredAppList[index].appName,
                                statusText:
                                    type === WorkflowNodeType.CI
                                        ? BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.FAIL]
                                        : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.FAIL],
                                status: BulkResponseStatus.FAIL,
                                message: errorReason.errors[0].userMessage,
                            })
                        }
                    }
                })
                setResponseList(_responseList)
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
                triggeredAppList.push({ appId: _wf.appId, appName: _wf.name })
                node = _wf.nodes.find((node) => {
                    return node.type === WorkflowNodeType.CI
                })
                if (node && !node.isLinkedCI) {
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
            }
            _CITriggerPromiseList.push(triggerCINode(payload))
        })
        handleBulkTrigger(_CITriggerPromiseList, triggeredAppList, WorkflowNodeType.CI)
    }

    const createBulkCDTriggerData = (): BulkCDDetailType[] => {
        const _selectedAppWorkflowList: BulkCDDetailType[] = []
        filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
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
                        envName: _selectedNode.environmentName,
                        parentPipelineId: _selectedNode.parentPipelineId,
                        parentPipelineType: WorkflowNodeType[_selectedNode.parentPipelineType],
                        parentEnvironmentName: _selectedNode.parentEnvironmentName,
                        material: _selectedNode.inputMaterialList,
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
                    })
                }
            }
        })
        return _selectedAppWorkflowList.sort((a, b) => sortCallback('name', a, b))
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
        const _selectedAppWorkflowList: BulkCDDetailType[] = createBulkCDTriggerData()
        return (
            <BulkCDTrigger
                stage={bulkTriggerType}
                appList={_selectedAppWorkflowList}
                closePopup={hideBulkCDModal}
                updateBulkInputMaterial={updateBulkCDInputMaterial}
                onClickTriggerBulkCD={onClickTriggerBulkCD}
                changeTab={changeTab}
                toggleSourceInfo={toggleSourceInfo}
                selectImage={selectImage}
                responseList={responseList}
                isLoading={isCDLoading}
                setLoading={setCDLoading}
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
                                appId={_appID}
                                pipelineId={selectedCDNode?.id}
                                stageType={DeploymentNodeType[selectedCDNode?.type]}
                                material={material}
                                materialType={materialType}
                                envName={node?.environmentName}
                                isLoading={isCILoading}
                                changeTab={changeTab}
                                triggerDeploy={onClickTriggerCDNode}
                                onClickRollbackMaterial={onClickRollbackMaterial}
                                closeCDModal={closeCDModal}
                                selectImage={selectImage}
                                toggleSourceInfo={toggleSourceInfo}
                                parentPipelineId={node?.parentPipelineId}
                                parentPipelineType={node?.parentPipelineType}
                                parentEnvironmentName={node?.parentEnvironmentName}
                            />
                        )}
                    </div>
                </VisibleModal>
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
                    onClickTriggerCDNode: onClickTriggerCDNode,
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
            </TriggerViewContext.Provider>
            <div></div>
        </div>
    )
}
