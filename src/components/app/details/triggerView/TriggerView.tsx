import React, { Component } from 'react'
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
import { MATERIAL_TYPE, NodeAttr, TriggerViewProps, TriggerViewState, WorkflowNodeType, WorkflowType } from './types'
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
import { withRouter, NavLink } from 'react-router-dom'
import { getEnvironmentListMinPublic, getLastExecutionByArtifactAppEnv, getHostURLConfiguration } from '../../../../services/service'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
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

class TriggerView extends Component<TriggerViewProps, TriggerViewState> {
    timerRef
    inprogressStatusTimer
    abortController: AbortController

    constructor(props: TriggerViewProps) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            workflows: [],
            cdNodeId: 0,
            ciNodeId: 0,
            workflowId: 0,
            nodeType: null,
            ciPipelineName: '',
            materialType: '',
            showCDModal: false,
            showApprovalModal: false,
            isLoading: false,
            invalidateCache: false,
            hostURLConfig: undefined,
            showWebhookModal: false,
            webhookPayloads: undefined,
            isWebhookPayloadLoading: false,
            webhhookTimeStampOrder: TIME_STAMP_ORDER.DESCENDING,
            showCIModal: false,
            showMaterialRegexModal: false,
            filteredCIPipelines: [],
            isChangeBranchClicked: false,
            loader: false,
            isSaveLoading: false,
            environmentLists: [],
            appReleaseTags: [],
            tagsEditable: false,
            configs: false,
            isDefaultConfigPresent: false,
            searchImageTag: '',
            resourceFilters: []
        }
        this.refreshMaterial = this.refreshMaterial.bind(this)
        this.onClickCIMaterial = this.onClickCIMaterial.bind(this)
        this.onClickCDMaterial = this.onClickCDMaterial.bind(this)
        this.changeTab = this.changeTab.bind(this)
        this.toggleInvalidateCache = this.toggleInvalidateCache.bind(this)
        this.getMaterialByCommit = this.getMaterialByCommit.bind(this)
        this.getFilteredMaterial = this.getFilteredMaterial.bind(this)
        this.getConfigs = this.getConfigs.bind(this)
    }

    componentWillUnmount() {
        clearInterval(this.timerRef)
        this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
    }

    componentDidMount() {
        this.getHostURLConfig()
        this.getWorkflows(true)
        this.getEnvironments()
    }

    getEnvironments = () => {
        getEnvironmentListMinPublic()
            .then((response) => {
                const list = []
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
                this.setState({ environmentLists: list })
            })
            .catch((error) => {
                showError(error)
            })
    }

    // FIXME: Seems like its missing a error state
    getConfigs() {
        getDefaultConfig().then((response) => {
            let isConfigPresent = response.result.isConfigured
            let _isDefaultConfig = response.result.is_default_configured
            this.setState({ configs: isConfigPresent, isDefaultConfigPresent: _isDefaultConfig })
        })
    }

    setAppReleaseTags = (appReleaseTags: string[]) => {
        this.setState({ appReleaseTags: appReleaseTags })
    }

    setTagsEditable = (tagsEditable: boolean) => {
        this.setState({ tagsEditable: tagsEditable })
    }

    getWorkflows = (isFromOnMount?: boolean) => {
        getTriggerWorkflows(this.props.match.params.appId, !this.props.isJobView, this.props.isJobView, this.props.filteredEnvIds)
            .then((result) => {
                const _filteredCIPipelines = result.filteredCIPipelines || []
                const wf = result.workflows || []
                if (this.state.showCIModal) {
                    wf.forEach((w) =>
                        w.nodes.forEach((n) => {
                            if (+n.id === this.state.ciNodeId) {
                                this.state.workflows.forEach((sw) =>
                                    sw.nodes.forEach((sn) => {
                                        if (+sn.id === this.state.ciNodeId) {
                                            n.inputMaterialList = sn.inputMaterialList
                                        }
                                    }),
                                )
                            }
                        }),
                    )
                }
                this.setState({ workflows: wf, view: ViewType.FORM, filteredCIPipelines: _filteredCIPipelines }, () => {
                    this.getWorkflowStatus()
                    if (isFromOnMount && ApprovalMaterialModal) {
                        this.getConfigs()
                        if (this.props.location.search.includes('approval-node')) {
                            this.setState({
                                showApprovalModal: true,
                            })
                            const searchParams = new URLSearchParams(this.props.location.search)
                            const nodeId = searchParams.get('approval-node')
                            this.onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
                        }
                    }
                    this.timerRef && clearInterval(this.timerRef)
                    this.timerRef = setInterval(() => {
                        this.getWorkflowStatus()
                    }, 30000)
                })
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ code: errors.code, view: ViewType.ERROR })
            })
    }

    getHostURLConfig() {
        getHostURLConfiguration()
            .then((response) => {
                this.setState({ hostURLConfig: response.result })
            })
            .catch((error) => {})
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.match.params.appId !== prevProps.match.params.appId ||
            prevProps.filteredEnvIds !== this.props.filteredEnvIds
        ) {
            this.setState({
                showCIModal: false,
                showMaterialRegexModal: false,
                view: ViewType.LOADING,
            })
            this.getWorkflows()
        }
    }

    getCommitHistory(
        ciPipelineMaterialId: number,
        commitHash: string,
        workflows: WorkflowType[],
        _selectedMaterial: CIMaterialType,
    ) {
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
                this.setState({
                    workflows: workflows,
                })
            })
            .catch((error: ServerErrors) => {
                showError(error)
                _selectedMaterial.isMaterialLoading = false
                this.setState({
                    workflows: workflows,
                })
            })
    }

    async getMaterialByCommit(
        ciNodeId: number,
        ciPipelineMaterialId: number,
        gitMaterialId: number,
        commitHash = null,
    ) {
        let _selectedMaterial
        const workflows = [...this.state.workflows].map((workflow) => {
            workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        if (material.isSelected && material.searchText !== commitHash) {
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
                this.setState({
                    workflows: workflows,
                })
            } else {
                this.setState(
                    {
                        workflows: workflows,
                    },
                    () => {
                        this.getCommitHistory(ciPipelineMaterialId, commitHash, workflows, _selectedMaterial)
                    },
                )
            }
        } else {
            this.setState(
                {
                    workflows: workflows,
                },
                () => {
                    this.abortController = new AbortController()
                    this.getMaterialHistory(
                        ciNodeId.toString(),
                        this.abortController.signal,
                        gitMaterialId,
                        false,
                    ).catch((errors: ServerErrors) => {
                        if (!this.abortController.signal.aborted) {
                            showError(errors)
                            this.setState({ code: errors.code })
                        }
                    })
                },
            )
        }
    }

    async getFilteredMaterial(ciNodeId: number, gitMaterialId: number, showExcluded: boolean) {
        const workflows = [...this.state.workflows].map((wf) => {
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
        this.setState(
            {
                workflows: workflows,
            },
            () => {
                this.abortController = new AbortController()
                this.getMaterialHistory(
                    ciNodeId.toString(),
                    this.abortController.signal,
                    gitMaterialId,
                    showExcluded,
                ).catch((errors: ServerErrors) => {
                    if (!this.abortController.signal.aborted) {
                        showError(errors)
                        this.setState({ code: errors.code })
                    }
                })
            },
        )
    }

    getMaterialHistory(ciNodeId: string, abortSignal: AbortSignal, gitMaterialId?: number, showExcluded?: boolean) {
        const params = {
            pipelineId: ciNodeId,
            materialId: gitMaterialId,
            showExcluded: showExcluded,
        }
        return getCIMaterialList(params, abortSignal).then((response) => {
            let showRegexModal = false
            const workflows = [...this.state.workflows].map((workflow) => {
                workflow.nodes.map((node) => {
                    if (node.type === 'CI' && node.id == ciNodeId) {
                        const selectedCIPipeline = this.state.filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
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
            this.setState(
                {
                    workflows: workflows,
                    showCIModal: !showRegexModal,
                    showMaterialRegexModal: showRegexModal,
                },
                () => {
                    this.getWorkflowStatus()
                    preventBodyScroll(true)
                },
            )
        })
    }

    //NOTE: GIT MATERIAL ID
    refreshMaterial(ciNodeId: number, gitMaterialId: number) {
        let showExcluded = false
        const workflows = [...this.state.workflows].map((wf) => {
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
        this.setState({ workflows })
        this.abortController = new AbortController()
        refreshGitMaterial(gitMaterialId.toString(), this.abortController.signal)
            .then((response) => {
                this.getMaterialHistory(
                    ciNodeId.toString(),
                    this.abortController.signal,
                    gitMaterialId,
                    showExcluded,
                ).catch((errors: ServerErrors) => {
                    if (!this.abortController.signal.aborted) {
                        showError(errors)
                        this.setState({ code: errors.code })
                    }
                })
            })
            .catch((error: ServerErrors) => {
                if (!this.abortController.signal.aborted) {
                    showError(error)
                }
            })
    }

    getWorkflowStatus() {
        getWorkflowStatus(this.props.match.params.appId)
            .then((response) => {
                const _processedWorkflowsData = processWorkflowStatuses(
                    response?.result?.ciWorkflowStatus ?? [],
                    response?.result?.cdWorkflowStatus ?? [],
                    this.state.workflows,
                )
                this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
                if (_processedWorkflowsData.cicdInProgress) {
                    this.inprogressStatusTimer = setTimeout(() => {
                        this.getWorkflowStatus()
                    }, 10000)
                }
                this.setState({ workflows: _processedWorkflowsData.workflows })
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
            })
    }

    async updateCIMaterialList(
        ciNodeId: string,
        ciPipelineName: string,
        preserveMaterialSelection: boolean,
        abortSignal: AbortSignal,
    ) {
        const params = {
            appId: this.props.match.params.appId,
            pipelineId: ciNodeId,
        }
        return getCIMaterialList(params, abortSignal).then((response) => {
            let workflowId
            const workflows = [...this.state.workflows].map((workflow) => {
                workflow.nodes.map((node) => {
                    if (node.type === 'CI' && node.id == ciNodeId) {
                        const selectedCIPipeline = this.state.filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
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
            const selectedCIPipeline = this.state.filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
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

            this.setState(
                {
                    workflows: workflows,
                    ciNodeId: +ciNodeId,
                    code: response.code,
                    ciPipelineName: ciPipelineName,
                    materialType: 'inputMaterialList',
                    showCIModal: !showRegexModal,
                    showMaterialRegexModal: showRegexModal,
                    workflowId: workflowId,
                },
                () => {
                    this.getWorkflowStatus()
                    preventBodyScroll(true)
                },
            )
        })
    }

    onClickCIMaterial(ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) {
        this.setState({ loader: true, showCIModal: true, materialType: 'inputMaterialList' })
        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
        this.abortController = new AbortController()

        Promise.all([
            this.updateCIMaterialList(ciNodeId, ciPipelineName, preserveMaterialSelection, this.abortController.signal),
            getCIBlockState && !this.props.isJobView
                ? getCIBlockState(
                      ciNodeId,
                      this.props.match.params.appId,
                      getBranchValues(ciNodeId, this.state.workflows, this.state.filteredCIPipelines),
                  )
                : { result: null },
        ])
            .then((resp) => {
                // need to set result for getCIBlockState call only as for updateCIMaterialList
                // it's already being set inside the same function
                if (resp[1].result) {
                    const workflows = [...this.state.workflows].map((workflow) => {
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

                    this.setState({
                        workflows,
                    })
                }
            })
            .catch((errors: ServerErrors) => {
                if (!this.abortController.signal.aborted) {
                    showError(errors)
                    this.setState({ code: errors.code })
                }
            })
            .finally(() => {
                this.setState({ loader: false })
            })
    }

    onClickCDMaterial(cdNodeId, nodeType: DeploymentNodeType, isApprovalNode: boolean = false, searchText?: string) {
        ReactGA.event(isApprovalNode ? TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked : TRIGGER_VIEW_GA_EVENTS.ImageClicked)
        this.setState({ showCDModal: !isApprovalNode, showApprovalModal: isApprovalNode, isLoading: true })
        this.abortController = new AbortController()

        getCDMaterialList(
            cdNodeId,
            isApprovalNode ? DeploymentNodeType.APPROVAL : nodeType,
            this.abortController.signal,
            isApprovalNode,
            searchText,
        )
            .then((data) => {
                const workflows = [...this.state.workflows].map((workflow) => {
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
                this.setState({
                    workflows,
                    materialType: 'inputMaterialList',
                    cdNodeId: cdNodeId,
                    nodeType,
                    showApprovalModal: isApprovalNode,
                    showCDModal: !isApprovalNode,
                    isLoading: false,
                    appReleaseTags: data.appReleaseTagNames,
                    tagsEditable: data.tagsEditable,
                    hideImageTaggingHardDelete: data.hideImageTaggingHardDelete,
                    resourceFilters: data.resourceFilters,
                })
                preventBodyScroll(true)
            })
            .catch((errors: ServerErrors) => {
                if (!this.abortController.signal.aborted) {
                    showError(errors)
                    this.setState({ code: errors.code })
                }
            })
    }

    onClickRollbackMaterial = (
        cdNodeId: number,
        offset?: number,
        size?: number,
        callback?: (loadingMore: boolean, noMoreImages?: boolean) => void,
        searchText?: string,
    ) => {
        if (!offset && !size) {
            ReactGA.event(TRIGGER_VIEW_GA_EVENTS.RollbackClicked)
            this.setState({ isLoading: true })
        }
        const _offset = offset || 1
        const _size = size || 20
        this.setState({ showCDModal: true })
        this.abortController = new AbortController()
        getRollbackMaterialList(cdNodeId, _offset, _size, this.abortController.signal, searchText)
            .then((response) => {
                const workflows = [...this.state.workflows].map((workflow) => {
                    const nodes = workflow.nodes.map((node) => {
                        if (response.result && node.type === 'CD' && +node.id == cdNodeId) {
                            node.userApprovalConfig = workflow.approvalConfiguredIdsMap[cdNodeId]
                            node.requestedUserId = response.result.requestedUserId

                            if (!offset && !size) {
                                node.rollbackMaterialList = response.result.materials
                            } else {
                                node.rollbackMaterialList = node.rollbackMaterialList.concat(response.result.materials)
                            }
                        }
                        return node
                    })
                    workflow.nodes = nodes
                    return workflow
                })
                this.setState(
                    {
                        workflows: workflows,
                        // FIXME: Pending enum
                        materialType: 'rollbackMaterialList',
                        cdNodeId: cdNodeId,
                        nodeType: 'CD',
                        showCDModal: true,
                        isLoading: false,
                        resourceFilters: response.result.resourceFilters,
                    },
                    () => {
                        preventBodyScroll(true)
                        this.getWorkflowStatus()
                    },
                )

                if (callback && response.result) {
                    callback(false, response.result.materials?.length < 20 || response.result.materials?.length ===0)
                }
            })
            .catch((errors: ServerErrors) => {
                if (!this.abortController.signal.aborted) {
                    showError(errors)
                    this.setState({ code: errors.code })

                    if (callback) {
                        callback(false)
                    }
                }
            })
    }

    getHelmPackageName = (helmPackageName: string, cdWorkflowType: string) => {
        if (cdWorkflowType === WorkflowNodeType.PRE_CD) {
            return `${helmPackageName} (Pre)`
        } else if (cdWorkflowType === WorkflowNodeType.POST_CD) {
            return `${helmPackageName} (Post)`
        } else {
            return helmPackageName
        }
    }

    onClickManifestDownload = (appId: number, envId: number, helmPackageName: string, cdWorkflowType: string) => {
        const downloadManifetsDownload = {
            appId: appId,
            envId: envId,
            appName: this.getHelmPackageName(helmPackageName, cdWorkflowType),
            cdWorkflowType: cdWorkflowType,
        }
        if (getDeployManifestDownload) {
            getDeployManifestDownload(downloadManifetsDownload)
        }
    }

    onClickTriggerCDNode = (
        nodeType: DeploymentNodeType,
        _appId: number,
        deploymentWithConfig?: string,
        wfrId?: number,
    ): void => {
        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
        this.setState({ isSaveLoading: true, isLoading: true })
        let node: NodeAttr
        for (let i = 0; i < this.state.workflows.length; i++) {
            const workflow = this.state.workflows[i]
            node = workflow.nodes.find((nd) => +nd.id == this.state.cdNodeId && nd.type == nodeType)
            if (node) break
        }

        const pipelineId = node.id
        const ciArtifact = node[this.state.materialType].find((artifact) => artifact.isSelected == true)
        if (_appId && pipelineId && ciArtifact.id) {
            triggerCDNode(pipelineId, ciArtifact.id, _appId.toString(), nodeType, deploymentWithConfig, wfrId)
                .then((response: any) => {
                    if (response.result) {
                        node.isVirtualEnvironment &&
                            node.deploymentAppType == DeploymentAppTypes.MANIFEST_DOWNLOAD &&
                            this.onClickManifestDownload(
                                _appId,
                                node.environmentId,
                                response.result.helmPackageName,
                                nodeType,
                            )
                        const msg =
                            this.state.materialType == MATERIAL_TYPE.rollbackMaterialList
                                ? 'Rollback Initiated'
                                : 'Deployment Initiated'
                        toast.success(msg)
                        this.setState(
                            {
                                code: response.code,
                                showCDModal: false,
                                isSaveLoading: false,
                                isLoading: false,
                                searchImageTag: '',
                            },
                            () => {
                                preventBodyScroll(false)
                                this.getWorkflowStatus()
                            },
                        )
                    }
                })
                .catch((errors: ServerErrors) => {
                    node.isVirtualEnvironment && node.deploymentAppType == DeploymentAppTypes.MANIFEST_PUSH
                        ? this.handleTriggerErrorMessageForHelmManifestPush(errors, node.id, node.environmentId)
                        : showError(errors)
                    this.setState({ code: errors.code, isLoading: false, isSaveLoading: false })
                })
        } else {
            let message = _appId ? '' : 'app id missing '
            message += pipelineId ? '' : 'pipeline id missing '
            message += ciArtifact.id ? '' : 'Artifact id missing '
            toast.error(message)
        }
    }

    handleTriggerErrorMessageForHelmManifestPush = (serverError: any, cdPipelineId: string, environmentId: number) => {
        if (
            serverError instanceof ServerErrors &&
            Array.isArray(serverError.errors) &&
            serverError.code !== 403 &&
            serverError.code !== 408
        ) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                const toastBody = (
                    <ToastBodyWithButton
                        onClick={() => this.redirectToDeploymentStepsPage(cdPipelineId, environmentId)}
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

    redirectToDeploymentStepsPage = (cdPipelineId: string, environmentId: number) => {
        const { appId } = this.props.match.params
        const { history } = this.props
        history.push(`/app/${appId}/cd-details/${environmentId}/${cdPipelineId}`)
    }

    onClickTriggerCINode = () => {
        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CITriggered)
        this.setState({ isLoading: true })
        let node, dockerfileConfiguredGitMaterialId
        for (let i = 0; i < this.state.workflows.length; i++) {
            node = this.state.workflows[i].nodes.find((node) => {
                return node.type === 'CI' && +node.id == this.state.ciNodeId
            })

            if (node) {
                dockerfileConfiguredGitMaterialId = this.state.workflows[i].ciConfiguredGitMaterialId
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
            this.setState({ isLoading: false })
            return
        }
        let envId
        if (this.state.selectedEnv && this.state.selectedEnv.id !== 0) {
            envId = this.state.selectedEnv.id
        }

        const payload = {
            pipelineId: +this.state.ciNodeId,
            ciPipelineMaterials: ciPipelineMaterials,
            invalidateCache: this.state.invalidateCache,
            environmentId: envId,
            pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD
        }

        triggerCINode(payload)
            .then((response: any) => {
                if (response.result) {
                    toast.success('Pipeline Triggered')
                    this.setState(
                        {
                            code: response.code,
                            showCIModal: false,
                            isLoading: false,
                            invalidateCache: false,
                        },
                        () => {
                            preventBodyScroll(false)
                            this.getWorkflowStatus()
                            if (this.props.isJobView) {
                                this.getWorkflows()
                            }
                        },
                    )
                }
            })
            .catch((errors: ServerErrors) => {
                if (errors.code === 403) {
                    toast.info(
                        <ToastBody title="Access denied" subtitle="You don't have access to perform this action." />,
                        {
                            className: 'devtron-toast unauthorized',
                        },
                    )
                } else {
                    errors.errors.map((error) => {
                        if (error.userMessage === NO_TASKS_CONFIGURED_ERROR) {
                            const errorToastBody = (
                                <ToastBodyWithButton
                                    onClick={this.redirectToCIPipeline}
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
                this.setState({ code: errors.code, isLoading: false })
            })
    }
    redirectToCIPipeline = () => {
        this.props.history.push(
            `/job/${this.props.match.params.appId}/edit/workflow/${this.state.workflowId}/ci-pipeline/${this.state.ciNodeId}/build`,
        )
    }
    selectCommit = (materialId: string, hash: string): void => {
        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
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
        this.setState({ workflows })
    }

    selectMaterial = (materialId): void => {
        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
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
        this.setState({ workflows })
    }

    selectImage = (index: number, materialType: string): void => {
        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (this.state.cdNodeId == +node.id && node.type === this.state.nodeType) {
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
        this.setState({ workflows })
    }

    toggleChanges = (materialId: string, hash: string): void => {
        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
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
        this.setState({ workflows })
    }

    toggleSourceInfo = (materialIndex: number): void => {
        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                    node[this.state.materialType][materialIndex].showSourceInfo =
                        !node[this.state.materialType][materialIndex].showSourceInfo
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })
        this.setState({ workflows })
    }

    toggleInvalidateCache() {
        this.setState({ invalidateCache: !this.state.invalidateCache })
    }

    //TODO: refactor
    changeTab(materialIndex, artifactId: number, tab): void {
        if (tab === CDModalTab.Changes) {
            const workflows = [...this.state.workflows].map((workflow) => {
                const nodes = workflow.nodes.map((node) => {
                    if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                        node[this.state.materialType][materialIndex].tab = tab
                    }
                    return node
                })
                workflow.nodes = nodes
                return workflow
            })
            this.setState({ workflows })
            return
        }

        let targetNode
        for (let i = 0; i < this.state.workflows.length; i++) {
            targetNode = this.state.workflows[i].nodes.find(
                (node) => +node.id == this.state.cdNodeId && node.type === this.state.nodeType,
            )
            if (targetNode) break
        }

        if (targetNode || targetNode.scanned || targetNode.scanEnabled) {
            getLastExecutionByArtifactAppEnv(artifactId, this.props.match.params.appId, targetNode.environmentId)
                .then((response) => {
                    const workflows = [...this.state.workflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                                node[this.state.materialType][materialIndex].tab = tab
                                node[this.state.materialType][materialIndex]['vulnerabilities'] =
                                    response.result.vulnerabilities
                                node[this.state.materialType][materialIndex]['lastExecution'] =
                                    response.result.lastExecution
                                node[this.state.materialType][materialIndex]['vulnerabilitiesLoading'] = false
                                node[this.state.materialType][materialIndex]['scanToolId'] = response.result.scanToolId
                            }
                            return node
                        })
                        workflow.nodes = nodes
                        return workflow
                    })
                    this.setState({ workflows })
                })
                .catch((error) => {
                    showError(error)
                    const workflows = [...this.state.workflows].map((workflow) => {
                        const nodes = workflow.nodes.map((node) => {
                            if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                                node[this.state.materialType][materialIndex].tab = tab
                                node[this.state.materialType][materialIndex]['vulnerabilitiesLoading'] = false
                            }
                            return node
                        })
                        workflow.nodes = nodes
                        return workflow
                    })
                    this.setState({ workflows })
                })
        }
    }

    closeCIModal = (): void => {
        preventBodyScroll(false)
        this.abortController.abort()
        this.setState({ showCIModal: false, showMaterialRegexModal: false })
    }

    closeCDModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        preventBodyScroll(false)
        this.abortController.abort()
        this.setState({ showCDModal: false, searchImageTag: '' })
    }

    closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        preventBodyScroll(false)
        this.setState({ showApprovalModal: false })
        this.props.history.push({
            search: '',
        })
    }

    hideWebhookModal = () => {
        this.setState({
            showWebhookModal: false,
        })
    }

    onShowCIModal = () => {
        this.setState({
            showCIModal: true,
        })
    }

    onClickWebhookTimeStamp = () => {
        if (this.state.webhhookTimeStampOrder === TIME_STAMP_ORDER.DESCENDING) {
            this.setState({ webhhookTimeStampOrder: TIME_STAMP_ORDER.ASCENDING })
        } else if (this.state.webhhookTimeStampOrder === TIME_STAMP_ORDER.ASCENDING) {
            this.setState({ webhhookTimeStampOrder: TIME_STAMP_ORDER.DESCENDING })
        }
    }

    toggleWebhookModal = (id, webhhookTimeStampOrder) => {
        this.setState({ isWebhookPayloadLoading: true })
        getCIWebhookRes(id, this.state.webhhookTimeStampOrder).then((result) => {
            this.setState({
                showWebhookModal: true,
                webhookPayloads: result?.result,
                isWebhookPayloadLoading: false,
            })
        })
    }

    onCloseBranchRegexModal = () => {
        this.setState({
            showMaterialRegexModal: false,
        })
    }

    onClickShowBranchRegexModal = (isChangedBranch = false) => {
        this.setState({ showCIModal: false }, () =>
            this.setState({ showMaterialRegexModal: true, isChangeBranchClicked: isChangedBranch }),
        )
    }

    setLoader = (isLoader) => {
        this.setState({
            loader: isLoader,
        })
    }

    setSelectedEnv = (_selectedEnv: Environment) => {
        this.setState({ selectedEnv: _selectedEnv })
    }

    getCINode = (): NodeAttr => {
        let nd: NodeAttr
        if (this.state.ciNodeId) {
            const configuredMaterialList = new Map<number, Set<number>>()
            for (let i = 0; i < this.state.workflows.length; i++) {
                nd = this.state.workflows[i].nodes.find((node) => +node.id == this.state.ciNodeId && node.type === 'CI')
                if (nd) {
                    const gitMaterials = new Map<number, string[]>()
                    for (const _inputMaterial of nd.inputMaterialList) {
                        gitMaterials[_inputMaterial.gitMaterialId] = [
                            _inputMaterial.gitMaterialName.toLowerCase(),
                            _inputMaterial.value,
                        ]
                    }
                    configuredMaterialList[this.state.workflows[i].name] = new Set<number>()
                    handleSourceNotConfigured(
                        configuredMaterialList,
                        this.state.workflows[i],
                        nd[this.state.materialType],
                        !gitMaterials[this.state.workflows[i].ciConfiguredGitMaterialId],
                    )
                    break
                }
            }
        }
        return nd
    }

    renderCIMaterial = () => {
        if (this.state.showCIModal || this.state.showMaterialRegexModal) {
            const nd: NodeAttr = this.getCINode()
            const material = nd?.[this.state.materialType] || []
            return (
                <VisibleModal className="" close={this.closeCIModal}>
                    <div className="modal-body--ci-material h-100" onClick={stopPropagation}>
                        {this.state.loader ? (
                            <>
                                <div className="trigger-modal__header flex right">
                                    <button type="button" className="dc__transparent" onClick={this.closeCIModal}>
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div style={{ height: 'calc(100% - 55px)' }}>
                                    <Progressing pageLoader size={32} />
                                </div>
                            </>
                        ) : (
                            <CIMaterial
                                workflowId={this.state.workflowId}
                                history={this.props.history}
                                location={this.props.location}
                                match={this.props.match}
                                material={material}
                                pipelineName={this.state.ciPipelineName}
                                isLoading={this.state.isLoading}
                                title={this.state.ciPipelineName}
                                pipelineId={this.state.ciNodeId}
                                showWebhookModal={this.state.showWebhookModal}
                                hideWebhookModal={this.hideWebhookModal}
                                toggleWebhookModal={this.toggleWebhookModal}
                                webhookPayloads={this.state.webhookPayloads}
                                isWebhookPayloadLoading={this.state.isWebhookPayloadLoading}
                                onClickWebhookTimeStamp={this.onClickWebhookTimeStamp}
                                webhhookTimeStampOrder={this.state.webhhookTimeStampOrder}
                                showMaterialRegexModal={this.state.showMaterialRegexModal}
                                onCloseBranchRegexModal={this.onCloseBranchRegexModal}
                                filteredCIPipelines={this.state.filteredCIPipelines}
                                onClickShowBranchRegexModal={this.onClickShowBranchRegexModal}
                                showCIModal={this.state.showCIModal}
                                onShowCIModal={this.onShowCIModal}
                                isChangeBranchClicked={this.state.isChangeBranchClicked}
                                getWorkflows={this.getWorkflows}
                                loader={this.state.loader}
                                setLoader={this.setLoader}
                                isFirstTrigger={nd?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED}
                                isCacheAvailable={nd?.storageConfigured}
                                appId={this.props.match.params.appId}
                                isJobView={this.props.isJobView}
                                isCITriggerBlocked={nd?.isCITriggerBlocked}
                                ciBlockState={nd?.ciBlockState}
                                selectedEnv={this.state.selectedEnv}
                                setSelectedEnv={this.setSelectedEnv}
                                environmentLists={this.state.environmentLists}
                            />
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    getCDNode = (): NodeAttr => {
        let node: NodeAttr
        if (this.state.cdNodeId) {
            for (const _workflow of this.state.workflows) {
                node = _workflow.nodes.find((el) => {
                    return +el.id == this.state.cdNodeId && el.type == this.state.nodeType
                })
                if (node) break
            }
        }

        return node ?? ({} as NodeAttr)
    }

    handleMaterialFilters = (
        searchText: string,
        cdNodeId,
        nodeType: DeploymentNodeType,
        isApprovalNode: boolean = false,
        fromRollback: boolean = false,
    ) => {
        if (!fromRollback) {
            this.onClickCDMaterial(cdNodeId, nodeType, isApprovalNode, searchText)
        } else {
            // By default setting from 1 to 20
            this.onClickRollbackMaterial(cdNodeId, null, null, null, searchText)
        }
        this.setState({ searchImageTag: searchText })
    }

    renderCDMaterial() {
        if (this.state.showCDModal) {
            const node: NodeAttr = this.getCDNode()
            const material = node[this.state.materialType] || []

            return (
                <VisibleModal className="" parentClassName="dc__overflow-hidden" close={this.closeCDModal}>
                    <div
                        className={`modal-body--cd-material h-100 contains-diff-view ${
                            material.length > 0 ? '' : 'no-material'
                        }`}
                        onClick={stopPropagation}
                    >
                        {this.state.isLoading ? (
                            <>
                                <div className="trigger-modal__header flex right">
                                    <button type="button" className="dc__transparent" onClick={this.closeCDModal}>
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div style={{ height: 'calc(100% - 55px)' }}>
                                    <Progressing pageLoader size={32} />
                                </div>
                            </>
                        ) : (
                            <CDMaterial
                                appId={Number(this.props.match.params.appId)}
                                pipelineId={this.state.cdNodeId}
                                stageType={DeploymentNodeType[this.state.nodeType]}
                                triggerType={node.triggerType}
                                material={material}
                                materialType={this.state.materialType}
                                envName={node?.environmentName}
                                isLoading={this.state.isLoading}
                                changeTab={this.changeTab}
                                triggerDeploy={this.onClickTriggerCDNode}
                                onClickRollbackMaterial={this.onClickRollbackMaterial}
                                closeCDModal={this.closeCDModal}
                                selectImage={this.selectImage}
                                toggleSourceInfo={this.toggleSourceInfo}
                                parentPipelineId={node.parentPipelineId}
                                parentPipelineType={node.parentPipelineType}
                                parentEnvironmentName={node.parentEnvironmentName}
                                userApprovalConfig={node.userApprovalConfig}
                                requestedUserId={node.requestedUserId}
                                isVirtualEnvironment={node.isVirtualEnvironment}
                                isSaveLoading={this.state.isSaveLoading}
                                ciPipelineId={node.connectingCiPipelineId}
                                appReleaseTagNames={this.state.appReleaseTags}
                                setAppReleaseTagNames={this.setAppReleaseTags}
                                tagsEditable={this.state.tagsEditable}
                                setTagsEditable={this.setTagsEditable}
                                hideImageTaggingHardDelete={this.state.hideImageTaggingHardDelete}
                                history={this.props.history}
                                location={this.props.location}
                                match={this.props.match}
                                isApplicationGroupTrigger={false}
                                handleMaterialFilters={this.handleMaterialFilters}
                                searchImageTag={this.state.searchImageTag}
                                resourceFilters={this.state.resourceFilters}
                            />
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    renderApprovalMaterial() {
        if (ApprovalMaterialModal && this.state.showApprovalModal) {
            const node: NodeAttr = this.getCDNode()
            return (
                <ApprovalMaterialModal
                    appId={Number(this.props.match.params.appId)}
                    pipelineId={this.state.cdNodeId}
                    stageType={DeploymentNodeType[this.state.nodeType]}
                    node={node}
                    materialType={this.state.materialType}
                    isLoading={this.state.isLoading}
                    changeTab={this.changeTab}
                    closeApprovalModal={this.closeApprovalModal}
                    toggleSourceInfo={this.toggleSourceInfo}
                    onClickCDMaterial={this.onClickCDMaterial}
                    getModuleInfo={getModuleInfo}
                    GitCommitInfoGeneric={GitCommitInfoGeneric}
                    ciPipelineId={node.connectingCiPipelineId}
                    appReleaseTagNames={this.state.appReleaseTags}
                    setAppReleaseTagNames={this.setAppReleaseTags}
                    tagsEditable={this.state.tagsEditable}
                    setTagsEditable={this.setTagsEditable}
                    hideImageTaggingHardDelete={this.state.hideImageTaggingHardDelete}
                    configs={this.state.configs}
                    isDefaultConfigPresent={this.state.isDefaultConfigPresent}
                    resourceFilters={this.state.resourceFilters}
                />
            )
        }

        return null
    }

    renderWorkflow() {
        return (
            <React.Fragment>
                {this.state.workflows.map((workflow, index) => {
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
                            history={this.props.history}
                            location={this.props.location}
                            match={this.props.match}
                            isJobView={this.props.isJobView}
                            index={index}
                            filteredCIPipelines={this.state.filteredCIPipelines}
                            environmentLists={this.state.environmentLists}
                        />
                    )
                })}
            </React.Fragment>
        )
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
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

    jobNotConfiguredSubtitle = () => {
        return (
            <>
                {APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.subTitle}&nbsp;
                <a href={DOCUMENTATION.APP_CREATE} target="_blank">
                    {APP_DETAILS.NEED_HELP}
                </a>
            </>
        )
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        } else if (!this.state.workflows.length) {
            return (
                <div>
                    {this.props.isJobView ? (
                        <AppNotConfigured
                            title={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.title}
                            subtitle={this.jobNotConfiguredSubtitle()}
                            buttonTitle={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.buttonTitle}
                            isJobView={this.props.isJobView}
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
                        invalidateCache: this.state.invalidateCache,
                        refreshMaterial: this.refreshMaterial,
                        onClickTriggerCINode: this.onClickTriggerCINode,
                        onClickTriggerCDNode: this.onClickTriggerCDNode,
                        onClickCIMaterial: this.onClickCIMaterial,
                        onClickCDMaterial: this.onClickCDMaterial,
                        onClickRollbackMaterial: this.onClickRollbackMaterial,
                        closeCIModal: this.closeCIModal,
                        selectCommit: this.selectCommit,
                        selectMaterial: this.selectMaterial,
                        toggleChanges: this.toggleChanges,
                        toggleInvalidateCache: this.toggleInvalidateCache,
                        getMaterialByCommit: this.getMaterialByCommit,
                        getFilteredMaterial: this.getFilteredMaterial,
                    }}
                >
                    {this.renderHostErrorMessage()}
                    {this.renderWorkflow()}
                    {this.renderCIMaterial()}
                    {this.renderCDMaterial()}
                    {this.renderApprovalMaterial()}
                </TriggerViewContext.Provider>
            </div>
        )
    }
}

export default withRouter(TriggerView)
