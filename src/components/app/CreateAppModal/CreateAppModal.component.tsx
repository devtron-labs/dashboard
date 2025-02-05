import {
    Button,
    Drawer,
    showError,
    ToastManager,
    ToastVariantType,
    validateDescription,
    validateTagKeyValue,
    validateTagValue,
} from '@devtron-labs/devtron-fe-common-lib'
import { useState } from 'react'
import { getHostURLConfiguration } from '@Services/service'
import { saveHostURLConfiguration } from '@Components/hostURL/hosturl.service'
import { createJob } from '@Components/Jobs/Service'
import { APP_COMPOSE_STAGE, getAppComposeURL } from '@Config/routes'
import { useHistory } from 'react-router-dom'
import { REQUIRED_FIELDS_MISSING } from '@Config/constants'
import {
    ApplicationInfoFormProps,
    CreateAppFormErrorStateType,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreateAppModalProps,
    CreationMethodType,
} from './types'
import { createAppInitialFormErrorState, createAppInitialFormState, CREATION_METHOD_CONFIG } from './constants'
import { validateAppName, validateCloneApp, validateProject } from './utils'
import { createApp } from './service'
import ApplicationInfoForm from './ApplicationInfoForm'
import HeaderSection from './HeaderSection'
import Sidebar from './Sidebar'

const CreateAppModal = ({ isJobView, handleClose }: CreateAppModalProps) => {
    const history = useHistory()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCreationMethod, setSelectedCreationMethod] = useState<CreationMethodType>(
        CREATION_METHOD_CONFIG[0].value,
    )
    const [formState, setFormState] = useState<CreateAppFormStateType>(structuredClone(createAppInitialFormState))
    const [formErrorState, setFormErrorState] = useState<CreateAppFormErrorStateType>(
        structuredClone(createAppInitialFormErrorState),
    )

    const validateFormField = (field: keyof CreateAppFormStateType, value) => {
        switch (field) {
            case 'name':
                return validateAppName(value).message
            case 'description':
                return validateDescription(value).message
            case 'projectId':
                return validateProject(value).message
            case 'cloneAppId':
                return selectedCreationMethod === CreationMethodType.clone ? validateCloneApp(value).message : null
            default:
                throw new Error(`Invalid field: ${field}`)
        }
    }

    const validateForm = () => {
        const updatedFormErrorState = structuredClone(formErrorState)

        updatedFormErrorState.projectId = validateFormField('projectId', formState.projectId)
        updatedFormErrorState.name = validateFormField('name', formState.name)
        updatedFormErrorState.description = validateFormField('description', formState.description)
        updatedFormErrorState.cloneAppId = validateFormField('cloneAppId', formState.cloneAppId)

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
            isFormValid: Object.keys(updatedFormErrorState)
                .filter((key) => key !== 'tags')
                .every((key) => !updatedFormErrorState[key]),
            invalidLabels,
            labelTags,
        }
    }

    const handleFormStateChange: ApplicationInfoFormProps['handleFormStateChange'] = ({ action, value }) => {
        setFormErrorState((previousFormErrorState) => {
            const updatedFormState = structuredClone(formState)
            const updatedFormErrorState = structuredClone(previousFormErrorState)

            switch (action) {
                case CreateAppFormStateActionType.updateProjectId:
                    updatedFormState.projectId = value
                    updatedFormErrorState.projectId = validateFormField('projectId', value)
                    break
                case CreateAppFormStateActionType.updateName:
                    updatedFormState.name = value
                    updatedFormErrorState.name = validateFormField('name', value)
                    break
                case CreateAppFormStateActionType.updateDescription:
                    updatedFormState.description = value
                    updatedFormErrorState.description = validateFormField('description', value)
                    break
                case CreateAppFormStateActionType.updateTags:
                    updatedFormState.tags = value
                    break
                case CreateAppFormStateActionType.updateCloneAppId:
                    updatedFormState.cloneAppId = value
                    updatedFormErrorState.cloneAppId = validateFormField('cloneAppId', value)
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
        const { isFormValid, invalidLabels, labelTags } = validateForm()

        if (!isFormValid || invalidLabels) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: invalidLabels
                    ? 'Some required fields in tags are missing or invalid'
                    : REQUIRED_FIELDS_MISSING,
            })
            return
        }

        const request = {
            appName: formState.name,
            teamId: +formState.projectId,
            templateId: formState.cloneAppId,
            description: formState.description?.trim(),
            labels: labelTags,
            // type 2 is for job type
            appType: isJobView ? 2 : null,
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
            <div className="h-100 bg__modal flexbox-col dc__overflow-hidden">
                <HeaderSection isJobView handleClose={handleClose} isCloseDisabled={isSubmitting} />
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
                            isJobView={isJobView}
                            selectedCreationMethod={selectedCreationMethod}
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
