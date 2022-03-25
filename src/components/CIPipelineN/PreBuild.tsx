import React from 'react'
import { FormType } from '../ciPipeline/types'
import { EmptyTaskState } from './EmptyTaskState'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import PreBuildIcon from '../../assets/icons/ic-cd-stage.svg'
import { PluginCard } from './PluginCard'
import { PluginCardListContainer } from './PluginCardListContainer'

export function PreBuild({
    formData,
    setFormData,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
}) {
    return formData.beforeDockerBuildScripts.length === 0 ? (
        <EmptyTaskState
            imgSource={EmptyPreBuild}
            title="No pre-build tasks configured"
            subTitle="Here, you can configure tasks to be executed before the container image is built."
            addNewTask={addNewTask}
        />
    ) : (
        <div className="p-20">
            <div className="cn-9 fw-6 fs-14">What do you want this task to do?</div>
            <PluginCard
                imgSource={PreBuildIcon}
                title="Execute custom script"
                subTitle="Write a script to perform custom tasks."
            />
            <PluginCardListContainer pluginListTitle="PRESET PLUGINS" pluginList={[]}/>
            <PluginCardListContainer pluginListTitle="SHARED PLUGINS" pluginList={[]}/>
        </div>
    )
}
