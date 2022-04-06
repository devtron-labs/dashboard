import React, { useState, useEffect } from 'react'
import { FormType, PluginDetailType, PluginType, ScriptType } from '../ciPipeline/types'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import PreBuildIcon from '../../assets/icons/ic-cd-stage.svg'
import { PluginCard } from './PluginCard'
import { PluginCardListContainer } from './PluginCardListContainer'
import { ViewType } from '../../config'
import { getPluginsData } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { showError } from '../common'
import CDEmptyState from '../app/details/cdDetails/CDEmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { CustomScriptComponent } from './CustomScriptComponent'
import { PluginDetailComponent } from './PluginDetailComponent'

export function PreBuild({
    formData,
    setFormData,
    pageState,
    setPageState,
    addNewTask,
    selectedTaskIndex,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    pageState: string
    setPageState: React.Dispatch<React.SetStateAction<string>>
    addNewTask: () => void
    selectedTaskIndex: number
}) {
    const [presetPlugins, setPresetPlugins] = useState<PluginDetailType[]>([])
    const [sharedPlugins, setSharedPlugins] = useState<PluginDetailType[]>([])

    useEffect(() => {
        const pluginList = [
            {
                id: 0,
                name: 'Interact with git repository',
                type: 'PRESET',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'https://bitnami.com/assets/stacks/airflow/img/airflow-stack-220x234.png',
                tags: ['GIT', 'Build'],
            },
            {
                id: 1,
                name: 'Interact with git repository',
                type: 'PRESET',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'https://s3-ap-southeast-1.amazonaws.com/devtron.ai/images/devtron-sqr-logo.png',
                tags: ['GIT', 'Build'],
            },
            {
                id: 2,
                name: 'HTTP',
                type: 'PRESET',
                description:
                    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel.',
                icon: 'https://raw.githubusercontent.com/prometheus/prometheus.github.io/master/assets/prometheus_logo-cb55bb5c346.png',
                tags: ['Request'],
            },
            {
                id: 3,
                name: 'Google Cloud Storage',
                type: 'PRESET',
                description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
                icon: 'https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg',
                tags: ['Database', 'Storage'],
            },
            {
                id: 4,
                name: 'GCS',
                type: 'SHARED',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'https://helm.elastic.co/icons/eck.png',
                tags: ['GIT', 'Build'],
            },
            {
                id: 5,
                name: 'Security Scan',
                type: 'SHARED',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'https://bitnami.com/assets/stacks/fluentd/img/fluentd-stack-220x234.png',
                tags: ['PROTECT', 'SECURITY'],
            },
        ]
        processPluginList(pluginList)
        // setPageState(ViewType.LOADING)
        // getPluginsData()
        //     .then((response) => {
        //         processPluginList(response?.result || [])
        //         setPageState(ViewType.FORM)
        //     })
        //     .catch((error: ServerErrors) => {
        //         setPageState(ViewType.ERROR)
        //         showError(error)
        //     })
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

    return formData.preBuildStage.steps.length === 0 ? (
        <CDEmptyState
            imgSource={EmptyPreBuild}
            title="No pre-build tasks configured"
            subtitle="Here, you can configure tasks to be executed before the container image is built."
            actionHandler={addNewTask}
            actionButtonText="Add task"
            ActionButtonIcon={Add}
        />
    ) : (
        <div className="p-20 ci-scrollable-content">
            {!formData.preBuildStage.steps[selectedTaskIndex]?.stepType ? (
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
            ) : formData.preBuildStage.steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                <CustomScriptComponent 
                setPageState={setPageState}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
                />
            ) : (
                <PluginDetailComponent
                    setPageState={setPageState}
                    selectedTaskIndex={selectedTaskIndex}
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
        </div>
    )
}
