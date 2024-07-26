import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Checkbox,
    CHECKBOX_VALUE,
    EditImageFormFieldProps,
    getAvailablePluginTags,
    getPluginsDetail,
    ServerErrors,
    stopPropagation,
    useAsync,
    validateDescription,
    validateDisplayName,
    validateName,
    VariableType,
    VisibleModal2,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { toast } from 'react-toastify'
import CreatePluginFormContent from './CreatePluginFormContent'
import {
    CreatePluginFormType,
    CreatePluginHandleChangeType,
    CreatePluginModalProps,
    CreatePluginModalURLParamsType,
    CreatePluginActionType,
    CreatePluginFormErrorType,
    CreatePluginFormContentProps,
} from './types'
import { getParentPluginList } from './service'
import { CREATE_PLUGIN_DEFAULT_FORM_ERROR } from './constants'
import { getDefaultPluginFormData, validateDocumentationLink, validatePluginVersion, validateTags } from './utils'
import './CreatePluginModal.scss'

const CreatePluginModal = ({ handleClose }: CreatePluginModalProps) => {
    const { appId } = useParams<CreatePluginModalURLParamsType>()
    const {
        formData,
        selectedTaskIndex,
        activeStageName,
        handleHideScopedVariableWidgetUpdate,
        handleDisableParentModalCloseUpdate,
    } = useContext(pipelineContext)
    const formInputVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.inputVariables

    const [isLoadingParentPluginList, parentPluginList, parentPluginListError, reloadParentPluginList] = useAsync(
        () => getParentPluginList(appId ? +appId : null),
        [],
    )
    // TODO: Make sure to re-fetch the data on save
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

    // FIXME: Check if abortController is required
    /**
     * @description This method is used to prefill the form with the selected plugin (latest version) details.
     */
    const prefillFormOnPluginSelection: CreatePluginFormContentProps['prefillFormOnPluginSelection'] = async (
        clonedPluginForm,
    ) => {
        try {
            const { id: parentPluginId } = clonedPluginForm
            setArePluginDetailsLoading(true)
            // TODO: Can check pluginDataStore before making the API call
            const {
                pluginStore: { parentPluginStore, pluginVersionStore },
            } = await getPluginsDetail({
                appId: appId ? +appId : null,
                parentPluginIds: [parentPluginId],
            })
            const { latestVersionId, pluginVersions } = parentPluginStore[parentPluginId]
            const { pluginIdentifier, pluginVersion, docLink, description, tags, inputVariables } =
                pluginVersionStore[latestVersionId]
            const latestVersionInputVariablesMap = inputVariables.reduce((acc, inputVariable) => {
                acc[inputVariable.name] = inputVariable
                return acc
            }, {})

            setSelectedPluginVersions(pluginVersions.map((pluginVersionData) => pluginVersionData.pluginVersion))

            return {
                ...clonedPluginForm,
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
                        allowEmptyValue: latestVersionInputVariable
                            ? latestVersionInputVariable.allowEmptyValue
                            : false,
                    }
                }),
            }
        } catch (error) {
            setPluginDetailsError(error)
            return clonedPluginForm
        } finally {
            setArePluginDetailsLoading(false)
        }
    }

    // TODO: Can validate in case of duplicate name
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
                clonedPluginForm = await prefillFormOnPluginSelection(clonedPluginForm)
                break
            case CreatePluginActionType.UPDATE_PLUGIN_ID:
                clonedPluginForm.pluginIdentifier = payload
                clonedPluginFormError.pluginIdentifier = validateName(payload).message
                break
            case CreatePluginActionType.UPDATE_PLUGIN_VERSION:
                clonedPluginForm.pluginVersion = payload
                clonedPluginFormError.pluginVersion = validatePluginVersion(payload).message
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

    /* Have to make an exception (i.e, having a separate handler for form error update) 
     for icon error since it is being handled by component itself 
    */
    const handleIconError: EditImageFormFieldProps['handleError'] = (errorMessage) => {
        const clonedPluginFormError = structuredClone(pluginFormError)
        clonedPluginFormError.icon = errorMessage
        setPluginFormError(clonedPluginFormError)
    }

    const handleToggleShouldReplaceCustomTask = () => {
        handleChange({
            action: CreatePluginActionType.TOGGLE_REPLACE_CUSTOM_TASK,
        })
    }

    const handleSubmit = async () => {
        if (Object.values(pluginFormError).some((error) => !!error)) {
            toast.error('Please fix the errors before saving the plugin')
            return
        }

        // Checking required fields
        if (!pluginForm.name || !pluginForm.pluginIdentifier || !pluginForm.pluginVersion) {
            setPluginFormError({
                ...pluginFormError,
                name: validateDisplayName(pluginForm.name).message,
                pluginIdentifier: validateName(pluginForm.pluginIdentifier).message,
                pluginVersion: validatePluginVersion(pluginForm.pluginVersion).message,
            })
            toast.error('Please fill the required fields')
            return
        }

        handleClose()
    }

    return (
        <VisibleModal2 close={handleClose}>
            <div
                className="bcn-0 dc__position-fixed dc__right-0 dc__top-0 h-100 flexbox-col dc__content-space w-800"
                onClick={stopPropagation}
            >
                <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                    <div className="py-12 px-20 flexbox dc__content-space dc__border-bottom">
                        <h2 className="m-0 cn-9 fs-16 fw-6 lh-24">Save as plugin</h2>

                        <button
                            type="button"
                            className="p-0 flex dc__no-border dc__no-background dc__outline-none-imp dc__tab-focus h-20 w-20 dc__tab-focus"
                            onClick={handleClose}
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

                    <button
                        type="button"
                        className="cta flex h-32"
                        data-testid="create-plugin-cta"
                        onClick={handleSubmit}
                    >
                        Create Plugin
                    </button>
                </div>
            </div>
        </VisibleModal2>
    )
}

export default CreatePluginModal
