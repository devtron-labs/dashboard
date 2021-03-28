import React, { Component } from 'react';
import { saveCIPipeline, deleteCIPipeline, getCIPipelineParsed, getSourceConfigParsed, getCIPipelineNameSuggestion } from './ciPipeline.service';
import { TriggerType, ViewType, TagOptions, SourceTypeReverseMap, SourceTypeMap } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { CIPipelineProps, CIPipelineState, MaterialType } from './types';
import { VisibleModal, Progressing, showError } from '../common';
import { toast } from 'react-toastify';
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import { ValidationRules } from './validationRules';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { AdvancedCIPipeline } from './AdvancedCIPipeline';
import './ciPipeline.css';

export default class CIPipeline extends Component<CIPipelineProps, CIPipelineState> {
    validationRules;
    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            showError: false,
            form: {
                name: "",
                args: [{ key: "", value: "" }],
                materials: [],
                triggerType: TriggerType.Auto,
                beforeDockerBuildScripts: [],
                afterDockerBuildScripts: [],
                scanEnabled: false,
            },
            ciPipeline: {
                active: true,
                ciMaterial: [],
                dockerArgs: {},
                //required for External CI Pipeline only
                externalCiConfig: {},
                id: 0,
                isExternal: false,
                isManual: false,
                name: "",
                linkedCount: 0,
                scanEnabled: false,
            },
            gitMaterials: [],
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
            showPreBuild: false,
            showDocker: false,
            showPostBuild: false,
        }
        this.validationRules = new ValidationRules();
        this.handlePipelineName = this.handlePipelineName.bind(this);
        this.handleTriggerChange = this.handleTriggerChange.bind(this);
        this.savePipeline = this.savePipeline.bind(this);
        this.selectSourceType = this.selectSourceType.bind(this);
        this.deletePipeline = this.deletePipeline.bind(this);
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this);
        this.handleScanToggle = this.handleScanToggle.bind(this);
        this.handleDocker = this.handleDocker.bind(this);
        // this.handleShowPostBuild = this.handleShowPostBuild.bind(this);
        this.handlePreBuild = this.handlePreBuild.bind(this);
    }

    componentDidMount() {
        if (this.props.match.params.ciPipelineId) {
            getCIPipelineParsed(this.props.match.params.appId, this.props.match.params.ciPipelineId).then((response) => {
                this.setState({ ...response, loadingData: false });
            }).catch((error: ServerErrors) => {
                showError(error);
                this.setState({ loadingData: false });
            })
        }
        else {
            getCIPipelineNameSuggestion(this.props.match.params.appId).then((response) => {
                console.log(response);
            }).catch((error) => {

            })
            getSourceConfigParsed(this.props.match.params.appId).then((response) => {
                this.setState({
                    view: ViewType.FORM,
                    form: {
                        ...this.state.form,
                        materials: response.result.materials
                    },
                    gitMaterials: response.result.gitMaterials,
                    loadingData: false,
                });
            })
        }
    }
    handleDocker() {
        this.setState({
            view: ViewType.FORM,
            showDocker: !this.state.showDocker
        })
    }

    handlePostBuild() {
        this.setState({
            view: ViewType.FORM,
            showPostBuild: !this.state.showPostBuild
        })
    }

    handlePreBuild() {
        this.setState({
            view: ViewType.FORM,
            showPreBuild: !this.state.showPreBuild
        })
    }

    handleDockerArgChange(event, index: number, key: 'key' | 'value') {
        let { form } = { ...this.state };
        form.args[index][key] = event.target.value;
        this.setState({ form });
    }

    handleTriggerChange(event): void {
        let { form } = { ...this.state };
        form.triggerType = event.target.value;
        this.setState({ form });
    }

    handlePipelineName(event): void {
        let state = { ...this.state };
        state.form.name = event.target.value;
        this.setState(state);
    }

    addDockerArg(): void {
        let state = { ...this.state };
        state.form.args.push({ key: "", value: "" });
        this.setState(state);
    }

    selectSourceType(event, gitMaterialId: number): void {
        let { form } = { ...this.state };
        let allMaterials = this.state.form.materials.map((mat) => {
            return {
                ...mat,
                type: (gitMaterialId == mat.gitMaterialId) ? event.target.value : mat.type,
            }
        })
        form.materials = allMaterials;
        this.setState({ form });
    }

    handleSourceChange(event, gitMaterialId: number): void {
        let { form } = { ...this.state };
        let allMaterials = this.state.form.materials.map((mat) => {
            if (mat.gitMaterialId == gitMaterialId) {
                return {
                    ...mat,
                    value: event.target.value
                }
            }
            else return mat;
        })
        form.materials = allMaterials;
        this.setState({ form });
    }

    selectMaterial(material: MaterialType): void {
        let allMaterials = this.state.form.materials.map((mat) => {
            if (mat.gitMaterialId == material.gitMaterialId) {
                return {
                    ...mat,
                    isSelected: !mat.isSelected,
                }
            }
            else return mat;
        })
        let { form } = { ...this.state };
        form.materials = allMaterials;
        this.setState({ form });
    }

    //invoked on Done, Discard, collapse icon
    toggleCollapse(stageId, stageIndex: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        let stage = this.state.form[key].find(s => s.id == stageId);
        if (stage.name.length && stage.script.length) {
            let { form } = { ...this.state };
            let stages = this.state.form[key];
            stages[stageIndex].isCollapsed = !stages[stageIndex].isCollapsed;
            form[key] = stages;
            this.setState({ form });
        }
        else {
            toast.error("Fill the required fields or cancel changes");
        }
    }

    addEmptyStage(stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        let { form } = this.state
        let { length, [length - 1]: last } = form[stageType]
        let stage = {
            index: last ? last.index + 1 : 1,
            name: "",
            outputLocation: "",
            script: "",
            isCollapsed: false,
            id: 0,
        }
        form[stageType].push(stage);
        this.setState({ form });
    }

    deleteStage = (stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) => {
        let stages = this.state.form[key]
        stages.splice(stageIndex, 1)
        this.setState(form => ({ ...form, [key]: stages }))
    }

    discardChanges(stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) {
        if (stageId) { //saved stage
            let stageData = this.state.ciPipeline[key].find(stage => stage.id == stageId);
            let { form } = { ...this.state };
            let stages = this.state.form[key].map((stage) => {
                if (stage.id == stageId) return {
                    id: stageData.id,
                    outputLocation: stageData.outputLocation,
                    script: stageData.script,
                    name: stageData.name,
                    isCollapsed: true,
                    index: stageData.index
                };
                else return stage;
            })
            form[key] = stages;
            this.setState({ form });
        }
        else { //unsaved stage
            let stages = [];
            for (let i = 0; i < this.state.form[key].length; i++) {
                if (i == stageIndex) {
                }
                else {
                    stages.push(this.state.form[key][i]);
                }
            }
            let { form } = { ...this.state };
            form[key] = stages;
            this.setState({ form });
        }
    }

    checkUniqueness(): boolean {
        let list = this.state.form.beforeDockerBuildScripts.concat(this.state.form.afterDockerBuildScripts);
        let stageNameList = list.map((l) => {
            return l.name;
        })
        let set = new Set();
        for (let i = 0; i < stageNameList.length; i++) {
            if (set.has(stageNameList[i])) return false
            else set.add(stageNameList[i])
        }
        return true;
    }

    handleChange(event, stageId: number, stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number, key: 'name' | 'outputLocation' | 'script') {
        let stages = this.state.form[stageType];
        stages[stageIndex][key] = event.target.value;
        this.setState({ form: { ...this.state.form, [stageType]: stages } });
    }

    handleScanToggle(): void {
        let state = { ...this.state };
        this.setState({
            form: {
                ...state.form,
                scanEnabled: !state.form.scanEnabled,
            },
        })
    }

    savePipeline() {
        let isUnique = this.checkUniqueness();
        if (!isUnique) {
            toast.error("All Stage names must be unique");
            return;
        }
        this.setState({ showError: true, loadingData: true });
        /*let errObj = this.validationRules.name(this.state.form.name);*/
        let self = this;
        let valid = this.state.form.materials.reduce((isValid, mat) => {
            isValid = isValid && self.validationRules.sourceValue(mat.value).isValid;
            return isValid;
        }, true);
        /*valid = valid && errObj.isValid;*/
        if (!valid) {
            this.setState({ loadingData: false })
            toast.error("Some Required Fields are missing");
            return;
        }
        let msg = this.state.ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created';
        saveCIPipeline(this.state.form, this.state.ciPipeline, this.state.gitMaterials, +this.props.match.params.appId, 0, false).then((response) => {
            if (response) {
                toast.success(msg);
                this.setState({ loadingData: false });
                this.props.close();
                this.props.getWorkflows();
            }
        }).catch((error: ServerErrors) => {
            showError(error)
            this.setState({ loadingData: false });
        })
    }

    deletePipeline() {
        deleteCIPipeline(this.state.form, this.state.ciPipeline, this.state.gitMaterials, Number(this.props.match.params.appId), Number(this.props.match.params.workflowId), false).then((response) => {
            if (response) {
                toast.success("Pipeline Deleted");
                this.setState({ loadingData: false });
                this.props.close();
                this.props.getWorkflows();
            }
        }).catch((error: ServerErrors) => {
            showError(error)
            this.setState({ loadingData: false });
        })
    }

    closeCIDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    removeDockerArgs(index: number) {
        let newArgs = [];
        for (let i = 0; i < this.state.form.args.length; i++) {
            if (index != i) newArgs.push(this.state.form.args[i]);
        }
        let { form } = { ...this.state };
        form.args = newArgs;
        this.setState({ form });
    }

    renderAdvanceCI() {
        return <AdvancedCIPipeline {...this.props}
            {...this.state}
            validationRules={this.validationRules}
            closeCIDeleteModal={this.closeCIDeleteModal}
            deletePipeline={this.deletePipeline}
            handlePreBuild={this.handlePreBuild}
            handlePotrBuild={this.handlePostBuild}
            addEmptyStage={this.addEmptyStage}
            toggleCollapse={this.toggleCollapse}
            deleteStage={this.deleteStage}
            handleChange={this.handleChange}
            discardChanges={this.discardChanges}
            handleTriggerChange={this.handleTriggerChange}
            handleDocker={this.handleDocker}
            addDockerArg={this.addDockerArg}
            handleDockerArgChange={this.handleDockerArgChange}
            removeDockerArgs={this.removeDockerArgs}
            handleScanToggle={this.handleScanToggle}
            handleSourceChange={this.handleSourceChange}
            handlePipelineName={this.handlePipelineName}
            selectSourceType={this.selectSourceType}
        />
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else {
            return <VisibleModal className="" >
                <div className="modal__body modal__body--ci br-0 modal__body--p-0 ">
                    <div className="p-20 flex flex-justify">
                        <h2 className="fs-16 fw-6 lh-1-43 m-0">Create build pipeline</h2>
                        <button type="button" className="transparent icon-dim-24" onClick={this.props.close}>
                            <Close className="" />
                        </button>
                    </div>
                    <hr className="divider m-0" />
                    {this.renderAdvanceCI()}
                </div>
            </VisibleModal>
        }
    }
}
