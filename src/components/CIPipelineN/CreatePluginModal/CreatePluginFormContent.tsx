import CreatableSelect from 'react-select/creatable'
import {
    EditImageFormField,
    GenericSectionErrorState,
    LoadingIndicator,
    multiSelectStyles,
    MultiValueContainer,
    Option,
    OptionType,
    PluginImageContainer,
    SelectPicker,
    SelectPickerOptionType,
    StyledRadioGroup,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICLegoBlock } from '@Icons/ic-lego-block.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { CreatePluginActionType, CreatePluginFormContentProps, CreatePluginFormViewType } from './types'
import CreatePluginFormField from './CreatePluginFormField'
import CreatePluginInputVariableContainer from './CreatePluginInputVariableContainer'

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
}: CreatePluginFormContentProps) => {
    const { currentTab, name, pluginIdentifier, docLink, pluginVersion, description, tags, inputVariables, icon } =
        pluginForm

    const handleTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targetMode = e.target.value as CreatePluginFormViewType

        if (targetMode === currentTab) {
            return
        }

        handleChange({ action: CreatePluginActionType.UPDATE_CURRENT_TAB, payload: targetMode })
    }

    const renderPluginName = () => {
        if (currentTab === CreatePluginFormViewType.EXISTING_PLUGIN) {
            // TODO: Can make util
            const { options, selectedOption } = parentPluginList.reduce(
                (acc, plugin) => {
                    const option: SelectPickerOptionType = {
                        label: plugin.name,
                        value: plugin.id,
                        startIcon: (
                            <PluginImageContainer
                                fallbackImageClassName="icon-dim-24 p-2"
                                imageProps={{
                                    src: plugin.icon,
                                    alt: name,
                                    width: 20,
                                    height: 20,
                                    className: 'p-2 dc__no-shrink',
                                }}
                            />
                        ),
                    }

                    acc.options.push(option)
                    if (plugin.name === name) {
                        acc.selectedOption = option
                    }

                    return acc
                },
                { options: [] as SelectPickerOptionType[], selectedOption: null as SelectPickerOptionType | null },
            )

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
                isRequired
                autoFocus
            />
        )
    }

    const tagOptions: OptionType[] =
        availableTags?.map((tag) => ({
            label: tag,
            value: tag,
        })) ?? []

    const selectedTags: OptionType[] = tags.map((tag) => ({
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
        handleChange({ action: CreatePluginActionType.UPDATE_TAGS, payload: options.map((option) => option.value) })
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

    return (
        <div className="flexbox-col dc__overflow-scroll p-20 dc__gap-16">
            <StyledRadioGroup
                className="gui-yaml-switch dc__no-shrink dc__content-start"
                onChange={handleTabChange}
                initialTab={currentTab}
                name="create-plugin-control"
            >
                {Object.values(CreatePluginFormViewType).map((tab) => (
                    <StyledRadioGroup.Radio value={tab} key={tab} className="fs-12 cn-7 fw-6 lh-20" canSelect={false}>
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
                <CreatePluginFormField
                    label="Plugin ID"
                    value={pluginIdentifier}
                    error={pluginFormError.pluginIdentifier}
                    action={CreatePluginActionType.UPDATE_PLUGIN_ID}
                    handleChange={handleChange}
                    placeholder="Enter plugin ID"
                    isDisabled={currentTab === CreatePluginFormViewType.EXISTING_PLUGIN}
                    isRequired
                />
            </div>

            <div className="dc__grid-row-one-half dc__column-gap-12">
                {/* New Version / Plugin Version */}
                <CreatePluginFormField
                    label={currentTab === CreatePluginFormViewType.EXISTING_PLUGIN ? 'New version' : 'Plugin version'}
                    value={pluginVersion}
                    error={pluginFormError.pluginVersion}
                    action={CreatePluginActionType.UPDATE_PLUGIN_VERSION}
                    handleChange={handleChange}
                    placeholder="Eg. 1.0.0"
                    isRequired
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
                <label htmlFor="select-tags-for-plugin" className="m-0 fs-13 fw-4 lh-20 cn-7">
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
                        MultiValueContainer,
                        NoOptionsMessage: renderNoOptionsMessage,
                        LoadingIndicator,
                    }}
                    onChange={handleTagsUpdate}
                    styles={multiSelectStyles}
                    inputId="select-tags-for-plugin"
                />
            </div>

            {/* Input variable container */}
            <CreatePluginInputVariableContainer inputVariables={inputVariables} handleChange={handleChange} />
        </div>
    )
}

export default CreatePluginFormContent
