import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Drawer,
    Progressing,
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
import { APP_COMPOSE_STAGE, getAppComposeURL, URLS } from '@Config/routes'
import { useHistory } from 'react-router-dom'
import { REQUIRED_FIELDS_MISSING } from '@Config/constants'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICBack } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICAppTemplate } from '@Icons/ic-app-template.svg'

import {
    ApplicationInfoFormProps,
    CreateAppFormErrorStateType,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreateAppModalProps,
    CreationMethodType,
} from './types'
import { createAppInitialFormErrorState, createAppInitialFormState } from './constants'
import { getCreateMethodConfig, validateAppName, validateCloneApp, validateProject } from './utils'
import { createApp } from './service'
import ApplicationInfoForm from './ApplicationInfoForm'
import HeaderSection from './HeaderSection'
import Sidebar from './Sidebar'
import UpdateTemplateConfig from './UpdateTemplateConfig'

import './styles.scss'

const TemplateList = importComponentFromFELibrary('TemplateList', null, 'function')
const createDevtronAppUsingTemplate = importComponentFromFELibrary('createDevtronAppUsingTemplate', null, 'function')

const CreateAppModal = ({ isJobView, handleClose }: CreateAppModalProps) => {
    const history = useHistory()
    const createMethodConfig = getCreateMethodConfig(isJobView)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCreationMethod, setSelectedCreationMethod] = useState<CreationMethodType>(
        createMethodConfig[0].value,
    )
    const [formState, setFormState] = useState<CreateAppFormStateType>(structuredClone(createAppInitialFormState))
    const [formErrorState, setFormErrorState] = useState<CreateAppFormErrorStateType>(
        structuredClone(createAppInitialFormErrorState),
    )

    const isCreationMethodTemplate = selectedCreationMethod === CreationMethodType.template

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
                .filter((key: keyof typeof updatedFormErrorState) => key !== 'tags' && key !== 'workflowConfig')
                .every((key) => !updatedFormErrorState[key]),
            invalidLabels,
            labelTags,
            invalidWorkFlow: updatedFormErrorState.workflowConfig,
        }
    }

    const handleFormStateChange: ApplicationInfoFormProps['handleFormStateChange'] = ({ action, value }) => {
        setFormState((previousFormState) => {
            const updatedFormState = structuredClone(previousFormState)

            setFormErrorState((previousFormErrorState) => {
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
                    case CreateAppFormStateActionType.updateGitMaterials:
                        updatedFormState.gitMaterials = value.data
                        updatedFormErrorState.gitMaterials = value.isError
                        break
                    case CreateAppFormStateActionType.updateBuildConfiguration:
                        updatedFormState.buildConfiguration = value
                        break
                    case CreateAppFormStateActionType.updateWorkflowConfig: {
                        const updatedPipelineToEnvMap = value.data.cd.reduce((acc, { pipelineId, environmentId }) => {
                            acc[pipelineId] = environmentId
                            return acc
                        }, {})
                        updatedFormState.workflowConfig = {
                            // If cd is not present initially use the data.cd
                            cd: updatedFormState.workflowConfig?.cd?.length
                                ? updatedFormState.workflowConfig.cd.map(({ environmentId, pipelineId }) => ({
                                      pipelineId,
                                      environmentId: updatedPipelineToEnvMap[pipelineId] ?? environmentId,
                                  }))
                                : value.data.cd,
                        }
                        updatedFormErrorState.workflowConfig = value.isError
                        break
                    }
                    case CreateAppFormStateActionType.updateTemplateConfig:
                        updatedFormState.templateConfig = value
                        break
                    default:
                        throw new Error(`Invalid action type: ${action}`)
                }

                setFormState(updatedFormState)

                return updatedFormErrorState
            })

            return updatedFormState
        })
    }

    const handleTagErrorChange = (tagsError: CreateAppFormErrorStateType['tags']) => {
        setFormErrorState((prev) => ({
            ...prev,
            tags: tagsError,
        }))
    }

    const handleTemplateClick = ({ id, templateId, name }: CreateAppFormStateType['templateConfig']) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateTemplateConfig,
            value: { id, templateId, name },
        })
    }

    const goBackToTemplatesList = () =>
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateTemplateConfig,
            value: null,
        })

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
        const url = isCreationMethodTemplate
            ? `${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`
            : getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG, isJobView)
        history.push(url)
    }

    const getCreateApiMethod = () => {
        if (isJobView) {
            return createJob
        }

        return isCreationMethodTemplate ? createDevtronAppUsingTemplate : createApp
    }

    const handleCreateApp = async () => {
        const { isFormValid, invalidLabels, labelTags, invalidWorkFlow } = validateForm()

        if (isCreationMethodTemplate && !formState.templateConfig?.templateId) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please select a template to create app',
            })
            return
        }

        if (!isFormValid || invalidLabels) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: invalidLabels
                    ? 'Some required fields in tags are missing or invalid'
                    : REQUIRED_FIELDS_MISSING,
            })
            return
        }

        if (invalidWorkFlow) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid Workflow!',
            })
            return
        }

        const request = {
            appName: formState.name,
            teamId: +formState.projectId,
            description: formState.description?.trim(),
            labels: labelTags,
            // type 2 is for job type
            appType: isJobView ? 2 : null,
            ...(selectedCreationMethod === CreationMethodType.clone
                ? {
                      templateId: formState.cloneAppId,
                  }
                : null),
            ...(isCreationMethodTemplate
                ? {
                      templateId: formState.templateConfig.templateId,
                      templatePatch: {
                          gitMaterial: formState.gitMaterials,
                          buildConfiguration: formState.buildConfiguration,
                          workflowConfig: formState.workflowConfig,
                      },
                  }
                : null),
        }

        const createAPI = getCreateApiMethod()
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
                <HeaderSection isJobView={isJobView} handleClose={handleClose} isCloseDisabled={isSubmitting} />
                <div className="flexbox flex-grow-1 dc__overflow-hidden">
                    <Sidebar
                        selectedCreationMethod={selectedCreationMethod}
                        handleCreationMethodChange={setSelectedCreationMethod}
                        createMethodConfig={createMethodConfig}
                        isJobView={isJobView}
                    />
                    {selectedCreationMethod !== CreationMethodType.template && (
                        <div className="p-20 flexbox-col dc__gap-20 flex-grow-1 bg__secondary dc__overflow-auto">
                            <ApplicationInfoForm
                                formState={formState}
                                handleFormStateChange={handleFormStateChange}
                                formErrorState={formErrorState}
                                handleTagErrorChange={handleTagErrorChange}
                                isJobView={isJobView}
                                selectedCreationMethod={selectedCreationMethod}
                            />
                        </div>
                    )}
                    {isCreationMethodTemplate && (
                        <div className="flexbox-col flex-grow-1 bg__secondary dc__overflow-auto">
                            {formState.templateConfig ? (
                                <>
                                    <div className="flex left dc__gap-12 py-12 px-20">
                                        <Button
                                            icon={<ICBack />}
                                            dataTestId="create-app-modal-go-back-to-templates-list"
                                            ariaLabel="go-back-to-templates-list"
                                            variant={ButtonVariantType.secondary}
                                            style={ButtonStyleType.neutral}
                                            size={ComponentSizeType.xs}
                                            showAriaLabelInTippy={false}
                                            onClick={goBackToTemplatesList}
                                        />
                                        <div className="flex left dc__gap-4">
                                            <Button
                                                dataTestId="template-list-breadcrumb"
                                                variant={ButtonVariantType.text}
                                                text="Templates"
                                                onClick={goBackToTemplatesList}
                                            />
                                            <span>/</span>
                                            <p className="m-0 flex left dc__gap-6">
                                                <ICAppTemplate className="icon-dim-20 p-1" />
                                                <span className="fs-13 lh-20 fw-6 cn-9">
                                                    {formState.templateConfig.name}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="divider__secondary--horizontal" />
                                    <div className="create-app-modal__template">
                                        <div className="create-app-modal__template__loader">
                                            <Progressing size={32} />
                                        </div>
                                        <div className="create-app-modal__template__content flexbox-col dc__gap-20 flex-grow-1 bg__secondary dc__overflow-auto p-20">
                                            <ApplicationInfoForm
                                                formState={formState}
                                                handleFormStateChange={handleFormStateChange}
                                                formErrorState={formErrorState}
                                                handleTagErrorChange={handleTagErrorChange}
                                                isJobView={isJobView}
                                                selectedCreationMethod={selectedCreationMethod}
                                            />
                                            <UpdateTemplateConfig
                                                formState={formState}
                                                isJobView={isJobView}
                                                handleFormStateChange={handleFormStateChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                TemplateList && <TemplateList handleTemplateClick={handleTemplateClick} />
                            )}
                        </div>
                    )}
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
