import React from 'react'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import EmptyState from '../EmptyState/EmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export function EmptyTaskState({ addNewTask }: { addNewTask: () => void }) {
    return (
        <div className="scrollable-content">
            <EmptyState>
                <EmptyState.Image>
                    <img src={EmptyPreBuild} alt="" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4>No pre-build tasks configured</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>Here, you can configure tasks to be executed before the container image is built.</EmptyState.Subtitle>
                <EmptyState.Button>
                    <div className="task-item add-task-container cb-5 fw-6 fs-13 flexbox" onClick={addNewTask}>
                        <Add className="add-icon" /> Add task
                    </div>
                </EmptyState.Button>
            </EmptyState>
        </div>
    )
}
