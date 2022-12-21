import React, { useEffect, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { Progressing, showError, VisibleModal } from '../../../common'
import { ReactComponent as Error } from '../../assets/icons/ic-errorInfo.svg'
import { createOption, handleKeyDown, TAG_VALIDATION_MESSAGE, validateTags } from '../../../app/appLabelCommon'
import ReactSelect, { ActionMeta, InputActionMeta } from 'react-select'
import InfoColourbar from '../../../common/infocolourBar/InfoColourbar'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../common/ReactSelect.utils'
import { AboutAppInfoModalProps, LabelTagsType, NumberOptionType, OptionType } from '../../../app/types'
import { createAppLabels } from '../../../app/service'
import { toast } from 'react-toastify'
import { ProjectSelectorTypes } from './ChartValuesView.type'
import { updateHelmAppProject } from '../../../charts/charts.service'
import common from 'mocha/lib/interfaces/common'

export default function ProjectModal({
    appId,
    onClose,
    appMetaInfo,
    installedAppId,
    projectsList,
    getAppMetaInfoRes,
}: ProjectSelectorTypes) {
    const [projectsOptions, setProjectsOption] = useState<NumberOptionType[]>([])
    const [selectedProject, setSelectedProject] = useState<NumberOptionType>()
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (Array.isArray(projectsList)) {
            const _projectsOption = projectsList.map((_project) => {
                if (!selectedProject && _project.label === appMetaInfo.projectName) {
                    setSelectedProject({ label: _project.label, value: _project.value })
                }
                return { label: _project.label, value: _project.value }
            })
            console.log(_projectsOption)
            setProjectsOption(_projectsOption)
        }
    }, [appMetaInfo, projectsList])

    const renderAboutModalInfoHeader = (): JSX.Element => {
        return (
            <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                <h2 className="fs-16 cn-9 fw-6 m-0"> Change Project </h2>
                <Close className="icon-dim-20 cursor" onClick={onClose} />
            </div>
        )
    }

    const handleProjectSelection = (selected: NumberOptionType): void => {
        setSelectedProject(selected)
    }

    const renderProjectSelect = (): JSX.Element => {
        return (
            <ReactSelect
                options={projectsOptions}
                value={selectedProject}
                onChange={handleProjectSelection}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                styles={getCommonSelectStyle({
                    control: (base, state) => ({
                        ...base,
                        minHeight: '32px',
                        marginBottom: '6px',
                        boxShadow: 'none',
                        backgroundColor: 'var(--N50)',
                        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                        cursor: 'pointer',
                    }),
                })}
            />
        )
    }

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()

        setSubmitting(true)

        const payload = {
            appId: appId,
            appName: appMetaInfo.appName,
            teamId: selectedProject.value,
            installedAppId: installedAppId ? installedAppId : 0,
        }

        try {
            await updateHelmAppProject(payload)
            if (appMetaInfo.projectName === selectedProject.label) {
                toast.success('Successfully saved')
            } else {
                toast.success(`Application '${appMetaInfo.appName}' is moved to project '${selectedProject.label}'`)
            }

            // Fetch the latest project & labels details
            await getAppMetaInfoRes()
        } catch (err) {
            if (err['code'] === 403 && appMetaInfo.projectName !== selectedProject.label) {
                toast.error(`You don't have the required access to the target project ${selectedProject.label}`)
            } else {
                showError(err)
            }
        } finally {
            onClose()
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

    const renderProjectInfo = (): JSX.Element => {
        return (
            <>
                <div className="cn-7 p-20">
                    <>
                        <div className="fs-12 fw-4 lh-20 mb-2">Project</div>
                        {renderProjectSelect()}
                        {selectedProject && appMetaInfo && selectedProject.label !== appMetaInfo.projectName && (
                            <InfoColourbar
                                classname="warn cn-9 lh-20"
                                Icon={Error}
                                message={projectChangeMessage()}
                                iconClass="warning-icon"
                                styles={{
                                    padding: '8px 12px',
                                }}
                            />
                        )}
                    </>
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
                {renderProjectInfo()}
            </div>
        </VisibleModal>
    )
}
