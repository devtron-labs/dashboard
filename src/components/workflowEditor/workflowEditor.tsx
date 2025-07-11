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

import { Component, createContext } from 'react'
import { Route, Switch, withRouter, generatePath } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    WorkflowNodeType,
    PipelineType,
    AddPipelineType,
    SelectedNode,
    InfoIconTippy,
    ToastVariantType,
    ToastManager,
    TARGET_IDS,
    CIPipelineNodeType,
    ChangeCIPayloadType,
    WorkflowOptionsModal,
    URLS as CommonURLS,
    ConfirmationModal,
    ConfirmationModalVariantType,
    deleteWorkflow,
    InfoBlock,
    DocLink,
    Button,
    Icon,
    ComponentSizeType,
    ButtonVariantType,
    ButtonStyleType,
    handleAnalyticsEvent,
    GenericEmptyState,
} from '@devtron-labs/devtron-fe-common-lib'
import { PipelineContext, WorkflowEditProps, WorkflowEditState } from './types'
import { URLS, AppConfigStatus, ViewType } from '../../config'
import { importComponentFromFELibrary, InValidHostUrlWarningBlock } from '../common'
import { Workflow } from './Workflow'
import {
    getAllChildDownstreams,
    getCreateWorkflows,
    getMaxYFromFirstLevelDownstream,
} from '../app/details/triggerView/workflow.service'
import AddWorkflow from './CreateWorkflow'
import CIPipeline from '../CIPipelineN/CIPipeline'
import emptyWorkflow from '../../assets/img/ic-empty-workflow@3x.png'
import LinkedCIPipeline from '../ciPipeline/LinkedCIPipelineEdit'
import LinkedCIPipelineView from '../ciPipeline/LinkedCIPipelineView'
import { ReactComponent as ICHelpOutline } from '../../assets/img/ic-help-outline.svg'
import { ReactComponent as ICClose } from '../../assets/icons/ic-close.svg'
import { getHostURLConfiguration, isGitOpsModuleInstalledAndConfigured } from '../../services/service'
import './workflowEditor.scss'
import CDSuccessModal from './CDSuccessModal'
import { WebhookDetailsModal } from '../ciPipeline/Webhook/WebhookDetailsModal'
import nojobs from '../../assets/img/empty-joblist.webp'
import CDPipeline from '../cdPipeline/CDPipeline'
import EmptyWorkflow from './EmptyWorkflow'
import { WorkflowCreate } from '../app/details/triggerView/config'
import { LinkedCIDetail } from '../../Pages/Shared/LinkedCIDetailsModal'
import { WORKFLOW_EDITOR_HEADER_TIPPY } from './constants'
import { CreateCICDPipeline } from '@Pages/App/Configurations'
import { getAnalyticsAction } from './utils'

export const pipelineContext = createContext<PipelineContext>(null)
const SyncEnvironment = importComponentFromFELibrary('SyncEnvironment')
const LINKED_CD_SOURCE_VARIANT = importComponentFromFELibrary('LINKED_CD_SOURCE_VARIANT', null, 'function')

class WorkflowEdit extends Component<WorkflowEditProps, WorkflowEditState> {
    workflowTimer = null

    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            workflows: [],
            appName: '',
            allCINodeMap: new Map(),
            allDeploymentNodeMap: new Map(),
            showDeleteDialog: false,
            showCIMenu: false,
            hostURLConfig: undefined,
            cIMenuPosition: {
                top: 0,
                left: 0,
            },
            workflowId: 0,
            allCINodesMap: undefined,
            showSuccessScreen: false,
            noGitOpsConfiguration: false,
            noGitOpsModuleInstalledAndConfigured: false,
            showOpenCIPipelineBanner:
                typeof Storage !== 'undefined' && localStorage.getItem('takeMeThereClicked') === '1',
            envToShowWebhookTippy: -1,
            filteredCIPipelines: [],
            envIds: [],
            isGitOpsRepoNotConfigured: false,
            showWorkflowOptionsModal: false,
            cachedCDConfigResponse: {
                pipelines: [],
                appId: 0,
            },
            blackListedCI: {},
            changeCIPayload: null,
            selectedNode: null,
            workflowPositionState: null,
        }
        this.hideWebhookTippy = this.hideWebhookTippy.bind(this)
    }

    componentDidMount() {
        this.getWorkflows()
    }

    componentWillUnmount() {
        this.removeTakeMeThereClickedItem()
        if (this.workflowTimer) {
            clearTimeout(this.workflowTimer)
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.filteredEnvIds !== this.props.filteredEnvIds) {
            this.getWorkflows()
        }
    }

    removeTakeMeThereClickedItem = () => {
        if (typeof Storage !== 'undefined' && localStorage.getItem('takeMeThereClicked')) {
            localStorage.removeItem('takeMeThereClicked')
            this.setState({
                showOpenCIPipelineBanner: false,
            })
        }
    }

    getWorkflows = () => {
        this.getHostURLConfig()
        this.checkGitOpsConfiguration()
        getCreateWorkflows(
            this.props.match.params.appId,
            this.props.isJobView,
            this.props.filteredEnvIds,
            this.props.isTemplateView,
        )
            .then((result) => {
                const allCINodeMap = new Map()
                const allDeploymentNodeMap = new Map()
                let isDeletionInProgress
                const _envIds = []
                for (const workFlow of result.workflows) {
                    for (const node of workFlow.nodes) {
                        if (node.type === WorkflowNodeType.CI) {
                            allCINodeMap.set(node.id, node)
                        } else if (node.type === WorkflowNodeType.CD) {
                            _envIds.push(node.environmentId)
                            if (
                                node.parentPipelineType === PipelineType.WEBHOOK &&
                                this.state.envToShowWebhookTippy === node.environmentId
                            ) {
                                workFlow.showTippy = true
                            }
                            if (!isDeletionInProgress && node.deploymentAppDeleteRequest) {
                                isDeletionInProgress = true
                            }
                            allDeploymentNodeMap.set(node.id, node)
                        }
                    }
                }
                if (isDeletionInProgress) {
                    this.workflowTimer = setTimeout(this.getWorkflows, 10000)
                }
                this.setState({
                    appName: result.appName,
                    workflows: result.workflows,
                    allCINodeMap,
                    allDeploymentNodeMap,
                    view: ViewType.FORM,
                    envToShowWebhookTippy: -1,
                    filteredCIPipelines: result.filteredCIPipelines,
                    envIds: _envIds,
                    isGitOpsRepoNotConfigured: result.isGitOpsRepoNotConfigured,
                    cachedCDConfigResponse: result.cachedCDConfigResponse ?? {
                        pipelines: [],
                        appId: 0,
                    },
                    blackListedCI: result.blackListedCI ?? {},
                    selectedNode: null,
                    workflowPositionState: null,
                })
            })
            .catch((errors) => {
                showError(errors)
                this.setState({ view: ViewType.ERROR, code: errors.code })
            })
    }

    getHostURLConfig() {
        getHostURLConfiguration()
            .then((response) => {
                this.setState({ hostURLConfig: response.result })
            })
            .catch((error) => {})
    }

    async checkGitOpsConfiguration(): Promise<void> {
        if (!this.props.isTemplateView) {
            try {
                const { result } = await isGitOpsModuleInstalledAndConfigured()
                if (result.isInstalled && !result.isConfigured) {
                    this.setState({ noGitOpsConfiguration: true })
                }
                if (!result.isInstalled || !result.isConfigured) {
                    this.setState({ noGitOpsModuleInstalledAndConfigured: true })
                }
            } catch (error) {}
        }
    }

    showDeleteDialog = (workflowId: number) => {
        this.setState({ workflowId, showDeleteDialog: true })
    }

    /**
     * This method sets the value of changeCIPayload on click of change ci button in workflow.
     */
    handleChangeCI = (changeCIPayload: ChangeCIPayloadType) => {
        this.setState({ changeCIPayload, showWorkflowOptionsModal: true })
    }

    resetChangeCIPayload = () => {
        this.setState({ changeCIPayload: null })
    }

    handleNewPipelineModal = () => {
        if (this.props.filteredEnvIds) {
            return
        }

        this.resetChangeCIPayload()
        this.setState({ showWorkflowOptionsModal: true })
    }

    handleCloseWorkflowOptionsModal = () => {
        // Not setting changeCIPayload to null as in some cases we would open CIPipeline/CDPipeline with changeCIPayload
        this.setState({ showWorkflowOptionsModal: false })
    }

    handleDisplayLoader = () => {
        this.setState({ view: ViewType.LOADING })
    }

    closeDeleteModal = () => this.setState({ showDeleteDialog: false })

    getAllWorkflows = () => {
        this.getWorkflows()
        this.props.getWorkflows()
    }

    deleteWorkflow = (appId?: string, workflowId?: number) => {
        deleteWorkflow(
            appId || this.props.match.params.appId,
            workflowId || this.state.workflowId,
            this.props.isTemplateView,
        )
            .then((response) => {
                if (response.errors) {
                    const { errors } = response
                    const { userMessage } = errors[0]
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: userMessage,
                    })
                    return
                }

                if (response.status.toLowerCase() === 'ok') {
                    this.closeDeleteModal()
                    this.handleDisplayLoader()
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Workflow Deleted',
                    })
                    this.getAllWorkflows()
                }
            })
            .catch((errors) => {
                showError(errors)
            })
    }

    handleCISelect = (workflowId: number | string, type: CIPipelineNodeType) => {
        let link = `${
            this.props.isTemplateView
                ? generatePath(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                      appId: this.props.match.params.appId,
                  })
                : `${URLS.APP}/${this.props.match.params.appId}`
        }/edit/workflow/${workflowId}`

        switch (type) {
            case CIPipelineNodeType.CI:
                link = `${link}/ci-pipeline/0`
                break
            case CIPipelineNodeType.EXTERNAL_CI:
                link = `${link}/external-ci`
                break
            case CIPipelineNodeType.LINKED_CI:
                link = `${link}/linked-ci`
                break
            case CIPipelineNodeType.JOB_CI:
                link = `${link}/ci-job/0`
                break
            case CIPipelineNodeType.LINKED_CD:
                link = `${link}/${URLS.LINKED_CD}`
                break
            case CIPipelineNodeType.CI_CD:
                link = `${link}/${URLS.APP_CI_CD_CONFIG}`
                break
        }
        this.props.history.push(link)
    }

    addCIPipeline = (type: CIPipelineNodeType, workflowId?: number | string) => {
        this.handleCISelect(workflowId || 0, type)
        if (!workflowId) {
            const action = getAnalyticsAction(type)
            if (action) {
                handleAnalyticsEvent({ category: 'New Workflow', action })
            }
        }
    }

    addWebhookCD = (workflowId?: number | string) => {
        this.props.history.push(
            `${
                this.props.isTemplateView
                    ? generatePath(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                          appId: this.props.match.params.appId,
                      })
                    : `${URLS.APP}/${this.props.match.params.appId}`
            }/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${
                workflowId || 0
            }/${PipelineType.WEBHOOK.toLowerCase()}/0/${URLS.APP_CD_CONFIG}/0/build`,
        )
        if (!workflowId) {
            handleAnalyticsEvent({ category: 'New Workflow', action: 'DA_NEW_WORKLFOW_EXTERNAL_IMAGE' })
        }
    }

    // Replace this with addCISelect
    addLinkedCD = (changeCIPayload?: ChangeCIPayloadType) => {
        this.props.history.push(
            `${
                this.props.isTemplateView
                    ? generatePath(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                          appId: this.props.match.params.appId,
                      })
                    : `${URLS.APP}/${this.props.match.params.appId}`
            }/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${
                changeCIPayload?.appWorkflowId ?? 0
            }/${URLS.LINKED_CD}?changeCi=${Number(!!changeCIPayload)}&switchFromCiPipelineId=${
                changeCIPayload?.switchFromCiPipelineId ?? 0
            }&switchFromExternalCiPipelineId=${changeCIPayload?.switchFromExternalCiPipelineId ?? 0}`,
        )
        if (!changeCIPayload?.appWorkflowId) {
            handleAnalyticsEvent({ category: 'New Workflow', action: 'DA_NEW_WORKLFOW_SYNC_WITH_CD' })
        }
    }

    handleCDSelect = (
        workflowId: number | string,
        ciPipelineId: number | string,
        parentPipelineType: string,
        parentPipelineId?: number | string,
        isWebhookCD?: boolean,
        childPipelineId?: number | string,
        addType?: AddPipelineType,
    ) => {
        const ciURL = isWebhookCD
            ? `${PipelineType.WEBHOOK.toLowerCase()}/0`
            : `${URLS.APP_CI_CONFIG.toLowerCase()}/${ciPipelineId}`
        let LINK = `${
            this.props.isTemplateView
                ? `${generatePath(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                      appId: this.props.match.params.appId,
                  })}`
                : `${URLS.APP}/${this.props.match.params.appId}`
        }/${CommonURLS.APP_CONFIG}/${
            URLS.APP_WORKFLOW_CONFIG
        }/${workflowId}/${ciURL}/${URLS.APP_CD_CONFIG}/0/build?parentPipelineType=${parentPipelineType}&addType=${
            addType ?? AddPipelineType.PARALLEL
        }`
        if (parentPipelineId) {
            LINK = `${LINK}&parentPipelineId=${parentPipelineId}`
        }
        if (childPipelineId) {
            LINK = `${LINK}&childPipelineId=${childPipelineId}`
        }

        this.props.history.push(LINK)
    }

    openCreateWorkflow = (): string => {
        return `${this.props.match.url}/edit`
    }

    openEditWorkflow = (event, workflowId: number): string => {
        return `${this.props.match.url}/${workflowId}/edit`
    }

    closeAddWorkflow = () => {
        this.props.history.push(
            `${
                this.props.isTemplateView
                    ? generatePath(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                          appId: this.props.match.params.appId,
                      })
                    : `${this.props.isJobView ? URLS.JOB : URLS.APP}/${this.props.match.params.appId}`
            }/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`,
        )
        this.props.getWorkflows()
    }

    closePipeline = (
        showSuccessCD?: boolean,
        environmentId?: number,
        environmentName?: string,
        successTitle?: string,
        showWebhookTippy?: boolean,
    ) => {
        const _url = this.props.isTemplateView
            ? `${generatePath(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                  appId: this.props.match.params.appId,
              })}/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`
            : `${this.props.isJobView ? URLS.JOB : URLS.APP}/${this.props.match.params.appId}/${
                  CommonURLS.APP_CONFIG
              }/${URLS.APP_WORKFLOW_CONFIG}`
        this.props.history.push(_url)

        if (showSuccessCD) {
            setTimeout(() => {
                this.setState({
                    showSuccessScreen: true,
                    environmentId,
                    environmentName,
                    successTitle,
                })
            }, 700)
        }

        // update isCDpipeline in AppCompose
        if (!this.props.isCDPipeline) {
            this.props.respondOnSuccess()
        }
        if (showWebhookTippy) {
            this.setState({ envToShowWebhookTippy: environmentId })
        }
        this.resetChangeCIPayload()
    }

    handleCreateCICDPipelineClose = () => {
        this.closePipeline()
    }

    renderDeleteDialog = () => {
        const wf = this.state.workflows.find((wf) => wf.id === this.state.workflowId)
        //As delete api gives 200 in case of cannot delete, so we using this component despite of DeleteConfirmationModal
        return (
            <ConfirmationModal
                title={`Delete workflow '${wf?.name}' ?`}
                variant={ConfirmationModalVariantType.delete}
                subtitle={`Are you sure you want to delete this workflow from '${this.state.appName}'?`}
                handleClose={this.closeDeleteModal}
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: this.closeDeleteModal,
                    },
                    primaryButtonConfig: {
                        text: 'Delete',
                        onClick: () => this.deleteWorkflow(),
                    },
                }}
            />
        )
    }

    closeSuccessPopup = () => {
        this.setState({ showSuccessScreen: false })
    }

    getLen = (): number => {
        const ciNode = this.state.allCINodeMap.get(this.props.match.params.ciPipelineId)
        return ciNode?.downstreams?.length || 0
    }

    handleClearSelectedNode = () => {
        this.handleSelectedNodeChange(null)
    }

    // TODO: Look into why have to parse id into String in few cases
    handleSelectedNodeChange = (selectedNode: SelectedNode) => {
        // If selectedNode is null, then remove bufferNodes
        // else find the workflow in which the selectedNode is present and add bufferNodes
        // bufferNodes are nodes which are have y greater than the selectedNode and are not present in downstream of selectedNode and the subsequent downstreams of the downstreams.
        // So basically they are nodes in which we have to add buffer height
        // and compute the maximum y of the bufferNodes and if there are downstreams > 1 then also for maxY, we will check maxY using node.y and depth
        if (selectedNode) {
            // would check if selectedNode.type and selectedNode.id is same as node.id and node.type
            let _wf = null
            let _node = null
            this.state.workflows.forEach((wf) => {
                if (!_wf) {
                    _node = wf.nodes?.find(
                        (wfNode) =>
                            String(wfNode.id) === String(selectedNode.id) && wfNode.type === selectedNode.nodeType,
                    )
                    if (_node) {
                        _wf = wf
                    }
                }
            })
            if (_node) {
                const { downstreamNodes } = getAllChildDownstreams(_node, _wf)
                const firstLevelDownstreamMaxY = getMaxYFromFirstLevelDownstream(_node, _wf)
                const bufferNodes = []
                if (downstreamNodes.length > 0) {
                    _wf.nodes.forEach((wfNode) => {
                        if (
                            wfNode.y > _node.y &&
                            wfNode.type !== WorkflowNodeType.GIT &&
                            !downstreamNodes.find(
                                (downstreamNode) =>
                                    String(downstreamNode.id) === String(wfNode.id) &&
                                    downstreamNode.type === wfNode.type,
                            )
                        ) {
                            bufferNodes.push(wfNode)
                        }
                    })
                }

                // It is the starting point of the invisible node that acts as source for parallel edge
                const dummyNodeY = WorkflowCreate.cDNodeSizes.distanceY + WorkflowCreate.cDNodeSizes.nodeHeight
                const parallelEdgeY =
                    downstreamNodes?.length > 0
                        ? firstLevelDownstreamMaxY +
                          dummyNodeY +
                          WorkflowCreate.cDNodeSizes.nodeHeight +
                          WorkflowCreate.workflow.offsetY
                        : 0
                const bufferNodeMaxY = Math.max(
                    ...bufferNodes.map(
                        (node) =>
                            node.y +
                            dummyNodeY +
                            WorkflowCreate.cDNodeSizes.nodeHeight +
                            WorkflowCreate.workflow.offsetY,
                    ),
                    0,
                )
                const maxY = Math.max(bufferNodeMaxY, parallelEdgeY)

                this.setState({
                    selectedNode: {
                        ...selectedNode,
                    },
                    workflowPositionState: {
                        nodes: bufferNodes,
                        maxY,
                        selectedWorkflowId: _wf.id,
                    },
                })
            }
        } else {
            this.setState({
                selectedNode: null,
                workflowPositionState: null,
            })
        }
    }

    // TODO: dynamic routes for ci-pipeline
    renderRouter() {
        return (
            <>
                {!this.props.isJobView && (
                    <CreateCICDPipeline
                        open={this.props.location.pathname.includes(URLS.APP_CI_CD_CONFIG)}
                        onClose={this.handleCreateCICDPipelineClose}
                        appId={this.props.match.params.appId}
                        getWorkflows={this.getWorkflows}
                        noGitOpsModuleInstalledAndConfigured={this.state.noGitOpsModuleInstalledAndConfigured}
                        isGitOpsInstalledButNotConfigured={this.state.noGitOpsConfiguration}
                        isGitOpsRepoNotConfigured={this.state.isGitOpsRepoNotConfigured}
                        envIds={this.state.envIds}
                        reloadAppConfig={this.props.reloadAppConfig}
                        isTemplateView={this.props.isTemplateView}
                    />
                )}
                <Switch>
                    <Route
                        path={`${this.props.match.path}/edit`}
                        render={({ location, history, match }: { location: any; history: any; match: any }) => {
                            return (
                                <AddWorkflow
                                    match={match}
                                    history={history}
                                    location={location}
                                    name={this.state.appName}
                                    onClose={this.closeAddWorkflow}
                                    getWorkflows={this.getWorkflows}
                                    isTemplateView={this.props.isTemplateView}
                                />
                            )
                        }}
                    />
                    {this.props.isJobView && (
                        <Route
                            path={`${this.props.match.path}/empty-workflow`}
                            render={({ location, history, match }: { location: any; history: any; match: any }) => {
                                return (
                                    <EmptyWorkflow
                                        match={match}
                                        history={history}
                                        location={location}
                                        name={this.state.appName}
                                        onClose={this.closeAddWorkflow}
                                        getWorkflows={this.getWorkflows}
                                    />
                                )
                            }}
                        />
                    )}
                    {!this.props.isJobView && (
                        <Route
                            path={[URLS.APP_LINKED_CI_CONFIG, URLS.APP_CI_CONFIG, PipelineType.WEBHOOK].map(
                                (pipeline) =>
                                    `${this.props.match.path}/${pipeline}/:ciPipelineId/cd-pipeline/:cdPipelineId`,
                            )}
                            render={({ location, match }: { location: any; match: any }) => {
                                return (
                                    <CDPipeline
                                        match={match}
                                        location={location}
                                        appName={this.state.appName}
                                        close={this.closePipeline}
                                        getWorkflows={this.getWorkflows}
                                        refreshParentWorkflows={this.props.getWorkflows}
                                        envIds={this.state.envIds}
                                        isGitOpsInstalledButNotConfigured={this.state.noGitOpsConfiguration}
                                        noGitOpsModuleInstalledAndConfigured={
                                            this.state.noGitOpsModuleInstalledAndConfigured
                                        }
                                        isGitOpsRepoNotConfigured={this.state.isGitOpsRepoNotConfigured}
                                        changeCIPayload={this.state.changeCIPayload}
                                        reloadAppConfig={this.props.reloadAppConfig}
                                        handleDisplayLoader={this.handleDisplayLoader}
                                        isTemplateView={this.props.isTemplateView}
                                    />
                                )
                            }}
                        />
                    )}
                    <Route
                        path={[URLS.APP_JOB_CI_CONFIG, URLS.APP_CI_CONFIG].map(
                            (ciPipeline) => `${this.props.match.path}/${ciPipeline}/:ciPipelineId`,
                        )}
                        render={({ location, match }: { location: any; match: any }) => {
                            let isJobCI = false
                            if (location.pathname.indexOf(URLS.APP_JOB_CI_CONFIG) >= 0) {
                                isJobCI = true
                            }
                            return (
                                <CIPipeline
                                    appName={this.state.appName}
                                    connectCDPipelines={this.getLen()}
                                    close={this.closePipeline}
                                    getWorkflows={this.getAllWorkflows}
                                    isJobView={this.props.isJobView}
                                    isJobCI={isJobCI}
                                    changeCIPayload={this.state.changeCIPayload}
                                    isTemplateView={this.props.isTemplateView}
                                />
                            )
                        }}
                    />
                    {!this.props.isJobView && [
                        <Route
                            key={`${this.props.match.path}/webhook/`}
                            path={`${this.props.match.path}/webhook/:webhookId`}
                        >
                            <WebhookDetailsModal
                                close={this.closePipeline}
                                isTemplateView={this.props.isTemplateView}
                            />
                        </Route>,
                        <Route
                            key={`${this.props.match.path}/linked-ci/`}
                            path={`${this.props.match.path}/linked-ci/:ciPipelineId`}
                            render={({ location, history, match }: { location: any; history: any; match: any }) => {
                                return (
                                    <LinkedCIPipelineView
                                        match={match}
                                        history={history}
                                        location={location}
                                        appName={this.state.appName}
                                        connectCDPipelines={this.getLen()}
                                        close={this.closePipeline}
                                        getWorkflows={this.getAllWorkflows}
                                        isTemplateView={this.props.isTemplateView}
                                    />
                                )
                            }}
                        />,
                        <Route
                            key={`${this.props.match.path}/linked-ci`}
                            path={`${this.props.match.path}/linked-ci`}
                            render={({ location, history, match }: { location: any; history: any; match: any }) => {
                                return (
                                    <LinkedCIPipeline
                                        match={match}
                                        history={history}
                                        location={location}
                                        appName={this.state.appName}
                                        connectCDPipelines={0}
                                        close={this.closePipeline}
                                        getWorkflows={this.getWorkflows}
                                        changeCIPayload={this.state.changeCIPayload}
                                        isTemplateView={this.props.isTemplateView}
                                    />
                                )
                            }}
                        />,

                        ...(SyncEnvironment
                            ? [
                                  <Route
                                      key={`${this.props.match.path}/${URLS.LINKED_CD}/`}
                                      path={`${this.props.match.path}/${URLS.LINKED_CD}/`}
                                  >
                                      <SyncEnvironment
                                          closeModal={this.closePipeline}
                                          cdPipelines={this.state.cachedCDConfigResponse.pipelines ?? []}
                                          blackListedIds={this.state.blackListedCI ?? {}}
                                          getWorkflows={this.getWorkflows}
                                          workflows={this.state.workflows}
                                          isTemplateView={this.props.isTemplateView}
                                      />
                                  </Route>,
                              ]
                            : []),
                    ]}
                </Switch>
            </>
        )
    }

    renderNewBuildPipelineButton() {
        return (
            <Button
                dataTestId="new-workflow-button"
                text="New Workflow"
                disabled={!!this.props.filteredEnvIds}
                onClick={this.handleNewPipelineModal}
                startIcon={<Icon name="ic-add" color={null} />}
                size={ComponentSizeType.medium}
                showTooltip={!!this.props.filteredEnvIds}
                tooltipProps={{
                    content: 'Cannot add new workflow or deployment pipelines when environment filter is applied.',
                }}
            />
        )
    }

    openCreateModal = () => {
        this.props.history.push(`${URLS.JOB}/${this.props.match.params.appId}/edit/workflow/empty-workflow`)
    }

    renderNewJobPipelineButton = () => {
        return (
            <Button
                dataTestId="job-pipeline-button"
                onClick={this.openCreateModal}
                text="Job pipeline"
                startIcon={<Icon name="ic-add" color={null} />}
                size={ComponentSizeType.medium}
            />
        )
    }

    renderWorkflowControlButton = (): JSX.Element => {
        if (this.props.isJobView) {
            return this.renderNewJobPipelineButton()
        }

        if (this.state.selectedNode) {
            return (
                <div className="flex dc__border-radius-4-imp bcv-5 ev-5">
                    <div className="flex pt-6 pb-6 pl-12 pr-12 dc__gap-8 h-100 fcn-0">
                        <ICHelpOutline className="icon-dim-16" />
                        <p className="cn-0 m-0 fs-13 fw-4 lh-20">Select a position to add pipeline</p>
                    </div>

                    <button
                        type="button"
                        className="pt-6 pb-6 pl-12 pr-12 flex dc__gap-4 bg__primary h-100 cn-9 fs-13 fw-4 lh-20 dc__hover-n50 dc__no-border dc__outline-none-imp dc__right-radius-4"
                        onClick={this.handleClearSelectedNode}
                    >
                        <ICClose className="icon-dim-12 fcn-9" />
                        Cancel
                    </button>
                </div>
            )
        }

        return this.renderNewBuildPipelineButton()
    }

    renderEmptyState() {
        return (
            <GenericEmptyState
                title="Workflows"
                subTitle={
                    <div className="flexbox-col dc__gap-4">
                        <span>
                            {this.props.isJobView
                                ? 'Configure job pipelines to be executed. Pipelines can be configured to be triggered automatically based on code change or time.'
                                : 'Workflows consist of pipelines from build to deployment stages of an application.'}
                        </span>
                        <DocLink
                            text="Learn about creating workflows"
                            docLinkKey="APP_CREATE_WORKFLOW"
                            dataTestId="learn-more-about-creating-workflow-link"
                        />
                    </div>
                }
                image={this.props.isJobView ? nojobs : emptyWorkflow}
                isButtonAvailable
                renderButton={this.renderWorkflowControlButton}
            />
        )
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return (
                <div className="mb-16">
                    <InValidHostUrlWarningBlock />
                </div>
            )
        }
    }

    hideWebhookTippy() {
        const _wf = this.state.workflows.map((wf) => {
            return { ...wf, showTippy: false }
        })
        this.setState({ workflows: _wf })
    }

    renderWorkflows() {
        const handleModalClose = () => {
            this.props.history.push(this.props.match.url)
        }

        return (
            <>
                {this.state.workflows.map((wf) => {
                    return (
                        <Workflow
                            id={wf.id}
                            key={wf.id}
                            name={wf.name}
                            startX={wf.startX}
                            startY={wf.startY}
                            width={wf.width}
                            height={wf.height}
                            nodes={wf.nodes}
                            history={this.props.history}
                            location={this.props.location}
                            match={this.props.match}
                            handleCDSelect={this.handleCDSelect}
                            handleCISelect={this.handleCISelect}
                            openEditWorkflow={this.openEditWorkflow}
                            showDeleteDialog={this.showDeleteDialog}
                            addCIPipeline={this.addCIPipeline}
                            addWebhookCD={this.addWebhookCD}
                            showWebhookTippy={wf.showTippy}
                            hideWebhookTippy={this.hideWebhookTippy}
                            isJobView={this.props.isJobView}
                            envList={this.props.envList}
                            filteredCIPipelines={this.state.filteredCIPipelines}
                            addNewPipelineBlocked={!!this.props.filteredEnvIds}
                            handleChangeCI={this.handleChangeCI}
                            selectedNode={this.state.selectedNode}
                            handleSelectedNodeChange={this.handleSelectedNodeChange}
                            appName={this.state.appName}
                            getWorkflows={this.getWorkflows}
                            refreshParentWorkflows={this.props.getWorkflows}
                            reloadEnvironments={this.props.reloadEnvironments}
                            workflowPositionState={this.state.workflowPositionState}
                            handleDisplayLoader={this.handleDisplayLoader}
                            isTemplateView={this.props.isTemplateView}
                        />
                    )
                })}
                <LinkedCIDetail workflows={this.state.workflows} handleClose={handleModalClose} />
            </>
        )
    }

    renderOpenCIPipelineBanner = () => {
        return (
            <div className="open-cipipeline-banner dc__position-abs">
                <InfoBlock
                    variant="help"
                    description={
                        <div className="flex dc__gap-8 fs-13 fw-4 lh-20 cn-9">
                            Open a build pipeline to override
                            <Button
                                dataTestId="close-info-block"
                                icon={<Icon name="ic-close-small" color={null} />}
                                ariaLabel="close-info-button"
                                showAriaLabelInTippy={false}
                                onClick={this.removeTakeMeThereClickedItem}
                                size={ComponentSizeType.xxs}
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.negativeGrey}
                            />
                        </div>
                    }
                />
            </div>
        )
    }

    renderMainContent = () => {
        if (
            this.state.view === ViewType.FORM &&
            this.props.configStatus >= AppConfigStatus.LOADING &&
            !this.state.workflows.length
        ) {
            return (
                <>
                    {this.renderRouter()}
                    {this.renderHostErrorMessage()}
                    {this.renderEmptyState()}
                </>
            )
        }

        return (
            <div
                className="workflow-editor bg__primary dc__overflow-auto"
                data-testid="workflow-editor-page"
                // Added for showing the tippy on ApprovalNode
                id={TARGET_IDS.WORKFLOW_EDITOR_CONTAINER}
            >
                <div className="flex dc__content-space pb-16">
                    <div className="flex dc__gap-8 dc__content-start">
                        <h1 className="m-0 cn-9 fs-16 fw-6">Workflow Editor</h1>
                        <InfoIconTippy
                            heading={WORKFLOW_EDITOR_HEADER_TIPPY.HEADING}
                            infoText={
                                this.props.isJobView
                                    ? WORKFLOW_EDITOR_HEADER_TIPPY.INFO_TEXT.JOB_VIEW
                                    : WORKFLOW_EDITOR_HEADER_TIPPY.INFO_TEXT.DEFAULT
                            }
                            documentationLink={this.props.isJobView ? 'JOB_WORKFLOW_EDITOR' : 'APP_CREATE_WORKFLOW'}
                            documentationLinkText={WORKFLOW_EDITOR_HEADER_TIPPY.DOCUMENTATION_LINK_TEXT}
                            placement="right"
                        />
                    </div>

                    {this.renderWorkflowControlButton()}
                </div>

                {this.renderRouter()}
                {this.renderHostErrorMessage()}
                {this.renderWorkflows()}
                {this.state.showDeleteDialog && this.renderDeleteDialog()}
                {this.state.showOpenCIPipelineBanner && this.renderOpenCIPipelineBanner()}
            </div>
        )
    }

    render() {
        if (this.props.configStatus === AppConfigStatus.LOADING || this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }

        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="flex-grow-1">
                    <ErrorScreenManager code={this.state.code} />
                </div>
            )
        }

        return (
            <>
                {this.renderMainContent()}
                {this.state.showSuccessScreen && (
                    <CDSuccessModal
                        appId={this.props.match.params.appId}
                        envId={this.state.environmentId}
                        envName={this.state.environmentName}
                        closeSuccessPopup={this.closeSuccessPopup}
                        successTitle={this.state.successTitle}
                        isTemplateView={this.props.isTemplateView}
                    />
                )}
                <WorkflowOptionsModal
                    open={this.state.showWorkflowOptionsModal}
                    onClose={this.handleCloseWorkflowOptionsModal}
                    addWebhookCD={this.addWebhookCD}
                    addCIPipeline={this.addCIPipeline}
                    addLinkedCD={this.addLinkedCD}
                    showLinkedCDSource={this.state.cachedCDConfigResponse?.pipelines?.length > 0}
                    changeCIPayload={this.state.changeCIPayload}
                    workflows={this.state.workflows}
                    getWorkflows={this.getWorkflows}
                    resetChangeCIPayload={this.resetChangeCIPayload}
                    linkedCDSourceVariant={LINKED_CD_SOURCE_VARIANT}
                    isTemplateView={this.props.isTemplateView}
                />
            </>
        )
    }
}

export default withRouter(WorkflowEdit)
