import React, { useState } from 'react'
import { ReactComponent as PreBuild } from '../../assets/icons/ic-cd-stage.svg'
import { not, RadioGroup } from '../common'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import CodeEditor from '../CodeEditor/CodeEditor'

interface CustomFormType {}

export function CustomScriptComponent() {
    const [yamlMode, toggleYamlMode] = useState(false)
    const [formData, setFormData] = useState<CustomFormType>({})

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
                <input
                        className="form__input"
                        autoComplete="off"
                        placeholder="Variable name"
                        type="text"
                    />
            </div>
        )
    }

    return (
        <>
            <div className="flexbox">
                Task name*
                <input
                    className="form__input bcn-1"
                    autoComplete="off"
                    placeholder="Task 1"
                    type="text"
                    value={'name'}
                />
            </div>
            <div className="flexbox">
                Configure task using
                <RadioGroup
                    className="gui-yaml-switch"
                    name="yaml-mode"
                    initialTab={yamlMode ? 'yaml' : 'gui'}
                    disabled={false}
                    onChange={changeEditorMode}
                >
                    <RadioGroup.Radio value="gui">GUI</RadioGroup.Radio>
                    <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
                </RadioGroup>
            </div>
            <div className="flexbox">
                Task type
                <RadioGroup
                    className="gui-yaml-switch"
                    name="yaml-mode"
                    initialTab={yamlMode ? 'yaml' : 'gui'}
                    disabled={false}
                    onChange={changeEditorMode}
                >
                    <RadioGroup.Radio value="Shell">Shell</RadioGroup.Radio>
                    <RadioGroup.Radio value="Container image">Container image</RadioGroup.Radio>
                    <RadioGroup.Radio value=">Docker file">Docker file</RadioGroup.Radio>
                </RadioGroup>
            </div>
            <div className="flexbox">Input variables {renderAddStage('beforeDockerBuildScripts')}</div>
            <div>
                <span className="form__label">Script to execute*</span>
                <div className="script-container">
                    <CodeEditor
                        // value={stage.script}
                        mode="shell"
                        // onChange={(value) => this.props.handleChange({ target: { value } }, stage.id, key, index, 'script')}
                        shebang="#!/bin/sh"
                        inline
                        height={300}
                    ></CodeEditor>
                </div>
                <div className="flexbox">Output variables {renderAddStage('beforeDockerBuildScripts')}</div>
            </div>
        </>
    )
}

