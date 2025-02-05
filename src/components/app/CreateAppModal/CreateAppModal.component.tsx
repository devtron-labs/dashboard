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
import {
    CreateAppFormErrorStateType,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreateAppModalProps,
    CreationMethodType,
    HandleFormStateChangeParamsType,
} from './types'
import { createAppInitialFormErrorState, createAppInitialFormState, CREATION_METHOD_CONFIG } from './constants'
import { validateAppName, validateCloneApp, validateProject } from './utils'
import { createApp } from '../create/service'
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
