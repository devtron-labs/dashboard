import React, { useState, useEffect } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import ReactGA from 'react-ga4'
import {
    BUILD_STATUS,
    DEFAULT_GIT_BRANCH_VALUE,
    SourceTypeMap,
    SOURCE_NOT_CONFIGURED,
    ViewType,
} from '../../../../config'
import { ServerErrors } from '../../../../modals/commonTypes'
import { CDMaterial } from '../../../app/details/triggerView/cdMaterial'
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
    CDModalTab,
    getCDMaterialList,
    getCIMaterialList,
    getGitMaterialByCommitHash,
    getRollbackMaterialList,
    refreshGitMaterial,
    triggerCDNode,
    triggerCINode,
} from '../../../app/service'
import {
    createGitCommitUrl,
    ErrorScreenManager,
    ISTTimeModal,
    PopupMenu,
    preventBodyScroll,
    Progressing,
    showError,
    stopPropagation,
} from '../../../common'
import { getWorkflows, getWorkflowStatus } from '../../Environment.service'
import { TIME_STAMP_ORDER } from '../../../app/details/triggerView/Constants'
import { toast } from 'react-toastify'
import { CI_CONFIGURED_GIT_MATERIAL_ERROR } from '../../../../config/constantMessaging'
import { getLastExecutionByArtifactAppEnv } from '../../../../services/service'
import { getCIWebhookRes } from '../../../app/details/triggerView/ciWebhook.service'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import { ENV_TRIGGER_VIEW_GA_EVENTS } from '../../Constants'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import './EnvTriggerView.scss'
import BulkCDTrigger from './BulkCDTrigger'
import BulkCITrigger from './BulkCITrigger'

let timerRef
let inprogressStatusTimer
export default function EnvTriggerView() {
    const { envId } = useParams<{ envId: string }>()
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch<CIMaterialRouterProps>()
    const [pageViewType, setPageViewType] = useState<string>(ViewType.LOADING)
    const [loader, setLoader] = useState(false)
    const [isLoading, setLoading] = useState(false)
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
    const [selectedAppList, setSelectedAppList] = useState<{ id: number; name: string; ciPipelineName: string; ciPipelineId: string;}[]>([])
    const [workflows, setWorkflows] = useState<WorkflowType[]>([])
    const [selectedCDNode, setSelectedCDNode] = useState<{ id: number; name: string; type: WorkflowNodeType }>(null)
    const [selectedCINode, setSelectedCINode] = useState<{ id: number; name: string; type: WorkflowNodeType }>(null)
    const [filteredCIPipelines, setFilteredCIPipelines] = useState(null)
    const [materialType, setMaterialType] = useState(MATERIAL_TYPE.inputMaterialList)

    const getWorkflowsData = async (): Promise<void> => {
        try {
            const { workflows, filteredCIPipelines } = await getWorkflows(envId)
            setWorkflows(workflows)
            setFilteredCIPipelines(filteredCIPipelines)
            setErrorCode(0)
            setPageViewType(ViewType.FORM)
            getWorkflowStatusData(workflows)
            timerRef && clearInterval(timerRef)
            timerRef = setInterval(() => {
                getWorkflowStatusData(workflows)
            }, 30000)
        } catch (error) {
            showError(error)
            setErrorCode(error['code'])
            setPageViewType(ViewType.ERROR)
        }
    }

    const getWorkflowStatusData = (workflowsList: WorkflowType[]) => {
        getWorkflowStatus(envId)
            .then((response) => {
                let ciMap = {}
                let cdMap = {}
                let preCDMap = {}
                let postCDMap = {}
                let allCIs = response?.result?.ciWorkflowStatus || []
                let allCDs = response?.result?.cdWorkflowStatus || []
                let cicdInProgress = false
                //Create maps from Array
                if (allCIs.length) {
                    allCIs.forEach((pipeline) => {
                        ciMap[pipeline.ciPipelineId] = {
                            status: pipeline.ciStatus,
                            storageConfigured: pipeline.storageConfigured || false,
                        }
                        if (!cicdInProgress && (pipeline.ciStatus === 'Starting' || pipeline.ciStatus === 'Running')) {
                            cicdInProgress = true
                        }
                    })
                }
                if (allCDs.length) {
                    allCDs.forEach((pipeline) => {
                        if (pipeline.pre_status) preCDMap[pipeline.pipeline_id] = pipeline.pre_status
                        if (pipeline.post_status) postCDMap[pipeline.pipeline_id] = pipeline.post_status
                        if (pipeline.deploy_status) cdMap[pipeline.pipeline_id] = pipeline.deploy_status
                        if (
                            !cicdInProgress &&
                            (pipeline.pre_status === 'Starting' ||
                                pipeline.pre_status === 'Running' ||
                                pipeline.deploy_status === 'Progressing' ||
                                pipeline.post_status === 'Starting' ||
                                pipeline.post_status === 'Running')
                        ) {
                            cicdInProgress = true
                        }
                    })
                }
                //Update Workflow using maps
                const _workflows = workflowsList.map((wf) => {
                    wf.nodes = wf.nodes.map((node) => {
                        switch (node.type) {
                            case 'CI':
                                node['status'] = ciMap[node.id]?.status
                                node['storageConfigured'] = ciMap[node.id]?.storageConfigured
                                break
                            case 'PRECD':
                                node['status'] = preCDMap[node.id]
                                break
                            case 'POSTCD':
                                node['status'] = postCDMap[node.id]
                                break
                            case 'CD':
                                node['status'] = cdMap[node.id]
                                break
                        }
                        return node
                    })
                    return wf
                })
                inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
                if (cicdInProgress) {
                    inprogressStatusTimer = setTimeout(() => {
                        getWorkflowStatusData(_workflows)
                    }, 10000)
                }
                setWorkflows(_workflows)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
            })
    }

    useEffect(() => {
        getWorkflowsData()
    }, [])

    const clearAppList = (): void => {
        setSelectedAppList([])
        const _workflows = workflows.map((wf) => {
            wf.isSelected = false
            return wf
        })
        setWorkflows(_workflows)
    }

    const handleSelectionChange = (e): void => {
        const _appId = Number(e.currentTarget.dataset.appId)
        const _workflows = workflows.map((wf) => {
            if (_appId === wf.appId) {
                const selectedAppIndex = selectedAppList.findIndex((app) => app.id === _appId)
                const _selectedAppList = [...selectedAppList]
                if (wf.isSelected) {
                    _selectedAppList.splice(selectedAppIndex, 1)
                    wf.isSelected = false
                } else {
                    const _ciNode = wf.nodes.find((node) => node.type === WorkflowNodeType.CI)
                    _selectedAppList.push({ id: _appId, name: wf.name, ciPipelineName: _ciNode.title, ciPipelineId: _ciNode.id })
                    wf.isSelected = true
                }
                setSelectedAppList(_selectedAppList)
            }
            return wf
        })
        setWorkflows(_workflows)
    }

    const renderWorkflow = (): JSX.Element => {
        return (
            <>
                {workflows.map((workflow) => {
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
                            isFromENv={true}
                            history={history}
                            location={location}
                            match={match}
                        />
                    )
                })}
                {selectedAppList.length > 0 && (
                    <div
                        className="flexbox dc__content-space dc__position-fixed dc__bottom-0 dc__border-top w-100 bcn-0 pt-12 pr-20 pb-12 pl-20"
                        style={{ paddingLeft: '90px', right: 0 }}
                    >
                        <div className="flex">
                            <Close className="icon-dim-16 scr-5 mr-8 cursor" onClick={clearAppList} />
                            <div>
                                <div className="fs-13 fw-6 cn-9">
                                    {selectedAppList.length} application{selectedAppList.length > 1 ? 's' : ''} selected
                                </div>
                                <div className="fs-13 fw-4 cn-7">
                                    {selectedAppList.map((app, index) => (
                                        <span>
                                            {app.name}
                                            {index !== selectedAppList.length - 1 && <span>, </span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex">
                            <button className="cta flex h-36 mr-12" onClick={onShowBulkCIModal}>
                                {isLoading ? <Progressing /> : 'Build image'}
                            </button>
                            <button className="cta flex h-36 dc__no-right-radius" onClick={onShowBulkCDModal}>
                                {isLoading ? (
                                    <Progressing />
                                ) : (
                                    <>
                                        <DeployIcon className="icon-dim-16 dc__no-svg-fill mr-8" />
                                        Deploy
                                    </>
                                )}
                            </button>
                            <PopupMenu autoClose>
                                <PopupMenu.Button
                                    isKebab
                                    rootClassName="h-36 popup-button-kebab dc__border-left-n3 pl-4 pr-4 dc__no-left-radius flex bcb-5"
                                >
                                    <Dropdown className="icon-dim-20 fcn-0" />
                                </PopupMenu.Button>
                                <PopupMenu.Body>
                                    <div className="flex left p-10 pointer" onClick={(e) => {}}>
                                        Trigger Pre-deployment stage
                                    </div>
                                    <div className="flex left p-10 pointer" onClick={onShowBulkCDModal}>
                                        Trigger Deployment
                                    </div>
                                    <div className="flex left p-10 pointer" onClick={(e) => {}}>
                                        Trigger Post-deployment stage
                                    </div>
                                </PopupMenu.Body>
                            </PopupMenu>
                        </div>
                    </div>
                )}
            </>
        )
    }

    const handleSourceNotConfigured = (
        configuredMaterialList: Map<number, Set<number>>,
        wf: WorkflowType,
        _materialList: any[],
    ) => {
        if (_materialList.length > 0) {
            _materialList.forEach((node) => configuredMaterialList[wf.name].add(node.gitMaterialId))
        }
        for (const material of wf.gitMaterials) {
            if (configuredMaterialList[wf.name].has(material.gitMaterialId)) {
                continue
            }
            const ciMaterial: CIMaterialType = {
                id: 0,
                gitMaterialId: material.gitMaterialId,
                gitMaterialName: material.materialName.toLowerCase(),
                type: '',
                value: DEFAULT_GIT_BRANCH_VALUE,
                active: false,
                gitURL: '',
                isRepoError: false,
                repoErrorMsg: '',
                isBranchError: true,
                branchErrorMsg: SOURCE_NOT_CONFIGURED,
                regex: '',
                history: [],
                isSelected: false,
                lastFetchTime: '',
                isRegex: false,
            }
            _materialList.push(ciMaterial)
        }
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
                            isSelected: true,
                        },
                    ]
                    _selectedMaterial.isMaterialLoading = false
                } else {
                    _selectedMaterial.history = []
                    _selectedMaterial.noSearchResultsMsg = `Commit not found for ‘${commitHash}’ in branch ‘${_selectedMaterial.value}’`
                    _selectedMaterial.noSearchResult = true
                    _selectedMaterial.isMaterialLoading = false
                }
                setWorkflows(workflows)
            })
            .catch((error: ServerErrors) => {
                showError(error)
                _selectedMaterial.isMaterialLoading = false
                setWorkflows(workflows)
            })
    }

    const getMaterialByCommit = async (
        _ciNodeId: number,
        pipelineName: string,
        ciPipelineMaterialId: number,
        commitHash = null,
    ) => {
        let _selectedMaterial
        const _workflows = [...workflows].map((workflow) => {
            workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == _ciNodeId) {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.isSelected && material.searchText !== commitHash) {
                            material.isMaterialLoading = true
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
                _selectedMaterial.history = [{ ...commitInLocalHistory, isSelected: true }]
                _selectedMaterial.isMaterialLoading = false

                setWorkflows(_workflows)
            } else {
                setWorkflows(_workflows)
                getCommitHistory(ciPipelineMaterialId, commitHash, _workflows, _selectedMaterial)
            }
        } else {
            setWorkflows(_workflows)
            updateCIMaterialList(selectedCINode.id.toString(), pipelineName, true).catch((errors: ServerErrors) => {
                showError(errors)
                setErrorCode(errors.code)
            })
        }
    }

    //NOTE: GIT MATERIAL ID
    const refreshMaterial = (ciNodeId: number, pipelineName: string, gitMaterialId: number) => {
        const _workflows = [...workflows].map((wf) => {
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
        setWorkflows(_workflows)
        refreshGitMaterial(gitMaterialId.toString())
            .then((response) => {
                updateCIMaterialList(selectedCINode.id.toString(), pipelineName, true).catch((errors: ServerErrors) => {
                    showError(errors)
                    setErrorCode(errors.code)
                })
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    const updateCIMaterialList = async (
        ciNodeId: string,
        ciPipelineName: string,
        preserveMaterialSelection: boolean,
    ): Promise<void> => {
        const params = {
            pipelineId: ciNodeId,
        }
        return getCIMaterialList(params).then((response) => {
            let _workflowId,
                _appID,
                showRegexModal = false
            const _workflows = [...workflows].map((workflow) => {
                workflow.nodes.map((node) => {
                    if (node.type === 'CI' && +node.id == +ciNodeId) {
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
                        _workflowId = workflow.id
                        _appID = workflow.appId
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

            const selectedCIPipeline = filteredCIPipelines.get(_appID).find((_ci) => _ci.id === +ciNodeId)
            if (selectedCIPipeline?.ciMaterial) {
                for (const mat of selectedCIPipeline.ciMaterial) {
                    showRegexModal = response.result.some((_mat) => {
                        return _mat.gitMaterialId === mat.gitMaterialId && mat.isRegex && !_mat.value
                    })
                    if (showRegexModal) {
                        break
                    }
                }
            }

            setWorkflows(_workflows)
            setErrorCode(response.code)
            setSelectedCINode({ id: +ciNodeId, name: ciPipelineName, type: WorkflowNodeType.CI })
            setMaterialType(MATERIAL_TYPE.inputMaterialList)
            setShowCIModal(!showRegexModal)
            setShowMaterialRegexModal(showRegexModal)
            setWorkflowID(_workflowId)
            setSelectedAppID(_appID)
            getWorkflowStatusData(_workflows)
            preventBodyScroll(true)
        })
    }

    const onClickCIMaterial = (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) => {
        setLoader(true)
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
        updateCIMaterialList(ciNodeId, ciPipelineName, preserveMaterialSelection)
            .catch((errors: ServerErrors) => {
                showError(errors)
                setErrorCode(errors.code)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const onClickCDMaterial = (cdNodeId, nodeType: 'PRECD' | 'CD' | 'POSTCD') => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.ImageClicked)
        let _workflowId, _appID
        getCDMaterialList(cdNodeId, nodeType)
            .then((data) => {
                let _selectedNode
                const _workflows = [...workflows].map((workflow) => {
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
                setWorkflows(_workflows)
                setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
                setMaterialType(MATERIAL_TYPE.inputMaterialList)
                setShowCDModal(true)
                setLoading(false)
                preventBodyScroll(true)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setErrorCode(errors.code)
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

        const _offset = offset || 1
        const _size = size || 20

        getRollbackMaterialList(cdNodeId, _offset, _size)
            .then((response) => {
                let _selectedNode
                const _workflows = [...workflows].map((workflow) => {
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
                setWorkflows(_workflows)
                setSelectedCDNode({ id: +cdNodeId, name: _selectedNode.name, type: _selectedNode.type })
                setMaterialType(MATERIAL_TYPE.rollbackMaterialList)
                setShowCDModal(true)
                setLoading(false)
                preventBodyScroll(true)
                getWorkflowStatusData(_workflows)
                if (callback && response.result) {
                    callback(false, response.result.length < 20)
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setErrorCode(errors.code)

                if (callback) {
                    callback(false)
                }
            })
    }

    // stageType'PRECD' | 'CD' | 'POSTCD'
    const onClickTriggerCDNode = (nodeType: string, deploymentWithConfig?: string, wfrId?: number): void => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
        setLoading(true)
        let node
        for (let i = 0; i < workflows.length; i++) {
            let workflow = workflows[i]
            node = workflow.nodes.find((nd) => +nd.id == selectedCDNode.id && nd.type == selectedCDNode.type)
            if (node) break
        }

        const pipelineId = node.id
        const ciArtifact = node[materialType].find((artifact) => artifact.isSelected == true)
        if (selectedAppID && pipelineId && ciArtifact.id) {
            triggerCDNode(pipelineId, ciArtifact.id, selectedAppID.toString(), nodeType, deploymentWithConfig, wfrId)
                .then((response: any) => {
                    if (response.result) {
                        const msg =
                            materialType == MATERIAL_TYPE.rollbackMaterialList
                                ? 'Rollback Initiated'
                                : 'Deployment Initiated'
                        toast.success(msg)
                        setShowCDModal(false)
                        setLoading(false)
                        setErrorCode(response.code)
                        preventBodyScroll(false)
                        getWorkflowStatusData(workflows)
                    }
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    setLoading(false)
                    setErrorCode(errors.code)
                })
        } else {
            let message = selectedAppID ? '' : 'app id missing '
            message += pipelineId ? '' : 'pipeline id missing '
            message += ciArtifact.id ? '' : 'Artifact id missing '
            toast.error(message)
        }
    }

    const onClickTriggerCINode = () => {
        ReactGA.event(ENV_TRIGGER_VIEW_GA_EVENTS.CITriggered)
        setLoading(true)
        let node, dockerfileConfiguredGitMaterialId
        for (let i = 0; i < workflows.length; i++) {
            node = workflows[i].nodes.find((node) => {
                return node.type === selectedCINode.type && +node.id == selectedCINode.id
            })

            if (node) {
                dockerfileConfiguredGitMaterialId = workflows[i].ciConfiguredGitMaterialId
                break
            }
        }
        const gitMaterials = new Map<number, string[]>()
        const ciPipelineMaterials = []
        for (let i = 0; i < node.inputMaterialList.length; i++) {
            gitMaterials[node.inputMaterialList[i].gitMaterialId] = [
                node.inputMaterialList[i].gitMaterialName.toLowerCase(),
                node.inputMaterialList[i].value,
            ]
            if (node.inputMaterialList[i]) {
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
        }
        if (gitMaterials[dockerfileConfiguredGitMaterialId][1] === DEFAULT_GIT_BRANCH_VALUE) {
            toast.error(
                CI_CONFIGURED_GIT_MATERIAL_ERROR.replace(
                    '$GIT_MATERIAL_ID',
                    `"${gitMaterials[dockerfileConfiguredGitMaterialId][0]}"`,
                ),
            )
            setLoading(false)
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
                    setLoading(false)
                    setErrorCode(response.code)
                    setInvalidateCache(false)
                    preventBodyScroll(false)
                    getWorkflowStatusData(workflows)
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)

                setLoading(false)

                setErrorCode(errors.code)
            })
    }

    const selectCommit = (materialId: string, hash: string): void => {
        const _workflows = [...workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === selectedCINode.type && +node.id == selectedCINode.id) {
                    node.inputMaterialList.map((material) => {
                        if (material.id == materialId && material.isSelected) {
                            material.history.map((hist) => {
                                if (material.type == SourceTypeMap.WEBHOOK) {
                                    hist.isSelected =
                                        hist.webhookData && hist.webhookData.id && hash == hist.webhookData.id
                                } else {
                                    hist.isSelected = hash == hist.commit
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
        setWorkflows(_workflows)
    }

    const selectMaterial = (materialId): void => {
        const _workflows = [...workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === selectedCINode.type && +node.id == selectedCINode.id) {
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
        setWorkflows(_workflows)
    }

    const selectImage = (index: number, materialType: string): void => {
        const _workflows = [...workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (selectedCDNode.id == +node.id && node.type === selectedCDNode.type) {
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
        setWorkflows(_workflows)
    }

    const toggleChanges = (materialId: string, hash: string): void => {
        const _workflows = [...workflows].map((workflow) => {
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

        setWorkflows(_workflows)
    }

    const toggleSourceInfo = (materialIndex: number): void => {
        const _workflows = [...workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (+node.id == selectedCDNode.id && node.type === selectedCDNode.type) {
                    node[materialType][materialIndex].showSourceInfo = !node[materialType][materialIndex].showSourceInfo
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })
        setWorkflows(_workflows)
    }

    const toggleInvalidateCache = (): void => {
        setInvalidateCache(!invalidateCache)
    }

    //TODO: refactor
    const changeTab = (materialIndex, artifactId: number, tab): void => {
        if (tab === CDModalTab.Changes) {
            const _workflows = [...workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (+node.id == selectedCDNode.id && node.type === selectedCDNode.type) {
                        node[materialType][materialIndex].tab = tab
                    }
                    return node
                })
                workflow.nodes = nodes
                return workflow
            })
            setWorkflows(_workflows)
            return
        }

        let targetNode
        for (let i = 0; i < workflows.length; i++) {
            targetNode = workflows[i].nodes.find(
                (node) => +node.id == selectedCDNode.id && node.type === selectedCDNode.type,
            )
            if (targetNode) break
        }

        if (targetNode || targetNode.scanned || targetNode.scanEnabled) {
            getLastExecutionByArtifactAppEnv(artifactId, selectedAppID, targetNode.environmentId)
                .then((response) => {
                    const _workflows = [...workflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (+node.id == selectedCDNode.id && node.type === selectedCDNode.type) {
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
                    setWorkflows(_workflows)
                })
                .catch((error) => {
                    showError(error)
                    const _workflows = [...workflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (+node.id == selectedCDNode.id && node.type === selectedCDNode.type) {
                                node[materialType][materialIndex].tab = tab
                                node[materialType][materialIndex]['vulnerabilitiesLoading'] = false
                            }
                            return node
                        })
                        workflow.nodes = nodes
                        return workflow
                    })
                    setWorkflows(_workflows)
                })
        }
    }

    const closeCIModal = (): void => {
        preventBodyScroll(false)
        setShowCIModal(false)
        setShowMaterialRegexModal(false)
    }

    const closeCDModal = (): void => {
        preventBodyScroll(false)
        setShowCDModal(false)
    }

    const hideWebhookModal = () => {
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
        setShowBulkCDModal(false)
    }

    const onShowBulkCDModal = (e) => {
        setTimeout(() => {
            setShowBulkCDModal(true)
        }, 100)
    }

    const hideBulkCIModal = () => {
        setShowBulkCIModal(false)
    }

    const onShowBulkCIModal = () => {
        setShowBulkCIModal(true)
    }

    const renderCIMaterial = (): JSX.Element | null => {
        if ((selectedCINode?.id && showCIModal) || showMaterialRegexModal) {
            let nd: NodeAttr, _appID
            const configuredMaterialList = new Map<number, Set<number>>()
            for (let i = 0; i < workflows.length; i++) {
                nd = workflows[i].nodes.find(
                    (node) => +node.id == selectedCINode.id && node.type === selectedCINode.type,
                )

                if (nd) {
                    configuredMaterialList[workflows[i].name] = new Set<number>()
                    _appID = workflows[i].appId
                    handleSourceNotConfigured(configuredMaterialList, workflows[i], nd[materialType])
                    break
                }
            }
            const material = nd?.[materialType] || []
            return (
                <CIMaterial
                    workflowId={workflowID}
                    history={history}
                    location={location}
                    match={match}
                    material={material}
                    pipelineName={selectedCINode.name}
                    isLoading={isLoading}
                    title={selectedCINode.name}
                    pipelineId={selectedCINode.id}
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
                    loader={loader}
                    setLoader={setLoader}
                    isFirstTrigger={nd?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED}
                    isCacheAvailable={nd?.storageConfigured}
                    isFromEnv={true}
                    appId={_appID.toString()}
                />
            )
        }

        return null
    }

    const renderBulkCDMaterial = (): JSX.Element | null => {
        if (!showBulkCDModal) {
            return null
        }
        return <BulkCDTrigger envId={1} appId="1" closePopup={hideBulkCDModal} isLoading={isLoading} />
    }

    const renderBulkCIMaterial = (): JSX.Element | null => {
        if (!showBulkCIModal) {
            return null
        }
        return (
            <BulkCITrigger
                appList={selectedAppList}
                envId={1}
                appId="1"
                closePopup={hideBulkCIModal}
            />
        )
    }

    const renderCDMaterial = (): JSX.Element | null => {
        if (showCDModal && selectedCDNode?.id) {
            let node: NodeAttr
            for (let i = 0; i < workflows.length; i++) {
                node = workflows[i].nodes.find((el) => {
                    return +el.id == selectedCDNode.id && el.type == selectedCDNode.type
                })
                if (node) {
                    break
                }
            }
            const material = node?.[materialType] || []

            return (
                <CDMaterial
                    appId={selectedAppID}
                    pipelineId={selectedCDNode.id}
                    stageType={selectedCDNode.type}
                    material={material}
                    materialType={materialType}
                    envName={node.environmentName}
                    isLoading={isLoading}
                    changeTab={changeTab}
                    triggerDeploy={onClickTriggerCDNode}
                    onClickRollbackMaterial={onClickRollbackMaterial}
                    closeCDModal={closeCDModal}
                    selectImage={selectImage}
                    toggleSourceInfo={toggleSourceInfo}
                    parentPipelineId={node.parentPipelineId}
                    parentPipelineType={node.parentPipelineType}
                    parentEnvironmentName={node.parentEnvironmentName}
                />
            )
        }

        return null
    }

    if (pageViewType === ViewType.LOADING) {
        return <Progressing pageLoader />
    } else if (pageViewType === ViewType.ERROR) {
        return <ErrorScreenManager code={errorCode} />
    } else if (!workflows.length) {
        return (
            <div>
                <AppNotConfigured />
            </div>
        )
    }
    return (
        <div className="svg-wrapper-trigger" style={{ paddingBottom: selectedAppList.length ? '68px' : '16px' }}>
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
