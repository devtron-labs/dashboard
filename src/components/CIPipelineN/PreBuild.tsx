import React, { useState, useEffect } from 'react'
import { FormType, PluginType } from '../ciPipeline/types'
import { EmptyTaskState } from './EmptyTaskState'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import PreBuildIcon from '../../assets/icons/ic-cd-stage.svg'
import { PluginCard } from './PluginCard'
import { PluginCardListContainer } from './PluginCardListContainer'
import { ViewType } from '../../config'
import { getPluginsData } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { showError } from '../common'

export function PreBuild({
    formData,
    setFormData,
    pageState,
    setPageState,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    pageState: string
    setPageState: React.Dispatch<React.SetStateAction<string>>
    addNewTask: () => void
}) {
    const [presetPlugins, setPresetPlugins] = useState<PluginType[]>([])
    const [sharedPlugins, setSharedPlugins] = useState<PluginType[]>([])

    useEffect(() => {
        const pluginList = [
            {
                id: 0,
                name: 'Interact with git repository',
                type: 'PRESET',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'string',
                tags: ['GIT', 'Build'],
            },
            {
                id: 1,
                name: 'Interact with git repository',
                type: 'PRESET',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'string',
                tags: ['GIT', 'Build'],
            },
            {
                id: 2,
                name: 'HTTP',
                type: 'PRESET',
                description:
                    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel.',
                icon: 'string',
                tags: ['Request'],
            },
            {
                id: 3,
                name: 'Google Cloud Storage',
                type: 'PRESET',
                description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
                icon: 'string',
                tags: ['Database', 'Storage'],
            },
            {
                id: 4,
                name: 'GCS',
                type: 'SHARED',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'string',
                tags: ['GIT', 'Build'],
            },
            {
                id: 5,
                name: 'Security Scan',
                type: 'SHARED',
                description:
                    'Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.',
                icon: 'string',
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
    function processPluginList(pluginList: PluginType[]): void {
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

    return formData.beforeDockerBuildScripts.length === 0 ? (
        <EmptyTaskState
            imgSource={EmptyPreBuild}
            title="No pre-build tasks configured"
            subTitle="Here, you can configure tasks to be executed before the container image is built."
            addNewTask={addNewTask}
        />
    ) : (
        <div className="p-20 scrollable-content">
            <div className="cn-9 fw-6 fs-14">What do you want this task to do?</div>
            <PluginCard
                imgSource={PreBuildIcon}
                title="Execute custom script"
                subTitle="Write a script to perform custom tasks."
            />
            <PluginCardListContainer pluginListTitle="PRESET PLUGINS" pluginList={presetPlugins} />
            <PluginCardListContainer pluginListTitle="SHARED PLUGINS" pluginList={sharedPlugins} />
        </div>
    )
}
