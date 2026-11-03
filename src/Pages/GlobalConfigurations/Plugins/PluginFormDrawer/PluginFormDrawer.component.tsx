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

import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    APIResponseHandler,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Drawer,
    EditImageFormFieldProps,
    getIsRequestAborted,
    getPluginsDetail,
    Icon,
    ServerErrors,
    showError,
    stopPropagation,
    ToastManager,
    ToastVariantType,
    useQueryClient,
} from '@devtron-labs/devtron-fe-common-lib'

import { CREATE_PLUGIN_DEFAULT_FORM_ERROR } from '@Components/CIPipelineN/CreatePluginModal/constants'
import CreatePluginFormContent from '@Components/CIPipelineN/CreatePluginModal/CreatePluginFormContent'
import { createPlugin } from '@Components/CIPipelineN/CreatePluginModal/service'
import {
    CreatePluginActionType,
    CreatePluginFormContentProps,
    CreatePluginFormErrorType,
    CreatePluginFormType,
    CreatePluginFormViewType,
    CreatePluginHandleChangeType,
} from '@Components/CIPipelineN/CreatePluginModal/types'
import {
    getDefaultPluginFormData,
    getPluginFormStateOnChange,
    validatePluginFormBeforeSubmit,
} from '@Components/CIPipelineN/CreatePluginModal/utils'

import {
    getDefaultPluginStep,
    PLUGIN_DRAWER_WIDTH,
    PLUGIN_FORM_DRAWER_TITLE,
    PLUGIN_FORM_SUBMIT_TEXT,
    PLUGIN_QUERY_KEYS,
    PLUGINS_ROOT_URL,
} from '../constants'
import { getPluginVersionDetail, useGetParentPluginList, useGetPluginTags, useGetPluginVersionDetail } from '../service'
import { PluginFormDrawerProps, PluginFormMode, PluginsURLParamsType, PluginVersionDetailDTO } from '../types'
import {
    getIsPresetPlugin,
    getPluginDetailURL,
    getPluginFormFromPluginVersionDetail,
    getStepFromPluginVersionDetail,
} from '../utils'
import PluginTaskEditor from './PluginTaskEditor'
import usePluginTaskForm from './usePluginTaskForm'

const PluginFormDrawer = ({ mode, handleSuccess }: PluginFormDrawerProps) => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const { pluginVersionId } = useParams<PluginsURLParamsType>()

    const isCreateMode = mode === PluginFormMode.CREATE

    const { formData, setFormData, formDataErrorObj, setFormDataErrorObj, resetStep, getValidatedStep } =
        usePluginTaskForm()

    const [pluginForm, setPluginForm] = useState<CreatePluginFormType>(() => getDefaultPluginFormData([]))
    const [pluginFormError, setPluginFormError] = useState<CreatePluginFormErrorType>(() =>
        structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR),
    )
    const [arePluginDetailsLoading, setArePluginDetailsLoading] = useState<boolean>(false)
    const [pluginDetailsError, setPluginDetailsError] = useState<ServerErrors>(null)
    const [selectedPluginVersions, setSelectedPluginVersions] = useState<string[]>([])
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)
    const pluginDetailsAbortControllerRef = useRef<AbortController>(new AbortController())

    const queryClient = useQueryClient()
    // Ensures the source plugin is applied to the form only once, so that background refetches do not reset user changes
    const hasAppliedSourcePluginRef = useRef<boolean>(false)

    const {
        data: parentPluginList,
        isLoading: isLoadingParentPluginList,
        error: parentPluginListError,
        refetch: refetchParentPluginList,
    } = useGetParentPluginList()

    const {
        data: availableTags,
        isLoading: areTagsLoading,
        error: availableTagsError,
        refetch: refetchAvailableTags,
    } = useGetPluginTags()

    // Source plugin version for clone / new version flows
    const {
        data: sourcePluginVersionDetail,
        isLoading: isSourcePluginLoading,
        error: sourcePluginError,
        refetch: refetchSourcePlugin,
    } = useGetPluginVersionDetail(+pluginVersionId, !isCreateMode)

    const applyPluginVersionDetail = (pluginVersionDetail: PluginVersionDetailDTO) => {
        resetStep(getStepFromPluginVersionDetail(pluginVersionDetail))
        setSelectedPluginVersions(pluginVersionDetail.versions?.map((version) => version.pluginVersion) ?? [])
    }

    useEffect(() => {
        if (isCreateMode || !sourcePluginVersionDetail || hasAppliedSourcePluginRef.current) {
            return
        }

        hasAppliedSourcePluginRef.current = true

        // New versions can only be created for shared plugins, preset ones can only be cloned
        if (mode === PluginFormMode.NEW_VERSION && getIsPresetPlugin(sourcePluginVersionDetail)) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'New versions cannot be created for plugins by Devtron, clone the plugin instead.',
            })
            navigate({ pathname: getPluginDetailURL(pluginVersionId), search }, { replace: true })
            return
        }

        applyPluginVersionDetail(sourcePluginVersionDetail)
        setPluginForm(getPluginFormFromPluginVersionDetail(sourcePluginVersionDetail, mode))
        setPluginFormError(structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR))
    }, [sourcePluginVersionDetail])

    useEffect(() => () => pluginDetailsAbortControllerRef.current.abort(), [])

    const handleClose = () => navigate({ pathname: PLUGINS_ROOT_URL, search })

    const handleBack = pluginVersionId
        ? () => navigate({ pathname: getPluginDetailURL(pluginVersionId), search })
        : null

    const handleCloseDrawer = () => {
        if (!isSubmitLoading) {
            handleClose()
        }
    }

    /**
     * Prefills the form with the latest version of the selected plugin in the new version tab of create flow
     */
    const prefillFormOnPluginSelection: CreatePluginFormContentProps['prefillFormOnPluginSelection'] = async (
        clonedPluginForm,
    ) => {
        try {
            setPluginDetailsError(null)
            setArePluginDetailsLoading(true)

            const { pluginVersionDetail, signal } = await abortPreviousRequests(async () => {
                const { signal: requestSignal } = pluginDetailsAbortControllerRef.current
                const {
                    pluginStore: { parentPluginStore },
                } = await getPluginsDetail({
                    appId: null,
                    parentPluginIds: [clonedPluginForm.id],
                    signal: requestSignal,
                })
                const { latestVersionId } = parentPluginStore[clonedPluginForm.id]

                const latestPluginVersionDetail = await queryClient.fetchQuery({
                    queryKey: [PLUGIN_QUERY_KEYS.VERSION_DETAIL, latestVersionId],
                    queryFn: ({ signal: querySignal }) => getPluginVersionDetail(latestVersionId, querySignal),
                })

                return { pluginVersionDetail: latestPluginVersionDetail, signal: requestSignal }
            }, pluginDetailsAbortControllerRef)

            // Tab was switched or another plugin was selected while fetching
            if (signal.aborted) {
                return clonedPluginForm
            }

            applyPluginVersionDetail(pluginVersionDetail)

            const updatedPluginForm: CreatePluginFormType = {
                ...getPluginFormFromPluginVersionDetail(pluginVersionDetail, PluginFormMode.NEW_VERSION),
                currentTab: CreatePluginFormViewType.EXISTING_PLUGIN,
            }
            setPluginForm(updatedPluginForm)
            return updatedPluginForm
        } catch (error) {
            if (!getIsRequestAborted(error)) {
                setPluginDetailsError(error)
            }
            return clonedPluginForm
        } finally {
            setArePluginDetailsLoading(false)
        }
    }

    const handleChange: CreatePluginHandleChangeType = async (params) => {
        if (params.action === CreatePluginActionType.UPDATE_PARENT_PLUGIN) {
            const clonedPluginForm = { ...structuredClone(pluginForm), ...params.payload }
            // Changing the plugin id and name so that in case of loading can show the correct plugin name
            setPluginForm(clonedPluginForm)

            setPluginFormError(structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR))
            // Form is updated inside prefill on success, skipping here to avoid stale updates after tab switch
            await prefillFormOnPluginSelection(clonedPluginForm)
            return
        }

        if (params.action === CreatePluginActionType.UPDATE_CURRENT_TAB) {
            pluginDetailsAbortControllerRef.current.abort()
            setArePluginDetailsLoading(false)
            setPluginDetailsError(null)
            setSelectedPluginVersions([])
            resetStep(getDefaultPluginStep())
        }

        const updatedPluginFormState = getPluginFormStateOnChange({
            pluginForm,
            pluginFormError,
            params,
            defaultInputVariables: [],
        })

        setPluginForm(updatedPluginFormState.pluginForm)
        setPluginFormError(updatedPluginFormState.pluginFormError)
    }

    const handleIconError: EditImageFormFieldProps['handleError'] = (errorMessage) => {
        setPluginFormError((prevPluginFormError) => ({
            ...prevPluginFormError,
            icon: errorMessage,
        }))
    }

    const handleSubmit = async () => {
        const {
            isValid,
            pluginFormError: updatedPluginFormError,
            errorMessage,
        } = validatePluginFormBeforeSubmit({ pluginForm, pluginFormError })

        if (!isValid) {
            setPluginFormError(updatedPluginFormError)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: errorMessage,
            })
            return
        }

        const stepData = getValidatedStep(pluginForm.name)
        if (!stepData) {
            return
        }

        setIsSubmitLoading(true)
        try {
            const {
                result: { pluginVersionId: createdPluginVersionId },
            } = await createPlugin({
                stepData,
                appId: null,
                pluginForm: { ...pluginForm, inputVariables: stepData.inlineStepDetail?.inputVariables ?? [] },
                availableTags,
            })

            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: pluginForm.id ? 'Plugin version created successfully' : 'Plugin created successfully',
            })
            handleSuccess(createdPluginVersionId)
        } catch (error) {
            showError(error)
        } finally {
            setIsSubmitLoading(false)
        }
    }

    const isNewVersionForm = pluginForm.currentTab === CreatePluginFormViewType.EXISTING_PLUGIN

    return (
        <Drawer position="right" width={PLUGIN_DRAWER_WIDTH} onClose={handleCloseDrawer} onEscape={handleCloseDrawer}>
            <div className="flexbox-col h-100 bg__primary" onClick={stopPropagation}>
                <div className="flexbox dc__align-items-center dc__content-space dc__gap-12 py-12 px-20 dc__border-bottom">
                    <div className="flexbox dc__align-items-center dc__gap-8">
                        {handleBack && (
                            <Button
                                icon={<Icon name="ic-caret-left" color={null} />}
                                dataTestId="plugin-form-drawer-back"
                                style={ButtonStyleType.neutral}
                                size={ComponentSizeType.xs}
                                variant={ButtonVariantType.borderLess}
                                ariaLabel="Back to plugin details"
                                onClick={handleBack}
                                disabled={isSubmitLoading}
                                showAriaLabelInTippy={false}
                            />
                        )}
                        <h2 className="m-0 cn-9 fs-16 fw-6 lh-24">{PLUGIN_FORM_DRAWER_TITLE[mode]}</h2>
                    </div>

                    <Button
                        icon={<Icon name="ic-close-large" color={null} />}
                        dataTestId="plugin-form-drawer-close"
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        variant={ButtonVariantType.borderLess}
                        ariaLabel="Close plugin drawer"
                        onClick={handleCloseDrawer}
                        disabled={isSubmitLoading}
                        showAriaLabelInTippy={false}
                    />
                </div>

                <APIResponseHandler
                    isLoading={isSourcePluginLoading}
                    progressingProps={{ pageLoader: true }}
                    error={sourcePluginError}
                    errorScreenManagerProps={{ code: sourcePluginError?.code, reload: refetchSourcePlugin }}
                >
                    <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                        <CreatePluginFormContent
                            isLoadingParentPluginList={isLoadingParentPluginList}
                            parentPluginList={parentPluginList}
                            parentPluginListError={parentPluginListError}
                            reloadParentPluginList={refetchParentPluginList}
                            pluginForm={pluginForm}
                            pluginFormError={pluginFormError}
                            handleChange={handleChange}
                            areTagsLoading={areTagsLoading}
                            availableTags={availableTags}
                            availableTagsError={availableTagsError}
                            reloadAvailableTags={refetchAvailableTags}
                            handleIconError={handleIconError}
                            arePluginDetailsLoading={arePluginDetailsLoading}
                            pluginDetailsError={pluginDetailsError}
                            prefillFormOnPluginSelection={prefillFormOnPluginSelection}
                            selectedPluginVersions={selectedPluginVersions}
                            hideTabs={!isCreateMode}
                            isParentPluginLocked={mode === PluginFormMode.NEW_VERSION}
                            hideInputVariables
                        >
                            <PluginTaskEditor
                                formData={formData}
                                setFormData={setFormData}
                                formDataErrorObj={formDataErrorObj}
                                setFormDataErrorObj={setFormDataErrorObj}
                            />
                        </CreatePluginFormContent>
                    </div>

                    <div className="flexbox dc__content-end dc__border-top py-16 px-20">
                        <Button
                            dataTestId="plugin-form-drawer-submit"
                            text={
                                isNewVersionForm
                                    ? PLUGIN_FORM_SUBMIT_TEXT[PluginFormMode.NEW_VERSION]
                                    : PLUGIN_FORM_SUBMIT_TEXT[mode]
                            }
                            onClick={handleSubmit}
                            isLoading={isSubmitLoading}
                            disabled={arePluginDetailsLoading}
                        />
                    </div>
                </APIResponseHandler>
            </div>
        </Drawer>
    )
}

export default PluginFormDrawer
