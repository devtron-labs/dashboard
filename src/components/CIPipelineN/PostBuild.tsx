import React from 'react'
import { FormType } from '../ciPipeline/types'
import { EmptyTaskState } from './EmptyTaskState'
import EmptyPostBuild from '../../assets/img/post-build-empty.png'

export function PostBuild({
    formData,
    setFormData,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
}) {
    return formData.afterDockerBuildScripts.length === 0 ? (
        <EmptyTaskState
            imgSource={EmptyPostBuild}
            title="No post-build tasks configured"
            subTitle="Here, you can configure tasks to be executed after the container image is built."
            addNewTask={addNewTask}
        />
    ) : (
        <div>What do you want to do now in Post-build</div>
    )
}
