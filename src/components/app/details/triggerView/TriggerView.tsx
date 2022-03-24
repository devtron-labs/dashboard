import React, { Component, createContext } from 'react';
import { getCDMaterialList, getRollbackMaterialList, triggerCDNode, getCIMaterialList, triggerCINode, getWorkflowStatus, refreshGitMaterial, CDModalTab } from '../../service';
import { ServerErrors } from '../../../../modals/commonTypes';
import { ErrorScreenManager, Progressing, showError } from '../../../common';
import { getTriggerWorkflows } from './workflow.service';
import { Workflow } from './workflow/Workflow';
import { NodeAttr, TriggerViewProps, TriggerViewState, CDMdalTabType } from './types';
import { CIMaterial } from './ciMaterial';
import { CDMaterial } from './cdMaterial';
import { URLS, ViewType, SourceTypeMap } from '../../../../config';
import { AppNotConfigured } from '../appDetails/AppDetails';
import { toast } from 'react-toastify';
import ReactGA from 'react-ga';
import { withRouter, NavLink } from 'react-router-dom';
import { getLastExecutionByArtifactAppEnv } from '../../../../services/service';
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg';
import { getHostURLConfiguration } from '../../../../services/service';
import { getCIWebhookRes } from './ciWebhook.service'

export const TriggerViewContext = createContext({
    invalidateCache: false,
    refreshMaterial: (ciNodeId: number, pipelineName: string, materialId: number) => { },
    onClickTriggerCINode: () => { },
    onClickTriggerCDNode: (nodeType: 'PRECD' | 'CD' | 'POSTCD') => { },
    onClickCIMaterial: (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) => { },
    onClickCDMaterial: (cdNodeId, nodeType: 'PRECD' | 'CD' | 'POSTCD') => { },
    onClickRollbackMaterial: (cdNodeId) => { },
    closeCIModal: () => { },
    selectCommit: (materialId: string, hash: string) => { },
    selectMaterial: (materialId) => { },
    toggleChanges: (materialId: string, hash: string) => { },
    toggleInvalidateCache: () => { },
});

const TIME_STAMP_ORDER = {
    DESCENDING: "DESC",
    ASCENDING: "ASC"
}

class TriggerView extends Component<TriggerViewProps, TriggerViewState> {
    timerRef;

    constructor(props: TriggerViewProps) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            workflows: [],
            cdNodeId: 0,
            ciNodeId: 0,
            workflowId: 0,
            nodeType: null,
            ciPipelineName: "",
            materialType: "",
            showCDModal: false,
            showCIModal: false,
            isLoading: false,
            invalidateCache: false,
            hostURLConfig: undefined,
            showWebhookModal: false,
            webhookPayloads: undefined,
            isWebhookPayloadLoading: false,
            webhhookTimeStampOrder: "DESC"
        }
        this.refreshMaterial = this.refreshMaterial.bind(this);
        this.onClickCIMaterial = this.onClickCIMaterial.bind(this);
        this.onClickCDMaterial = this.onClickCDMaterial.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.toggleInvalidateCache = this.toggleInvalidateCache.bind(this);
    }

    componentWillUnmount() {
        clearInterval(this.timerRef);
    }

    componentDidMount() {
        this.getHostURLConfig();
        getTriggerWorkflows(this.props.match.params.appId).then((result) => {
            let wf = result.workflows || [];
            this.setState({ workflows: wf, view: ViewType.FORM }, () => {
                this.getWorkflowStatus();
                this.timerRef = setInterval(() => {
                    this.getWorkflowStatus();
                }, 30000)
            })
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code, view: ViewType.ERROR });
        })
    }

    getHostURLConfig() {
        getHostURLConfiguration().then((response) => {
            this.setState({ hostURLConfig: response.result, })
        }).catch((error) => {

        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.appId !== prevProps.match.params.appId) {
            getTriggerWorkflows(this.props.match.params.appId).then((result) => {
                let wf = result.workflows || [];
                this.setState({ workflows: wf }, () => {
                    this.getWorkflowStatus();
                    this.timerRef = setInterval(() => {
                        this.getWorkflowStatus();
                    }, 30000)
                })
            }).catch((errors: ServerErrors) => {
                showError(errors);
                this.setState({ code: errors.code });
            })
        }
    }
    //NOTE: GIT MATERIAL ID
    refreshMaterial(ciNodeId: number, pipelineName: string, gitMaterialId: number) {
        let { workflows } = { ...this.state };
        workflows = workflows.map((wf) => {
            wf.nodes = wf.nodes.map((node) => {
                if (node.id === ciNodeId.toString() && node.type === 'CI') {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        material.isMaterialLoading = (material.gitMaterialId === gitMaterialId) ? true : material.isMaterialLoading;
                        return material;

                    })
                    return node;
                }
                return node;
            })
            return wf;
        })
        this.setState({ workflows });
        refreshGitMaterial(gitMaterialId.toString()).then((response) => {
            this.onClickCIMaterial(ciNodeId.toString(), pipelineName, true);
        }).catch((error: ServerErrors) => {
            showError(error);
        })
    }

    preventBodyScroll(lock) {
        if (lock) {
            document.body.style.overflowY = 'hidden';
            document.body.style.height = '100vh';
            document.documentElement.style.overflow = 'initial';
        }
        else {
            document.body.style.overflowY = null;
            document.body.style.height = null;
            document.documentElement.style.overflow = null;
        }
    }
    getWorkflowStatus() {
        getWorkflowStatus(this.props.match.params.appId).then((response) => {
            let ciMap = {};
            let cdMap = {};
            let preCDMap = {};
            let postCDMap = {};
            let allCIs = response?.result.ciWorkflowStatus || [];
            let allCDs = response?.result.cdWorkflowStatus || [];
            //Create maps from Array
            if (allCIs.length) {
                allCIs.forEach((pipeline) => {
                    ciMap[pipeline.ciPipelineId] = pipeline.ciStatus;
                })
            }
            if (allCDs.length) {
                allCDs.forEach((pipeline) => {
                    if (pipeline.pre_status) preCDMap[pipeline.pipeline_id] = pipeline.pre_status;
                    if (pipeline.post_status) postCDMap[pipeline.pipeline_id] = pipeline.post_status;
                    if (pipeline.deploy_status) cdMap[pipeline.pipeline_id] = pipeline.deploy_status;
                })
            }
            //Update Workflow using maps
            let { workflows } = { ...this.state };
            workflows = workflows.map((wf) => {
                wf.nodes = wf.nodes.map((node) => {
                    switch (node.type) {
                        case 'CI': node['status'] = ciMap[node.id]; break;
                        case 'PRECD': node['status'] = preCDMap[node.id]; break;
                        case 'POSTCD': node['status'] = postCDMap[node.id]; break;
                        case 'CD': node['status'] = cdMap[node.id]; break
                    }
                    return node;
                })
                return wf;
            })
            this.setState({ workflows });

        }).catch((errors: ServerErrors) => {
            showError(errors);
        })
    }

    onClickCIMaterial(ciNodeId: string, ciPipelineName: string, preserveMaterialSelection: boolean) {
        ReactGA.event({
            category: 'Trigger View',
            action: 'Select Material Clicked'
        })
        let params = {
            appId: this.props.match.params.appId,
            pipelineId: ciNodeId
        }
        getCIMaterialList(params).then((response) => {
            let state = { ...this.state };
            state.code = response.code;
            state.ciNodeId = + ciNodeId;
            let workflowId;
            let workflows = this.state.workflows.map((workflow) => {
                workflow.nodes.map((node) => {
                    if (node.type === 'CI' && +node.id == state.ciNodeId) {
                        workflowId = workflow.id;
                        if (preserveMaterialSelection) {
                            let selectMaterial = node.inputMaterialList.find((mat) => mat.isSelected);
                            node.inputMaterialList = response.result.map((material) => {
                                return {
                                    ...material,
                                    isSelected: selectMaterial.id === material.id
                                }
                            })
                        }
                        else node.inputMaterialList = response.result;
                        return node;
                    }
                    else return node;
                })
                return workflow;
            })

            this.setState({
                workflows: workflows,
                ciNodeId: +ciNodeId,
                ciPipelineName: ciPipelineName,
                materialType: 'inputMaterialList',
                showCIModal: true,
                workflowId: workflowId,
            }, () => {
                this.getWorkflowStatus();
                this.preventBodyScroll(true);
            });
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code });
        })
    }

    onClickCDMaterial(cdNodeId, nodeType: 'PRECD' | 'CD' | 'POSTCD') {
        ReactGA.event({
            category: 'Trigger View',
            action: 'Select Image Clicked'
        })
        getCDMaterialList(cdNodeId, nodeType).then((data) => {
            let workflows = this.state.workflows.map((workflow) => {
                let nodes = workflow.nodes.map((node) => {
                    if (cdNodeId == node.id && node.type === nodeType) {
                        node['inputMaterialList'] = data;
                    }
                    return node;
                })
                workflow.nodes = nodes;
                return workflow;
            })
            this.setState({
                workflows,
                materialType: 'inputMaterialList',
                cdNodeId: cdNodeId,
                nodeType,
                showCDModal: true,
                isLoading: false,
            });
            this.preventBodyScroll(true);
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code });
        })
    }

    onClickRollbackMaterial = (cdNodeId) => {
        ReactGA.event({
            category: 'Trigger View',
            action: 'Select Rollback Material Clicked'
        })
        getRollbackMaterialList(cdNodeId).then((response) => {
            let workflows = this.state.workflows.map((workflow) => {
                let nodes = workflow.nodes.map((node) => {
                    if (node.type === 'CD' && +node.id == cdNodeId) {
                        node.rollbackMaterialList = response.result;
                    };
                    return node;
                })
                workflow.nodes = nodes;
                return workflow;
            })
            this.setState({
                workflows: workflows,
                materialType: 'rollbackMaterialList',
                cdNodeId: cdNodeId,
                nodeType: 'CD',
                showCDModal: true,
                isLoading: false
            }, () => {
                this.preventBodyScroll(true);
                this.getWorkflowStatus();
            });
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code });
        })
    }

    // stageType'PRECD' | 'CD' | 'POSTCD'
    onClickTriggerCDNode = (nodeType: string): void => {
        ReactGA.event({
            category: 'Trigger View',
            action: `${nodeType} Triggered`
        })
        this.setState({ isLoading: true })
        let appId = this.props.match.params.appId;
        let ciArtifact;
        let node;
        for (let i = 0; i < this.state.workflows.length; i++) {
            let workflow = this.state.workflows[i];
            node = workflow.nodes.find(nd => +nd.id == this.state.cdNodeId && nd.type == nodeType);
            if (node) break
        }
        let pipelineId = node.id;
        let key = this.state.materialType;
        ciArtifact = node[key].find(artifact => artifact.isSelected == true);
        if (appId && pipelineId && ciArtifact.id) {
            triggerCDNode(pipelineId, ciArtifact.id, appId, nodeType).then((response: any) => {
                if (response.result) {
                    let msg = (key == 'rollbackMaterialList') ? "Rollback Initiated" : "Deployment Initiated";
                    toast.success(msg);
                    this.setState({
                        code: response.code,
                        showCDModal: false,
                        isLoading: false,
                    }, () => {
                        this.preventBodyScroll(false);
                        this.getWorkflowStatus();
                    })
                }
            }).catch((errors: ServerErrors) => {
                showError(errors);
                this.setState({ code: errors.code, isLoading: false });
            })
        }
        else {
            let message = appId ? '' : 'app id missing ';
            message += pipelineId ? '' : 'pipeline id missing ';
            message += ciArtifact.id ? '' : 'Artifact id missing ';
            toast.error(message);
        }
    }

    onClickTriggerCINode = () => {
        ReactGA.event({
            category: 'Trigger View',
            action: 'CI Triggered'
        })
        this.setState({ isLoading: true })
        let node;
        for (let i = 0; i < this.state.workflows.length; i++) {
            node = this.state.workflows[i].nodes.find((node) => {
                return (node.type === 'CI' && +node.id == this.state.ciNodeId);
            })
            if (node) break;
        }

        let ciPipelineMaterials = [];
        for (let i = 0; i < node.inputMaterialList.length; i++) {
            if (node.inputMaterialList[i]) {
                let history = node.inputMaterialList[i].history.filter(hstry => hstry.isSelected);
                if (!history.length) history.push(node.inputMaterialList[i].history[0]);
                history.map((element) => {
                    let historyItem = {
                        Id: node.inputMaterialList[i].id,
                        GitCommit: {
                            Commit: element.commit,
                        }
                    }
                    if (!element.commit) {
                        historyItem.GitCommit['WebhookData'] = {
                            id: element.webhookData.id
                        }
                    }
                    return ciPipelineMaterials.push(historyItem);
                })
            }
        }
        let payload = {
            pipelineId: +this.state.ciNodeId,
            ciPipelineMaterials: ciPipelineMaterials,
            invalidateCache: this.state.invalidateCache,
        }

        triggerCINode(payload).then((response: any) => {
            if (response.result) {
                toast.success("Pipeline Triggered");
                let state = { ...this.state };
                state.code = response.code;
                state.showCIModal = false;
                state.isLoading = false;
                state.invalidateCache = false;
                this.setState(state, () => {
                    this.preventBodyScroll(false);
                    this.getWorkflowStatus();
                });
            }
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code, isLoading: false });
        })
    }

    selectCommit = (materialId: string, hash: string): void => {
        let workflows = this.state.workflows.map((workflow) => {
            let nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
                    node.inputMaterialList.map((material) => {
                        if (material.id == materialId && material.isSelected) {
                            material.history.map((hist) => {
                                if (material.type == SourceTypeMap.WEBHOOK) {
                                    hist.isSelected = hist.webhookData && hist.webhookData.id && hash == hist.webhookData.id;
                                } else {
                                    hist.isSelected = (hash == hist.commit)
                                }
                            })
                        }
                    })
                    return node;
                }
                return node;
            })
            workflow.nodes = nodes;
            return workflow;
        })
        this.setState({ workflows });
    }

    selectMaterial = (materialId): void => {
        let workflows = this.state.workflows.map((workflow) => {
            let nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
                    node.inputMaterialList = node.inputMaterialList.map((material) => {
                        return {
                            ...material,
                            isSelected: material.id == materialId
                        }
                    })
                }
                return node;
            })
            workflow.nodes = nodes;
            return workflow;
        })
        this.setState({ workflows });
    }

    selectImage = (index: number, materialType: string): void => {
        let workflows = this.state.workflows.map((workflow) => {
            let nodes = workflow.nodes.map((node) => {
                if (this.state.cdNodeId == +node.id && node.type === this.state.nodeType) {
                    let artifacts = node[materialType].map((artifact, i) => {
                        return {
                            ...artifact,
                            isSelected: (i === index)
                        }
                    })
                    node[materialType] = artifacts;
                }
                return node;
            })
            workflow.nodes = nodes;
            return workflow;
        })
        this.setState({ workflows });
    }

    toggleChanges = (materialId: string, hash: string): void => {
        let workflows = this.state.workflows.map((workflow) => {
            let nodes = workflow.nodes.map((node) => {
                if (node.type === 'CI' && +node.id == this.state.ciNodeId) {
                    node.inputMaterialList.map((material) => {
                        if (material.id == materialId) {
                            material.history.map((hist) => {
                                if (hist.commit == hash) hist.showChanges = !hist.showChanges;
                            })
                        }
                    })
                }
                return node;
            })
            workflow.nodes = nodes;
            return workflow;
        })
        this.setState({ workflows });
    }

    toggleSourceInfo = (materialIndex: number): void => {
        let workflows = this.state.workflows.map((workflow) => {
            let nodes = workflow.nodes.map((node) => {
                if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                    node[this.state.materialType][materialIndex].showSourceInfo = !node[this.state.materialType][materialIndex].showSourceInfo;
                }
                return node;
            })
            workflow.nodes = nodes;
            return workflow;
        })
        this.setState({ workflows });
    }

    toggleInvalidateCache() {
        this.setState({ invalidateCache: !this.state.invalidateCache });
    }

    //TODO: refactor
    changeTab(materialIndex, artifactId: number, tab: CDMdalTabType): void {
        if (tab === CDModalTab.Changes) {
            let workflows = this.state.workflows.map((workflow) => {
                let nodes = workflow.nodes.map((node) => {
                    if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                        node[this.state.materialType][materialIndex].tab = tab;
                    }
                    return node;
                })
                workflow.nodes = nodes;
                return workflow;
            })
            this.setState({ workflows });
            return;
        }

        let targetNode;
        for (let i = 0; i < this.state.workflows.length; i++) {
            targetNode = this.state.workflows[i].nodes.find(node => +node.id == this.state.cdNodeId && node.type === this.state.nodeType)
            if (targetNode) break;
        }

        if (targetNode || targetNode.scanned || targetNode.scanEnabled) {
            getLastExecutionByArtifactAppEnv(artifactId, this.props.match.params.appId, targetNode.environmentId).then((response) => {
                let workflows = this.state.workflows.map((workflow) => {
                    let nodes = workflow.nodes.map((node) => {
                        if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                            node[this.state.materialType][materialIndex].tab = tab;
                            node[this.state.materialType][materialIndex]['vulnerabilities'] = response.result.vulnerabilities;
                            node[this.state.materialType][materialIndex]['lastExecution'] = response.result.lastExecution;
                            node[this.state.materialType][materialIndex]['vulnerabilitiesLoading'] = false
                        }
                        return node;
                    })
                    workflow.nodes = nodes;
                    return workflow;
                })
                this.setState({ workflows })
            }).catch((error) => {
                showError(error);
                let workflows = this.state.workflows.map((workflow) => {
                    let nodes = workflow.nodes.map((node) => {
                        if (+node.id == this.state.cdNodeId && node.type === this.state.nodeType) {
                            node[this.state.materialType][materialIndex].tab = tab;
                            node[this.state.materialType][materialIndex]['vulnerabilitiesLoading'] = false
                        }
                        return node;
                    })
                    workflow.nodes = nodes;
                    return workflow;
                })
                this.setState({ workflows })
            })
        }
    }

    closeCIModal = (): void => {
        this.preventBodyScroll(false);
        this.setState({ showCIModal: false })
    }

    closeCDModal = (): void => {
        this.preventBodyScroll(false);
        this.setState({ showCDModal: false })
    }

    hideWebhookModal = () => {
        this.setState({
            showWebhookModal: false
        })
    }

    onClickWebhookTimeStamp = () => {
        if (this.state.webhhookTimeStampOrder === "DESC") {
            this.setState({ webhhookTimeStampOrder: TIME_STAMP_ORDER.ASCENDING })
        }
        if(this.state.webhhookTimeStampOrder === "ASC"){
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

    renderCIMaterial = () => {
        if (this.state.ciNodeId && this.state.showCIModal) {
            let nd: NodeAttr;
            for (let i = 0; i < this.state.workflows.length; i++) {
                nd = this.state.workflows[i].nodes.find(node => +node.id == this.state.ciNodeId && node.type === 'CI');
                if (nd) break;
            }
            let material = nd[this.state.materialType] || [];
            return <CIMaterial
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
            />
        }
    }

    renderCDMaterial() {
        if (this.state.showCDModal && this.state.cdNodeId) {
            let node: NodeAttr;
            for (let i = 0; i < this.state.workflows.length; i++) {
                node = this.state.workflows[i].nodes.find((el) => {
                    return (+el.id == this.state.cdNodeId && el.type == this.state.nodeType);
                })
                if (node) break;
            }
            let material = node[this.state.materialType] || [];
            return <CDMaterial
                stageType={this.state.nodeType}
                material={material}
                materialType={this.state.materialType}
                envName={node.environmentName}
                isLoading={this.state.isLoading}
                changeTab={this.changeTab}
                triggerDeploy={this.onClickTriggerCDNode}
                closeCDModal={this.closeCDModal}
                selectImage={this.selectImage}
                toggleSourceInfo={this.toggleSourceInfo}
                parentPipelineId={node.parentPipelineId}
                parentPipelineType={node.parentPipelineType}
                parentEnvironmentName={node.parentEnvironmentName}
            />
        }
    }

    renderWorkflow() {
        return <React.Fragment>
            {this.state.workflows.map((workflow) => {
                return <Workflow key={workflow.id}
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
                />
            })}
        </React.Fragment>
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

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        }
        else if (!this.state.workflows.length) {
            return <div>
                <AppNotConfigured />
            </div>
        }
        return <div className="svg-wrapper-trigger">
            <TriggerViewContext.Provider value={{
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
            }} >
                {this.renderHostErrorMessage()}
                {this.renderWorkflow()}
                {this.renderCIMaterial()}
                {this.renderCDMaterial()}
            </TriggerViewContext.Provider>
        </div>
    }
}

export default withRouter(TriggerView)