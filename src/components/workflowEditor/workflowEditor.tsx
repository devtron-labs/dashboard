import React, { Component, createContext } from 'react';
import { WorkflowEditProps, WorkflowEditState } from './types';
import { Route, Switch, withRouter } from 'react-router-dom';
import { URLS, AppConfigStatus, ViewType } from '../../config';
import { Progressing, showError, ErrorScreenManager } from '../common';
import { toast } from 'react-toastify';
import { Workflow } from './Workflow';
import { getCreateWorkflows } from '../app/details/triggerView/workflow.service';
import { deleteWorkflow } from './service';
import { DeleteWorkflow } from './modals/deleteWorkflow';
import AddWorkflow from './modals/CreateWorkflow';
import add from '../../assets/icons/misc/addWhite.svg';
import CIPipeline from '../ciPipeline/CIPipeline';
import CDPipeline from '../cdPipeline/CDPipeline';
import emptyWorkflow from '../../assets/img/ic-empty-workflow@3x.png';
import ExternalCIPipeline from '../ciPipeline/ExternalCIPipeline';
import LinkedCIPipeline from '../ciPipeline/LinkedCIPipelineEdit';
import LinkedCIPipelineView from '../ciPipeline/LinkedCIPipelineView';
import { Link } from 'react-router-dom';
import { isGitopsConfigured } from '../../services/service';
import './workflowEditor.css';

export const WorkflowEditorContext = createContext({
    handleCISelect: (workflowId: string, type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => { },
    handleCDSelect: (workflowId: string, cdPipelineId: string) => { },
});


class WorkflowEdit extends Component<WorkflowEditProps, WorkflowEditState>  {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            workflows: [],
            appName: "",
            showDeleteDialog: false,
            workflowId: 0,
            isGitOpsConfigAvailable: false,
        }
    }

    componentDidMount() {
        this.getWorkflows();
    }

    getWorkflows = () => {
        isGitopsConfigured().then((response) => {
            let isGitOpsConfigAvailable = response.result && response.result.exists;
            this.setState({ isGitOpsConfigAvailable });
        })
        getCreateWorkflows(this.props.match.params.appId).then((result) => {
            this.setState({ appName: result.appName, workflows: result.workflows, view: ViewType.FORM });
        }).catch((errors) => {
            showError(errors);
            this.setState({ view: ViewType.ERROR, code: errors.code });
        })
    }

    showDeleteDialog = (workflowId) => {
        this.setState({ workflowId, showDeleteDialog: true })
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

    handleCISelect = (workflowId, type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => {
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

    handleCDSelect = (workflowId, ciPipelineId) => {
        const LINK = `${URLS.APP}/${this.props.match.params.appId}/edit/workflow/${workflowId}/ci-pipeline/${ciPipelineId}/cd-pipeline`;
        this.props.history.push(LINK);
    }

    openCreateWorkflow = (): string => {
        return `${this.props.match.url}/edit`
    }

    openEditWorkflow = (event, workflowId: number): string => {
        return `${this.props.match.url}/${workflowId}/edit`
    }

    closeAddWorkflow = () => {
        this.props.history.push(`${URLS.APP}/${this.props.match.params.appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`);
        this.props.getWorkflows();
    }

    closePipeline = () => {
        const LINK = `${URLS.APP}/${this.props.match.params.appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`;
        this.props.history.push(LINK);
        //update isCipipeline in AppCompose
        if (!this.props.isCiPipeline) this.props.respondOnSuccess();
    }

    renderDeleteDialog = () => {
        let wf = this.state.workflows.find(wf => wf.id === this.state.workflowId);
        if (this.state.showDeleteDialog) {
            return <DeleteWorkflow workflowName={wf ? wf.name : ""}
                closeDelete={() => this.setState({ showDeleteDialog: false })}
                description={`Are you sure you want to delete this workflow from '${this.state.appName}'`}
                deleteWorkflow={this.deleteWorkflow} />
        }
    }
    //TODO: dynamic routes for ci-pipeline
    renderRouter() {
        return <Switch>
            <Route path={`${this.props.match.path}/edit`} render={(props) => {
                return <AddWorkflow match={props.match} history={props.history} location={props.location} name={this.state.appName} onClose={this.closeAddWorkflow}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route
                path={[URLS.APP_EXTERNAL_CI_CONFIG, URLS.APP_LINKED_CI_CONFIG, URLS.APP_CI_CONFIG].map(pipeline => `${this.props.match.path}/${pipeline}/:ciPipelineId/cd-pipeline/:cdPipelineId?`)}
                render={(props) => {
                    return <CDPipeline appName={this.state.appName} match={props.match} history={props.history} location={props.location} close={this.closePipeline}
                        getWorkflows={this.getWorkflows} />
                }}
            />
            <Route path={`${this.props.match.path}/ci-pipeline/:ciPipelineId?`} render={(props) => {
                let workflowId = props.match.params.workflowId;
                let workflow = this.state.workflows.find(wf => workflowId == wf.id);
                let ciPipelineId = props.match.params.ciPipelineId;
                let ciNode = workflow.nodes.find(ci => ci.id === ciPipelineId);
                let len = (ciNode && ciNode.downstreams ? ciNode && ciNode.downstreams.length : 0);
                return <CIPipeline appName={this.state.appName} match={props.match} history={props.history} location={{ ...props.location }}
                    connectCDPipelines={len}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={`${this.props.match.path}/external-ci/:ciPipelineId?`} render={(props) => {
                let workflowId = props.match.params.workflowId;
                let workflow = this.state.workflows.find(wf => workflowId == wf.id);
                let ciPipelineId = props.match.params.ciPipelineId;
                let ciNode = workflow.nodes.find(ci => ci.id === ciPipelineId);
                let len = (ciNode && ciNode.downstreams ? ciNode && ciNode.downstreams.length : 0);
                return <ExternalCIPipeline appName={this.state.appName} match={props.match} history={props.history} location={{ ...props.location }}
                    connectCDPipelines={len}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={`${this.props.match.path}/linked-ci/:ciPipelineId`} render={(props) => {
                let workflowId = props.match.params.workflowId;
                let workflow = this.state.workflows.find(wf => workflowId == wf.id);
                let ciPipelineId = props.match.params.ciPipelineId;
                let ciNode = workflow.nodes.find(ci => ci.id === ciPipelineId);
                let len = (ciNode && ciNode.downstreams ? ciNode && ciNode.downstreams.length : 0);
                return <LinkedCIPipelineView appName={this.state.appName} match={props.match} history={props.history} location={{ ...props.location }}
                    connectCDPipelines={len}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
            <Route path={`${this.props.match.path}/linked-ci`} render={(props) => {
                return <LinkedCIPipeline appName={this.state.appName} match={props.match} history={props.history} location={props.location}
                    connectCDPipelines={0}
                    close={this.closePipeline}
                    getWorkflows={this.getWorkflows} />
            }} />
        </Switch>
    }

    renderEmptyState() {
        return <div className="create-here">
            <img src={emptyWorkflow} alt="create-workflow" height="200" />
            <h1 className="form__title form__title--workflow-editor">Workflows</h1>
            <p className="form__subtitle form__subtitle--workflow-editor">
                Workflows consist of pipelines from build to deployment stages of an application.&nbsp;
                <a className="learn-more__href" href="https://docs.devtron.ai/creating-application/workflow" target="blank" rel="noreferrer noopener">Learn about creating workflows</a>
            </p>
            <Link className="no-decor" to={this.openCreateWorkflow()}>
                <button type="button" className="cta">Create Workflow</button>
            </Link>
        </div>
    }

    renderWorkflows() {
        return <>
            {this.state.workflows.map((wf) => {
                return <Workflow id={wf.id}
                    key={wf.id}
                    name={wf.name}
                    startX={wf.startX}
                    startY={wf.startY}
                    width={wf.width}
                    height={wf.height}
                    nodes={wf.nodes}
                    handleCDSelect={this.handleCDSelect}
                    openEditWorkflow={this.openEditWorkflow}
                    showDeleteDialog={this.showDeleteDialog}
                    isGitOpsConfigAvailable={this.state.isGitOpsConfigAvailable}
                    history={this.props.history}
                    location={this.props.location}
                    match={this.props.match}
                />
            })}
        </>
    }

    render() {
        if (this.props.configStatus === AppConfigStatus.LOADING || this.state.view == ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        }
        else if (this.state.view === ViewType.FORM && this.props.configStatus >= AppConfigStatus.LOADING && !this.state.workflows.length) {
            return <WorkflowEditorContext.Provider value={{
                handleCISelect: this.handleCISelect,
                handleCDSelect: this.handleCDSelect,
            }}>
                {this.renderRouter()}
                {this.renderEmptyState()}
            </WorkflowEditorContext.Provider>
        }
        else return <WorkflowEditorContext.Provider value={{
            handleCISelect: this.handleCISelect,
            handleCDSelect: this.handleCDSelect,
        }}>
            <div className="workflow-editor">
                <h1 className="form__title form__title--artifacts">Workflow Editor</h1>
                <p>Workflow consist of pipelines from buid to deployment stages of an application.&nbsp;
                    <a className="learn-more__href" href="https://docs.devtron.ai/creating-application/workflow" target="blank" rel="noreferrer noopener">Learn about creating workflows</a>
                </p>
                {this.renderRouter()}
                <Link to={this.openCreateWorkflow()} className="cta mb-12 cta-with-img no-decor" style={{ width: '140px' }}>
                    <img src={add} alt="add-worflow" className="icon-dim-18" />New Workflow
                </Link>
                {this.renderWorkflows()}
                {this.renderDeleteDialog()}
            </div>
        </WorkflowEditorContext.Provider>
    }
}

export default withRouter(WorkflowEdit)