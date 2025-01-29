/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react'
import folder from '../../assets/icons/ic-folder.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { deleteProject } from './service'
import './project.scss'
import { DeleteComponentsName, DC_PROJECT_CONFIRMATION_MESSAGE } from '../../config/constantMessaging'
import { CustomInput, ButtonWithLoader, DeleteComponent } from '@devtron-labs/devtron-fe-common-lib'

export interface ProjectProps {
    id: number
    name: string
    active: boolean
    isCollapsed: boolean
    saveProject: (index: number, key: 'name') => void
    onCancel: (index) => void
    handleChange: (Event, index: number, key: 'name') => void
    loadingData: boolean
    index: number
    isValid: { name: boolean }
    errorMessage: { name: string }
    reload: () => void
}

export interface ProjectState {
    deleting: boolean
    confirmation: boolean
}
export class Project extends Component<ProjectProps, ProjectState> {
    constructor(props) {
        super(props)

        this.state = {
            deleting: false,
            confirmation: false,
        }
    }

    toggleConfirmation = () => {
        this.setState((prevState) => {
            return { confirmation: !prevState.confirmation }
        })
    }

    setDeleting = () => {
        this.setState({
            deleting: true,
        })
    }

    getProjectPayload = () => {
        return {
            id: this.props.id,
            name: this.props.name,
            active: this.props.active,
        }
    }

    handleActionChange = (event: React.ChangeEvent) => {
        this.props.handleChange(event, this.props.index, 'name')
    }

    saveProjectData = (event: React.SyntheticEvent) => {
        event.preventDefault()
        this.props.saveProject(this.props.index, 'name')
    }

    renderCollapsedView() {
        return (
            <div
                data-testid={`hover-project-id-${this.props.name}`}
                className="project__row white-card white-card--add-new-item mb-16"
            >
                <img src={folder} alt="" className="icon-dim-24 mr-16" />
                <span className="project-title">{this.props.name}</span>
                <button
                    data-testid={`delete-project-button-${this.props.name}`}
                    type="button"
                    className="project__row__trash dc__transparent dc__align-right"
                    onClick={this.toggleConfirmation}
                >
                    <Trash className="scn-5 icon-dim-20" />
                </button>
                {this.state.confirmation && (
                    <DeleteComponent
                        setDeleting={this.setDeleting}
                        deleteComponent={deleteProject}
                        payload={this.getProjectPayload()}
                        title={this.props.name}
                        toggleConfirmation={this.toggleConfirmation}
                        component={DeleteComponentsName.Project}
                        confirmationDialogDescription={DC_PROJECT_CONFIRMATION_MESSAGE}
                        reload={this.props.reload}
                    />
                )}
            </div>
        )
    }

    renderForm() {
        const { isValid } = this.props
        const { errorMessage } = this.props
        return (
            <div>
                <form className="white-card p-24 mb-16 dashed" onSubmit={this.saveProjectData}>
                    <div className="white-card__header"> {this.props.id ? 'Edit project' : 'Add Project'} </div>
                    <CustomInput
                        label="Project Name"
                        name="name"
                        value={this.props.name}
                        placeholder="e.g. My Project"
                        onChange={this.handleActionChange}
                        autoFocus
                        data-testid="project-name-input"
                        required
                        error={!isValid.name && errorMessage.name}
                    />
                    <div className="form__buttons mt-16">
                        <button
                            data-testid="project-cancel-button"
                            type="button"
                            className="cta cancel mr-16"
                            onClick={this.props.onCancel}
                        >
                            Cancel
                        </button>
                        <ButtonWithLoader
                            type="submit"
                            rootClassName="cta"
                            isLoading={this.props.loadingData}
                            dataTestId="project-save-button"
                        >
                            Save
                        </ButtonWithLoader>
                    </div>
                </form>
            </div>
        )
    }

    render() {
        if (this.props.isCollapsed) {
            return this.renderCollapsedView()
        }

        return this.renderForm()
    }
}
