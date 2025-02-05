import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CustomInput,
    Drawer,
    ResizableTextarea,
    showError,
    TagsContainer,
    ToastManager,
    ToastVariantType,
    validateDescription,
    validateTagKeyValue,
    validateTagValue,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDevtronApp } from '@Icons/ic-devtron-app.svg'
import { ReactComponent as ICCaretLeftSmall } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ChangeEvent, SyntheticEvent, useState } from 'react'
import { importComponentFromFELibrary } from '@Components/common'
import { APP_TYPE } from '@Config/constants'
import { getHostURLConfiguration } from '@Services/service'
import { saveHostURLConfiguration } from '@Components/hostURL/hosturl.service'
import { createJob } from '@Components/Jobs/Service'
import { APP_COMPOSE_STAGE, getAppComposeURL } from '@Config/routes'
import { useHistory } from 'react-router-dom'
import ProjectSelector from './ProjectSelector'
import {
    CreateAppFormErrorStateType,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreationMethodType,
    HandleFormStateChangeParamsType,
} from './types'
import { createAppInitialFormErrorState, createAppInitialFormState, CREATION_METHOD_CONFIG } from './constants'
import { validateAppName, validateCloneApp, validateProject } from './utils'
import { createApp } from '../create/service'
import { ReactComponent as ICError } from '../../../assets/icons/ic-warning.svg'

const MandatoryTagsContainer = importComponentFromFELibrary('MandatoryTagsContainer', null, 'function')

const ApplicationInfoForm = ({
    formState,
    handleFormStateChange,
    isJobView,
    formErrorState,
    handleTagErrorChange,
}: {
    formState: CreateAppFormStateType
    handleFormStateChange: (params: HandleFormStateChangeParamsType) => void
    isJobView: boolean
    formErrorState: CreateAppFormErrorStateType
    handleTagErrorChange: (tagsError: CreateAppFormErrorStateType['tags']) => void
}) => {
    console.log(formErrorState.tags)
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

    const handleProjectIdChange = (projectId: CreateAppFormStateType['projectId']) => {
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
        </div>
    )
}

const HeaderSection = ({
    isJobView,
    handleClose,
    disableClose,
}: {
    isJobView?: boolean
    handleClose
    disableClose: boolean
}) => (
    <div className="flex flex-align-center flex-justify border__primary--bottom py-12 px-20">
        <h2 className="fs-16 fw-6 lh-1-43 m-0">Create {isJobView ? 'Job' : 'Devtron Application'}</h2>
        <Button
            onClick={handleClose}
            dataTestId={`close-create-custom${isJobView ? 'job' : 'app'}-wing`}
            icon={<ICClose />}
            disabled={disableClose}
            ariaLabel="Close"
            showAriaLabelInTippy={false}
            style={ButtonStyleType.negativeGrey}
            size={ComponentSizeType.small}
            variant={ButtonVariantType.borderLess}
        />
    </div>
)

const Sidebar = ({
    selectedCreationMethod,
    handleCreationMethodChange,
}: {
    selectedCreationMethod: CreationMethodType
    handleCreationMethodChange: (creationMethod: CreationMethodType) => void
}) => {
    const getHandleCreationMethodChange = (creationMethod: CreationMethodType) => () => {
        handleCreationMethodChange(creationMethod)
    }

    return (
        <div className="w-250 p-20 flexbox-col dc__gap-24">
            <div className="flexbox-col">
                {CREATION_METHOD_CONFIG.map(({ label, value }) => {
                    const isSelected = value === selectedCreationMethod

                    return (
                        <button
                            className={`dc__transparent flex left dc__gap-8 py-6 px-8 ${isSelected ? 'br-4 bcb-1' : 'dc__hover-n50'}`}
                            key={value}
                            aria-label={`Creation method: ${label}`}
                            type="button"
                            onClick={getHandleCreationMethodChange(value)}
                        >
                            {/* Add icon */}
                            <span className={`fs-13 lh-20 dc__truncate ${isSelected ? 'cb-5 fw-6' : 'cn-9'}`}>
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const CreateAppModal = ({
    isJobView,
    handleClose,
}: {
    isJobView: boolean
    handleClose: (e: SyntheticEvent) => void
}) => {
    const history = useHistory()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCreationMethod, setSelectedCreationMethod] = useState<CreationMethodType>(
        CREATION_METHOD_CONFIG[0].value,
    )
    const [formState, setFormState] = useState<CreateAppFormStateType>(structuredClone(createAppInitialFormState))
    const [formErrorState, setFormErrorState] = useState<CreateAppFormErrorStateType>(
        structuredClone(createAppInitialFormErrorState),
    )

    const getIsFormValid = () => {
        const updatedFormErrorState = structuredClone(formErrorState)

        updatedFormErrorState.projectId = validateProject(formState.projectId).message
        updatedFormErrorState.name = validateAppName(formState.name).message
        updatedFormErrorState.description = validateDescription(formState.description).message
        updatedFormErrorState.cloneAppId = validateCloneApp(formState.cloneAppId).message

        const labelTags = []
        updatedFormErrorState.tags = {}
        let invalidLabels = false

        for (let index = 0; index < formState.tags.length; index++) {
            const currentTag = formState.tags[index]
            const currentKey = currentTag.data.tagKey.value
            const currentVal = currentTag.data.tagValue.value
            updatedFormErrorState.tags[currentTag.id] = {
                tagKey: { isValid: true, errorMessages: [] },
                tagValue: { isValid: true, errorMessages: [] },
            }
            if (!currentKey && !currentVal) {
                // eslint-disable-next-line no-continue
                continue
            }
            const { isValid: isKeyValid, errorMessages: keyErrorMessages } = validateTagKeyValue(currentKey)
            const { isValid: isValueValid, errorMessages: valueErrorMessages } = validateTagValue(
                currentVal,
                currentKey,
            )
            if (!isKeyValid || !isValueValid) {
                invalidLabels = true
                updatedFormErrorState.tags[currentTag.id].tagKey = {
                    isValid: isKeyValid,
                    errorMessages: keyErrorMessages,
                }
                updatedFormErrorState.tags[currentTag.id].tagValue = {
                    isValid: isValueValid,
                    errorMessages: valueErrorMessages,
                }
            } else if (isKeyValid && isValueValid) {
                labelTags.push({
                    key: currentKey,
                    value: currentVal,
                    propagate: currentTag.customState.propagateTag,
                })
            }
        }

        setFormErrorState(updatedFormErrorState)

        return {
            isFormValid: Object.keys(formErrorState).every((key) => !formErrorState[key]),
            invalidLabels,
            labelTags,
        }
    }

    const handleFormStateChange = ({ action, value }: HandleFormStateChangeParamsType) => {
        setFormErrorState((previousFormErrorState) => {
            const updatedFormState = structuredClone(formState)
            const updatedFormErrorState = structuredClone(previousFormErrorState)

            switch (action) {
                case CreateAppFormStateActionType.updateProjectId:
                    updatedFormState.projectId = value
                    updatedFormErrorState.projectId = validateProject(value).message
                    break
                case CreateAppFormStateActionType.updateName:
                    updatedFormState.name = value
                    updatedFormErrorState.name = validateAppName(value).message
                    break
                case CreateAppFormStateActionType.updateDescription:
                    updatedFormState.description = value
                    updatedFormErrorState.description = validateDescription(value).message
                    break
                case CreateAppFormStateActionType.updateTags:
                    updatedFormState.tags = value
                    break
                case CreateAppFormStateActionType.updateCloneAppId:
                    updatedFormState.cloneAppId = value
                    updatedFormErrorState.cloneAppId = validateCloneApp(value).message
                    break
                default:
                    throw new Error(`Invalid action type: ${action}`)
            }

            setFormState(updatedFormState)

            return updatedFormErrorState
        })
    }

    const handleTagErrorChange = (tagsError: CreateAppFormErrorStateType['tags']) => {
        setFormErrorState((prev) => ({
            ...prev,
            tags: tagsError,
        }))
    }

    const getHostURLConfig = async () => {
        try {
            const { result } = await getHostURLConfiguration()
            if (!result?.value) {
                const payload = {
                    id: result?.id,
                    key: result?.key || 'url',
                    value: window.location.origin,
                    active: result?.active || true,
                }
                await saveHostURLConfiguration(payload)
            }
        } catch (error) {
            showError(error)
        }
    }

    const redirectToArtifacts = (appId: string) => {
        const url = getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG, isJobView)
        history.push(url)
    }

    const handleCreateApp = async () => {
        const { isFormValid, invalidLabels, labelTags } = getIsFormValid()

        if (!isFormValid || invalidLabels) {
            if (invalidLabels) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Some required fields in tags are missing or invalid',
                })
            }
            return
        }

        const request = {
            appName: formState.name,
            teamId: formState.projectId,
            templateId: formState.cloneAppId,
            description: formState.description?.trim(),
            labels: labelTags,
            appType: null,
        }

        if (isJobView) {
            request.appType = 2 // type 2 is for job type
        }

        const createAPI = isJobView ? createJob : createApp
        setIsSubmitting(true)
        try {
            const { result } = await createAPI(request)
            // eslint-disable-next-line no-void
            void getHostURLConfig()

            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: `Your ${isJobView ? 'job' : 'application'} is created. Go ahead and set it up.`,
            })
            redirectToArtifacts(result.id)
        } catch (error) {
            setIsSubmitting(false)
            showError(error)
        }
    }

    return (
        <Drawer position="right" width="1024px">
            <div className="h-100 bg__primary flexbox-col dc__overflow-hidden">
                <HeaderSection isJobView={false} handleClose={handleClose} disableClose={isSubmitting} />
                <div className="flexbox flex-grow-1 dc__overflow-auto">
                    <Sidebar
                        selectedCreationMethod={selectedCreationMethod}
                        handleCreationMethodChange={setSelectedCreationMethod}
                    />
                    <div className="p-20 flex-grow-1 bg__secondary h-100 dc__overflow-auto">
                        <ApplicationInfoForm
                            formState={formState}
                            handleFormStateChange={handleFormStateChange}
                            formErrorState={formErrorState}
                            handleTagErrorChange={handleTagErrorChange}
                            isJobView={false}
                        />
                    </div>
                </div>
                <div className="px-20 py-16 flexbox dc__content-end dc__no-shrink border__primary--top">
                    <Button
                        text={isJobView ? 'Create Job' : 'Create Application'}
                        dataTestId="create"
                        isLoading={isSubmitting}
                        onClick={handleCreateApp}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default CreateAppModal
