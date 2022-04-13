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
import { getPluginsData } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { showError } from '../common'
import CDEmptyState from '../app/details/cdDetails/CDEmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { TaskDetailComponent } from './TaskDetailComponent'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'
import { ciPipelineContext } from './CIPipeline'

export function PreBuild() {
    const {
        formData,
        setFormData,
        setPageState,
        addNewTask,
        selectedTaskIndex,
        configurationType,
        setConfigurationType,
        activeStageName,
        calculateLastStepDetail,
        appId,
        formDataErrorObj,
        setFormDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        pageState: string
        setPageState: React.Dispatch<React.SetStateAction<string>>
        addNewTask: () => void
        selectedTaskIndex: number
        configurationType: string
        setConfigurationType: React.Dispatch<React.SetStateAction<string>>
        activeStageName: string
        calculateLastStepDetail: (
            isFromAddNewTask: boolean,
            _formData: FormType,
            startIndex?: number,
        ) => {
            index: number
        }
        appId: number
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
    } = useContext(ciPipelineContext)
    const [presetPlugins, setPresetPlugins] = useState<PluginDetailType[]>([])
    const [sharedPlugins, setSharedPlugins] = useState<PluginDetailType[]>([])
    const [editorValue, setEditorValue] = useState<string>(YAML.stringify(formData[activeStageName]))

    useEffect(() => {
        if (configurationType === ConfigurationType.YAML) {
            setEditorValue(YAML.stringify(formData[activeStageName]))
        }
    }, [configurationType])

    useEffect(() => {
        setConfigurationType(ConfigurationType.GUI)
        calculateLastStepDetail(false, formData)
    }, [activeStageName])

    useEffect(() => {
        setPageState(ViewType.LOADING)
        getPluginsData(appId)
            .then((response) => {
                processPluginList(response?.result || [])
                setPageState(ViewType.FORM)
            })
            .catch((error: ServerErrors) => {
                setPageState(ViewType.ERROR)
                showError(error)
            })
    }, [])

    function processPluginList(pluginList: PluginDetailType[]): void {
        const _presetPlugin = []
        const _sharedPlugin = []
        const pluginListLength = pluginList.length
        for (let i = 0; i < pluginListLength; i++) {
            if (pluginList[i].type === 'PRESET') {
                _presetPlugin.push(pluginList[i])
            } else {
                _sharedPlugin.push(pluginList[i])
            }
        }
        setPresetPlugins(_presetPlugin)
        setSharedPlugins(_sharedPlugin)
    }

    function setPluginType(pluginType: PluginType, pluginId: number): void {
        const _form = { ...formData }
        const _formDataErrorObj = { ...formDataErrorObj }
        _form[activeStageName].steps[selectedTaskIndex].stepType = pluginType
        if (pluginType === PluginType.INLINE) {
            _form[activeStageName].steps[selectedTaskIndex].inlineStepDetail = {
                scriptType: ScriptType.SHELL,
                conditionDetails: [],
                inputVariables: [],
                outputVariables: [],
                commandArgsMap: [
                    {
                        command: '',
                        args: [],
                    },
                ],
                portMap: [
                    {
                        portOnLocal: null,
                        portOnContainer: null,
                    },
                ],
                mountCodeToContainer: false,
                mountDirectoryFromHost: false,
                script: '',
            }
            _formDataErrorObj[activeStageName]['steps'][selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName]['steps'][selectedTaskIndex],
                inlineStepDetail: { inputVariables: [], outputVariables: [] },
            }
        } else {
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
                <div className="cn-9 fw-6 fs-14">What do you want this task to do?</div>
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
        <YAMLScriptComponent editorValue={editorValue} handleEditorValueChange={handleEditorValueChange} />
    )
}
