import React, { Component } from 'react'
import {
    saveCIPipeline,
    deleteCIPipeline,
    getInitDataWithCIPipeline,
    getInitData,
    createWebhookConditionList,
} from './ciPipeline.service'
import { TriggerType, ViewType, SourceTypeMap } from '../../config'
import { ServerErrors } from '../../modals/commonTypes'
import { CIPipelineProps, CIPipelineState } from './types'
import { VisibleModal, Progressing, ButtonWithLoader, ConditionalWrap, DeleteDialog, showError } from '../common'
import { toast } from 'react-toastify'
import { ValidationRules } from './validationRules'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { CIPipelineAdvanced } from './CIPipelineAdvanced'
import { SourceMaterials, WebhookCIProps } from './SourceMaterials'
import Tippy from '@tippyjs/react'
import './ciPipeline.css'

export default class CIPipeline extends Component<CIPipelineProps, CIPipelineState> {
    validationRules
    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            showError: false,
            form: {
                name: '',
                args: [{ key: '', value: '' }],
                materials: [],
                triggerType: TriggerType.Auto,
                beforeDockerBuildScripts: [],
                afterDockerBuildScripts: [],
                scanEnabled: false,
                gitHost: undefined,
                webhookEvents: [],
                ciPipelineSourceTypeOptions: [],
                webhookConditionList: [],
                ciPipelineEditable: true,
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
                name: '',
                linkedCount: 0,
                scanEnabled: false,
            },
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
            showPreBuild: false,
            showDocker: false,
            showPostBuild: false,
            isAdvanced: false,
        }
        this.validationRules = new ValidationRules()
        this.handlePipelineName = this.handlePipelineName.bind(this)
        this.addEmptyStage = this.addEmptyStage.bind(this)
        this.handleTriggerChange = this.handleTriggerChange.bind(this)
        this.savePipeline = this.savePipeline.bind(this)
        this.selectSourceType = this.selectSourceType.bind(this)
        this.deletePipeline = this.deletePipeline.bind(this)
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this)
        this.handleScanToggle = this.handleScanToggle.bind(this)
        this.handleDocker = this.handleDocker.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handlePreBuild = this.handlePreBuild.bind(this)
        this.handleDockerArgs = this.handleDockerArgs.bind(this)
        this.handlePostBuild = this.handlePostBuild.bind(this)
        this.discardChanges = this.discardChanges.bind(this)
        this.handleDockerArgChange = this.handleDockerArgChange.bind(this)
        this.addDockerArg = this.addDockerArg.bind(this)
        this.removeDockerArgs = this.removeDockerArgs.bind(this)
        this.handleSourceChange = this.handleSourceChange.bind(this)
        this.toggleCollapse = this.toggleCollapse.bind(this)
        this.toggleCIPipelineView = this.toggleCIPipelineView.bind(this)
        this.getSelectedWebhookEvent = this.getSelectedWebhookEvent.bind(this)
        this.addWebhookCondition = this.addWebhookCondition.bind(this)
        this.deleteWebhookCondition = this.deleteWebhookCondition.bind(this)
        this.onWebhookConditionSelectorChange = this.onWebhookConditionSelectorChange.bind(this)
        this.onWebhookConditionSelectorValueChange = this.onWebhookConditionSelectorValueChange.bind(this)
    }
    componentDidMount() {
        if (this.props.match.params.ciPipelineId) {
            getInitDataWithCIPipeline(this.props.match.params.appId, this.props.match.params.ciPipelineId, true)
                .then((response) => {
                    this.setState({ ...response, loadingData: false, isAdvanced: true })
                })
                .catch((error: ServerErrors) => {
                    showError(error)
                })
        } else {
            getInitData(this.props.match.params.appId, true)
                .then((response) => {
                    this.setState({
                        ...this.state,
                        ...response.result,
                        view: ViewType.FORM,
                    })
                })
                .catch((error: ServerErrors) => {
                    console.error(error)
                    showError(error)
                })
        }
    }

    toggleCIPipelineView(): void {
        this.setState({
            isAdvanced: !this.state.isAdvanced,
        })
    }

    handlePreBuild(): void {
        this.setState({
            showPreBuild: !this.state.showPreBuild,
        })
    }

    handleDockerArgs(): void {
        this.setState({
            showDockerArgs: !this.state.showDockerArgs,
        })
    }

    handlePostBuild(): void {
        this.setState({
            showPostBuild: !this.state.showPostBuild,
        })
    }

    handleDocker(): void {
        this.setState({
            showDocker: !this.state.showDocker,
        })
    }

    handleDockerArgChange(event, index: number, key: 'key' | 'value') {
        let { form } = { ...this.state }
        form.args[index][key] = event.target.value
        this.setState({ form })
    }

    handleTriggerChange(event): void {
        let { form } = { ...this.state }
        form.triggerType = event.target.value
        this.setState({ form })
    }

    handlePipelineName(event): void {
        let state = { ...this.state }
        state.form.name = event.target.value
        this.setState(state)
    }

    addDockerArg(): void {
        let state = { ...this.state }
        state.form.args.push({ key: '', value: '' })
        this.setState(state)
    }

    selectSourceType(selectedSource, gitMaterialId: number): void {
        let { form } = { ...this.state }

        // update source type in material
        let allMaterials = this.state.form.materials.map((mat) => {
            return {
                ...mat,
                type: gitMaterialId === mat.gitMaterialId ? selectedSource.value : mat.type,
                value: '',
            }
        })
        form.materials = allMaterials

        // update source type selected option in dropdown
        let _ciPipelineSourceTypeOptions = this.state.form.ciPipelineSourceTypeOptions.map((sourceTypeOption) => {
            return {
                ...sourceTypeOption,
                isSelected: sourceTypeOption.label === selectedSource.label,
            }
        })
        form.ciPipelineSourceTypeOptions = _ciPipelineSourceTypeOptions

        // if selected source is of type webhook, then set eventId in value, assume single git material, set condition list
        if (selectedSource.isWebhook) {
            let _material = form.materials[0]
            let _selectedWebhookEvent = form.webhookEvents.find((we) => we.name === selectedSource.label)
            let _condition = {}

            // create initial data with fix values
            if (_selectedWebhookEvent && _selectedWebhookEvent.selectors) {
                _selectedWebhookEvent.selectors.forEach((_selector) => {
                    if (_selector.fixValue) {
                        _condition[_selector.id] = _selector.fixValue
                    }
                })
            }

            _material.value = JSON.stringify({ eventId: _selectedWebhookEvent.id, condition: _condition })

            // update condition list
            form.webhookConditionList = createWebhookConditionList(_material.value)
        }

        this.setState({ form })
    }

    handleSourceChange(event, gitMaterialId: number): void {
        let { form } = { ...this.state }
        let allMaterials = this.state.form.materials.map((mat) => {
            if (mat.gitMaterialId == gitMaterialId) {
                return {
                    ...mat,
                    value: event.target.value,
                }
            } else return mat
        })
        form.materials = allMaterials
        this.setState({ form })
    }

    //invoked on Done, Discard, collapse icon
    toggleCollapse(stageId, stageIndex: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts'): void {
        let stage = this.state.form[key].find((s) => s.id == stageId)
        if (stage.name.length && stage.script.length) {
            let { form } = { ...this.state }
            let stages = this.state.form[key]
            stages[stageIndex].isCollapsed = !stages[stageIndex].isCollapsed
            form[key] = stages
            this.setState({ form })
        } else {
            toast.error('Fill the required fields or cancel changes')
        }
    }

    addEmptyStage(stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts'): void {
        let { form } = this.state
        let { length, [length - 1]: last } = form[stageType]
        let stage = {
            index: last ? last.index + 1 : 1,
            name: '',
            outputLocation: '',
            script: '',
            isCollapsed: false,
            id: 0,
        }
        form[stageType].push(stage)
        this.setState({ form })
    }

    deleteStage = (
        stageId: number,
        key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        stageIndex: number,
    ): void => {
        let stages = this.state.form[key]
        stages.splice(stageIndex, 1)
        this.setState((form) => ({ ...form, [key]: stages }))
    }

    discardChanges(stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) {
        if (stageId) {
            //saved stage
            let stageData = this.state.ciPipeline[key].find((stage) => stage.id == stageId)
            let { form } = { ...this.state }
            let stages = this.state.form[key].map((stage) => {
                if (stage.id == stageId)
                    return {
                        id: stageData.id,
                        outputLocation: stageData.outputLocation,
                        script: stageData.script,
                        name: stageData.name,
                        isCollapsed: true,
                        index: stageData.index,
                    }
                else return stage
            })
            form[key] = stages
            this.setState({ form })
        } else {
            //unsaved stage
            let stages = []
            for (let i = 0; i < this.state.form[key].length; i++) {
                if (i == stageIndex) {
                } else {
                    stages.push(this.state.form[key][i])
                }
            }
            let { form } = { ...this.state }
            form[key] = stages
            this.setState({ form })
        }
    }

    checkUniqueness(): boolean {
        let list = this.state.form.beforeDockerBuildScripts.concat(this.state.form.afterDockerBuildScripts)
        let stageNameList = list.map((l) => {
            l.script = l.script.replace(/\r\n/g, '\n')
            return l.name
        })
        let set = new Set()
        for (let i = 0; i < stageNameList.length; i++) {
            if (set.has(stageNameList[i])) return false
            else set.add(stageNameList[i])
        }
        return true
    }

    handleChange(
        event,
        stageId: number,
        stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        stageIndex: number,
        key: 'name' | 'outputLocation' | 'script',
    ) {
        let stages = this.state.form[stageType]
        stages[stageIndex][key] = event.target.value
        this.setState({ form: { ...this.state.form, [stageType]: stages } })
    }

    handleScanToggle(): void {
        let state = { ...this.state }
        this.setState({
            form: {
                ...state.form,
                scanEnabled: !state.form.scanEnabled,
            },
        })
    }

    noop = () => {}

    copyToClipboard(text: string, callback = this.noop): void {
        let textarea = document.createElement('textarea')
        let main = document.getElementsByClassName('main')[0]
        main.appendChild(textarea)
        textarea.value = text
        textarea.select()
        document.execCommand('copy')
        main.removeChild(textarea)
        callback()
    }

    savePipeline() {
        let isUnique = this.checkUniqueness()
        if (!isUnique) {
            toast.error('All Stage names must be unique')
            return
        }
        this.setState({ showError: true, loadingData: true })
        let errObj = this.validationRules.name(this.state.form.name)
        let self = this
        let valid = this.state.form.materials.reduce((isValid, mat) => {
            isValid = isValid && self.validationRules.sourceValue(mat.value).isValid
            return isValid
        }, true)
        valid = valid && errObj.isValid
        let scanValidation = this.state.form.scanEnabled || !window._env_.FORCE_SECURITY_SCANNING
        if (!scanValidation) {
            this.setState({ loadingData: false })
            toast.error('Scanning is mandatory, please enable scanning')
            return
        }
        if (!valid) {
            this.setState({ loadingData: false })
            toast.error('Some Required Fields are missing')
            return
        }
        let msg = this.state.ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created'
        saveCIPipeline(
            this.state.form,
            this.state.ciPipeline,
            this.state.form.materials,
            +this.props.match.params.appId,
            +this.props.match.params.workflowId,
            false,
            this.state.form.webhookConditionList,
            this.state.form.ciPipelineSourceTypeOptions,
        )
            .then((response) => {
                if (response) {
                    toast.success(msg)
                    this.setState({ loadingData: false })
                    this.props.close()
                    this.props.getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ loadingData: false })
            })
    }

    deletePipeline() {
        deleteCIPipeline(
            this.state.form,
            this.state.ciPipeline,
            this.state.form.materials,
            Number(this.props.match.params.appId),
            Number(this.props.match.params.workflowId),
            false,
            this.state.form.webhookConditionList,
        )
            .then((response) => {
                if (response) {
                    toast.success('Pipeline Deleted')
                    this.setState({ loadingData: false })
                    this.props.close()
                    this.props.getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ loadingData: false })
            })
    }

    closeCIDeleteModal(): void {
        this.setState({ showDeleteModal: false })
    }

    removeDockerArgs(index: number) {
        let newArgs = []
        for (let i = 0; i < this.state.form.args.length; i++) {
            if (index != i) newArgs.push(this.state.form.args[i])
        }
        let { form } = { ...this.state }
        form.args = newArgs
        this.setState({ form })
    }

    getSelectedWebhookEvent(material) {
        let _materialValue = JSON.parse(material.value)
        let _selectedEventId = _materialValue.eventId
        return this.state.form.webhookEvents.find((we) => we.id === _selectedEventId)
    }

    addWebhookCondition(): void {
        let newConditonList = this.state.form.webhookConditionList.push({ selectorId: 0, value: '' })
        this.setState((form) => ({ ...form, webhookConditionList: newConditonList }))
    }

    deleteWebhookCondition(index: number): void {
        let newConditonList = this.state.form.webhookConditionList.splice(index, 1)
        this.setState((form) => ({ ...form, webhookConditionList: newConditonList }))
    }

    onWebhookConditionSelectorChange(index: number, selectorId: number): void {
        let _form = { ...this.state.form }
        let _condition = _form.webhookConditionList[index]
        _condition.selectorId = selectorId
        _condition.value = ''
        this.setState({ form: _form })
    }

    onWebhookConditionSelectorValueChange(index: number, value: string): void {
        let _form = { ...this.state.form }
        let _condition = _form.webhookConditionList[index]
        _condition.value = value
        this.setState({ form: _form })
    }

    renderDeleteCIModal() {
        if (this.props.match.params.ciPipelineId && this.state.showDeleteModal) {
            return (
                <DeleteDialog
                    title={`Delete '${this.state.form.name}' ?`}
                    description={`Are you sure you want to delete this CI Pipeline from '${this.props.appName}' ?`}
                    closeDelete={this.closeCIDeleteModal}
                    delete={this.deletePipeline}
                />
            )
        }
        return null
    }

    renderSecondaryButtton() {
        if (this.props.match.params.ciPipelineId) {
            let canDeletePipeline = this.props.connectCDPipelines === 0 && this.state.ciPipeline.linkedCount === 0
            let message =
                this.props.connectCDPipelines > 0
                    ? 'This Pipeline cannot be deleted as it has connected CD pipeline'
                    : 'This pipeline has linked CI pipelines'
            return (
                <ConditionalWrap
                    condition={!canDeletePipeline}
                    wrap={(children) => (
                        <Tippy className="default-tt" content={message}>
                            <div>{children}</div>
                        </Tippy>
                    )}
                >
                    <button
                        type="button"
                        className={`cta cta--workflow delete mr-16`}
                        disabled={!canDeletePipeline}
                        onClick={() => {
                            this.setState({ showDeleteModal: true })
                        }}
                    >
                        Delete Pipeline
                    </button>
                </ConditionalWrap>
            )
        } else {
            if (!this.state.isAdvanced) {
                return (
                    <button
                        type="button"
                        className={`cta cta--workflow cancel mr-16`}
                        onClick={() => {
                            this.setState({ isAdvanced: true })
                        }}
                    >
                        Advanced options
                    </button>
                )
            } else {
                return (
                    <button
                        type="button"
                        className={`cta cta--workflow cancel mr-16`}
                        onClick={() => {
                            this.props.close()
                        }}
                    >
                        Cancel
                    </button>
                )
            }
        }
    }

    renderBasicCI() {
        let _webhookData: WebhookCIProps = {
            webhookConditionList: this.state.form.webhookConditionList,
            gitHost: this.state.form.gitHost,
            getSelectedWebhookEvent: this.getSelectedWebhookEvent,
            copyToClipboard: this.copyToClipboard,
            addWebhookCondition: this.addWebhookCondition,
            deleteWebhookCondition: this.deleteWebhookCondition,
            onWebhookConditionSelectorChange: this.onWebhookConditionSelectorChange,
            onWebhookConditionSelectorValueChange: this.onWebhookConditionSelectorValueChange,
        }

        return (
            <div className="pl-20 pr-20 pt-20 pb-20">
                <SourceMaterials
                    showError={this.state.showError}
                    validationRules={this.validationRules}
                    materials={this.state.form.materials}
                    selectSourceType={this.selectSourceType}
                    handleSourceChange={this.handleSourceChange}
                    includeWebhookEvents={true}
                    ciPipelineSourceTypeOptions={this.state.form.ciPipelineSourceTypeOptions}
                    webhookData={_webhookData}
                    canEditPipeline={this.state.form.ciPipelineEditable}
                />
            </div>
        )
    }

    renderAdvanceCI() {
        return (
            <div className="" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}>
                <CIPipelineAdvanced
                    {...this.state}
                    copyToClipboard={this.copyToClipboard}
                    validationRules={this.validationRules}
                    closeCIDeleteModal={this.closeCIDeleteModal}
                    deletePipeline={this.deletePipeline}
                    handlePreBuild={this.handlePreBuild}
                    handlePostBuild={this.handlePostBuild}
                    handleDockerArgs={this.handleDockerArgs}
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
                    getSelectedWebhookEvent={this.getSelectedWebhookEvent}
                    addWebhookCondition={this.addWebhookCondition}
                    deleteWebhookCondition={this.deleteWebhookCondition}
                    onWebhookConditionSelectorChange={this.onWebhookConditionSelectorChange}
                    onWebhookConditionSelectorValueChange={this.onWebhookConditionSelectorValueChange}
                />
            </div>
        )
    }

    renderCIPipelineBody() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ minHeight: '200px' }} className="flex">
                    <Progressing pageLoader />
                </div>
            )
        } else if (this.state.isAdvanced) {
            return this.renderAdvanceCI()
        } else {
            return <>{this.renderBasicCI()}</>
        }
    }

    render() {
        let text = this.props.match.params.ciPipelineId ? 'Update Pipeline' : 'Create Pipeline'
        const title = this.props.match.params.ciPipelineId ? 'Edit build pipeline' : 'Create build pipeline'

        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--ci br-0 modal__body--p-0">
                    <div className="p-20 flex flex-align-center flex-justify bcn-0 ">
                        <h2 className="fs-16 fw-6 lh-1-43 m-0">{title}</h2>
                        <button
                            type="button"
                            className="transparent flex icon-dim-24"
                            onClick={() => {
                                this.props.close()
                            }}
                        >
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <hr className="divider m-0" />
                    <div className="ci-pipeline-advance">{this.renderCIPipelineBody()}</div>
                    {this.state.view !== ViewType.LOADING && (
                        <>
                            <div className="ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex flex-justify">
                                {this.renderSecondaryButtton()}
                                {this.state.form.ciPipelineEditable && (
                                    <ButtonWithLoader
                                        rootClassName="cta cta--workflow flex-1"
                                        loaderColor="white"
                                        onClick={this.savePipeline}
                                        isLoading={this.state.loadingData}
                                    >
                                        {text}
                                    </ButtonWithLoader>
                                )}
                            </div>
                        </>
                    )}
                    {this.renderDeleteCIModal()}
                </div>
            </VisibleModal>
        )
    }
}
