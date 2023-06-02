import React, { useState, useEffect, useContext } from 'react'
import { FormType, PluginType, ScriptType, FormErrorObjectType } from '@devtron-labs/devtron-fe-common-lib'
import { PreBuildType } from '../ciPipeline/types'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import EmptyPostBuild from '../../assets/img/post-build-empty.png'
import PreBuildIcon from '../../assets/icons/ic-cd-stage.svg'
import { PluginCard } from './PluginCard'
import { PluginCardListContainer } from './PluginCardListContainer'
import { BuildStageVariable, ConfigurationType } from '../../config'
import CDEmptyState from '../app/details/cdDetails/CDEmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { TaskDetailComponent } from './TaskDetailComponent'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'
import { ciPipelineContext } from './CIPipeline'
import nojobs from '../../assets/img/empty-joblist@2x.png'
import { importComponentFromFELibrary } from '../common'

const isRequired = importComponentFromFELibrary('isRequired', null, 'function')
export function PreBuild({ presetPlugins, sharedPlugins, mandatoryPluginsMap, isJobView }: PreBuildType) {
    const {
        formData,
        setFormData,
        addNewTask,
        selectedTaskIndex,
        setSelectedTaskIndex,
        configurationType,
        setConfigurationType,
        activeStageName,
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
            _formDataErrorObj[activeStageName].steps[selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName].steps[selectedTaskIndex],
                inlineStepDetail: { inputVariables: [], outputVariables: [] },
            }
        } else {
            const isPluginRequired =
                isRequired && isRequired(formData, mandatoryPluginsMap, activeStageName, pluginId)
            _form[activeStageName].steps[selectedTaskIndex].description = pluginDescription
            _form[activeStageName].steps[selectedTaskIndex].name = pluginName
            _form[activeStageName].steps[selectedTaskIndex].isMandatory = isPluginRequired
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail = {
                id: 0,
                pluginId: pluginId,
                conditionDetails: [],
                inputVariables: [],
                outputVariables: [],
            }
            _formDataErrorObj[activeStageName].steps[selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName].steps[selectedTaskIndex],
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
                        dataTestId="execute-custom-script-button"
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

    const getImgSource = () => {
        if (isJobView) {
            return nojobs
        } else if (activeStageName === BuildStageVariable.PreBuild) {
            return EmptyPreBuild
        } else {
            return EmptyPostBuild
        }
    }

    function renderGUI(): JSX.Element {
        if (formData[activeStageName].steps.length === 0) {
            const _preBuildText = activeStageName === BuildStageVariable.PreBuild ? 'pre-build' : 'post-build'
            const _execOrderText = activeStageName === BuildStageVariable.PreBuild ? 'before' : 'after'
            const _title = isJobView ? 'No tasks configured' : `No ${_preBuildText} tasks configured`
            const _subtitle = isJobView
                ? 'Configure tasks to be executed by this job.'
                : `Here, you can configure tasks to be executed ${_execOrderText} the container image is built.`

            return (
                <CDEmptyState
                    imgSource={getImgSource()}
                    title={_title}
                    subtitle={_subtitle}
                    actionHandler={addNewTask}
                    actionButtonText="Add task"
                    ActionButtonIcon={Add}
                    dataTestId="pre-build-add-task-button"
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
