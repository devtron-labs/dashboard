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

import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    Button,
    Drawer,
    showError,
    ToastManager,
    ToastVariantType,
    validateTagKeyValue,
    validateTagValue,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { saveHostURLConfiguration } from '@Components/hostURL/hosturl.service'
import { createJob } from '@Components/Jobs/Service'
import { REQUIRED_FIELDS_MISSING } from '@Config/constants'
import { APP_COMPOSE_STAGE, getAppComposeURL, URLS } from '@Config/routes'
import { getHostURLConfiguration } from '@Services/service'

import ApplicationInfoForm from './ApplicationInfoForm'
import { ApplicationSelectionList } from './ApplicationSelectionList'
import { createAppInitialFormErrorState, createAppInitialFormState } from './constants'
import HeaderSection from './HeaderSection'
import { createApp } from './service'
import Sidebar from './Sidebar'
import {
    ApplicationInfoFormProps,
    CreateAppFormErrorStateType,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreateAppModalProps,
    CreationMethodType,
} from './types'
import { getCreateMethodConfig, getNoItemSelectToastText, validateFormField } from './utils'

import './styles.scss'

const createDevtronAppUsingTemplate = importComponentFromFELibrary('createDevtronAppUsingTemplate', null, 'function')

const CreateAppModal = ({ isJobView, handleClose }: CreateAppModalProps) => {
    const history = useHistory()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCreationMethod, setSelectedCreationMethod] = useState<CreationMethodType>(null)
    const [formState, setFormState] = useState<CreateAppFormStateType>(structuredClone(createAppInitialFormState))
    const [formErrorState, setFormErrorState] = useState<CreateAppFormErrorStateType>(
        structuredClone(createAppInitialFormErrorState),
    )
    const [isTagsAccordionExpanded, setIsTagsAccordionExpanded] = useState(false)

    const createMethodConfig = useMemo(
        () => getCreateMethodConfig(isJobView, selectedCreationMethod),
        [isJobView, selectedCreationMethod],
    )

    useEffect(() => {
        setSelectedCreationMethod(createMethodConfig[0].value)
    }, [])

    const isCreationMethodTemplate = selectedCreationMethod === CreationMethodType.template

    const toggleIsTagsAccordionExpanded = () => {
        setIsTagsAccordionExpanded((prev) => !prev)
    }

    const validateForm = () => {
        const updatedFormErrorState = structuredClone(formErrorState)

        updatedFormErrorState.projectId = validateFormField('projectId', formState.projectId)
        updatedFormErrorState.name = validateFormField('name', formState.name)
        updatedFormErrorState.description = validateFormField('description', formState.description)

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

        if (invalidLabels && !isTagsAccordionExpanded) {
            setIsTagsAccordionExpanded(true)
        }

        return {
            isFormValid: Object.keys(updatedFormErrorState)
                .filter((key: keyof typeof updatedFormErrorState) => key !== 'tags' && key !== 'workflowConfig')
                .every((key) => !updatedFormErrorState[key]),
            invalidLabels,
            labelTags,
            invalidWorkFlow: Object.values(updatedFormErrorState.workflowConfig ?? {}).some((value) => !!value),
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
                    case CreateAppFormStateActionType.updateCloneAppConfig:
                        updatedFormState.cloneAppConfig = value
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
                        updatedFormErrorState.workflowConfig = value.workflowIdToErrorMessageMap
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
            : getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG, isJobView, false)
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

        if (isCreationMethodTemplate) {
            if (!formState.templateConfig?.templateId || !formState.cloneAppConfig?.appId) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: getNoItemSelectToastText(CreationMethodType.template),
                })
                return
            }

            if (invalidWorkFlow) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: Object.values(formErrorState.workflowConfig)[0],
                })
                return
            }
        }

        if (selectedCreationMethod === CreationMethodType.clone && !formState.cloneAppConfig?.appId) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: getNoItemSelectToastText(CreationMethodType.clone),
            })
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

        const request = {
            appName: formState.name,
            teamId: +formState.projectId,
            description: formState.description?.trim(),
            labels: labelTags,
            // type 2 is for job type
            appType: isJobView ? 2 : null,
            ...(selectedCreationMethod === CreationMethodType.clone
                ? {
                      templateId: formState.cloneAppConfig.appId,
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

    const getSelectedMethodContent = () => {
        switch (selectedCreationMethod) {
            case CreationMethodType.blank:
                return (
                    <ApplicationInfoForm
                        formState={formState}
                        handleFormStateChange={handleFormStateChange}
                        formErrorState={formErrorState}
                        handleTagErrorChange={handleTagErrorChange}
                        isJobView={isJobView}
                        selectedCreationMethod={selectedCreationMethod}
                        isTagsAccordionExpanded={isTagsAccordionExpanded}
                        toggleIsTagsAccordionExpanded={toggleIsTagsAccordionExpanded}
                    />
                )
            case CreationMethodType.clone:
            case CreationMethodType.template:
                return (
                    <ApplicationSelectionList
                        formState={formState}
                        formErrorState={formErrorState}
                        selectedCreationMethod={selectedCreationMethod}
                        handleFormStateChange={handleFormStateChange}
                        handleTagErrorChange={handleTagErrorChange}
                        isJobView={isJobView}
                        isTagsAccordionExpanded={isTagsAccordionExpanded}
                        toggleIsTagsAccordionExpanded={toggleIsTagsAccordionExpanded}
                    />
                )
            default:
                return null
        }
    }

    const handleCreationMethodChange = (method: CreationMethodType) => {
        setFormState((prev) => ({
            ...prev,
            templateConfig: null,
            cloneAppConfig: null,
        }))

        setSelectedCreationMethod(method)
    }

    return (
        <Drawer position="right" width="1024px" onEscape={handleClose}>
            <div className="h-100 bg__modal--primary flexbox-col dc__overflow-hidden">
                <HeaderSection isJobView={isJobView} handleClose={handleClose} isCloseDisabled={isSubmitting} />
                <div className="flexbox flex-grow-1 dc__overflow-hidden">
                    <Sidebar
                        selectedCreationMethod={selectedCreationMethod}
                        handleCreationMethodChange={handleCreationMethodChange}
                        createMethodConfig={createMethodConfig}
                        isJobView={isJobView}
                    />
                    <div
                        className={`flexbox-col flex-grow-1 bg__secondary dc__overflow-auto ${selectedCreationMethod === CreationMethodType.blank ? 'p-20' : ''}`}
                    >
                        {getSelectedMethodContent()}
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
