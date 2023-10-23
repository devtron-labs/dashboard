import React, { useEffect, useState } from 'react'
import {
    ServerErrors,
    showError,
    Progressing,
    ErrorScreenManager,
    stopPropagation,
    VisibleModal,
    DeploymentNodeType,
    CDModalTab,
    DeploymentAppTypes,
    ToastBodyWithButton,
    ToastBody,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    getCDMaterialList,
    getRollbackMaterialList,
    triggerCDNode,
    getCIMaterialList,
    triggerCINode,
    getWorkflowStatus,
    refreshGitMaterial,
    getGitMaterialByCommitHash,
} from '../../service'
import {
    createGitCommitUrl,
    importComponentFromFELibrary,
    ISTTimeModal,
    preventBodyScroll,
    sortObjectArrayAlphabetically,
} from '../../../common'
import { getTriggerWorkflows } from './workflow.service'
import { Workflow } from './workflow/Workflow'
import {
    CIMaterialRouterProps,
    MATERIAL_TYPE,
    NodeAttr,
    TriggerViewProps,
    TriggerViewState,
    WorkflowNodeType,
    WorkflowType,
} from './types'
import { CIMaterial } from './ciMaterial'
import { CDMaterial } from './cdMaterial'
import {
    URLS,
    ViewType,
    SourceTypeMap,
    BUILD_STATUS,
    DEFAULT_GIT_BRANCH_VALUE,
    DOCUMENTATION,
    NO_COMMIT_SELECTED,
} from '../../../../config'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { toast } from 'react-toastify'
import ReactGA from 'react-ga4'
import { withRouter, NavLink, useParams, useHistory, useRouteMatch, useLocation } from 'react-router-dom'
import { getEnvironmentListMinPublic, getLastExecutionByArtifactAppEnv } from '../../../../services/service'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { getHostURLConfiguration } from '../../../../services/service'
import { getCIWebhookRes } from './ciWebhook.service'
import { CIMaterialType } from './MaterialHistory'
import { TriggerViewContext } from './config'
import { DEFAULT_ENV, HOST_ERROR_MESSAGE, TIME_STAMP_ORDER, TRIGGER_VIEW_GA_EVENTS } from './Constants'
import {
    APP_DETAILS,
    CI_CONFIGURED_GIT_MATERIAL_ERROR,
    NO_TASKS_CONFIGURED_ERROR,
    TOAST_BUTTON_TEXT_VIEW_DETAILS,
} from '../../../../config/constantMessaging'
import {
    getBranchValues,
    handleSourceNotConfigured,
    processConsequenceData,
    processWorkflowStatuses,
} from '../../../ApplicationGroup/AppGroup.utils'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { getDefaultConfig } from '../../../notifications/notifications.service'
import { Environment } from '../../../cdPipeline/cdPipeline.types'
import { CIPipelineBuildType } from '../../../ciPipeline/types'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const getDeployManifestDownload = importComponentFromFELibrary('getDeployManifestDownload', null, 'function')
const getCIBlockState = importComponentFromFELibrary('getCIBlockState', null, 'function')

function TriggerView({ isJobView, filteredEnvIds }: TriggerViewProps) {
    let timerRef
    let inprogressStatusTimer
    let abortController: AbortController

    const params = useParams<{ appId: string }>()
    const history = useHistory()
    const match = useRouteMatch<CIMaterialRouterProps>()
    const location = useLocation()

    const [code, setCode] = useState(0)
    const [view, setView] = useState(ViewType.LOADING)
    const [workflows, setWorkflows] = useState([])
    const [cdNodeId, setCdNodeId] = useState(0)
    const [ciNodeId, setCiNodeId] = useState(0)
    const [workflowId, setWorkflowId] = useState(0)
    const [nodeType, setNodeType] = useState(null)
    const [ciPipelineName, setCiPipelineName] = useState('')
    const [materialType, setMaterialType] = useState('')
    const [showCDModal, setShowCDModal] = useState(false)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [invalidateCache, setInvalidateCache] = useState(false)
    const [hostURLConfig, setHostURLConfig] = useState(undefined)
    const [showWebhookModal, setShowWebhookModal] = useState(false)
    const [webhookPayloads, setWebhookPayloads] = useState(undefined)
    const [isWebhookPayloadLoading, setIsWebhookPayloadLoading] = useState(false)
    const [webhhookTimeStampOrder, setWebhhookTimeStampOrder] = useState(TIME_STAMP_ORDER.DESCENDING)
    const [showCIModal, setShowCIModal] = useState(false)
    const [showMaterialRegexModal, setShowMaterialRegexModal] = useState(false)
    const [filteredCIPipelines, setFilteredCIPipelines] = useState([])
    const [isChangeBranchClicked, setIsChangeBranchClicked] = useState(false)
    const [loader, setLoader] = useState(false)
    const [isSaveLoading, setIsSaveLoading] = useState(false)
    const [environmentLists, setEnvironmentLists] = useState([])
    const [appReleaseTags, setAppReleaseTags] = useState([])
    const [tagsEditable, setTagsEditable] = useState(false)
    const [configs, setConfigs] = useState(false)
    const [isDefaultConfigPresent, setIsDefaultConfigPresent] = useState(false)
    const [searchImageTag, setSearchImageTag] = useState('')
    const [hideImageTaggingHardDelete, setHideImageTaggingHardDelete] = useState(false)
    const [selectedEnv, setSelectedEnv] = useState<Environment>(null)

    useEffect(() => {
        getHostURLConfig()
        getWorkflows(true)
        getEnvironments()

        return () => {
            // timerRef, inprogressStatusTimer in here is fired on component unmount.
            clearInterval(timerRef)
            inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        }
    }, [])

    useEffect(() => {
        setShowCIModal(false)
        setShowMaterialRegexModal(false)
        setView(ViewType.LOADING)
        getWorkflows()
    }, [params.appId, filteredEnvIds])

    const getEnvironments = () => {
        getEnvironmentListMinPublic()
            .then((response) => {
                let list = []
                list.push({
                    id: 0,
                    clusterName: '',
                    name: DEFAULT_ENV,
                    active: false,
                    isClusterActive: false,
                    description: 'System default',
                })
                response.result?.forEach((env) => {
                    if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                        list.push({
                            id: env.id,
                            clusterName: env.cluster_name,
                            name: env.environment_name,
                            active: false,
                            isClusterActive: env.isClusterActive,
                            description: env.description,
                        })
                    }
                })
                sortObjectArrayAlphabetically(list, 'name')
                setEnvironmentLists(list)
            })
            .catch((error) => {
                showError(error)
            })
    }

    const getConfigs = () => {
        getDefaultConfig().then((response) => {
            let isConfigPresent = response.result.isConfigured
            let _isDefaultConfig = response.result.is_default_configured
            setConfigs(isConfigPresent)
            setIsDefaultConfigPresent(_isDefaultConfig)
        })
    }

    const setAppReleaseTagNames = (appReleaseTags: string[]) => {
        setAppReleaseTags(appReleaseTags)
    }

    const onClickSetEditableTags = (tagsEditable: boolean) => {
        setTagsEditable(tagsEditable)
    }

    const getWorkflowStatusRes = () => {
        getWorkflowStatus(params.appId)
            .then((response) => {
                const _processedWorkflowsData = processWorkflowStatuses(
                    response?.result?.ciWorkflowStatus ?? [],
                    response?.result?.cdWorkflowStatus ?? [],
                    workflows,
                )
                inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
                if (_processedWorkflowsData.cicdInProgress) {
                    inprogressStatusTimer = setTimeout(() => {
                        getWorkflowStatusRes()
                    }, 10000)
                }
                setWorkflows(_processedWorkflowsData.workflows)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
            })
    }

    const onClickCDMaterial = (
        cdNodeId,
        nodeType: DeploymentNodeType,
        isApprovalNode: boolean = false,
        searchText?: string,
    ) => {
        ReactGA.event(isApprovalNode ? TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked : TRIGGER_VIEW_GA_EVENTS.ImageClicked)
        setShowCDModal(!isApprovalNode)
        setShowApprovalModal(isApprovalNode)
        setIsLoading(true)

        abortController = new AbortController()

        getCDMaterialList(
            cdNodeId,
            isApprovalNode ? DeploymentNodeType.APPROVAL : nodeType,
            abortController.signal,
            isApprovalNode,
            searchText,
        )
            .then((data) => {
                const workflow = [...workflows].map((workflow) => {
                    let cipipId = 0
                    workflow.nodes.map((node) => {
                        if (node.type == 'CI') {
                            cipipId = +node.id
                        }
                        return node
                    })
                    const nodes = workflow.nodes.map((node) => {
                        if (cdNodeId == node.id && node.type === nodeType) {
                            node.inputMaterialList = data.materials
                            node.appReleaseTagNames = data.appReleaseTagNames
                            node.tagsEditable = data.tagsEditable
                            if (node.type === 'CD') {
                                node.approvalUsers = data.approvalUsers
                                node.userApprovalConfig =
                                    data.userApprovalConfig ?? workflow.approvalConfiguredIdsMap[cdNodeId]
                                node.requestedUserId = data.requestedUserId
                            }
                        }
                        node.connectingCiPipelineId = cipipId
                        return node
                    })
                    workflow.appReleaseTags = data.appReleaseTagNames
                    workflow.nodes = nodes
                    return workflow
                })

                setWorkflows(workflow)
                setMaterialType('inputMaterialList')
                setCdNodeId(cdNodeId)
                setNodeType(nodeType)
                setShowApprovalModal(isApprovalNode)
                setShowCDModal(!isApprovalNode)
                setIsLoading(false)
                setAppReleaseTagNames(data.appReleaseTagNames)
                setTagsEditable(data.tagsEditable)
                setHideImageTaggingHardDelete(data.hideImageTaggingHardDelete)
                preventBodyScroll(true)
            })
            .catch((errors: ServerErrors) => {
                if (!abortController.signal.aborted) {
                    showError(errors)
                    setCode(errors.code)
                }
            })
    }

    const getWorkflows = (isFromOnMount?: boolean) => {
        getTriggerWorkflows(params.appId, !isJobView, isJobView, filteredEnvIds)
            .then((result) => {
                const _filteredCIPipelines = result.filteredCIPipelines || []
                const wf = result.workflows || []
                if (showCIModal) {
                    wf.forEach((w) =>
                        w.nodes.forEach((n) => {
                            if (+n.id === ciNodeId) {
                                workflows.forEach((sw) =>
                                    sw.nodes.forEach((sn) => {
                                        if (+sn.id === ciNodeId) {
                                            n.inputMaterialList = sn.inputMaterialList
                                        }
                                    }),
                                )
                            }
                        }),
                    )
                }
                setWorkflows(wf)
                setView(ViewType.FORM)
                setFilteredCIPipelines(_filteredCIPipelines),
                    () => {
                        getWorkflowStatusRes()
                        if (isFromOnMount && ApprovalMaterialModal) {
                            getConfigs()
                            if (location.search.includes('approval-node')) {
                                setShowApprovalModal
                                const searchParams = new URLSearchParams(location.search)
                                const nodeId = searchParams.get('approval-node')
                                onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
                            }
                        }
                        timerRef && clearInterval(timerRef)
                        timerRef = setInterval(() => {
                            getWorkflowStatusRes()
                        }, 30000)
                    }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setCode(errors.code)
                setView(ViewType.ERROR)
            })
    }

    const getHostURLConfig = () => {
        getHostURLConfiguration()
            .then((response) => {
                setHostURLConfig(response.result)
            })
            .catch((error) => {})
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
                setWorkflows(workflows)
            })
            .catch((error: ServerErrors) => {
                showError(error)
                _selectedMaterial.isMaterialLoading = false
                setWorkflows(workflows)
            })
    }

    const getMaterialByCommit = async (
        ciNodeId: number,
        ciPipelineMaterialId: number,
        gitMaterialId: number,
        commitHash = null,
    ) => {
        let _selectedMaterial
        const workflow = [...workflows].map((workflow) => {
            workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == ciNodeId) {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.isSelected) {
                            material.isMaterialLoading = true
                            material.searchText = commitHash
                            material.showAllCommits = false
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
                if (commitInLocalHistory.excluded) {
                    _selectedMaterial.isMaterialSelectionError = true
                    _selectedMaterial.materialSelectionErrorMsg = NO_COMMIT_SELECTED
                }

                setWorkflows(workflow)
            } else {
                setWorkflows(workflow),
                    () => {
                        getCommitHistory(ciPipelineMaterialId, commitHash, workflows, _selectedMaterial)
                    }
            }
        } else {
            setWorkflows(workflow),
                () => {
                    abortController = new AbortController()
                    getMaterialHistory(ciNodeId.toString(), abortController.signal, gitMaterialId, false).catch(
                        (errors: ServerErrors) => {
                            if (!abortController.signal.aborted) {
                                showError(errors)
                                setCode(errors.code)
                            }
                        },
                    )
                }
        }

        const getFilteredMaterial = async (ciNodeId: number, gitMaterialId: number, showExcluded: boolean) => {
            const workflow = [...workflows].map((wf) => {
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
            setWorkflows(workflow),
                () => {
                    abortController = new AbortController()
                    getMaterialHistory(ciNodeId.toString(), abortController.signal, gitMaterialId, showExcluded).catch(
                        (errors: ServerErrors) => {
                            if (!abortController.signal.aborted) {
                                showError(errors)
                                setCode(errors.code)
                            }
                        },
                    )
                }
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
                const workflow = [...workflows].map((workflow) => {
                    workflow.nodes.map((node) => {
                        if (node.type === 'CI' && node.id == ciNodeId) {
                            const selectedCIPipeline = filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
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
                    return workflow
                })

                setWorkflows(workflow)
                setShowCIModal(!showRegexModal)
                setShowMaterialRegexModal(showRegexModal),
                    () => {
                        getWorkflowStatusRes()
                        preventBodyScroll(true)
                    }
            })
        }

        //NOTE: GIT MATERIAL ID
        const refreshMaterial = (ciNodeId: number, gitMaterialId: number) => {
            let showExcluded = false
            const workflow = [...workflows].map((wf) => {
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
            setWorkflows(workflow)
            abortController = new AbortController()
            refreshGitMaterial(gitMaterialId.toString(), abortController.signal)
                .then((response) => {
                    getMaterialHistory(ciNodeId.toString(), abortController.signal, gitMaterialId, showExcluded).catch(
                        (errors: ServerErrors) => {
                            if (!abortController.signal.aborted) {
                                showError(errors)
                                setCode(errors.code)
                            }
                        },
                    )
                })
                .catch((error: ServerErrors) => {
                    if (!abortController.signal.aborted) {
                        showError(error)
                    }
                })
        }
        const updateCIMaterialList = async (
            ciNodeId: string,
            ciPipelineName: string,
            preserveMaterialSelection: boolean,
            abortSignal: AbortSignal,
        ) => {
            const param = {
                appId: params.appId,
                pipelineId: ciNodeId,
            }
            return getCIMaterialList(param, abortSignal).then((response) => {
                let workflowId
                const workflow = [...workflows].map((workflow) => {
                    workflow.nodes.map((node) => {
                        if (node.type === 'CI' && node.id == ciNodeId) {
                            const selectedCIPipeline = filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
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
                            workflowId = workflow.id
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

                let showRegexModal = false
                const selectedCIPipeline = filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
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
                setWorkflows(workflow)
                setCiNodeId(+ciNodeId)
                setCode(response.code)
                setCiPipelineName(ciPipelineName)
                setMaterialType('inputMaterialList')
                setShowCIModal(!showRegexModal)
                setShowMaterialRegexModal(showRegexModal)
                setWorkflowId(workflowId),
                    () => {
                        getWorkflowStatusRes()
                        preventBodyScroll(true)
                    }
            })
        }

        const onClickCIMaterial = (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) => {
            setLoader(true)
            setShowCIModal(true)
            setMaterialType('inputMaterialList')
            ReactGA.event(TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
            abortController = new AbortController()

            Promise.all([
                updateCIMaterialList(ciNodeId, ciPipelineName, preserveMaterialSelection, abortController.signal),
                getCIBlockState && !isJobView
                    ? getCIBlockState(ciNodeId, params.appId, getBranchValues(ciNodeId, workflows, filteredCIPipelines))
                    : { result: null },
            ])
                .then((resp) => {
                    // need to set result for getCIBlockState call only as for updateCIMaterialList
                    // it's already being set inside the same function
                    if (resp[1].result) {
                        const workflow = [...workflows].map((workflow) => {
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

                        setWorkflows(workflow)
                    }
                })
                .catch((errors: ServerErrors) => {
                    if (!abortController.signal.aborted) {
                        showError(errors)
                        setCode(errors.code)
                    }
                })
                .finally(() => {
                    setLoader(false)
                })
        }

        const onClickRollbackMaterial = (
            cdNodeId: number,
            offset?: number,
            size?: number,
            callback?: (loadingMore: boolean, noMoreImages?: boolean) => void,
        ) => {
            if (!offset && !size) {
                ReactGA.event(TRIGGER_VIEW_GA_EVENTS.RollbackClicked)
                setIsLoading(true)
            }

            const _offset = offset || 1
            const _size = size || 20
            setShowCDModal(true)
            abortController = new AbortController()
            getRollbackMaterialList(cdNodeId, _offset, _size, abortController.signal)
                .then((response) => {
                    const workflow = [...workflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (response.result && node.type === 'CD' && +node.id == cdNodeId) {
                                node.userApprovalConfig = workflow.approvalConfiguredIdsMap[cdNodeId]
                                node.requestedUserId = response.result.requestedUserId

                                if (!offset && !size) {
                                    node.rollbackMaterialList = response.result.materials
                                } else {
                                    node.rollbackMaterialList = node.rollbackMaterialList.concat(
                                        response.result.materials,
                                    )
                                }
                            }
                            return node
                        })
                        workflow.nodes = nodes
                        return workflow
                    })
                    setWorkflows(workflow)
                    setMaterialType('rollbackMaterialList')
                    setCdNodeId(cdNodeId)
                    setNodeType('CD')
                    setShowCDModal(true)
                    setIsLoading(false),
                        () => {
                            preventBodyScroll(true)
                            getWorkflowStatusRes()
                        }

                    if (callback && response.result) {
                        callback(false, response.result.length < 20)
                    }
                })
                .catch((errors: ServerErrors) => {
                    if (!abortController.signal.aborted) {
                        showError(errors)
                        setCode(errors.code)

                        if (callback) {
                            callback(false)
                        }
                    }
                })
        }

        const getHelmPackageName = (helmPackageName: string, cdWorkflowType: string) => {
            if (cdWorkflowType === WorkflowNodeType.PRE_CD) {
                return `${helmPackageName} (Pre)`
            } else if (cdWorkflowType === WorkflowNodeType.POST_CD) {
                return `${helmPackageName} (Post)`
            } else {
                return helmPackageName
            }
        }

        const onClickManifestDownload = (
            appId: number,
            envId: number,
            helmPackageName: string,
            cdWorkflowType: string,
        ) => {
            const downloadManifetsDownload = {
                appId: appId,
                envId: envId,
                appName: getHelmPackageName(helmPackageName, cdWorkflowType),
                cdWorkflowType: cdWorkflowType,
            }
            if (getDeployManifestDownload) {
                getDeployManifestDownload(downloadManifetsDownload)
            }
        }

        const onClickTriggerCDNode = (
            nodeType: DeploymentNodeType,
            _appId: number,
            deploymentWithConfig?: string,
            wfrId?: number,
        ): void => {
            ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
            setIsSaveLoading(true)
            setIsLoading(true)
            let node: NodeAttr
            for (let i = 0; i < workflows.length; i++) {
                let workflow = workflows[i]
                node = workflow.nodes.find((nd) => +nd.id == cdNodeId && nd.type == nodeType)
                if (node) break
            }

            const pipelineId = node.id
            const ciArtifact = node[materialType].find((artifact) => artifact.isSelected == true)
            if (_appId && pipelineId && ciArtifact.id) {
                triggerCDNode(pipelineId, ciArtifact.id, _appId.toString(), nodeType, deploymentWithConfig, wfrId)
                    .then((response: any) => {
                        if (response.result) {
                            node.isVirtualEnvironment &&
                                node.deploymentAppType == DeploymentAppTypes.MANIFEST_DOWNLOAD &&
                                onClickManifestDownload(
                                    _appId,
                                    node.environmentId,
                                    response.result.helmPackageName,
                                    nodeType,
                                )
                            const msg =
                                materialType == MATERIAL_TYPE.rollbackMaterialList
                                    ? 'Rollback Initiated'
                                    : 'Deployment Initiated'
                            toast.success(msg)
                            setCode(response.code)
                            setShowCDModal(false)
                            setIsLoading(false)
                            setIsSaveLoading(false)
                            setSearchImageTag(''),
                                () => {
                                    preventBodyScroll(false)
                                    getWorkflowStatusRes()
                                }
                        }
                    })
                    .catch((errors: ServerErrors) => {
                        node.isVirtualEnvironment && node.deploymentAppType == DeploymentAppTypes.MANIFEST_PUSH
                            ? handleTriggerErrorMessageForHelmManifestPush(errors, node.id, node.environmentId)
                            : showError(errors)
                        setCode(errors.code)
                        setIsLoading(false)
                        setIsSaveLoading(false)
                    })
            } else {
                let message = _appId ? '' : 'app id missing '
                message += pipelineId ? '' : 'pipeline id missing '
                message += ciArtifact.id ? '' : 'Artifact id missing '
                toast.error(message)
            }
        }

        const handleTriggerErrorMessageForHelmManifestPush = (
            serverError: any,
            cdPipelineId: string,
            environmentId: number,
        ) => {
            if (
                serverError instanceof ServerErrors &&
                Array.isArray(serverError.errors) &&
                serverError.code !== 403 &&
                serverError.code !== 408
            ) {
                serverError.errors.map(({ userMessage, internalMessage }) => {
                    const toastBody = (
                        <ToastBodyWithButton
                            onClick={() => redirectToDeploymentStepsPage(cdPipelineId, environmentId)}
                            title=""
                            subtitle={userMessage || internalMessage}
                            buttonText={TOAST_BUTTON_TEXT_VIEW_DETAILS}
                        />
                    )
                    toast.error(toastBody, { autoClose: false })
                })
            } else {
                showError(serverError)
            }
        }

        const redirectToDeploymentStepsPage = (cdPipelineId: string, environmentId: number) => {
            const { appId } = params
            // const { history } = this.props
            history.push(`/app/${appId}/cd-details/${environmentId}/${cdPipelineId}`)
        }

        const onClickTriggerCINode = () => {
            ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CITriggered)
            setIsLoading(true)
            let node, dockerfileConfiguredGitMaterialId
            for (let i = 0; i < workflows.length; i++) {
                node = workflows[i].nodes.find((node) => {
                    return node.type === 'CI' && +node.id == ciNodeId
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
                setIsLoading(false)
                return
            }
            let envId
            if (selectedEnv && selectedEnv.id !== 0) {
                envId = selectedEnv.id
            }

            const payload = {
                pipelineId: +ciNodeId,
                ciPipelineMaterials: ciPipelineMaterials,
                invalidateCache: invalidateCache,
                environmentId: envId,
                pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
            }

            triggerCINode(payload)
                .then((response: any) => {
                    if (response.result) {
                        toast.success('Pipeline Triggered')
                        setCode(response.code),
                            setShowCIModal(false),
                            setIsLoading(false),
                            setInvalidateCache(false),
                            () => {
                                preventBodyScroll(false)
                                getWorkflowStatusRes()
                                if (isJobView) {
                                    getWorkflows()
                                }
                            }
                    }
                })
                .catch((errors: ServerErrors) => {
                    if (errors.code === 403) {
                        toast.info(
                            <ToastBody
                                title="Access denied"
                                subtitle="You don't have access to perform this action."
                            />,
                            {
                                className: 'devtron-toast unauthorized',
                            },
                        )
                    } else {
                        errors.errors.map((error) => {
                            if (error.userMessage === NO_TASKS_CONFIGURED_ERROR) {
                                const errorToastBody = (
                                    <ToastBodyWithButton
                                        onClick={redirectToCIPipeline}
                                        subtitle={error.userMessage}
                                        title="Nothing to execute"
                                        buttonText="EDIT PIPELINE"
                                    />
                                )
                                toast.error(errorToastBody)
                            } else {
                                toast.error(error)
                            }
                        })
                    }
                    setCode(errors.code)
                    setIsLoading(false)
                })
        }
        const redirectToCIPipeline = () => {
            history.push(`/job/${params.appId}/edit/workflow/${workflowId}/ci-pipeline/${ciNodeId}/build`)
        }

        const selectCommit = (materialId: string, hash: string): void => {
            const workflow = [...workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (node.type === 'CI' && +node.id == ciNodeId) {
                        node.inputMaterialList.map((material) => {
                            if (material.id == materialId && material.isSelected) {
                                material.history.map((hist) => {
                                    if (!hist.excluded) {
                                        if (material.type == SourceTypeMap.WEBHOOK) {
                                            if (
                                                hist?.webhookData &&
                                                hist.webhookData?.id &&
                                                hash == hist.webhookData.id
                                            ) {
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
            setWorkflows(workflow)
        }

        const selectMaterial = (materialId): void => {
            const workflow = [...workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (node.type === 'CI' && +node.id == ciNodeId) {
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
            setWorkflows(workflow)
        }

        const selectImage = (index: number, materialType: string): void => {
            const workflow = [...workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (cdNodeId == +node.id && node.type === nodeType) {
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
            setWorkflows(workflow)
        }

        const toggleChanges = (materialId: string, hash: string): void => {
            const workflow = [...workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (node.type === 'CI' && +node.id == ciNodeId) {
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
            setWorkflows(workflow)
        }

        const toggleSourceInfo = (materialIndex: number): void => {
            const workflow = [...workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (+node.id == cdNodeId && node.type === nodeType) {
                        node[materialType][materialIndex].showSourceInfo =
                            !node[materialType][materialIndex].showSourceInfo
                    }
                    return node
                })
                workflow.nodes = nodes
                return workflow
            })
            setWorkflows(workflow)
        }

        const toggleInvalidateCache = () => {
            setInvalidateCache(!invalidateCache)
        }

        //TODO: refactor
        const changeTab = (materialIndex, artifactId: number, tab): void => {
            if (tab === CDModalTab.Changes) {
                const workflow = [...workflows].map((workflow) => {
                    const nodes = workflow.nodes.map((node) => {
                        if (+node.id == cdNodeId && node.type === nodeType) {
                            node[materialType][materialIndex].tab = tab
                        }
                        return node
                    })
                    workflow.nodes = nodes
                    return workflow
                })
                setWorkflows(workflow)
                return
            }

            let targetNode
            for (let i = 0; i < workflows.length; i++) {
                targetNode = workflows[i].nodes.find((node) => +node.id == cdNodeId && node.type === nodeType)``
                if (targetNode) break
            }

            if (targetNode || targetNode.scanned || targetNode.scanEnabled) {
                getLastExecutionByArtifactAppEnv(artifactId, params.appId, targetNode.environmentId)
                    .then((response) => {
                        const workflow = [...workflows].map((workflow) => {
                            const nodes = workflow.nodes.map((node) => {
                                if (+node.id == cdNodeId && node.type === nodeType) {
                                    node[materialType][materialIndex].tab = tab
                                    node[materialType][materialIndex]['vulnerabilities'] =
                                        response.result.vulnerabilities
                                    node[materialType][materialIndex]['lastExecution'] = response.result.lastExecution
                                    node[materialType][materialIndex]['vulnerabilitiesLoading'] = false
                                    node[materialType][materialIndex]['scanToolId'] = response.result.scanToolId
                                }
                                return node
                            })
                            workflow.nodes = nodes
                            return workflow
                        })
                        setWorkflows(workflow)
                    })
                    .catch((error) => {
                        showError(error)
                        const workflow = [...workflows].map((workflow) => {
                            const nodes = workflow.nodes.map((node) => {
                                if (+node.id == cdNodeId && node.type === nodeType) {
                                    node[materialType][materialIndex].tab = tab
                                    node[materialType][materialIndex]['vulnerabilitiesLoading'] = false
                                }
                                return node
                            })
                            workflow.nodes = nodes
                            return workflow
                        })
                        setWorkflows(workflow)
                    })
            }
        }

        const closeCIModal = (): void => {
            preventBodyScroll(false)
            abortController.abort()
            setShowCIModal(false)
            setShowMaterialRegexModal(false)
        }

        const closeCDModal = (e): void => {
            preventBodyScroll(false)
            abortController.abort()
            setShowCDModal(false)
            setSearchImageTag('')
        }

        const closeApprovalModal = (e): void => {
            preventBodyScroll(false)
            setShowApprovalModal(false)
            history.push({
                search: '',
            })
        }

        const hideWebhookModal = () => {
            setShowWebhookModal(false)
        }

        const onShowCIModal = () => {
            setShowCIModal(true)
        }

        const onClickWebhookTimeStamp = () => {
            if (webhhookTimeStampOrder === TIME_STAMP_ORDER.DESCENDING) {
                setWebhhookTimeStampOrder(TIME_STAMP_ORDER.ASCENDING)
            } else if (webhhookTimeStampOrder === TIME_STAMP_ORDER.ASCENDING) {
                setWebhhookTimeStampOrder(TIME_STAMP_ORDER.DESCENDING)
            }
        }

        const toggleWebhookModal = (id, webhhookTimeStampOrder) => {
            setIsWebhookPayloadLoading(true)
            getCIWebhookRes(id, webhhookTimeStampOrder).then((result) => {
                setShowWebhookModal(true)
                setWebhookPayloads(result?.result)
                setIsWebhookPayloadLoading(false)
            })
        }

        const onCloseBranchRegexModal = () => {
            setShowMaterialRegexModal(false)
        }

        const onClickShowBranchRegexModal = (isChangedBranch = false) => {
            // this.setState({ showCIModal: false }, () =>
            //     this.setState({ showMaterialRegexModal: true, isChangeBranchClicked: isChangedBranch }),
            // )
            setShowCIModal(false),
                () => {
                    setShowMaterialRegexModal(true)
                    setIsChangeBranchClicked(isChangedBranch)
                }
        }

        const onClickSetLoader = (isLoader) => {
            setLoader(isLoader)
        }

        const onClickSetSelectedEnv = (_selectedEnv: Environment) => {
            setSelectedEnv(_selectedEnv)
        }

        const getCINode = (): NodeAttr => {
            let nd: NodeAttr
            if (ciNodeId) {
                const configuredMaterialList = new Map<number, Set<number>>()
                for (let i = 0; i < workflows.length; i++) {
                    nd = workflows[i].nodes.find((node) => +node.id == ciNodeId && node.type === 'CI')
                    if (nd) {
                        const gitMaterials = new Map<number, string[]>()
                        for (const _inputMaterial of nd.inputMaterialList) {
                            gitMaterials[_inputMaterial.gitMaterialId] = [
                                _inputMaterial.gitMaterialName.toLowerCase(),
                                _inputMaterial.value,
                            ]
                        }
                        configuredMaterialList[workflows[i].name] = new Set<number>()
                        handleSourceNotConfigured(
                            configuredMaterialList,
                            workflows[i],
                            nd[materialType],
                            !gitMaterials[workflows[i].ciConfiguredGitMaterialId],
                        )
                        break
                    }
                }
            }
            return nd
        }

        const renderCIMaterial = () => {
            if (showCIModal || showMaterialRegexModal) {
                const nd: NodeAttr = getCINode()
                const material = nd?.[materialType] || []
                return (
                    <VisibleModal className="" close={closeCIModal}>
                        <div className="modal-body--ci-material h-100" onClick={stopPropagation}>
                            {loader ? (
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
                                    workflowId={workflowId}
                                    history={history}
                                    location={location}
                                    match={match}
                                    material={material}
                                    pipelineName={ciPipelineName}
                                    isLoading={isLoading}
                                    title={ciPipelineName}
                                    pipelineId={ciNodeId}
                                    showWebhookModal={showWebhookModal}
                                    hideWebhookModal={hideWebhookModal}
                                    toggleWebhookModal={toggleWebhookModal}
                                    webhookPayloads={webhookPayloads}
                                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                                    onClickWebhookTimeStamp={onClickWebhookTimeStamp}
                                    webhhookTimeStampOrder={webhhookTimeStampOrder}
                                    showMaterialRegexModal={showMaterialRegexModal}
                                    onCloseBranchRegexModal={onCloseBranchRegexModal}
                                    filteredCIPipelines={filteredCIPipelines}
                                    onClickShowBranchRegexModal={onClickShowBranchRegexModal}
                                    showCIModal={showCIModal}
                                    onShowCIModal={onShowCIModal}
                                    isChangeBranchClicked={isChangeBranchClicked}
                                    getWorkflows={getWorkflows}
                                    loader={loader}
                                    setLoader={onClickSetLoader}
                                    isFirstTrigger={nd?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED}
                                    isCacheAvailable={nd?.storageConfigured}
                                    appId={params.appId}
                                    isJobView={isJobView}
                                    isCITriggerBlocked={nd?.isCITriggerBlocked}
                                    ciBlockState={nd?.ciBlockState}
                                    selectedEnv={selectedEnv}
                                    setSelectedEnv={onClickSetSelectedEnv}
                                    environmentLists={environmentLists}
                                />
                            )}
                        </div>
                    </VisibleModal>
                )
            }

            return null
        }

        const getCDNode = (): NodeAttr => {
            let node: NodeAttr
            if (cdNodeId) {
                for (const _workflow of workflows) {
                    node = _workflow.nodes.find((el) => {
                        return +el.id == cdNodeId && el.type == nodeType
                    })
                    if (node) break
                }
            }

            return node ?? ({} as NodeAttr)
        }

        const handleMaterialFilters = (
            searchText: string,
            cdNodeId,
            nodeType: DeploymentNodeType,
            isApprovalNode: boolean = false,
        ) => {
            onClickCDMaterial(cdNodeId, nodeType, isApprovalNode, searchText)
            setSearchImageTag(searchText)
        }

        const renderCDMaterial = () => {
            if (showCDModal) {
                const node: NodeAttr = getCDNode()
                const material = node[materialType] || []

                return (
                    <VisibleModal className="" parentClassName="dc__overflow-hidden" close={closeCDModal}>
                        <div
                            className={`modal-body--cd-material h-100 contains-diff-view ${
                                material.length > 0 ? '' : 'no-material'
                            }`}
                            onClick={stopPropagation}
                        >
                            {isLoading ? (
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
                                    appId={Number(params.appId)}
                                    pipelineId={cdNodeId}
                                    stageType={DeploymentNodeType[nodeType]}
                                    triggerType={node.triggerType}
                                    material={material}
                                    materialType={materialType}
                                    envName={node?.environmentName}
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
                                    userApprovalConfig={node.userApprovalConfig}
                                    requestedUserId={node.requestedUserId}
                                    isVirtualEnvironment={node.isVirtualEnvironment}
                                    isSaveLoading={isSaveLoading}
                                    ciPipelineId={node.connectingCiPipelineId}
                                    appReleaseTagNames={appReleaseTags}
                                    setAppReleaseTagNames={setAppReleaseTagNames}
                                    tagsEditable={tagsEditable}
                                    setTagsEditable={onClickSetEditableTags}
                                    hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                                    history={history}
                                    location={location}
                                    match={match}
                                    isApplicationGroupTrigger={false}
                                    handleMaterialFilters={handleMaterialFilters}
                                    searchImageTag={searchImageTag}
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
                const node: NodeAttr = getCDNode()
                return (
                    <ApprovalMaterialModal
                        appId={Number(params.appId)}
                        pipelineId={cdNodeId}
                        stageType={DeploymentNodeType[nodeType]}
                        node={node}
                        materialType={materialType}
                        isLoading={isLoading}
                        changeTab={changeTab}
                        closeApprovalModal={closeApprovalModal}
                        toggleSourceInfo={toggleSourceInfo}
                        onClickCDMaterial={onClickCDMaterial}
                        getModuleInfo={getModuleInfo}
                        GitCommitInfoGeneric={GitCommitInfoGeneric}
                        ciPipelineId={node.connectingCiPipelineId}
                        appReleaseTagNames={appReleaseTags}
                        setAppReleaseTagNames={setAppReleaseTagNames}
                        tagsEditable={tagsEditable}
                        setTagsEditable={onClickSetEditableTags}
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                        configs={configs}
                        isDefaultConfigPresent={isDefaultConfigPresent}
                    />
                )
            }

            return null
        }

        const renderWorkflow = () => {
            return (
                <React.Fragment>
                    {workflows.map((workflow, index) => {
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
                                history={history}
                                location={location}
                                match={match}
                                isJobView={isJobView}
                                index={index}
                                filteredCIPipelines={filteredCIPipelines}
                                environmentLists={environmentLists}
                            />
                        )
                    })}
                </React.Fragment>
            )
        }

        const renderHostErrorMessage = () => {
            if (!hostURLConfig || hostURLConfig.value !== window.location.origin) {
                return (
                    <div className="br-4 bw-1 er-2 pt-10 pb-10 pl-16 pr-16 bcr-1 mb-16 flex left">
                        <Error className="icon-dim-20 mr-8" />
                        <div className="cn-9 fs-13">
                            {HOST_ERROR_MESSAGE.NotConfigured}
                            &nbsp;
                            <NavLink className="dc__link-bold" to={URLS.GLOBAL_CONFIG_HOST_URL}>
                                {HOST_ERROR_MESSAGE.Review}
                            </NavLink>
                        </div>
                    </div>
                )
            }

            return null
        }

        const jobNotConfiguredSubtitle = () => {
            return (
                <>
                    {APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.subTitle}&nbsp;
                    <a href={DOCUMENTATION.APP_CREATE} target="_blank">
                        {APP_DETAILS.NEED_HELP}
                    </a>
                </>
            )
        }
        if (view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (view === ViewType.ERROR) {
            return <ErrorScreenManager code={code} />
        } else if (!workflows.length) {
            return (
                <div>
                    {isJobView ? (
                        <AppNotConfigured
                            title={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.title}
                            subtitle={jobNotConfiguredSubtitle()}
                            buttonTitle={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.buttonTitle}
                            isJobView={isJobView}
                        />
                    ) : (
                        <AppNotConfigured />
                    )}
                </div>
            )
        }
        return (
            <div className="svg-wrapper-trigger">
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
                    {renderHostErrorMessage()}
                    {renderWorkflow()}
                    {renderCIMaterial()}
                    {renderCDMaterial()}
                    {renderApprovalMaterial()}
                </TriggerViewContext.Provider>
            </div>
        )
    }
}

export default TriggerView
