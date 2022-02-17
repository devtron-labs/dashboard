import React, { Component } from 'react';
import { WorkflowEditProps, WorkflowEditState } from './types';
import { Route, Switch, withRouter } from 'react-router-dom';
import { URLS, AppConfigStatus, ViewType, DOCUMENTATION } from '../../config';
import { Progressing, showError, ErrorScreenManager, DeleteDialog } from '../common';
import { toast } from 'react-toastify';
import { Workflow } from './Workflow';
import { getCreateWorkflows } from '../app/details/triggerView/workflow.service';
import { deleteWorkflow } from './service';
import AddWorkflow from './CreateWorkflow';
import add from '../../assets/icons/misc/addWhite.svg';
import CIPipeline from '../ciPipeline/CIPipeline';
import CDPipeline from '../cdPipeline/CDPipeline';
import emptyWorkflow from '../../assets/img/ic-empty-workflow@3x.png';
import ExternalCIPipeline from '../ciPipeline/ExternalCIPipeline';
import LinkedCIPipeline from '../ciPipeline/LinkedCIPipelineEdit';
import LinkedCIPipelineView from '../ciPipeline/LinkedCIPipelineView';
import { NavLink } from 'react-router-dom';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { isGitopsConfigured, getHostURLConfiguration } from '../../services/service';
import { PipelineSelect } from './PipelineSelect';
import './workflowEditor.css';
import { NodeAttr } from '../app/details/triggerView/types';

class WorkflowEdit extends Component<WorkflowEditProps, WorkflowEditState>  {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            workflows: [],
            appName: "",
            allCINodeMap: new Map(),
            allDeploymentNodeMap: new Map(),
            showDeleteDialog: false,
            showCIMenu: false,
            isGitOpsConfigAvailable: false,
            hostURLConfig: undefined,
            cIMenuPosition: {
                top: 0,
                left: 0,
            },
            workflowId: 0,
            allCINodesMap: undefined,
        }
    }

    componentDidMount() {
        this.getWorkflows();
    }

    getWorkflows = () => {
        this.getHostURLConfig();
        isGitopsConfigured().then((response) => {
            let isGitOpsConfigAvailable = response.result && response.result.exists;
            this.setState({ isGitOpsConfigAvailable });
        })
        getCreateWorkflows(this.props.match.params.appId).then((result) => {
            let allCINodeMap = new Map(result.workflows
                .flatMap( wf => wf.nodes.filter(node => node.type == 'CI'))
                .map(ciPipeline => [ciPipeline.id, ciPipeline] as [string, NodeAttr]));
            let allDeploymentNodeMap = new Map(result.workflows
                .flatMap( wf => wf.nodes.filter(node => node.type == 'CD'))
                .map(cdPipeline => [cdPipeline.id, cdPipeline] as [string, NodeAttr]));

            this.setState({
                appName: result.appName,
                workflows: result.workflows,
                allCINodeMap: allCINodeMap,
                allDeploymentNodeMap: allDeploymentNodeMap,
                view: ViewType.FORM
            });
        }).catch((errors) => {
            showError(errors);
            this.setState({ view: ViewType.ERROR, code: errors.code });
        })
    }

    getHostURLConfig() {
        getHostURLConfiguration().then((response) => {
            this.setState({ hostURLConfig: response.result, })
        }).catch((error) => {

        })
    }

    showDeleteDialog = (workflowId: number) => {
        this.setState({ workflowId, showDeleteDialog: true })
    }

    toggleCIMenu = (event) => {
        let { top, left } = event.target.getBoundingClientRect();
        top = top + 41;
        this.setState({
            cIMenuPosition: {
                top: top,
                left: left,
            },
            showCIMenu: !this.state.showCIMenu,
        });
    }

    deleteWorkflow = () => {
        deleteWorkflow(this.props.match.params.appId, this.state.workflowId).then((response) => {
            if (response.status.toLowerCase() === "ok") {
                this.setState({ showDeleteDialog: false })
                toast.success("Workflow Deleted");
                this.getWorkflows();
                this.props.getWorkflows();
            }
        }).catch((errors) => {
            showError(errors);
        })
    }

    handleCISelect = (workflowId: number | string, type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => {
        let link = `${URLS.APP}/${this.props.match.params.appId}/edit/workflow/${workflowId}`;
        switch (type) {
            case 'CI':
                link = `${link}/ci-pipeline`;
                break;
            case 'EXTERNAL-CI':
                link = `${link}/external-ci`;
                break;
            case 'LINKED-CI':
                link = `${link}/linked-ci`;
                break;
        }
        this.props.history.push(link);
    }

    addCIPipeline = (type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI', workflowId?: number | string) => {
        this.handleCISelect(workflowId || 0, type);
    }

    handleCDSelect = (workflowId: number | string, ciPipelineId: number| string, parentPipelineType: string, parentPipelineId?: number| string) => {
        const LINK = `${URLS.APP}/${this.props.match.params.appId}/edit/workflow/${workflowId}/ci-pipeline/${ciPipelineId}/cd-pipeline?parentPipelineType=${parentPipelineType}&parentPipelineId=${parentPipelineId}`;
        this.props.history.push(LINK);
    }

    openCreateWorkflow = (): string => {
        return `${this.props.match.url}/edit`;
    }

    openEditWorkflow = (event, workflowId: number): string => {
        return `${this.props.match.url}/${workflowId}/edit`;
    }

    closeAddWorkflow = () => {
        this.props.history.push(`${URLS.APP}/${this.props.match.params.appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`);
        this.props.getWorkflows();
    }

    closePipeline = () => {
        const LINK = `${URLS.APP}/${this.props.match.params.appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`;
        this.props.history.push(LINK);
        //update isCDpipeline in AppCompose
        if (!this.props.isCDPipeline) this.props.respondOnSuccess();
    }

    renderDeleteDialog = () => {
        let wf = this.state.workflows.find(wf => wf.id === this.state.workflowId);
        if (this.state.showDeleteDialog) {
            return <DeleteDialog title={`Delete '${wf?.name}' ?`}
                description={`Are you sure you want to delete this workflow from '${this.state.appName}'?`}
                closeDelete={() => this.setState({ showDeleteDialog: false })}
                delete={this.deleteWorkflow} />
        }
    }
    //TODO: dynamic routes for ci-pipeline
    renderRouter() {
        return <Switch>
            <Route path={`${this.props.match.path}/edit`} render={(props) => {
                return <AddWorkflow match={props.match} history={props.history} location={props.location}
                    name={this.state.appName}
                    onClose={this.closeAddWorkflow}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={[URLS.APP_EXTERNAL_CI_CONFIG, URLS.APP_LINKED_CI_CONFIG, URLS.APP_CI_CONFIG].map(pipeline => `${this.props.match.path}/${pipeline}/:ciPipelineId/cd-pipeline/:cdPipelineId?`)}
                render={(props) => {
                    let cdNode = this.state.allDeploymentNodeMap.get(props.match.params.cdPipelineId);
                    let downstreamNodeSize = (cdNode?.downstreams?.length ?? 0)
                    return <CDPipeline match={props.match} history={props.history} location={props.location}
                        appName={this.state.appName}
                        close={this.closePipeline}
                        downstreamNodeSize = {downstreamNodeSize}
                        getWorkflows={this.getWorkflows} />
                }}
            />
            <Route path={`${this.props.match.path}/ci-pipeline/:ciPipelineId?`} render={(props) => {
                let ciNode = this.state.allCINodeMap.get(props.match.params.ciPipelineId);
                let len = (ciNode && ciNode.downstreams ? ciNode && ciNode.downstreams.length : 0);
                return <CIPipeline match={props.match} history={props.history} location={props.location}
                    appName={this.state.appName}
                    connectCDPipelines={len}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={`${this.props.match.path}/external-ci/:ciPipelineId?`} render={(props) => {
                let ciNode = this.state.allCINodeMap.get(props.match.params.ciPipelineId);
                let len = (ciNode && ciNode.downstreams ? ciNode && ciNode.downstreams.length : 0);
                return <ExternalCIPipeline match={props.match} history={props.history} location={props.location}
                    appName={this.state.appName}
                    connectCDPipelines={len}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={`${this.props.match.path}/linked-ci/:ciPipelineId`} render={(props) => {
                let ciNode = this.state.allCINodeMap.get(props.match.params.ciPipelineId);
                let len = (ciNode && ciNode.downstreams ? ciNode && ciNode.downstreams.length : 0);
                return <LinkedCIPipelineView match={props.match} history={props.history} location={props.location}
                    appName={this.state.appName}
                    connectCDPipelines={len}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={`${this.props.match.path}/linked-ci`} render={(props) => {
                return <LinkedCIPipeline match={props.match} history={props.history} location={props.location}
                    appName={this.state.appName}
                    connectCDPipelines={0}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
        </Switch>
    }

    renderNewBuildPipelineButton(openAtTop: boolean) {
        let top = this.state.cIMenuPosition.top;
        if (openAtTop) {
            top = top - 382 + 100;
        }
        return <>
            <button type="button" className="cta no-decor flex mb-20"
                style={{ width: '170px' }}
                onClick={this.toggleCIMenu}>
                <img src={add} alt="add-worflow" className="icon-dim-18 mr-5" />New Build Pipeline
            </button>
            <PipelineSelect workflowId={0}
                showMenu={this.state.showCIMenu}
                addCIPipeline={this.addCIPipeline}
                toggleCIMenu={this.toggleCIMenu}
                styles={{
                    left: `${this.state.cIMenuPosition.left}px`,
                    top: `${top}px`,
                }}
            />
        </>
    }

    renderEmptyState() {
        return <div className="create-here">
            <img src={emptyWorkflow} alt="create-workflow" height="200" />
            <h1 className="form__title form__title--workflow-editor">Workflows</h1>
            <p className="form__subtitle form__subtitle--workflow-editor">
                Workflows consist of pipelines from build to deployment stages of an application. <br></br>
                <a className="learn-more__href" href="" target="blank" rel="noreferrer noopener">Learn about creating workflows</a>
            </p>
            {this.renderNewBuildPipelineButton(true)}
        </div>
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return <div className="br-4 bw-1 er-2 pt-10 pb-10 pl-16 pr-16 bcr-1 mb-16 flex left">
                <Error className="icon-dim-20 mr-8" />
                <div className="cn-9 fs-13">Host url is not configured or is incorrect. Reach out to your DevOps team (super-admin) to &nbsp;
                <NavLink className="hosturl__review" to={URLS.GLOBAL_CONFIG_HOST_URL}>Review and update</NavLink>
                </div>
            </div>
        }
    }

    renderWorkflows() {
        return this.state.workflows.map((wf) => {
            return <Workflow id={wf.id}
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
                isGitOpsConfigAvailable={this.state.isGitOpsConfigAvailable}
                handleCDSelect={this.handleCDSelect}
                handleCISelect={this.handleCISelect}
                openEditWorkflow={this.openEditWorkflow}
                showDeleteDialog={this.showDeleteDialog}
                addCIPipeline={this.addCIPipeline}
            />
        })
    }

    render() {
        if (this.props.configStatus === AppConfigStatus.LOADING || this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="loading-wrapper">
                <ErrorScreenManager code={this.state.code} />
            </div>
        }
        else if (this.state.view === ViewType.FORM && this.props.configStatus >= AppConfigStatus.LOADING && !this.state.workflows.length) {
            return <>
                {this.renderRouter()}
                <div className="mt-16 ml-20 mr-20 mb-16" >
                    {this.renderHostErrorMessage()}
                </div>
                {this.renderEmptyState()}
            </>
        }
        else {
            return <div className="workflow-editor">
                <h1 className="form__title form__title--artifacts">Workflow Editor</h1>
                <p>Workflow consist of pipelines from buid to deployment stages of an application.&nbsp;
                    <a className="learn-more__href" href={DOCUMENTATION.APP_CREATE_WORKFLOW} target="blank" rel="noreferrer noopener">Learn about creating workflows</a>
                </p>
                {this.renderRouter()}
                {this.renderHostErrorMessage()}
                {this.renderNewBuildPipelineButton(false)}
                {this.renderWorkflows()}
                {this.renderDeleteDialog()}
            </div>
        }
    }
}

export default withRouter(WorkflowEdit)