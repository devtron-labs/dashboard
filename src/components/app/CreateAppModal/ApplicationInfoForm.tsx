import { CustomInput, ResizableTextarea, TagsContainer } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDevtronApp } from '@Icons/ic-devtron-app.svg'
import { ReactComponent as ICCaretLeftSmall } from '@Icons/ic-caret-left-small.svg'
import { ChangeEvent, useState } from 'react'
import { importComponentFromFELibrary } from '@Components/common'
import { APP_TYPE } from '@Config/constants'
import ProjectSelector from './ProjectSelector'
import {
    ApplicationInfoFormProps,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreationMethodType,
    HandleFormStateChangeParamsType,
    ProjectSelectorProps,
} from './types'
import { ReactComponent as ICError } from '../../../assets/icons/ic-warning.svg'
import AppToCloneSelector from './AppToCloneSelector'

const MandatoryTagsContainer = importComponentFromFELibrary('MandatoryTagsContainer', null, 'function')

const ApplicationInfoForm = ({
    formState,
    handleFormStateChange,
    isJobView,
    formErrorState,
    handleTagErrorChange,
    selectedCreationMethod,
}: ApplicationInfoFormProps) => {
    const [isTagsAccordionExpanded, setIsTagsAccordionExpanded] = useState(false)

    const toggleIsTagsAccordionExpanded = () => {
        setIsTagsAccordionExpanded((prev) => !prev)
    }

    const handleInputChange =
        (
            action: Extract<
                HandleFormStateChangeParamsType['action'],
                CreateAppFormStateActionType.updateName | CreateAppFormStateActionType.updateDescription
            >,
        ) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            handleFormStateChange({ action, value: event.target.value })
        }

    const handleProjectIdChange: ProjectSelectorProps['handleProjectIdChange'] = (projectId) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateProjectId,
            value: projectId,
        })
    }

    const handleTagsUpdate = (tags: CreateAppFormStateType['tags']) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateTags,
            value: tags,
        })
    }

    const handleCloneIdChange = (cloneId) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateCloneAppId,
            value: cloneId,
        })
    }

    return (
        <div className="flexbox-col dc__gap-16 p-20 br-8 border__secondary bg__primary">
            <ICDevtronApp className="icon-dim-48 dc__no-shrink" />
            <div className="flexbox dc__gap-8">
                <ProjectSelector
                    selectedProjectId={formState.projectId}
                    handleProjectIdChange={handleProjectIdChange}
                    error={formErrorState.projectId}
                />
                <span className="pt-26 fs-20 lh-36 cn-7 dc__no-shrink">/</span>
                <CustomInput
                    label={isJobView ? 'Job name' : 'Application name'}
                    isRequiredField
                    required
                    rootClassName="h-36"
                    name="name"
                    onChange={handleInputChange(CreateAppFormStateActionType.updateName)}
                    value={formState.name}
                    placeholder="Enter name"
                    inputWrapClassName="w-100"
                    error={formErrorState.name}
                    helperText={
                        !isJobView && 'Apps are NOT env specific and can be used to deploy to multiple environments.'
                    }
                />
            </div>
            <div>
                <span className="form__label mt-16">Description</span>
                <ResizableTextarea
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange(CreateAppFormStateActionType.updateDescription)}
                    placeholder={isJobView ? 'Describe this job' : 'Write a description for this application'}
                    className="w-100"
                />
                {formErrorState.description ? (
                    <span className="form__error">
                        <ICError className="form__icon form__icon--error" />
                        {formErrorState.description} <br />
                    </span>
                ) : null}
            </div>
            <div className="flexbox-col dc__gap-16">
                <button
                    className="dc__transparent p-0 flex left dc__gap-8"
                    type="button"
                    onClick={toggleIsTagsAccordionExpanded}
                >
                    <ICCaretLeftSmall
                        className={`scn-7 dc__no-shrink dc__transition--transform ${isTagsAccordionExpanded ? 'dc__flip-270' : 'dc__flip-180'}`}
                    />
                    <span className="fs-13 fw-6 lh-20 cn-9">Add tags to application</span>
                </button>
                {isTagsAccordionExpanded &&
                    (MandatoryTagsContainer ? (
                        <MandatoryTagsContainer
                            isCreateApp
                            appType={isJobView ? APP_TYPE.JOB : APP_TYPE.DEVTRON_APPS}
                            projectId={formState.projectId}
                            tags={formState.tags}
                            setTags={handleTagsUpdate}
                            tagsError={formErrorState.tags}
                            setTagErrors={handleTagErrorChange}
                        />
                    ) : (
                        <TagsContainer
                            appType={isJobView ? APP_TYPE.JOB : APP_TYPE.DEVTRON_APPS}
                            isCreateApp
                            rows={formState.tags}
                            setRows={handleTagsUpdate}
                            tagsError={formErrorState.tags}
                            setTagErrors={handleTagErrorChange}
                        />
                    ))}
            </div>
            {selectedCreationMethod === CreationMethodType.clone && (
                <AppToCloneSelector
                    error={formErrorState.cloneAppId}
                    isJobView={isJobView}
                    handleCloneIdChange={handleCloneIdChange}
                />
            )}
        </div>
    )
}

export default ApplicationInfoForm
