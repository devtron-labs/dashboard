import React, { useEffect, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { Progressing, showError, VisibleModal } from '../../common'
import TagLabelSelect from './TagLabelSelect'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { createOption, handleKeyDown, TAG_VALIDATION_MESSAGE, validateTags } from '../appLabelCommon'
import ReactSelect, { ActionMeta, InputActionMeta } from 'react-select'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../v2/common/ReactSelect.utils'
import { AboutAppInfoModalProps, LabelTagsType, NumberOptionType, OptionType } from '../types'
import { createAppLabels } from '../service'
import { toast } from 'react-toastify'

export default function AboutAppInfoModal({
    isLoading,
    appId,
    isChangeProjectView,
    onClose,
    appMetaInfo,
    currentLabelTags,
    getAppMetaInfoRes,
    fetchingProjects,
    projectsList,
}: AboutAppInfoModalProps) {
    const [projectsOptions, setProjectsOption] = useState<NumberOptionType[]>([])
    const [selectedProject, setSelectedProject] = useState<NumberOptionType>()
    const [submitting, setSubmitting] = useState(false)
    const [labelTags, setLabelTags] = useState<LabelTagsType>(currentLabelTags)

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
                <h2 className="fs-16 cn-9 fw-6 m-0">{isChangeProjectView ? 'Change project' : 'Manage tags'}</h2>
                <Close className="icon-dim-20 cursor" onClick={onClose} />
            </div>
        )
    }

    const renderValidationMessaging = (): JSX.Element => {
        if (labelTags.tagError !== '') {
            return (
                <div className="flex left cr-5 fs-11 mt-6">
                    <Error className="form__icon form__icon--error" />
                    {labelTags.tagError}
                </div>
            )
        }
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

    const setAppTagLabel = (): void => {
        const newTag = labelTags.inputTagValue.split(',').map((e) => {
            e = e.trim()
            return createOption(e)
        })
        setLabelTags({
            inputTagValue: '',
            tags: [...labelTags.tags, ...newTag],
            tagError: '',
        })
    }

    function validateForm(): boolean {
        if (
            labelTags.tags.length !== labelTags.tags.map((tag) => tag.value).filter((tag) => validateTags(tag)).length
        ) {
            setLabelTags((labelTags) => ({ ...labelTags, tagError: TAG_VALIDATION_MESSAGE.error }))
            return false
        }
        return true
    }

    const handleKeyDownEvent = (e): void => {
        handleKeyDown(labelTags, setAppTagLabel, e)
    }

    function handleInputChange(newValue: string, actionMeta: InputActionMeta): void {
        setLabelTags((tags) => ({ ...tags, inputTagValue: newValue, tagError: '' }))
    }

    function handleTagsChange(newValue: OptionType[], actionMeta: ActionMeta<any>): void {
        setLabelTags((tags) => ({ ...tags, tags: newValue || [], tagError: '' }))
    }

    function handleCreatableBlur(e): void {
        labelTags.inputTagValue = labelTags.inputTagValue.trim()
        if (!labelTags.inputTagValue) {
            return
        } else {
            setLabelTags({
                inputTagValue: '',
                tags: [...labelTags.tags, createOption(e.target.value)],
                tagError: '',
            })
        }
    }

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }
        setSubmitting(true)

        const _optionTypes = []
        if (labelTags.tags && labelTags.tags.length > 0) {
            labelTags.tags.forEach((_label) => {
                let colonIndex = _label.value.indexOf(':')
                let splittedTagBeforeColon = _label.value.substring(0, colonIndex)
                let splittedTagAfterColon = _label.value.substring(colonIndex + 1)
                _optionTypes.push({
                    key: splittedTagBeforeColon,
                    value: splittedTagAfterColon,
                })
            })
        }

        const payload = {
            id: parseInt(appId),
            labels: _optionTypes,
            teamId: selectedProject.value,
        }

        try {
            await createAppLabels(payload)
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

    const renderAboutModalInfo = (): JSX.Element => {
        return (
            <>
                <div className="cn-7 p-20">
                    {isChangeProjectView ? (
                        <>
                            <div className="fs-12 fw-4 lh-20 mb-2">Project</div>
                            {renderProjectSelect()}
                            {selectedProject && appMetaInfo && selectedProject.label !== appMetaInfo.projectName && (
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
                        </>
                    ) : (
                        <>
                            <TagLabelSelect
                                validateTags={validateTags}
                                labelTags={labelTags}
                                onInputChange={handleInputChange}
                                onTagsChange={handleTagsChange}
                                onKeyDown={handleKeyDownEvent}
                                onCreatableBlur={handleCreatableBlur}
                            />
                            {renderValidationMessaging()}
                        </>
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
