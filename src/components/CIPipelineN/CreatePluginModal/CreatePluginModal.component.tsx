import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga4'
import {
    BuildStageVariable,
    ButtonWithLoader,
    Checkbox,
    CHECKBOX_VALUE,
    EditImageFormFieldProps,
    getAvailablePluginTags,
    getIsRequestAborted,
    getPluginsDetail,
    getUpdatedPluginStore,
    PluginType,
    ServerErrors,
    showError,
    StepType,
    stopPropagation,
    useAsync,
    validateDescription,
    validateDisplayName,
    validateName,
    VariableType,
    VisibleModal2,
    validateSemanticVersioning,
    PluginDataStoreType,
    abortPreviousRequests,
    ToastManager,
    ToastVariantType,
    RefVariableType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import CreatePluginFormContent from './CreatePluginFormContent'
import {
    CreatePluginFormType,
    CreatePluginHandleChangeType,
    CreatePluginModalProps,
    CreatePluginModalURLParamsType,
    CreatePluginActionType,
    CreatePluginFormErrorType,
    CreatePluginFormContentProps,
    HandleCreatePluginReturnType,
} from './types'
import { createPlugin, getParentPluginList } from './service'
import { CREATE_PLUGIN_DEFAULT_FORM_ERROR } from './constants'
import { getDefaultPluginFormData, validateDocumentationLink, validateTags } from './utils'
import './CreatePluginModal.scss'

const CreatePluginModal = ({ handleClose }: CreatePluginModalProps) => {
    const { appId } = useParams<CreatePluginModalURLParamsType>()
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        handleHideScopedVariableWidgetUpdate,
        handleDisableParentModalCloseUpdate,
        handleUpdateAvailableTags,
        pluginDataStore,
        handlePluginDataStoreUpdate,
        calculateLastStepDetail,
        validateStage,
    } = useContext(pipelineContext)

    const currentStepData: StepType = formData[activeStageName].steps[selectedTaskIndex]
    const formInputVariables: VariableType[] = currentStepData.inlineStepDetail?.inputVariables || []

    const [isLoadingParentPluginList, parentPluginList, parentPluginListError, reloadParentPluginList] = useAsync(
        () => getParentPluginList(appId ? +appId : null),
        [],
    )
    const [areTagsLoading, availableTags, availableTagsError, reloadAvailableTags] = useAsync(
        () => getAvailablePluginTags(appId ? +appId : null),
        [],
    )

    useEffect(() => {
        handleDisableParentModalCloseUpdate(true)
        handleHideScopedVariableWidgetUpdate(true)

        return () => {
            handleDisableParentModalCloseUpdate(false)
            handleHideScopedVariableWidgetUpdate(false)
        }
    }, [])

    const [pluginForm, setPluginForm] = useState<CreatePluginFormType>(getDefaultPluginFormData(formInputVariables))
    const [pluginFormError, setPluginFormError] = useState<CreatePluginFormErrorType>(
        structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR),
    )
    const [arePluginDetailsLoading, setArePluginDetailsLoading] = useState<boolean>(false)
    const [pluginDetailsError, setPluginDetailsError] = useState<ServerErrors>(null)
    const [selectedPluginVersions, setSelectedPluginVersions] = useState<
        CreatePluginFormContentProps['selectedPluginVersions']
    >([])
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)
    const pluginDetailsAbortControllerRef = useRef<AbortController>(new AbortController())

    const handleCloseModal = () => {
        if (isSubmitLoading) {
            return
        }

        handleClose()
    }

    const handleUpdateFormWithPluginData = (
        clonedPluginForm: CreatePluginFormType,
        pluginDetails: PluginDataStoreType['pluginVersionStore'][0],
    ): CreatePluginFormType => {
        const { pluginIdentifier, pluginVersion, docLink, description, tags, inputVariables, icon } = pluginDetails
        const latestVersionInputVariablesMap = inputVariables.reduce((acc, inputVariable) => {
            acc[inputVariable.name] = inputVariable
            return acc
        }, {})

        return {
            ...clonedPluginForm,
            icon,
            pluginIdentifier,
            pluginVersion,
            docLink,
            description,
            tags,
            // traversing on our input variables and setting allowEmptyValue on basis of latest plugin's input variables
            inputVariables: clonedPluginForm.inputVariables.map((inputVariable) => {
                const latestVersionInputVariable = latestVersionInputVariablesMap[inputVariable.name]
                return {
                    ...inputVariable,
                    allowEmptyValue: latestVersionInputVariable ? latestVersionInputVariable.allowEmptyValue : false,
                }
            }),
        }
    }

    /**
     * @description This method is used to prefill the form with the selected plugin (latest version) details.
     */
    const prefillFormOnPluginSelection: CreatePluginFormContentProps['prefillFormOnPluginSelection'] = async (
        clonedPluginForm,
    ) => {
        try {
            setPluginDetailsError(null)
            const { id: parentPluginId } = clonedPluginForm
            const parentPluginLatestVersionId = pluginDataStore.parentPluginStore[parentPluginId]?.latestVersionId

            if (parentPluginLatestVersionId && pluginDataStore.pluginVersionStore[parentPluginLatestVersionId]) {
                const { latestVersionId, pluginVersions } = pluginDataStore.parentPluginStore[parentPluginId]
                setSelectedPluginVersions(pluginVersions.map((pluginVersionData) => pluginVersionData.pluginVersion))
                const latestPluginDetails = pluginDataStore.pluginVersionStore[latestVersionId]
                return handleUpdateFormWithPluginData(clonedPluginForm, latestPluginDetails)
            }

            setArePluginDetailsLoading(true)

            const {
                pluginStore: { parentPluginStore, pluginVersionStore },
            } = await abortPreviousRequests(
                () =>
                    getPluginsDetail({
                        appId: appId ? +appId : null,
                        parentPluginIds: [parentPluginId],
                        signal: pluginDetailsAbortControllerRef.current.signal,
                    }),
                pluginDetailsAbortControllerRef,
            )
            handlePluginDataStoreUpdate(getUpdatedPluginStore(pluginDataStore, parentPluginStore, pluginVersionStore))

            const { latestVersionId, pluginVersions } = parentPluginStore[parentPluginId]
            setSelectedPluginVersions(pluginVersions.map((pluginVersionData) => pluginVersionData.pluginVersion))

            return handleUpdateFormWithPluginData(clonedPluginForm, pluginVersionStore[latestVersionId])
        } catch (error) {
            if (!getIsRequestAborted(error)) {
                setPluginDetailsError(error)
            }
            return clonedPluginForm
        } finally {
            setArePluginDetailsLoading(false)
        }
    }

    const handleChange: CreatePluginHandleChangeType = async ({ action, payload }) => {
        let clonedPluginForm = structuredClone(pluginForm)
        let clonedPluginFormError = structuredClone(pluginFormError)

        switch (action) {
            case CreatePluginActionType.UPDATE_CURRENT_TAB:
                clonedPluginForm = {
                    ...getDefaultPluginFormData(formInputVariables),
                    currentTab: payload,
                }
                clonedPluginFormError = structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR)
                setArePluginDetailsLoading(false)
                setPluginDetailsError(null)
                break
            case CreatePluginActionType.UPDATE_PLUGIN_ICON:
                clonedPluginForm.icon = payload
                break
            case CreatePluginActionType.UPDATE_NEW_PLUGIN_NAME:
                clonedPluginForm.id = 0
                clonedPluginForm.name = payload
                clonedPluginFormError.name = validateDisplayName(payload).message
                break
            case CreatePluginActionType.UPDATE_PARENT_PLUGIN:
                clonedPluginForm.id = payload.id
                clonedPluginForm.name = payload.name

                // Changing the plugin id and name so that in case of loading can show the correct plugin name
                setPluginForm(clonedPluginForm)

                clonedPluginForm = await prefillFormOnPluginSelection(clonedPluginForm)
                clonedPluginFormError = structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR)
                break
            case CreatePluginActionType.UPDATE_PLUGIN_IDENTIFIER:
                clonedPluginForm.pluginIdentifier = payload
                clonedPluginFormError.pluginIdentifier = validateName(payload).message
                break
            case CreatePluginActionType.UPDATE_PLUGIN_VERSION:
                clonedPluginForm.pluginVersion = payload
                clonedPluginFormError.pluginVersion = validateSemanticVersioning(payload).message
                break
            case CreatePluginActionType.UPDATE_DOCUMENTATION_LINK:
                clonedPluginForm.docLink = payload
                clonedPluginFormError.docLink = validateDocumentationLink(payload).message
                break
            case CreatePluginActionType.UPDATE_DESCRIPTION:
                clonedPluginForm.description = payload
                clonedPluginFormError.description = validateDescription(payload).message
                break
            case CreatePluginActionType.UPDATE_TAGS:
                clonedPluginForm.tags = payload.tags
                clonedPluginFormError.tags = validateTags(payload.tags).message
                break
            case CreatePluginActionType.TOGGLE_INPUT_VARIABLE_ALLOW_EMPTY_VALUE:
                clonedPluginForm.inputVariables[payload.index].allowEmptyValue =
                    !clonedPluginForm.inputVariables[payload.index].allowEmptyValue
                break
            case CreatePluginActionType.TOGGLE_REPLACE_CUSTOM_TASK:
                clonedPluginForm.shouldReplaceCustomTask = !clonedPluginForm.shouldReplaceCustomTask
                break
            default:
                break
        }

        setPluginForm(clonedPluginForm)
        setPluginFormError(clonedPluginFormError)
    }

    const handleIconError: EditImageFormFieldProps['handleError'] = (errorMessage) => {
        setPluginFormError((prevPluginFormError) => ({
            ...prevPluginFormError,
            icon: errorMessage,
        }))
    }

    const handleToggleShouldReplaceCustomTask = () => {
        handleChange({
            action: CreatePluginActionType.TOGGLE_REPLACE_CUSTOM_TASK,
        })
    }

    const handleCreatePlugin = async (): Promise<HandleCreatePluginReturnType> => {
        try {
            setIsSubmitLoading(true)
            const {
                result: { pluginVersionId },
            } = await createPlugin({
                stepData: currentStepData,
                appId: +appId || null,
                pluginForm,
                availableTags,
            })

            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: pluginForm.id ? 'Plugin version created successfully' : 'Plugin created successfully',
            })

            return {
                pluginVersionId,
                hasError: false,
            }
        } catch (error) {
            setIsSubmitLoading(false)
            showError(error)
            return {
                pluginVersionId: null,
                hasError: true,
            }
        }
    }

    const handleReplacePluginAfterCreation = (pluginVersionId: number, updatedPluginDataStore: PluginDataStoreType) => {
        const clonedFormData = structuredClone(formData)

        const pluginFormInputVariableMap: Record<string, string> = pluginForm.inputVariables.reduce(
            (acc, inputVariable) => {
                acc[inputVariable.name] = inputVariable.value
                return acc
            },
            {} as Record<string, string>,
        )
        const { inputVariables, outputVariables } = updatedPluginDataStore.pluginVersionStore[pluginVersionId]

        const selectedTask: StepType = clonedFormData[activeStageName].steps[selectedTaskIndex]
        selectedTask.name = pluginForm.name
        selectedTask.description = pluginForm.description
        selectedTask.stepType = PluginType.PLUGIN_REF
        selectedTask.outputDirectoryPath = null
        selectedTask.inlineStepDetail = null
        selectedTask.pluginRefStepDetail = {
            id: 0,
            pluginId: pluginVersionId,
            inputVariables:
                inputVariables?.map((inputVariable) => ({
                    ...inputVariable,
                    variableType: RefVariableType.NEW,
                    value: pluginFormInputVariableMap[inputVariable.name] || '',
                })) || [],
            outputVariables: outputVariables || [],
            conditionDetails: [],
        }
        calculateLastStepDetail(false, clonedFormData, activeStageName)
        validateStage(BuildStageVariable.PreBuild, clonedFormData, undefined, updatedPluginDataStore)
        validateStage(BuildStageVariable.PostBuild, clonedFormData, undefined, updatedPluginDataStore)
        setFormData(clonedFormData)
    }

    const handleSubmit = async () => {
        ReactGA.event({
            category: 'Pipeline configuration',
            action: 'Save as plugin',
        })

        if (Object.values(pluginFormError).some((error) => !!error)) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please fix the errors before saving the plugin',
            })
            return
        }

        // Checking required fields
        if (!pluginForm.name || !pluginForm.pluginIdentifier || !pluginForm.pluginVersion) {
            setPluginFormError({
                ...pluginFormError,
                name: validateDisplayName(pluginForm.name).message,
                pluginIdentifier: validateName(pluginForm.pluginIdentifier).message,
                pluginVersion: validateSemanticVersioning(pluginForm.pluginVersion).message,
            })
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please fill the required fields',
            })
            return
        }

        const { pluginVersionId, hasError } = await handleCreatePlugin()

        if (hasError) {
            return
        }

        try {
            const [
                updatedTags,
                {
                    pluginStore: { parentPluginStore, pluginVersionStore },
                },
            ] = await Promise.all([
                getAvailablePluginTags(appId ? +appId : null),
                getPluginsDetail({
                    appId: appId ? +appId : null,
                    pluginIds: [pluginVersionId],
                }),
            ])

            const clonedPluginDataStore = getUpdatedPluginStore(pluginDataStore, parentPluginStore, pluginVersionStore)
            handleUpdateAvailableTags(updatedTags)
            handlePluginDataStoreUpdate(clonedPluginDataStore)

            if (pluginForm.shouldReplaceCustomTask) {
                handleReplacePluginAfterCreation(pluginVersionId, clonedPluginDataStore)
            }
        } catch {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Unable to retrieve data for newly created plugin',
            })
        }

        setIsSubmitLoading(false)
        handleClose()
    }

    return (
        <VisibleModal2 close={handleCloseModal}>
            <div
                className="bg__primary dc__position-fixed dc__right-0 dc__top-0 h-100 flexbox-col dc__content-space w-800"
                onClick={stopPropagation}
            >
                <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                    <div className="py-12 px-20 flexbox dc__content-space dc__border-bottom">
                        <h2 className="m-0 cn-9 fs-16 fw-6 lh-24">Save as plugin</h2>

                        <button
                            type="button"
                            className="p-0 flex dc__no-border dc__no-background dc__outline-none-imp dc__tab-focus h-20 w-20 dc__tab-focus"
                            onClick={handleCloseModal}
                            disabled={isSubmitLoading}
                            aria-label="Close create plugin modal"
                            data-testid="close-create-plugin-modal"
                        >
                            <ICCross className="icon-dim-20 fcn-6 dc__no-shrink" />
                        </button>
                    </div>

                    <CreatePluginFormContent
                        isLoadingParentPluginList={isLoadingParentPluginList}
                        parentPluginList={parentPluginList}
                        parentPluginListError={parentPluginListError}
                        reloadParentPluginList={reloadParentPluginList}
                        pluginForm={pluginForm}
                        pluginFormError={pluginFormError}
                        handleChange={handleChange}
                        areTagsLoading={areTagsLoading}
                        availableTags={availableTags}
                        availableTagsError={availableTagsError}
                        reloadAvailableTags={reloadAvailableTags}
                        handleIconError={handleIconError}
                        arePluginDetailsLoading={arePluginDetailsLoading}
                        pluginDetailsError={pluginDetailsError}
                        prefillFormOnPluginSelection={prefillFormOnPluginSelection}
                        selectedPluginVersions={selectedPluginVersions}
                    />
                </div>

                <div className="dc__border-top py-16 px-20 flexbox dc__content-space dc__align-items-center">
                    <Checkbox
                        isChecked={pluginForm.shouldReplaceCustomTask}
                        onChange={handleToggleShouldReplaceCustomTask}
                        rootClassName="icon-dim-20 w-100 mb-0 dc_width-max-content"
                        dataTestId="replace-custom-task-checkbox"
                        tabIndex={0}
                        value={CHECKBOX_VALUE.CHECKED}
                    >
                        <span className="cn-9 fs-13 fw-4 lh-20">Create and replace custom task with this plugin</span>
                    </Checkbox>

                    <ButtonWithLoader
                        type="button"
                        rootClassName="cta flex h-32 w-160"
                        dataTestId="create-plugin-cta"
                        onClick={handleSubmit}
                        disabled={isSubmitLoading}
                        isLoading={isSubmitLoading}
                    >
                        Create Plugin Version
                    </ButtonWithLoader>
                </div>
            </div>
        </VisibleModal2>
    )
}

export default CreatePluginModal
