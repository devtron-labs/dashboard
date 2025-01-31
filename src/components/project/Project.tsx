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
import folder from '@Icons/ic-folder.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { deleteProject } from './service'
import './project.scss'
import {
    CustomInput,
    ButtonWithLoader,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    ComponentSizeType,
    ERROR_STATUS_CODE,
    DeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { ProjectProps, ProjectState } from './types'
import { DeleteComponentsName } from '@Config/constantMessaging'

export class Project extends Component<ProjectProps, ProjectState> {
    constructor(props) {
        super(props)

        this.state = {
            confirmation: false,
        }
    }

    toggleConfirmation = () => {
        this.setState((prevState) => {
            return { confirmation: !prevState.confirmation }
        })
    }

    handleActionChange = (event: React.ChangeEvent) => {
        this.props.handleChange(event, this.props.index, 'name')
    }

    saveProjectData = (event: React.SyntheticEvent) => {
        event.preventDefault()
        this.props.saveProject(this.props.index, 'name')
    }

    onDelete = async () => {
        const deletePayload = {
            id: this.props.id,
            name: this.props.name,
            active: this.props.active,
        }
        await deleteProject(deletePayload)
        this.props.reload()
    }

    renderCollapsedView() {
        return (
            <div
                data-testid={`hover-project-id-${this.props.name}`}
                className="project__row white-card white-card--add-new-item mb-16 dc__visible-hover dc__visible-hover--parent"
            >
                <img src={folder} alt="" className="icon-dim-24 mr-16" />
                <span className="project-title">{this.props.name}</span>
                <div className="dc__visible-hover--child dc__align-right">
                    <Button
                        dataTestId={`delete-project-button-${this.props.name}`}
                        icon={<Trash />}
                        onClick={this.toggleConfirmation}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.medium}
                        ariaLabel="Delete"
                    />
                </div>
                <DeleteConfirmationModal
                    title={this.props.name}
                    component={DeleteComponentsName.Project}
                    onDelete={this.onDelete}
                    showConfirmationModal={this.state.confirmation}
                    closeConfirmationModal={this.toggleConfirmation}
                    errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR}
                />
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
                        isRequiredField
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
