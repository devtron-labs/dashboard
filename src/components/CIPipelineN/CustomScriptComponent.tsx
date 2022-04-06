import React, { useState } from 'react'
import { ReactComponent as PreBuild } from '../../assets/icons/ic-cd-stage.svg'
import { not, RadioGroup } from '../common'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import { ConfigurationType } from '../../config'
import { PluginVariableType, ConditionContainerType, FormType } from '../ciPipeline/types'
import { ConditionContainer } from './ConditionContainer'
import { VariableContainer } from './VariableContainer'
import CustomInputOutputVariables from './CustomInputOutputVariables'

interface CustomFormType {}

export function CustomScriptComponent({
    setPageState,
    selectedTaskIndex,
    formData,
    setFormData,
}: {
    setPageState?: React.Dispatch<React.SetStateAction<string>>
    selectedTaskIndex?: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const [yamlMode, toggleYamlMode] = useState(false)
    const [configurationType, setConfigurationType] = useState<string>('GUI')

    function changeEditorMode(e) {
        if (yamlMode) {
            // setExternalValues(tempArray.current)
            // toggleYamlMode(not)
            // tempArray.current = []
            return
        }
        toggleYamlMode(not)
    }

    function addEmptyStage(stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts'): void {
        // let { form }
        // let { length, [length - 1]: last } = form[stageType]
        // let stage = {
        //     index: last ? last.index + 1 : 1,
        //     name: "",
        //     outputLocation: "",
        //     script: "",
        //     isCollapsed: false,
        //     id: 0,
        // }
        // form[stageType].push(stage);
        // this.setState({ form });
    }

    function deleteStage(
        stageId: number,
        key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        stageIndex: number,
    ): void {
        // let stages = this.state.form[key]
        // stages.splice(stageIndex, 1)
        // this.setState(form => ({ ...form, [key]: stages }))
    }
    function renderAddStage(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        return (
            <div>
                <div
                    className="cursor"
                    // onClick={() => { this.props.addEmptyStage(key) }}
                >
                    <Add className="icon-dim-20 fcb-5 vertical-align-middle mr-16" />
                    <span className="artifact__add">Add Variable</span>
                </div>
                <input className="form__input w-100" autoComplete="off" placeholder="Variable name" type="text" />
                <input className="form__input w-100" autoComplete="off" placeholder="Description" type="text" />
            </div>
        )
    }

    return (
        <div className="p-20 ci-scrollable-content">
            <div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Task name*</label>{' '}
                    <input
                    style={{ width: '80% !important' }}
                    className="form__input bcn-1 w-80"
                    autoComplete="off"
                    placeholder="Task 1"
                    type="text"
                    value={'name'}
                />
                </div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Configure task using</label>
                    <RadioGroup
                        className="configuration-container justify-start"
                        disabled={false}
                        initialTab={configurationType}
                        name="configuration-type"
                        onChange={(event) => {
                            setConfigurationType(event.target.value)
                        }}
                    >
                        <RadioGroup.Radio className="left-radius" value={ConfigurationType.GUI}>
                            {ConfigurationType.GUI}
                        </RadioGroup.Radio>
                        <RadioGroup.Radio className="right-radius" value={ConfigurationType.YAML}>
                            {ConfigurationType.YAML}
                        </RadioGroup.Radio>
                    </RadioGroup>
                </div>
            </div>
            <hr />
            <CustomInputOutputVariables
                type={PluginVariableType.INPUT}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            <ConditionContainer
                type={ConditionContainerType.TRIGGER_SKIP}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            <CustomInputOutputVariables
                type={PluginVariableType.OUTPUT}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            <ConditionContainer
                type={ConditionContainerType.PASS_FAILURE}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
        </div>
        // <div className="fs-13 fw-6">
        //     <div className="flexbox pt-6 pb-6">
        //         <span className="w-200">Task name*</span>
        //         <input
        //             style={{ width: '80% !important' }}
        //             className="form__input bcn-1 w-80"
        //             autoComplete="off"
        //             placeholder="Task 1"
        //             type="text"
        //             value={'name'}
        //         />
        //     </div>
        //     <div className="flexbox pt-6 pb-6">
        //         <span className="w-200">Configure task using</span>
        //         <RadioGroup
        //             className="gui-yaml-switch"
        //             name="yaml-mode"
        //             initialTab={yamlMode ? 'yaml' : 'gui'}
        //             disabled={false}
        //             onChange={changeEditorMode}
        //         >
        //             <RadioGroup.Radio value="gui">GUI</RadioGroup.Radio>
        //             <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
        //         </RadioGroup>
        //     </div>
        //     <div className="flexbox pt-6 pb-6">
        //         <span className="w-200">Task type</span>
        //         <RadioGroup
        //             className="gui-yaml-switch"
        //             name="yaml-mode"
        //             initialTab={yamlMode ? 'yaml' : 'gui'}
        //             disabled={false}
        //             onChange={changeEditorMode}
        //         >
        //             <RadioGroup.Radio value="Shell">Shell</RadioGroup.Radio>
        //             <RadioGroup.Radio value="Container image">Container image</RadioGroup.Radio>
        //             <RadioGroup.Radio value=">Docker file">Docker file</RadioGroup.Radio>
        //         </RadioGroup>
        //     </div>
        //     <div className="flexbox pt-6 pb-6 ">
        //         <span className="w-200">Input variables</span>
        //         {renderAddStage('beforeDockerBuildScripts')}
        //     </div>
        //     <span className="form__label w-200">Script to execute*</span>
        //     <div className="script-container">
        //         <CodeEditor
        //             // value={stage.script}
        //             mode="shell"
        //             // onChange={(value) => this.props.handleChange({ target: { value } }, stage.id, key, index, 'script')}
        //             shebang="#!/bin/sh"
        //             inline
        //             height={300}
        //         ></CodeEditor>
        //     </div>
        //     <div className="flexbox pt-6 pb-6">
        //         <span className='w-200'>Output variables </span>
        //         {renderAddStage('beforeDockerBuildScripts')}</div>
        // </div>
    )
}
