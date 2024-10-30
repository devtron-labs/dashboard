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
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ErrorScreenNotAuthorized,
    FeatureTitleWithInfo,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { HEADER_TEXT, ViewType } from '../../config'
import { createProject, getProjectList } from './service'
import { Project } from './Project'
import { ProjectListState, ProjectType, ProjectListProps } from './types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import './project.scss'
import { PROJECT_EXIST_MSG, REQUIRED_FIELD_MSG } from '../../config/constantMessaging'

export default class ProjectList extends Component<ProjectListProps, ProjectListState> {
    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            loadingData: false,
            view: ViewType.LOADING,
            projects: [],
            isValid: {
                name: true,
            },
            errorMessage: {
                name: '',
            },
        }
        this.saveProject = this.saveProject.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.discard = this.discard.bind(this)
        this.addProject = this.addProject.bind(this)
    }

    getProjectList = () => {
        getProjectList()
            .then((response) => {
                this.setState({
                    view: ViewType.FORM,
                    code: response.code,
                    projects: response.result.reverse(),
                })
            })
            .catch((errors) => {
                if (Array.isArray(errors.error)) {
                    errors.error.map((err) =>
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: err.userMessage,
                        }),
                    )
                }
                this.setState({ view: ViewType.ERROR, code: errors.code, loadingData: false })
            })
    }

    componentDidMount() {
        if (this.props.isSuperAdmin) {
            this.getProjectList()
        }
    }

    handleChange(event, index: number, key: 'name'): void {
        const { projects, isValid, errorMessage } = { ...this.state }
        if (event.target.value.includes(' ')) {
            isValid[key] = false
            errorMessage[key] = `Do not use 'spaces' in name`
        } else if (event.target.value && event.target.value.length > 2) {
            isValid[key] = true
            errorMessage[key] = ''
        } else {
            isValid[key] = false
            errorMessage[key] = 'Atleast 3 characters required.'
        }
        projects[index][key] = event.target.value
        this.setState({ projects, isValid })
    }

    discard(index: number): void {
        const { projects } = { ...this.state }
        projects.splice(index, 1)
        this.setState({ projects })
    }

    addProject(e): void {
        const { projects } = { ...this.state }
        const emptyProject = {
            id: 0,
            name: '',
            active: true,
            isCollapsed: false,
        }
        projects.splice(0, 0, emptyProject)
        this.setState({ projects })
    }

    isProjectNameExists(index: number, projectName: string): boolean {
        return this.state.projects.some(({ name }, i) => name === projectName && i !== index)
    }

    saveProject(index: number, key: 'name'): void {
        const { projects, isValid, errorMessage } = { ...this.state }
        const project = this.state.projects[index]
        if (!isValid?.[key]) {
            return
        }
        if (!project.name) {
            isValid[key] = false
            errorMessage[key] = REQUIRED_FIELD_MSG
            this.setState({ isValid })
            return
        }
        if (this.isProjectNameExists(index, project.name)) {
            isValid[key] = false
            errorMessage[key] = PROJECT_EXIST_MSG
            this.setState({ isValid })
            return
        }

        this.setState({ loadingData: true, isValid })
        createProject(project)
            .then((response) => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Project Created Successfully',
                })
                projects[index] = {
                    ...response.result,
                    isCollapsed: true,
                }
                this.setState({ code: response.code, projects, loadingData: false })
            })
            .catch((errors) => {
                showError(errors)
                this.setState({ view: ViewType.ERROR, code: errors.code, loadingData: false })
            })
    }

    renderProjects(project: ProjectType & { isCollapsed: boolean }, index: number) {
        return (
            <Project
                saveProject={this.saveProject}
                handleChange={this.handleChange}
                onCancel={(event) => this.discard(index)}
                isValid={this.state.isValid}
                errorMessage={this.state.errorMessage}
                id={project.id}
                name={project.name}
                active={project.active}
                isCollapsed={project.isCollapsed}
                index={index}
                loadingData={this.state.loadingData}
                reload={this.getProjectList}
            />
        )
    }

    renderPageHeader() {
        return (
            <FeatureTitleWithInfo
                title={HEADER_TEXT.PROJECTS.title}
                renderDescriptionContent={() => HEADER_TEXT.PROJECTS.description}
                docLink={HEADER_TEXT.PROJECTS.docLink}
                showInfoIconTippy
                additionalContainerClasses="mb-20"
                dataTestId="project-list-title"
            />
        )
    }

    renderAddProject() {
        const unSavedItem = this.state.projects.find((item) => !item.id)
        if (!unSavedItem) {
            return (
                <div
                    data-testid="project-add-project-button"
                    className="white-card white-card--add-new-item mb-16 dashed"
                    onClick={this.addProject}
                >
                    <Add className="icon-dim-24 fcb-5 mr-16" />
                    <span className="list__add-item">Add Project</span>
                </div>
            )
        }
    }

    render() {
        if (!this.props.isSuperAdmin) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenNotAuthorized />
                </div>
            )
        }
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenManager code={this.state.code} />
                </div>
            )
        }
        return (
            <section className="global-configuration__component flex-1">
                {this.renderPageHeader()}
                {this.renderAddProject()}
                {this.state.projects.map((project, index) => {
                    return (
                        <React.Fragment key={`${project.name}-${index}`}>
                            {this.renderProjects(project, index)}
                        </React.Fragment>
                    )
                })}
            </section>
        )
    }
}
