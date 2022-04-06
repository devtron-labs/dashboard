import React, { useState, useEffect } from 'react'
import { FormType, PluginDetailType, PluginType, ScriptType } from '../ciPipeline/types'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import PreBuildIcon from '../../assets/icons/ic-cd-stage.svg'
import { PluginCard } from './PluginCard'
import { PluginCardListContainer } from './PluginCardListContainer'
import { ConfigurationType, ViewType } from '../../config'
import { getPluginsData } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { showError } from '../common'
import CDEmptyState from '../app/details/cdDetails/CDEmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { CustomScriptComponent } from './CustomScriptComponent'
import { PluginDetailComponent } from './PluginDetailComponent'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'

export function PreBuild({
    formData,
    setFormData,
    pageState,
    setPageState,
    addNewTask,
    selectedTaskIndex,
    configurationType,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    pageState: string
    setPageState: React.Dispatch<React.SetStateAction<string>>
    addNewTask: () => void
    selectedTaskIndex: number
    configurationType: string
}) {
    const [presetPlugins, setPresetPlugins] = useState<PluginDetailType[]>([])
    const [sharedPlugins, setSharedPlugins] = useState<PluginDetailType[]>([])
    const [editorValue, setEditorValue] = useState<string>(YAML.stringify(formData.preBuildStage))

    useEffect(() => {
        if (configurationType === ConfigurationType.YAML) {
            setEditorValue(YAML.stringify(formData.preBuildStage))
        }
    }, [configurationType])
    useEffect(() => {
        setPageState(ViewType.LOADING)
        getPluginsData()
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
        _form.preBuildStage.steps[selectedTaskIndex].stepType = pluginType
        if (pluginType === PluginType.INLINE) {
            _form.preBuildStage.steps[selectedTaskIndex].inlineStepDetail = {
                scriptType: ScriptType.SHELL,
                conditionDetails: [],
            }
        } else {
            _form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail = {
                id: 0,
                pluginId: pluginId,
                conditionDetails: [],
            }
        }
        setFormData(_form)
    }

    const handleEditorValueChange = (editorValue: string): void => {
        setEditorValue(editorValue)
        const _form = { ...formData }
        _form.preBuildStage = YAML.parse(editorValue)
        setFormData(_form)
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

    function renderPluginDetail(): JSX.Element {
        if (formData.preBuildStage.steps[selectedTaskIndex].stepType === PluginType.INLINE) {
            return (
                <CustomScriptComponent
                    setPageState={setPageState}
                    selectedTaskIndex={selectedTaskIndex}
                    formData={formData}
                    setFormData={setFormData}
                />
            )
        } else {
            return (
                <PluginDetailComponent
                    setPageState={setPageState}
                    selectedTaskIndex={selectedTaskIndex}
                    formData={formData}
                    setFormData={setFormData}
                />
            )
        }
    }

    function renderGUI(): JSX.Element {
        if (formData.preBuildStage.steps.length === 0) {
            return (
                <CDEmptyState
                    imgSource={EmptyPreBuild}
                    title="No pre-build tasks configured"
                    subtitle="Here, you can configure tasks to be executed before the container image is built."
                    actionHandler={addNewTask}
                    actionButtonText="Add task"
                    ActionButtonIcon={Add}
                />
            )
        } else {
            return (
                <div className="p-20 ci-scrollable-content">
                    {!formData.preBuildStage.steps[selectedTaskIndex]?.stepType
                        ? renderPluginList()
                        : renderPluginDetail()}
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
