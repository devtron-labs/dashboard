import { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Checkbox,
    CHECKBOX_VALUE,
    getAvailablePluginTags,
    noop,
    stopPropagation,
    useAsync,
    VariableType,
    VisibleModal2,
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
} from './types'
import { getParentPluginList } from './service'
import { CREATE_PLUGIN_DEFAULT_FORM_ERROR } from './constants'
import { getDefaultPluginFormData } from './utils'
import './CreatePluginModal.scss'

const CreatePluginModal = ({ handleClose }: CreatePluginModalProps) => {
    const { appId } = useParams<CreatePluginModalURLParamsType>()
    const { formData, selectedTaskIndex, activeStageName } = useContext(pipelineContext)
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
    const [pluginForm, setPluginForm] = useState<CreatePluginFormType>(getDefaultPluginFormData(formInputVariables))
    const [pluginFormError, setPluginFormError] = useState(structuredClone(CREATE_PLUGIN_DEFAULT_FORM_ERROR))

    const handleChange: CreatePluginHandleChangeType = ({ action, payload }) => {
        const clonedPluginForm = structuredClone(pluginForm)
        const clonedPluginFormError = structuredClone(pluginFormError)

        switch (action) {
            case CreatePluginActionType.UPDATE_CURRENT_TAB:
                clonedPluginForm.currentTab = payload
                break
            case CreatePluginActionType.UPDATE_NEW_PLUGIN_NAME:
                clonedPluginForm.id = 0
                clonedPluginForm.name = payload
                break
            case CreatePluginActionType.UPDATE_PARENT_PLUGIN:
                clonedPluginForm.id = payload.id
                clonedPluginForm.name = payload.name
                // TODO: Make api call
                break
            case CreatePluginActionType.UPDATE_PLUGIN_ID:
                clonedPluginForm.pluginIdentifier = payload
                break
            case CreatePluginActionType.UPDATE_PLUGIN_VERSION:
                clonedPluginForm.pluginVersion = payload
                break
            case CreatePluginActionType.UPDATE_DOCUMENTATION_LINK:
                clonedPluginForm.docLink = payload
                break
            case CreatePluginActionType.UPDATE_DESCRIPTION:
                clonedPluginForm.description = payload
                break
            case CreatePluginActionType.UPDATE_TAGS:
                clonedPluginForm.tags = payload
                break
            case CreatePluginActionType.TOGGLE_INPUT_VARIABLE_ALLOW_EMPTY_VALUE:
                clonedPluginForm.inputVariables[payload].allowEmptyValue =
                    !clonedPluginForm.inputVariables[payload].allowEmptyValue
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

    const handleSubmit = () => {}

    return (
        <VisibleModal2 close={handleClose}>
            <div
                className="bcn-0 dc__position-fixed dc__right-0 dc__top-0 h-100 flexbox-col dc__content-space w-800"
                onClick={stopPropagation}
            >
                <div className="flexbox-col dc__overflow-scroll">
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
                    />
                </div>

                <div className="dc__border-top py-16 px-20 flexbox dc__content-space dc__align-items-center">
                    <Checkbox
                        isChecked={false}
                        onChange={noop}
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
