import React, { useState, useEffect, useContext } from 'react'
import {
    FormErrorObjectType,
    FormType,
    PluginDetailType,
    PluginType,
    ScriptType,
    VariableType,
} from '../ciPipeline/types'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import EmptyPostBuild from '../../assets/img/post-build-empty.png'
import PreBuildIcon from '../../assets/icons/ic-cd-stage.svg'
import { PluginCard } from './PluginCard'
import { PluginCardListContainer } from './PluginCardListContainer'
import { BuildStageVariable, ConfigurationType, ViewType } from '../../config'
import CDEmptyState from '../app/details/cdDetails/CDEmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { TaskDetailComponent } from './TaskDetailComponent'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'
import { ciPipelineContext } from './CIPipeline'

export function PreBuild({
    presetPlugins,
    sharedPlugins,
}: {
    presetPlugins: PluginDetailType[]
    sharedPlugins: PluginDetailType[]
}) {
    const {
        formData,
        setFormData,
        addNewTask,
        selectedTaskIndex,
        setSelectedTaskIndex,
        configurationType,
        setConfigurationType,
        activeStageName,
        appId,
        formDataErrorObj,
        setFormDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        addNewTask: () => void
        selectedTaskIndex: number
        setSelectedTaskIndex: React.Dispatch<React.SetStateAction<number>>
        configurationType: string
        setConfigurationType: React.Dispatch<React.SetStateAction<string>>
        activeStageName: string
        appId: number
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
    } = useContext(ciPipelineContext)
    const [editorValue, setEditorValue] = useState<string>(YAML.stringify(formData[activeStageName]))
    useEffect(() => {
        if (configurationType === ConfigurationType.YAML) {
            setEditorValue(YAML.stringify(formData[activeStageName]))
        }
    }, [configurationType])

    useEffect(() => {
        setConfigurationType(ConfigurationType.GUI)
        setSelectedTaskIndex(0)
    }, [activeStageName])

    function setPluginType(
        pluginType: PluginType,
        pluginId: number,
        pluginName?: string,
        pluginDescription?: string,
    ): void {
        const _form = { ...formData }
        const _formDataErrorObj = { ...formDataErrorObj }
        _form[activeStageName].steps[selectedTaskIndex].stepType = pluginType
        if (pluginType === PluginType.INLINE) {
            _form[activeStageName].steps[selectedTaskIndex].inlineStepDetail = {
                scriptType: ScriptType.SHELL,
                script: '#!/bin/sh \nset -eo pipefail \n#set -v  ## uncomment this to debug the script \n', //default value for shell
                conditionDetails: [],
                inputVariables: [],
                outputVariables: [],
                commandArgsMap: [
                    {
                        command: '',
                        args: [],
                    },
                ],
                portMap: [],
                mountCodeToContainer: false,
                mountDirectoryFromHost: false,
            }
            _formDataErrorObj[activeStageName]['steps'][selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName]['steps'][selectedTaskIndex],
                inlineStepDetail: { inputVariables: [], outputVariables: [] },
            }
        } else {
            _form[activeStageName].steps[selectedTaskIndex].description = pluginDescription
            _form[activeStageName].steps[selectedTaskIndex].name = pluginName
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail = {
                id: 0,
                pluginId: pluginId,
                conditionDetails: [],
                inputVariables: [],
                outputVariables: [],
            }
            _formDataErrorObj[activeStageName]['steps'][selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName]['steps'][selectedTaskIndex],
                pluginRefStepDetail: { inputVariables: [] },
            }
        }
        setFormData(_form)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const handleEditorValueChange = (editorValue: string): void => {
        try {
            setEditorValue(editorValue)
            const _form = { ...formData }
            _form[activeStageName] = YAML.parse(editorValue)
            setFormData(_form)
        } catch (error) {}
    }

    function renderPluginList(): JSX.Element {
        return (
            <>
                <div className="cn-9 fw-6 fs-14 pb-10">What do you want this task to do?</div>
                <div onClick={() => setPluginType(PluginType.INLINE, 0)}>
                    <PluginCard
                        imgSource={PreBuildIcon}
                        title="Execute custom script"
                        subTitle="Write a script to perform custom tasks."
                    />
                </div>
                <PluginCardListContainer
                    setPluginType={setPluginType}
                    pluginListTitle="PRESET PLUGINS"
                    pluginList={presetPlugins}
                />
                <PluginCardListContainer
                    setPluginType={setPluginType}
                    pluginListTitle="SHARED PLUGINS"
                    pluginList={sharedPlugins}
                />
            </>
        )
    }

    function renderGUI(): JSX.Element {
        if (formData[activeStageName].steps.length === 0) {
            return (
                <CDEmptyState
                    imgSource={activeStageName === BuildStageVariable.PreBuild ? EmptyPreBuild : EmptyPostBuild}
                    title={`No ${
                        activeStageName === BuildStageVariable.PreBuild ? 'pre-build' : 'post-build'
                    } tasks configured`}
                    subtitle={`Here, you can configure tasks to be executed ${
                        activeStageName === BuildStageVariable.PreBuild ? 'before' : 'after'
                    } the container image is built.`}
                    actionHandler={addNewTask}
                    actionButtonText="Add task"
                    ActionButtonIcon={Add}
                />
            )
        } else {
            return (
                <div className="p-20 ci-scrollable-content">
                    {!formData[activeStageName].steps[selectedTaskIndex]?.stepType ? (
                        renderPluginList()
                    ) : (
                        <TaskDetailComponent />
                    )}
                </div>
            )
        }
    }

    return configurationType === ConfigurationType.GUI ? (
        renderGUI()
    ) : (
        <YAMLScriptComponent
            editorValue={editorValue}
            handleEditorValueChange={handleEditorValueChange}
            showSample={true}
        />
    )
}
