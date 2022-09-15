import React, { useEffect, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import moment from 'moment'
import { Moment12HourFormat } from '../../../config'
import { Progressing, useAsync } from '../../common'
import TagLabelSelect from './TagLabelSelect'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { validateTags } from '../appLabelCommon'
import { getTeamListMin } from '../../../services/service'
import ReactSelect from 'react-select'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../v2/common/ReactSelect.utils'
import { NumberOptionType } from '../types'

export default function AboutAppInfoModal({
    appId,
    onClose,
    appMetaResult,
    isLoading,
    labelTags,
    handleInputChange,
    handleTagsChange,
    handleKeyDown,
    handleCreatableBlur,
    handleSubmit,
    submitting,
}) {
    const [fetchingProjects, projectsListRes] = useAsync(() => getTeamListMin(), [appId])
    const [projectsOptions, setProjectsOption] = useState<NumberOptionType[]>([])
    const [selectedProject, setSelectedProject] = useState<NumberOptionType>(null)

    useEffect(() => {
        if (!fetchingProjects && projectsListRes?.result && appMetaResult) {
            const _projectsOption = projectsListRes.result.map((_project) => {
                if (!selectedProject && _project.name === appMetaResult.projectName) {
                    setSelectedProject({ label: _project.name, value: _project.id })
                }
                return { label: _project.name, value: _project.id }
            })

            setProjectsOption(_projectsOption)
        }
    }, [fetchingProjects, projectsListRes, appMetaResult])

    const handleCancelAction = () => {
        onClose(false)
    }

    const renderAboutModalInfoHeader = () => {
        return (
            <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20">
                <h2 className="fs-20 cn-9 fw-6 m-0">About</h2>
                <button className="dc__transparent" onClick={handleCancelAction}>
                    <Close className="icon-dim-20 cursor" />
                </button>
            </div>
        )
    }

    const renderValidationMessaging = () => {
        if (labelTags.tagError !== '') {
            return (
                <div className="flex left cr-5 fs-11 mt-6">
                    <Error className="form__icon form__icon--error" />
                    {labelTags.tagError}
                </div>
            )
        }
    }

    const handleProjectSelection = (selected) => {
        setSelectedProject(selected)
    }

    const renderProjectSelect = () => {
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

    const handleSaveAction = (e) => {
        e.preventDefault()
        handleSubmit(e, selectedProject)
    }

    const renderAboutModalInfo = () => {
        return (
            <>
                <div className="cn-7 p-20">
                    <div>
                        <div className="fs-12 fw-4 lh-20">App name</div>
                        <div className="fs-14 fw-6 lh-20 mb-20">{appMetaResult?.appName}</div>
                    </div>
                    <div>
                        <div className="fs-12 fw-4 lh-20">Created on</div>
                        <div className="fs-14 fw-6 lh-20 mb-20">
                            {moment(appMetaResult?.createdOn).format(Moment12HourFormat)}
                        </div>
                    </div>
                    <div>
                        <div className="fs-12 fw-4 lh-20">Created by</div>
                        <div className="fs-14 fw-6 lh-20 mb-20">{appMetaResult?.createdBy}</div>
                    </div>
                    <div className="mb-20">
                        <div className="fs-12 fw-4 lh-20 mb-2">Project</div>
                        {renderProjectSelect()}
                        {selectedProject && appMetaResult && selectedProject.label !== appMetaResult.projectName && (
                            <InfoColourBar
                                classname="warn cn-9 lh-20"
                                Icon={Error}
                                message="Changing the project may result in current users losing access to this application. Users with access to the target project will gain access after the application is moved."
                                iconClass="warning-icon"
                                styles={{
                                    padding: '8px 12px',
                                }}
                            />
                        )}
                    </div>
                    <TagLabelSelect
                        validateTags={validateTags}
                        labelTags={labelTags}
                        onInputChange={handleInputChange}
                        onTagsChange={handleTagsChange}
                        onKeyDown={handleKeyDown}
                        onCreatableBlur={handleCreatableBlur}
                    />
                    {renderValidationMessaging()}
                </div>
                <div className="form__buttons dc__border-top pt-16 pb-16 pl-20 pr-20">
                    <button
                        className="cta cancel flex h-36 mr-12"
                        type="button"
                        disabled={submitting}
                        onClick={handleCancelAction}
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
        <div>
            {renderAboutModalInfoHeader()}
            {isLoading || fetchingProjects ? (
                <div className="flex" style={{ minHeight: '400px' }}>
                    <Progressing pageLoader />
                </div>
            ) : (
                renderAboutModalInfo()
            )}
        </div>
    )
}
