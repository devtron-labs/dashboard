import React from 'react'
import { FormType } from '../ciPipeline/types'
import EmptyPostBuild from '../../assets/img/post-build-empty.png'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import CDEmptyState from '../app/details/cdDetails/CDEmptyState'

export function PostBuild({
    formData,
    setFormData,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
}) {
    return formData.postBuildStage.steps.length === 0 ? (
        <CDEmptyState
            imgSource={EmptyPostBuild}
            title="No post-build tasks configured"
            subtitle="Here, you can configure tasks to be executed after the container image is built."
            actionHandler={addNewTask}
            actionButtonText="Add task"
            ActionButtonIcon={Add}
        />
    ) : (
        <div>What do you want to do now in Post-build</div>
    )
}
