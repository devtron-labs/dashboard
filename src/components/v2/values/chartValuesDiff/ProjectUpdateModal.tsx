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

import { useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    VisibleModal,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ProjectSelectorTypes } from './ChartValuesView.type'
import { updateHelmAppProject } from '../../../charts/charts.service'
import { ProjectChangeMessageList } from './constant'
import { NumberOptionType } from '@Components/app/types'

export default function ProjectUpdateModal({
    appId,
    onClose,
    appMetaInfo,
    installedAppId,
    projectList,
    getAppMetaInfoRes,
}: ProjectSelectorTypes) {
    const [projectOptions, setProjectOptions] = useState<NumberOptionType[]>([])
    const [selectedProject, setSelectedProject] = useState<NumberOptionType>()
    const [isSubmitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (appMetaInfo && Array.isArray(projectList)) {
            const _projectOptions = projectList.map((_project) => {
                if (!selectedProject && _project.label === appMetaInfo.projectName) {
                    setSelectedProject({ label: _project.label, value: _project.value })
                }
                return { label: _project.label, value: _project.value }
            })
            setProjectOptions(_projectOptions)
        }
    }, [appMetaInfo])

    const renderAboutModalInfoHeader = (): JSX.Element => {
        return (
            <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                <h2 className="fs-16 cn-9 fw-6 m-0"> Change project </h2>
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
                inputId="project"
                name="project"
                label="Project"
                required
                placeholder="Select project"
                options={projectOptions}
                value={selectedProject}
                classNamePrefix="select-project-list"
                onChange={handleProjectSelection}
                size={ComponentSizeType.large}
            />
        )
    }

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        setSubmitting(true)

        const payload = {
            appId,
            appName: appMetaInfo.appName,
            teamId: selectedProject.value,
            installedAppId: installedAppId || 0,
        }

        try {
            await updateHelmAppProject(payload)
            if (appMetaInfo.projectName === selectedProject.label) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully saved',
                })
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: `Application '${appMetaInfo.appName}' is moved to project '${selectedProject.label}'`,
                })
            }
            // Fetch the latest project & labels details
            await getAppMetaInfoRes()
            onClose()
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
            setSubmitting(false)
        }
    }

    const projectChangeMessage = (): JSX.Element => {
        return (
            <>
                <span className="fs-13 fw-4 lh-20 cn-9">Project change may lead to:</span>
                <ol className="fs-13 fw-4 lh-20 cn-9 pl-20 pr-4 m-0">
                    <li> {ProjectChangeMessageList.MessageOne} </li>
                    <li>{ProjectChangeMessageList.MessageTwo}</li>
                </ol>
            </>
        )
    }

    const renderProjectInfo = (): JSX.Element => {
        return (
            <>
                <div className="cn-7 p-20">
                    {renderProjectSelect()}
                    {selectedProject && appMetaInfo && selectedProject.label !== appMetaInfo.projectName && (
                        <InfoBlock variant="warning" description={projectChangeMessage()} />
                    )}
                </div>
                <div className="form__buttons dc__border-top pt-16 pb-16 pl-20 pr-20">
                    <button
                        className="cta cancel flex h-36 mr-12"
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        tabIndex={6}
                        data-tesid="cancel-button-on-project-change"
                    >
                        Cancel
                    </button>
                    <button
                        className="cta flex h-36"
                        type="submit"
                        disabled={isSubmitting}
                        onClick={handleSaveAction}
                        tabIndex={5}
                        data-testid="overview-project-save-button"
                    >
                        {isSubmitting ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </>
        )
    }

    return (
        <VisibleModal className="app-status__material-modal">
            <div className="modal__body br-8 bg__primary mt-0-imp p-0 dc__no-top-radius">
                {renderAboutModalInfoHeader()}
                {renderProjectInfo()}
            </div>
        </VisibleModal>
    )
}
