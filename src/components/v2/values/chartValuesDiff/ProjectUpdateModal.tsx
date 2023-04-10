import React, { useEffect, useState } from 'react'
import { showError, Progressing, VisibleModal, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-errorInfo.svg'
import ReactSelect from 'react-select'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../common/ReactSelect.utils'
import { NumberOptionType } from '../../../app/types'
import { toast } from 'react-toastify'
import { ProjectSelectorTypes } from './ChartValuesView.type'
import { updateHelmAppProject } from '../../../charts/charts.service'
import { ProjectChangeMessageList } from './constant'

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
            <ReactSelect
                options={projectOptions}
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
            onClose()
        } catch (err) {
            if (err['code'] === 403 && appMetaInfo.projectName !== selectedProject.label) {
                toast.error(`You don't have the required access to the target project ${selectedProject.label}`)
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
                    <div className="fs-12 fw-4 lh-20 mb-2">Project</div>
                    {renderProjectSelect()}
                    {selectedProject && appMetaInfo && selectedProject.label !== appMetaInfo.projectName && (
                        <InfoColourBar
                            classname="warn cn-9 lh-20 pt-8 pr-12"
                            Icon={Error}
                            message={projectChangeMessage()}
                            iconClass="warning-icon"
                        />
                    )}
                </div>
                <div className="form__buttons dc__border-top pt-16 pb-16 pl-20 pr-20">
                    <button
                        className="cta cancel flex h-36 mr-12"
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        tabIndex={6}
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
            <div className="modal__body br-8 bcn-0 mt-0-imp p-0 dc__no-top-radius">
                {renderAboutModalInfoHeader()}
                {renderProjectInfo()}
            </div>
        </VisibleModal>
    )
}
