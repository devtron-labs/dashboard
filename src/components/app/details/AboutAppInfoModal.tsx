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

import React, { useEffect, useState } from 'react'
import { showError, Progressing, VisibleModal, InfoColourBar, SelectPicker, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { AboutAppInfoModalProps, NumberOptionType } from '../types'
import { editApp } from '../service'

export default function AboutAppInfoModal({
    isLoading,
    appId,
    onClose,
    appMetaInfo,
    getAppMetaInfoRes,
    fetchingProjects,
    projectsList,
    appType,
}: AboutAppInfoModalProps) {
    const [projectsOptions, setProjectsOption] = useState<NumberOptionType[]>([])
    const [selectedProject, setSelectedProject] = useState<NumberOptionType>()
    const [submitting, setSubmitting] = useState(false)
    const isJobOverview = appType === 'job'

    useEffect(() => {
        if (appMetaInfo && !fetchingProjects && Array.isArray(projectsList)) {
            const _projectsOption = projectsList.map((_project) => {
                if (!selectedProject && _project.name === appMetaInfo.projectName) {
                    setSelectedProject({ label: _project.name, value: _project.id })
                }
                return { label: _project.name, value: _project.id }
            })

            setProjectsOption(_projectsOption)
        }
    }, [appMetaInfo, fetchingProjects, projectsList])

    const renderAboutModalInfoHeader = (): JSX.Element => {
        return (
            <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                <h2 className="fs-16 cn-9 fw-6 m-0">Change project</h2>
                <Close className="icon-dim-20 cursor" onClick={onClose} />
            </div>
        )
    }

    const handleProjectSelection = (selected: NumberOptionType): void => {
        setSelectedProject(selected)
    }

    const renderProjectSelect = (): JSX.Element => {
        return (
            <SelectPicker
                inputId="overview-project-menu-list"
                name="overview-project-menu-list"
                classNamePrefix="overview-project-menu-list"
                options={projectsOptions}
                value={selectedProject}
                onChange={handleProjectSelection}
            />
        )
    }

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        setSubmitting(true)

        const payload = {
            id: parseInt(appId),
            teamId: selectedProject.value,
            labels: appMetaInfo.labels,
            description: appMetaInfo.description,
        }

        try {
            await editApp(payload)
             ToastManager.showToast({
                 variant: ToastVariantType.success,
                 description: `Application '${appMetaInfo.appName}' is moved to project '${selectedProject.label}'`,
             })

            // Fetch the latest project & labels details
            await getAppMetaInfoRes()
        } catch (err) {
            if (err['code'] === 403 && appMetaInfo.projectName !== selectedProject.label) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: `You don't have the required access to the target project ${selectedProject.label}`,
                })
            } else {
                showError(err)
            }
        } finally {
            onClose(e)
            setSubmitting(false)
        }
    }

    const projectChangeMessage = (): JSX.Element => {
        return (
            <>
                <span className="fs-13 fw-4 lh-20 cn-9">Project change may lead to:</span>
                <ol className="fs-13 fw-4 lh-20 cn-9 pl-20 pr-4 m-0">
                    <li>Current users losing access to this application.</li>
                    <li>
                        Users getting an access to the application automatically, if they have an access to the selected
                        project.
                    </li>
                </ol>
            </>
        )
    }

    const renderAboutModalInfo = (): JSX.Element => {
        return (
            <>
                <div className="cn-7 p-20">
                    <div className="fs-12 fw-4 lh-20 mb-2">Project</div>
                    {renderProjectSelect()}
                    {selectedProject &&
                        appMetaInfo &&
                        selectedProject.label !== appMetaInfo.projectName &&
                        !isJobOverview && (
                            <InfoColourBar
                                classname="warn cn-9 lh-20"
                                Icon={Error}
                                message={projectChangeMessage()}
                                iconClass="warning-icon"
                                styles={{
                                    padding: '8px 12px',
                                }}
                            />
                        )}
                </div>
                <div className="form__buttons dc__border-top pt-16 pb-16 pl-20 pr-20">
                    <button
                        className="cta cancel flex h-36 mr-12"
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        tabIndex={6}
                    >
                        Cancel
                    </button>
                    <button
                        className="cta flex h-36"
                        type="submit"
                        disabled={submitting}
                        onClick={handleSaveAction}
                        tabIndex={5}
                        data-testid="overview-project-save-button"
                    >
                        {submitting ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </>
        )
    }

    return (
        <VisibleModal className="app-status__material-modal">
            <div className="modal__body br-8 bcn-0 mt-0-imp p-0 dc__no-top-radius">
                {renderAboutModalInfoHeader()}
                {isLoading || fetchingProjects ? (
                    <div className="flex" style={{ minHeight: '400px' }}>
                        <Progressing pageLoader />
                    </div>
                ) : (
                    renderAboutModalInfo()
                )}
            </div>
        </VisibleModal>
    )
}
