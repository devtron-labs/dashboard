import CreatableSelect from 'react-select/creatable'
import {
    APIResponseHandler,
    ComponentSizeType,
    EditImageFormField,
    GenericSectionErrorState,
    getIsRequestAborted,
    LoadingIndicator,
    logExceptionToSentry,
    MultiValueChipContainer,
    MultiValueRemove,
    Option,
    OptionType,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
    SEMANTIC_VERSION_DOCUMENTATION_LINK,
    stopPropagation,
    StyledRadioGroup,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICLegoBlock } from '@Icons/ic-lego-block.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { ReactComponent as ICVisibilityOn } from '@Icons/ic-visibility-on.svg'
import { ReactComponent as ICHelp } from '@Icons/ic-help.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ICTag } from '@Icons/ic-tag.svg'
import { ReactNode } from 'react'
import { CreatePluginActionType, CreatePluginFormContentProps, CreatePluginFormViewType } from './types'
import CreatePluginFormField from './CreatePluginFormField'
import CreatePluginInputVariableContainer from './CreatePluginInputVariableContainer'
import {
    getIsTagValid,
    getSelectPickerOptionsFromParentPluginList,
    PluginCreatableTagClearIndicator,
    pluginCreatableTagSelectStyles,
} from './utils'

const CreatePluginFormContent = ({
    isLoadingParentPluginList,
    parentPluginList,
    parentPluginListError,
    reloadParentPluginList,
    pluginForm,
    pluginFormError,
    handleChange,
    areTagsLoading,
    availableTags,
    availableTagsError,
    reloadAvailableTags,
    handleIconError,
    arePluginDetailsLoading,
    pluginDetailsError,
    prefillFormOnPluginSelection,
    selectedPluginVersions,
}: CreatePluginFormContentProps) => {
    const arePluginDetailsLoadingOrAborted = arePluginDetailsLoading || getIsRequestAborted(pluginDetailsError)

    const { currentTab, name, pluginIdentifier, docLink, pluginVersion, description, tags, inputVariables, icon } =
        pluginForm

    const handleTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targetMode = e.target.value as CreatePluginFormViewType

        if (targetMode === currentTab) {
            return
        }

        handleChange({ action: CreatePluginActionType.UPDATE_CURRENT_TAB, payload: targetMode })
    }

    const handlePluginSelection: SelectPickerProps['onChange'] = (newValue: SelectPickerOptionType) => {
        handleChange({
            action: CreatePluginActionType.UPDATE_PARENT_PLUGIN,
            payload: { id: +newValue.value, name: newValue.label as string },
        })
    }

    const renderPluginName = () => {
        if (currentTab === CreatePluginFormViewType.EXISTING_PLUGIN) {
            const { options, selectedOption } = getSelectPickerOptionsFromParentPluginList(parentPluginList, name)

            return (
                <SelectPicker
                    inputId="select-existing-plugin"
                    name="select-existing-plugin"
                    classNamePrefix="select-existing-plugin"
                    label="Existing Plugin"
                    icon={<ICLegoBlock className="dc__no-shrink" />}
                    required
                    options={options}
                    value={selectedOption}
                    isLoading={isLoadingParentPluginList}
                    optionListError={parentPluginListError}
                    reloadOptionList={reloadParentPluginList}
                    autoFocus
                    placeholder="Select plugin"
                    size={ComponentSizeType.large}
                    // Should we disable this or allow user to select the plugin since we already have abortController?
                    isDisabled={isLoadingParentPluginList || arePluginDetailsLoadingOrAborted}
                    onKeyDown={stopPropagation}
                    onChange={handlePluginSelection}
                />
            )
        }

        return (
            <CreatePluginFormField
                label="Plugin display name"
                value={name}
                error={pluginFormError.name}
                action={CreatePluginActionType.UPDATE_NEW_PLUGIN_NAME}
                handleChange={handleChange}
                placeholder="Enter plugin name"
                required
                autoFocus
            />
        )
    }

    const uniqueTagNames = [...new Set([...(availableTags || []), ...tags])]

    const selectedTags: OptionType[] = tags.map((tag) => ({
        label: tag,
        value: tag,
    }))
    const tagOptions: OptionType[] = uniqueTagNames.map((tag) => ({
        label: tag,
        value: tag,
    }))

    const renderNoOptionsMessage = () => {
        if (availableTagsError) {
            return <GenericSectionErrorState reload={reloadAvailableTags} />
        }

        return <p className="m-0 cn-7 fs-13 fw-4 lh-20 py-6 px-8">No options</p>
    }

    const handleTagsUpdate = (options: OptionType[]) => {
        handleChange({
            action: CreatePluginActionType.UPDATE_TAGS,
            payload: { tags: options.map((option) => option.value) },
        })
    }

    const renderOption = (props) => {
        const { data, selectOption } = props

        const handleSelectNewOption = () => {
            selectOption(data)
        }

        if (data.__isNew__) {
            return (
                <button
                    type="button"
                    onClick={handleSelectNewOption}
                    className="dc__position-sticky dc__transparent p-8 dc__bottom-0 dc__border-top-n1 bcn-0 dc__bottom-radius-4 w-100 dc__hover-n50 flexbox dc__align-items-center w-100 dc__gap-4"
                >
                    <ICAdd className="fcb-5 icon-dim-16 dc__no-shrink" />
                    <span className="cb-5 fs-13 fw-6 dc__truncate">Create `{data.value}`</span>
                </button>
            )
        }

        return <Option {...props} />
    }

    const handleURLChange = (url: string) => {
        handleChange({ action: CreatePluginActionType.UPDATE_PLUGIN_ICON, payload: url })
    }

    const handlePluginDetailsReload = async () => {
        if (currentTab === CreatePluginFormViewType.NEW_PLUGIN) {
            logExceptionToSentry(new Error('Error: Plugin details reload should not be called for new plugin'))
            return
        }

        const clonedPluginForm = structuredClone(pluginForm)
        await prefillFormOnPluginSelection(clonedPluginForm)
    }

    const renderMultiValueChip = (props) => <MultiValueChipContainer validator={getIsTagValid} {...props} />

    const renderExistingPluginVersionList = () => (
        <div className="flexbox-col dc__gap-4 p-12 mxh-350 dc__overflow-scroll">
            {selectedPluginVersions.map((version) => (
                <div className="flexbox dc__align-items-center dc__gap-4" key={version}>
                    <ICTag className="icon-dim-16 dc__no-shrink" />
                    <span className="cn-9 fs-13 fw-4 lh-20">{version}</span>
                </div>
            ))}
        </div>
    )

    const renderPluginVersionLabel = (): ReactNode => {
        if (currentTab === CreatePluginFormViewType.EXISTING_PLUGIN) {
            return (
                <div className="flexbox dc__content-space w-100">
                    <span className="dc__required-field">New version</span>

                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300"
                        placement="bottom"
                        Icon={ICHelp}
                        iconClass="fcv-5"
                        heading="Existing versions"
                        trigger="click"
                        interactive
                        additionalContent={renderExistingPluginVersionList()}
                    >
                        <button
                            className="flexbox dc__gap-4 dc__align-items-center p-0-imp dc__transparent"
                            type="button"
                        >
                            <span className="cb-5 fs-13 fw-4 lh-20">View existing versions</span>
                            <ICVisibilityOn className="icon-dim-16 dc__no-shrink scb-5" />
                        </button>
                    </TippyCustomized>
                </div>
            )
        }

        return 'Plugin version'
    }

    const showPluginDetailFields = currentTab !== CreatePluginFormViewType.EXISTING_PLUGIN || !!name

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-scroll p-20 dc__gap-16">
            <StyledRadioGroup
                className="gui-yaml-switch dc__no-shrink dc__content-start"
                onChange={handleTabChange}
                initialTab={currentTab}
                name="create-plugin-control"
            >
                {Object.values(CreatePluginFormViewType).map((tab) => (
                    <StyledRadioGroup.Radio value={tab} key={tab} className="fs-12 cn-7 fw-6 lh-20">
                        {tab}
                    </StyledRadioGroup.Radio>
                ))}
            </StyledRadioGroup>

            {currentTab === CreatePluginFormViewType.NEW_PLUGIN && (
                <EditImageFormField
                    url={icon}
                    defaultIcon={<ICLegoBlock className="w-100 h-100 dc__opacity-1 p-5" />}
                    errorMessage={pluginFormError.icon}
                    handleError={handleIconError}
                    handleURLChange={handleURLChange}
                    ariaLabelPrefix="Edit plugin icon"
                    dataTestIdPrefix="edit-plugin-icon"
                    altText="Plugin icon"
                />
            )}

            <div className="dc__grid-row-one-half dc__column-gap-12">
                {/* Existing plugin / display name */}
                {renderPluginName()}

                {/* Plugin ID */}
                {showPluginDetailFields && !arePluginDetailsLoadingOrAborted && !pluginDetailsError && (
                    <CreatePluginFormField
                        label="Plugin ID"
                        value={pluginIdentifier}
                        error={pluginFormError.pluginIdentifier}
                        action={CreatePluginActionType.UPDATE_PLUGIN_IDENTIFIER}
                        handleChange={handleChange}
                        placeholder="Enter plugin ID"
                        disabled={currentTab === CreatePluginFormViewType.EXISTING_PLUGIN}
                        required
                    />
                )}
            </div>

            {!!showPluginDetailFields && (
                <APIResponseHandler
                    isLoading={arePluginDetailsLoadingOrAborted}
                    progressingProps={{
                        pageLoader: true,
                    }}
                    error={pluginDetailsError}
                    genericSectionErrorProps={{
                        reload: handlePluginDetailsReload,
                        rootClassName: 'flex-grow-1',
                    }}
                >
                    <div className="dc__grid-row-one-half dc__column-gap-12">
                        {/* New Version / Plugin Version */}
                        <CreatePluginFormField
                            label={renderPluginVersionLabel()}
                            value={pluginVersion}
                            error={pluginFormError.pluginVersion}
                            action={CreatePluginActionType.UPDATE_PLUGIN_VERSION}
                            handleChange={handleChange}
                            helperText={
                                <span className="fs-11">
                                    Using&nbsp;
                                    <a
                                        href={SEMANTIC_VERSION_DOCUMENTATION_LINK}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="anchor"
                                    >
                                        semantic versioning
                                    </a>
                                    &nbsp;is recommended for best practices.
                                </span>
                            }
                            placeholder="Eg. 1.0.0"
                            required
                            labelClassName="w-100"
                        />

                        {/* Documentation Link */}
                        <CreatePluginFormField
                            label="Documentation link"
                            value={docLink}
                            error={pluginFormError.docLink}
                            action={CreatePluginActionType.UPDATE_DOCUMENTATION_LINK}
                            handleChange={handleChange}
                            placeholder="Documentation link for this plugin version"
                        />
                    </div>

                    {/* Description */}
                    <CreatePluginFormField
                        label="Description"
                        value={description}
                        error={pluginFormError.description}
                        action={CreatePluginActionType.UPDATE_DESCRIPTION}
                        handleChange={handleChange}
                        placeholder="Enter a description for this plugin version"
                        useTextArea
                    />

                    {/* Tags */}
                    <div className="flexbox-col dc__gap-6">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                            htmlFor="select-tags-for-plugin"
                            className="m-0 fs-13 fw-4 lh-20 cn-7 dc_width-max-content"
                        >
                            Tags
                        </label>

                        <CreatableSelect
                            value={selectedTags}
                            isMulti
                            isClearable
                            closeMenuOnSelect={false}
                            options={tagOptions}
                            placeholder="Type to select or create"
                            name="select-tags-for-plugin"
                            hideSelectedOptions={false}
                            isLoading={areTagsLoading}
                            components={{
                                Option: renderOption,
                                MultiValueContainer: renderMultiValueChip,
                                NoOptionsMessage: renderNoOptionsMessage,
                                MultiValueRemove,
                                LoadingIndicator,
                                ClearIndicator: PluginCreatableTagClearIndicator,
                            }}
                            onChange={handleTagsUpdate}
                            styles={pluginCreatableTagSelectStyles}
                            inputId="select-tags-for-plugin"
                            onKeyDown={stopPropagation}
                            menuPosition="fixed"
                        />

                        {pluginFormError.tags && (
                            <div className="form__error">
                                <ICWarning className="form__icon form__icon--error" />
                                {pluginFormError.tags}
                            </div>
                        )}
                    </div>

                    {/* Input variable container */}
                    <CreatePluginInputVariableContainer inputVariables={inputVariables} handleChange={handleChange} />
                </APIResponseHandler>
            )}
        </div>
    )
}

export default CreatePluginFormContent
