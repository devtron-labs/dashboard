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

import React, { Component } from 'react'
import {
    ServerErrors,
    showError,
    Progressing,
    ErrorScreenManager,
    stopPropagation,
    VisibleModal,
    DeploymentNodeType,
    CommonNodeAttr,
    WorkflowType,
    getIsRequestAborted,
    handleUTCTime,
    createGitCommitUrl,
    CIMaterialType,
    ToastManager,
    ToastVariantType,
    TOAST_ACCESS_DENIED,
    BlockedStateData,
    getEnvironmentListMinPublic,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactGA from 'react-ga4'
import { withRouter, NavLink, Route, Switch } from 'react-router-dom'
import {
    getCIMaterialList,
    triggerCINode,
    getWorkflowStatus,
    refreshGitMaterial,
    getGitMaterialByCommitHash,
} from '../../service'
import {
    getCDPipelineURL,
    getCIPipelineURL,
    importComponentFromFELibrary,
    preventBodyScroll,
    sortObjectArrayAlphabetically,
    withAppContext,
} from '../../../common'
import { getTriggerWorkflows } from './workflow.service'
import { Workflow } from './workflow/Workflow'
import { CIMaterialProps, CIPipelineNodeType, TriggerViewProps, TriggerViewState } from './types'
import CDMaterial from './cdMaterial'
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
import { getHostURLConfiguration } from '../../../../services/service'
import { ReactComponent as ICError } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { getCIWebhookRes } from './ciWebhook.service'
import { TriggerViewContext } from './config'
import {
    DEFAULT_ENV,
    HOST_ERROR_MESSAGE,
    TIME_STAMP_ORDER,
    TRIGGER_VIEW_PARAMS,
    TRIGGER_VIEW_GA_EVENTS,
} from './Constants'
import {
    APP_DETAILS,
    CI_CONFIGURED_GIT_MATERIAL_ERROR,
    NO_TASKS_CONFIGURED_ERROR,
} from '../../../../config/constantMessaging'
import {
    getBranchValues,
    handleSourceNotConfigured,
    processConsequenceData,
    processWorkflowStatuses,
} from '../../../ApplicationGroup/AppGroup.utils'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { CIPipelineBuildType } from '../../../ciPipeline/types'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import { CIMaterialModal } from './CIMaterialModal'
import { WebhookReceivedPayloadModal } from './WebhookReceivedPayloadModal'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const getCIBlockState: (...props) => Promise<BlockedStateData> = importComponentFromFELibrary(
    'getCIBlockState',
    null,
    'function',
)
const ImagePromotionRouter = importComponentFromFELibrary('ImagePromotionRouter', null, 'function')
const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')
const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')

class TriggerView extends Component<TriggerViewProps, TriggerViewState> {
    timerRef

    inprogressStatusTimer

    abortController: AbortController

    abortCIBuild: AbortController

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
            isLoading: false,
            invalidateCache: false,
            hostURLConfig: undefined,
            webhookPayloads: undefined,
            isWebhookPayloadLoading: false,
            webhookTimeStampOrder: TIME_STAMP_ORDER.DESCENDING,
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
            resourceFilters: [],
            runtimeParams: [],
        }
        this.refreshMaterial = this.refreshMaterial.bind(this)
        this.onClickCIMaterial = this.onClickCIMaterial.bind(this)
        this.onClickCDMaterial = this.onClickCDMaterial.bind(this)
        this.toggleInvalidateCache = this.toggleInvalidateCache.bind(this)
        this.getMaterialByCommit = this.getMaterialByCommit.bind(this)
        this.getFilteredMaterial = this.getFilteredMaterial.bind(this)
        this.abortController = new AbortController()
        this.abortCIBuild = new AbortController()
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

    reloadTriggerView = () => {
        this.setState({
            view: ViewType.LOADING,
        })
        this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
        this.getWorkflows()
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

    getWorkflows = (isFromOnMount?: boolean) => {
        getTriggerWorkflows(
            this.props.match.params.appId,
            !this.props.isJobView,
            this.props.isJobView,
            this.props.filteredEnvIds,
        )
            .then((result) => {
                const _filteredCIPipelines = result.filteredCIPipelines || []
                const wf = result.workflows || []
                if (this.state.ciNodeId) {
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
                    if (isFromOnMount) {
                        if (ApprovalMaterialModal) {
                            if (this.props.location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
                                const searchParams = new URLSearchParams(this.props.location.search)
                                const nodeId = searchParams.get(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)
                                this.onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
                            }
                        }

                        if (this.props.location.search.includes('rollback-node')) {
                            const searchParams = new URLSearchParams(this.props.location.search)
                            const nodeId = Number(searchParams.get('rollback-node'))
                            if (!isNaN(nodeId)) {
                                this.onClickRollbackMaterial(nodeId)
                            } else {
                                ToastManager.showToast({
                                    variant: ToastVariantType.error,
                                    description: 'Invalid node id',
                                })
                                this.props.history.push({
                                    search: '',
                                })
                            }
                        } else if (this.props.location.search.includes('cd-node')) {
                            const searchParams = new URLSearchParams(this.props.location.search)
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
                                this.props.history.push({
                                    search: '',
                                })
                            } else if (!isNaN(nodeId)) {
                                this.onClickCDMaterial(nodeId, nodeType as DeploymentNodeType)
                            } else {
                                ToastManager.showToast({
                                    variant: ToastVariantType.error,
                                    description: 'Invalid node id',
                                })
                                this.props.history.push({
                                    search: '',
                                })
                            }
                        }
                    }
                    if (this.props.location.pathname.includes('build')) {
                        // extracting ciNodeId from URL
                        const ciNodeId = this.props.location.pathname.match(/build\/(\d+)/)?.[1] ?? null
                        const ciNode = wf
                            .flatMap((workflow) => workflow.nodes)
                            .find((node) => node.type === CIPipelineNodeType.CI && node.id === ciNodeId)
                        const pipelineName = ciNode?.title

                        if (!isNaN(+ciNodeId) && !!pipelineName) {
                            this.onClickCIMaterial(ciNodeId, pipelineName, false)
                        } else {
                            ToastManager.showToast({
                                variant: ToastVariantType.error,
                                description: 'Invalid Node',
                            })
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
        this.abortController.abort()
        this.abortController = new AbortController()

        getGitMaterialByCommitHash(ciPipelineMaterialId.toString(), commitHash, this.abortController.signal)
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
                this.setState({
                    workflows,
                })
            })
            .catch((error: ServerErrors) => {
                if (!getIsRequestAborted(error)) {
                    showError(error)
                    _selectedMaterial.isMaterialLoading = false
                    this.setState({
                        workflows,
                    })
                }
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
                        if (material.isSelected) {
                            material.isMaterialLoading = true
                            material.searchText = commitHash
                            material.showAllCommits = false
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
                if (commitInLocalHistory.excluded) {
                    _selectedMaterial.isMaterialSelectionError = true
                    _selectedMaterial.materialSelectionErrorMsg = NO_COMMIT_SELECTED
                }
                this.setState({
                    workflows,
                })
            } else {
                this.setState(
                    {
                        workflows,
                    },
                    () => {
                        this.getCommitHistory(ciPipelineMaterialId, commitHash, workflows, _selectedMaterial)
                    },
                )
            }
        } else {
            this.setState(
                {
                    workflows,
                },
                () => {
                    this.getMaterialHistoryWrapper(ciNodeId.toString(), gitMaterialId, false)
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
                workflows,
            },
            () => {
                this.getMaterialHistoryWrapper(ciNodeId.toString(), gitMaterialId, showExcluded)
            },
        )
    }

    getMaterialHistory(ciNodeId: string, abortSignal: AbortSignal, gitMaterialId?: number, showExcluded?: boolean) {
        const params = {
            pipelineId: ciNodeId,
            materialId: gitMaterialId,
            showExcluded,
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
                            }
                            return mat
                        })
                    }
                    return node
                })
                return workflow
            })
            this.setState(
                {
                    workflows,
                    showMaterialRegexModal: showRegexModal,
                },
                () => {
                    this.getWorkflowStatus()
                    preventBodyScroll(true)
                },
            )
        })
    }

    getMaterialHistoryWrapper = (nodeId: string, gitMaterialId: number, showExcluded: boolean) => {
        this.abortController.abort()
        this.abortController = new AbortController()

        this.getMaterialHistory(nodeId, this.abortController.signal, gitMaterialId, showExcluded).catch(
            (errors: ServerErrors) => {
                if (!getIsRequestAborted(errors)) {
                    showError(errors)
                    this.setState({ code: errors.code })
                }
            },
        )
    }

    // NOTE: GIT MATERIAL ID
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
        this.abortController.abort()
        this.abortController = new AbortController()

        refreshGitMaterial(gitMaterialId.toString(), this.abortController.signal)
            .then((response) => {
                this.getMaterialHistory(
                    ciNodeId.toString(),
                    this.abortController.signal,
                    gitMaterialId,
                    showExcluded,
                ).catch((errors: ServerErrors) => {
                    if (!getIsRequestAborted(errors)) {
                        showError(errors)
                        this.setState({ code: errors.code })
                    }
                })
            })
            .catch((error: ServerErrors) => {
                if (!getIsRequestAborted(error)) {
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
                        } else {
                            node.inputMaterialList = response.result
                        }
                        return node
                    }
                    return node
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
                    workflows,
                    ciNodeId: +ciNodeId,
                    code: response.code,
                    ciPipelineName,
                    materialType: 'inputMaterialList',
                    showMaterialRegexModal: showRegexModal,
                    workflowId,
                },
                () => {
                    this.getWorkflowStatus()
                    preventBodyScroll(true)
                },
            )
        })
    }

    onClickCIMaterial(ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) {
        this.setState({ loader: true, materialType: 'inputMaterialList' })
        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.MaterialClicked)
        this.abortController.abort()
        this.abortController = new AbortController()
        if (!this.props.location.pathname.includes(URLS.WEBHOOK_MODAL)) {
            this.props.history.push(`${this.props.match.url}${URLS.BUILD}/${ciNodeId}`)
        }

        Promise.all([
            this.updateCIMaterialList(ciNodeId, ciPipelineName, preserveMaterialSelection, this.abortController.signal),
            getCIBlockState && !this.props.isJobView
                ? getCIBlockState(
                      ciNodeId,
                      this.props.match.params.appId,
                      getBranchValues(ciNodeId, this.state.workflows, this.state.filteredCIPipelines),
                      this.props.appContext.currentAppName,
                  )
                : null,
            getRuntimeParams?.(ciNodeId) ?? null,
        ])
            .then((resp) => {
                // For updateCIMaterialList, it's already being set inside the same function so not setting that
                if (resp[1]) {
                    const workflows = [...this.state.workflows].map((workflow) => {
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

                    this.setState({
                        workflows,
                    })
                }

                if (resp[2]) {
                    // Not saving as null since page ViewType is set as Error in case of error
                    this.setState({
                        runtimeParams: resp[2] || [],
                    })
                }
            })
            .catch((errors: ServerErrors) => {
                if (!getIsRequestAborted(errors)) {
                    showError(errors)
                    this.closeCIModal()
                }
            })
            .finally(() => {
                this.setState({ loader: false })
            })
    }

    // TODO: Can also combine rollback and onClickCDMaterial
    // Till then make sure that they are consistent
    onClickCDMaterial(cdNodeId, nodeType: DeploymentNodeType, isApprovalNode: boolean = false) {
        ReactGA.event(isApprovalNode ? TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked : TRIGGER_VIEW_GA_EVENTS.ImageClicked)

        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (cdNodeId == node.id && node.type === nodeType) {
                    if (node.type === 'CD') {
                        node.approvalConfigData = workflow.approvalConfiguredIdsMap[cdNodeId]
                    }
                }
                return node
            })

            workflow.nodes = nodes
            return workflow
        })
        this.setState({
            workflows,
            materialType: 'inputMaterialList',
            cdNodeId,
            nodeType,
        })
        preventBodyScroll(true)

        const newParams = new URLSearchParams(this.props.location.search)
        newParams.set(
            isApprovalNode ? TRIGGER_VIEW_PARAMS.APPROVAL_NODE : TRIGGER_VIEW_PARAMS.CD_NODE,
            cdNodeId.toString(),
        )
        if (!isApprovalNode) {
            newParams.set('node-type', nodeType)
        } else {
            const currentApprovalState = newParams.get(TRIGGER_VIEW_PARAMS.APPROVAL_STATE)
            const approvalState =
                currentApprovalState === TRIGGER_VIEW_PARAMS.PENDING
                    ? TRIGGER_VIEW_PARAMS.PENDING
                    : TRIGGER_VIEW_PARAMS.APPROVAL

            newParams.set(TRIGGER_VIEW_PARAMS.APPROVAL_STATE, approvalState)
            newParams.delete(TRIGGER_VIEW_PARAMS.CD_NODE)
            newParams.delete(TRIGGER_VIEW_PARAMS.NODE_TYPE)
        }
        this.props.history.push({
            search: newParams.toString(),
        })
    }

    // Assuming that rollback has only CD as nodeType
    onClickRollbackMaterial = (cdNodeId: number, offset?: number, size?: number) => {
        if (!offset && !size) {
            ReactGA.event(TRIGGER_VIEW_GA_EVENTS.RollbackClicked)
        }

        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CD' && +node.id == cdNodeId) {
                    node.approvalConfigData = workflow.approvalConfiguredIdsMap[cdNodeId]
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })
        this.setState(
            {
                workflows,
                materialType: 'rollbackMaterialList',
                cdNodeId,
                nodeType: 'CD',
            },
            () => {
                preventBodyScroll(true)
                this.getWorkflowStatus()
            },
        )

        const newParams = new URLSearchParams(this.props.location.search)
        newParams.set('rollback-node', cdNodeId.toString())
        this.props.history.push({
            search: newParams.toString(),
        })
    }

    onClickTriggerCINode = () => {
        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CITriggered)
        this.setState({ isLoading: true })
        let node
        let dockerfileConfiguredGitMaterialId
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
        }
        if (gitMaterials[dockerfileConfiguredGitMaterialId][1] === DEFAULT_GIT_BRANCH_VALUE) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: CI_CONFIGURED_GIT_MATERIAL_ERROR.replace(
                    '$GIT_MATERIAL_ID',
                    `"${gitMaterials[dockerfileConfiguredGitMaterialId][0]}"`,
                ),
            })
            this.setState({ isLoading: false })
            return
        }
        let envId
        if (this.state.selectedEnv && this.state.selectedEnv.id !== 0) {
            envId = this.state.selectedEnv.id
        }

        // No need to validate here since ciMaterial handles it for trigger view
        const runtimeParamsPayload = getRuntimeParamsPayload?.(this.state.runtimeParams ?? [])

        const payload = {
            pipelineId: +this.state.ciNodeId,
            ciPipelineMaterials,
            invalidateCache: this.state.invalidateCache,
            environmentId: envId,
            pipelineType: node.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
            ...(getRuntimeParamsPayload ? runtimeParamsPayload : {}),
        }

        this.abortCIBuild = new AbortController()
        triggerCINode(payload, this.abortCIBuild.signal)
            .then((response: any) => {
                if (response.result) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Pipeline Triggered',
                    })
                    this.setState(
                        {
                            code: response.code,
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
                    this.props.history.push(this.props.match.url)
                }
            })
            .catch((errors: ServerErrors) => {
                if (errors.code === 403) {
                    ToastManager.showToast({
                        variant: ToastVariantType.notAuthorized,
                        description: TOAST_ACCESS_DENIED.SUBTITLE,
                    })
                } else if (errors instanceof ServerErrors && Array.isArray(errors.errors) && errors.code === 409) {
                    errors.errors.map((err) =>
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: err.internalMessage,
                        }),
                    )
                } else {
                    errors.errors.map((error) => {
                        if (error.userMessage === NO_TASKS_CONFIGURED_ERROR) {
                            ToastManager.showToast({
                                variant: ToastVariantType.error,
                                title: 'Nothing to execute',
                                description: 'error.userMessage',
                                buttonProps: {
                                    text: 'Edit Pipeline',
                                    dataTestId: 'edit-pipeline-btn',
                                    onClick: this.redirectToCIPipeline,
                                },
                            })
                        } else {
                            showError(errors)
                        }
                    })
                }
                this.setState({ code: errors.code, isLoading: false })
            })
    }

    redirectToCIPipeline = () => {
        this.props.history.push(
            getCIPipelineURL(
                this.props.match.params.appId,
                this.state.workflowId.toString(),
                true,
                this.state.ciNodeId,
                true,
                false,
            ),
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
                    node.inputMaterialList = node.inputMaterialList?.map((material) => {
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

    toggleChanges = (materialId: string, hash: string): void => {
        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
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
        this.setState({ workflows })
    }

    toggleInvalidateCache() {
        this.setState({ invalidateCache: !this.state.invalidateCache })
    }

    closeCIModal = (): void => {
        preventBodyScroll(false)
        this.abortController.abort()
        this.setState({ showMaterialRegexModal: false })
        this.props.history.push(this.props.match.url)
    }

    closeCDModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        this.setState({ searchImageTag: '' })
        this.props.history.push({
            search: '',
        })
        preventBodyScroll(false)
        this.getWorkflowStatus()
    }

    closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        preventBodyScroll(false)
        this.props.history.push({
            search: '',
        })
        preventBodyScroll(false)
        this.getWorkflowStatus()
    }


    onClickWebhookTimeStamp = () => {
        if (this.state.webhookTimeStampOrder === TIME_STAMP_ORDER.DESCENDING) {
            this.setState({ webhookTimeStampOrder: TIME_STAMP_ORDER.ASCENDING })
        } else if (this.state.webhookTimeStampOrder === TIME_STAMP_ORDER.ASCENDING) {
            this.setState({ webhookTimeStampOrder: TIME_STAMP_ORDER.DESCENDING })
        }
    }

    getWebhookPayload = (id) => {
        this.setState({ isWebhookPayloadLoading: true })
        getCIWebhookRes(id, this.state.webhookTimeStampOrder).then((result) => {
            this.setState({
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
        this.setState({ showMaterialRegexModal: true, isChangeBranchClicked: isChangedBranch })
    }

    handleRuntimeParamChange: CIMaterialProps['handleRuntimeParamChange'] = (updatedRuntimeParams) => {
        this.setState({
            runtimeParams: updatedRuntimeParams,
        })
    }

    setLoader = (isLoader) => {
        this.setState({
            loader: isLoader,
        })
    }

    setSelectedEnv = (_selectedEnv) => {
        this.setState({ selectedEnv: _selectedEnv })
    }

    getCINode = (): CommonNodeAttr => {
        let nd: CommonNodeAttr
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

    resetAbortController = () => {
        this.abortCIBuild = new AbortController()
    }


    renderCIMaterial = () => {
        if (this.state.ciNodeId) {
            const nd: CommonNodeAttr = this.getCINode()
            const material = nd?.[this.state.materialType] || []
            return (
                <Switch>
                    <Route
                        path={`${this.props.match.url}${URLS.BUILD}/:ciNodeId/${URLS.WEBHOOK_MODAL}`}
                    >
                        <WebhookReceivedPayloadModal
                            workflowId={this.state.workflowId}
                            webhookPayloads={this.state.webhookPayloads}
                            isWebhookPayloadLoading={this.state.isWebhookPayloadLoading}
                            material={material}
                            pipelineId={this.state.ciNodeId.toString()}
                            title={this.state.ciPipelineName}
                            isJobView={this.props.isJobView}
                            getWebhookPayload={this.getWebhookPayload}
                            appId={this.props.match.params.appId}
                        />
                    </Route>
                    <Route exact path={`${this.props.match.url}${URLS.BUILD}/:ciNodeId`}>
                        <CIMaterialModal
                            workflowId={this.state.workflowId}
                            history={this.props.history}
                            location={this.props.location}
                            match={this.props.match}
                            material={material}
                            pipelineName={this.state.ciPipelineName}
                            isLoading={this.state.isLoading}
                            title={this.state.ciPipelineName}
                            pipelineId={this.state.ciNodeId.toString()}
                            getWebhookPayload={this.getWebhookPayload}
                            onClickWebhookTimeStamp={this.onClickWebhookTimeStamp}
                            showMaterialRegexModal={this.state.showMaterialRegexModal}
                            onCloseBranchRegexModal={this.onCloseBranchRegexModal}
                            filteredCIPipelines={this.state.filteredCIPipelines}
                            onClickShowBranchRegexModal={this.onClickShowBranchRegexModal}
                            isChangeBranchClicked={this.state.isChangeBranchClicked}
                            getWorkflows={this.getWorkflows}
                            loader={this.state.loader}
                            setLoader={this.setLoader}
                            isFirstTrigger={nd?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED}
                            isCacheAvailable={nd?.storageConfigured}
                            appId={this.props.match.params.appId}
                            isJobView={this.props.isJobView}
                            isCITriggerBlocked={nd?.isTriggerBlocked}
                            ciBlockState={nd?.pluginBlockState}
                            selectedEnv={this.state.selectedEnv}
                            setSelectedEnv={this.setSelectedEnv}
                            environmentLists={this.state.environmentLists}
                            isJobCI={!!nd?.isJobCI}
                            runtimeParams={this.state.runtimeParams}
                            handleRuntimeParamChange={this.handleRuntimeParamChange}
                            closeCIModal={this.closeCIModal}
                            abortController={this.abortCIBuild}
                            resetAbortController={this.resetAbortController}
                        />
                    </Route>
                </Switch>
            )
        }
        return null
    }

    getCDNode = (): CommonNodeAttr => {
        let node: CommonNodeAttr
        if (this.state.cdNodeId) {
            for (const _workflow of this.state.workflows) {
                node = _workflow.nodes.find((el) => {
                    return +el.id == this.state.cdNodeId && el.type == this.state.nodeType
                })

                if (node) {
                    break
                }
            }
        }

        return node ?? ({} as CommonNodeAttr)
    }

    renderCDMaterialContent = (cdNode: CommonNodeAttr) => {
        const selectedWorkflow = this.state.workflows.find((wf) => wf.nodes.some((node) => node.id === cdNode.id))
        const selectedCINode = selectedWorkflow?.nodes.find((node) => node.type === 'CI' || node.type === 'WEBHOOK')
        const doesWorkflowContainsWebhook = selectedCINode?.type === 'WEBHOOK'
        const configurePluginURL = getCDPipelineURL(
            this.props.match.params.appId,
            selectedWorkflow.id,
            doesWorkflowContainsWebhook ? '0' : selectedCINode?.id,
            doesWorkflowContainsWebhook,
            cdNode.id,
            true,
        )

        return (
            <CDMaterial
                materialType={this.state.materialType}
                appId={Number(this.props.match.params.appId)}
                pipelineId={this.state.cdNodeId}
                stageType={DeploymentNodeType[this.state.nodeType]}
                envName={cdNode?.environmentName}
                envId={cdNode?.environmentId}
                closeCDModal={this.closeCDModal}
                triggerType={cdNode.triggerType}
                isVirtualEnvironment={cdNode.isVirtualEnvironment}
                parentEnvironmentName={cdNode.parentEnvironmentName}
                isLoading={this.state.isLoading}
                ciPipelineId={cdNode.connectingCiPipelineId}
                isSaveLoading={this.state.isSaveLoading}
                deploymentAppType={cdNode?.deploymentAppType}
                showPluginWarningBeforeTrigger={cdNode?.showPluginWarning}
                consequence={cdNode?.pluginBlockState}
                configurePluginURL={configurePluginURL}
                isTriggerBlockedDueToPlugin={cdNode?.showPluginWarning && cdNode?.isTriggerBlocked}
            />
        )
    }

    renderCDMaterial() {
        if (this.props.location.search.includes('cd-node') || this.props.location.search.includes('rollback-node')) {
            const cdNode: CommonNodeAttr = this.getCDNode()
            if (!cdNode.id) {
                return null
            }
            const material = cdNode[this.state.materialType] || []

            return (
                <VisibleModal className="" parentClassName="dc__overflow-hidden" close={this.closeCDModal}>
                    <div
                        className={`modal-body--cd-material h-100 flexbox-col contains-diff-view ${
                            material.length > 0 ? '' : 'no-material'
                        }`}
                        onClick={stopPropagation}
                    >
                        {this.state.isLoading ? (
                            <>
                                <div className="trigger-modal__header flexbox dc__content-space">
                                    <button type="button" className="dc__transparent" onClick={this.closeCDModal}>
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div style={{ height: 'calc(100% - 55px)' }}>
                                    <Progressing pageLoader size={32} />
                                </div>
                            </>
                        ) : (
                            this.renderCDMaterialContent(cdNode)
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    renderApprovalMaterial() {
        if (ApprovalMaterialModal && this.props.location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const node: CommonNodeAttr = this.getCDNode()
            return (
                <ApprovalMaterialModal
                    isLoading={this.state.isLoading}
                    node={node}
                    materialType={this.state.materialType}
                    stageType={DeploymentNodeType[this.state.nodeType]}
                    closeApprovalModal={this.closeApprovalModal}
                    appId={Number(this.props.match.params.appId)}
                    pipelineId={this.state.cdNodeId}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node.connectingCiPipelineId}
                    history={this.props.history}
                />
            )
        }

        return null
    }

    handleModalClose = () => {
        this.props.history.push(this.props.match.url)
    }

    renderWorkflow() {
        return (
            <>
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
                            artifactPromotionMetadata={workflow.artifactPromotionMetadata}
                            history={this.props.history}
                            location={this.props.location}
                            match={this.props.match}
                            isJobView={this.props.isJobView}
                            index={index}
                            filteredCIPipelines={this.state.filteredCIPipelines}
                            environmentLists={this.state.environmentLists}
                            appId={+this.props.match.params.appId}
                        />
                    )
                })}
                <LinkedCIDetail workflows={this.state.workflows} handleClose={this.handleModalClose} />
            </>
        )
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return (
                <div className="br-4 bw-1 er-2 pt-10 pb-10 pl-16 pr-16 bcr-1 mb-16 flex left">
                    <ICError className="icon-dim-20 mr-8" />
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
                <a href={DOCUMENTATION.APP_CREATE} target="_blank noopener noreferrer">
                    {APP_DETAILS.NEED_HELP}
                </a>
            </>
        )
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        }
        if (!this.state.workflows.length) {
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
            <>
                <div className="svg-wrapper-trigger bcn-0">
                    <TriggerViewContext.Provider
                        value={{
                            invalidateCache: this.state.invalidateCache,
                            refreshMaterial: this.refreshMaterial,
                            onClickTriggerCINode: this.onClickTriggerCINode,
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
                            reloadTriggerView: this.reloadTriggerView,
                        }}
                    >
                        {this.renderHostErrorMessage()}
                        {this.renderWorkflow()}
                        {this.renderCIMaterial()}
                        {this.renderCDMaterial()}
                        {this.renderApprovalMaterial()}
                    </TriggerViewContext.Provider>
                </div>
                {ImagePromotionRouter && (
                    <ImagePromotionRouter
                        basePath={this.props.match.path}
                        baseURL={this.props.match.url}
                        workflows={this.state.workflows}
                        getModuleInfo={getModuleInfo}
                    />
                )}
            </>
        )
    }
}

export default withRouter(withAppContext(TriggerView))
