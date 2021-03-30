import React, { Component } from 'react'
import { TriggerType, ViewType } from '../../config';
import { Select, Typeahead as DevtronTypeahead, Progressing, ButtonWithLoader, showError, isEmpty, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, TypeaheadOption, DeleteDialog, } from '../common';
import { BasicCDPipelineModalProps } from './types'
import error from '../../assets/icons/misc/errorInfo.svg';
import AdvanceCDPipelineModal from './AdvanceCDPipelineModal';
import { DropdownIndicator, Option } from './cdpipeline.util';
import ReactSelect from 'react-select';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';

export default class BasicCDPipelineModal extends Component<BasicCDPipelineModalProps, {}>{
       
    renderCDAdvanceModal() {
     let deploymentStrategies = this.props.strategies.map(strategy => {return {value: strategy.deploymentTemplate , label: strategy.deploymentTemplate } })

        let envId = this.props.pipelineConfig.environmentId;
        let selectedEnv = this.props.environments.find(env => env.id == envId);
        let namespaceEditable = false;
        // let namespaceErroObj = this.props.validationRules.namespace(this.state.pipelineConfig.namespace);
        // let nameErrorObj = this.props.validationRules.name(this.state.pipelineConfig.name);
        // let envErrorObj = this.props.validationRules.environment(this.props.pipelineConfig.environmentId);
        if (!selectedEnv || selectedEnv.namespace && selectedEnv.namespace.length > 0) {
            namespaceEditable = false;
        }
        else {
            namespaceEditable = true;
        }
        if (this.props.view == ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else {
            return <div className="m-20">
                <div className="cn-9 fw-6 fs-14 mb-18">Select Environment</div>
                <div className="form__row form__row--flex">
                    <div className={`typeahead w-50 `}>
                        <DevtronTypeahead name="environment" label={"Deploy to Environment*"} labelKey='name' multi={false}
                            defaultSelections={selectedEnv ? [selectedEnv] : []}
                            disabled={!!this.props.pipelineConfig.id}
                            onChange={this.props.selectEnvironment} >
                            {this.props.environments.map((env) => {
                                return <TypeaheadOption key={env.id} item={env} id={env.id}>
                                    {env.name}
                                </TypeaheadOption>
                            })}
                        </DevtronTypeahead >
                        {/* {this.props.showError && !envErrorObj.isValid ? <span className="form__error">
                    <img src={error} className="form__icon" />
                    {envErrorObj.message}
                </span> : null} */}
                    </div>
                    <label className="flex-1 ml-16">
                        <span className="form__label">Namespace*</span>
                        <input className="form__input" autoComplete="off" placeholder="Namespace" type="text"
                            disabled={!namespaceEditable}
                            value={selectedEnv && selectedEnv.namespace ? selectedEnv.namespace : this.props.pipelineConfig.namespace}
                            onChange={(event) => { this.props.handleNamespaceChange(event, selectedEnv) }}
                        />
                        {/* {this.state.showError && !namespaceErroObj.isValid ? <span className="form__error">
                    <img src={error} className="form__icon" />
                    {namespaceErroObj.message}
                </span> : null} */}
                    </label>
                </div>
                <hr className="mb-12 divider" />
                <div className="">
                    <div className="cn-9 fw-6 fs-14 mb-4">Deployment strategy</div>
                    <span className="form__label">To add and configure strategies switch to advanced options.</span>
                </div>
                
                <div className={`typeahead w-50 `}>
                    <ReactSelect name="environment"
                        label={""}
                        labelKey='name'
                        multi={false}
                        defaultSelections={selectedEnv ? [selectedEnv] : []}
                        disabled={!!this.props.pipelineConfig.id}
                        placeholder={this.props.strategies[0].deploymentTemplate}
                        onChange={(e) => this.props.selectStrategy(e.value)}
                        components={{
                            DropdownIndicator,
                        }}
                        options={deploymentStrategies}
                        />
                        {console.log(this.props.strategies)}
                    {/* {this.props.showError && !envErrorObj.isValid ? <span className="form__error">
                    <img src={error} className="form__icon" />
                    {envErrorObj.message}
                </span> : null} */}
                </div>
                {/* <Select rootClassName="mb-16 dashed w-50" onChange={(e) => this.props.selectStrategy(e.target.value)} >
                    <Select.Button rootClassName="select-button--deployment-strategy " >
                        Add Deployment Strategy
                    </Select.Button>
                    {this.props.strategies.map((strategy) => {
                        return <Select.Option rootClassName="select-option--deployment-strategy" key={strategy.deploymentTemplate} value={strategy.deploymentTemplate} >
                            {strategy.deploymentTemplate}
                        </Select.Option>
                    })}
                </Select> */}
                <hr className="" />
                <div className="flex left mb-12">
                    <div className={"cursor br-4 pt-8 pb-8 pl-16 pr-16 ml-20 cn-7 fs-14 fw-6"} style={{ border: "1px solid #d0d4d9", width: "155px" }} onClick={() => AdvanceCDPipelineModal}>
                        Advanced options
                   </div>
                    <div className="m-auto-mr-0" style={{ width: "155px" }}>
                        <ButtonWithLoader rootClassName="cta flex-1" loaderColor="white" onClick={this.props.savePipeline} isLoading={this.props.loadingData}>
                            {this.props.cdPipelineId ? "Update Pipeline" : "Create Pipeline"}
                        </ButtonWithLoader>
                    </div>
                </div>
            </div>
        }
    }

    render() {
        return <><div className="modal__body br-0 modal__body--w-800 modal__body--p-0">
            <div className="modal__header m-20">
                <div className="modal__title fs-16">Create build pipeline</div>
                <button type="button" className="transparent" >
                    <Close className="icon-dim-24" onClick={this.props.close} />
                </button>
            </div>
            <hr className="divider" />
            {this.renderCDAdvanceModal()}
        </div>

        </>
    }
}
