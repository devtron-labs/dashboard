import React, { Fragment, useEffect, useState } from 'react'
import { DeleteDialog, multiSelectStyles, Option, Progressing, showError, VisibleModal } from '../common'
import Select, { components, InputActionMeta, MultiValue } from 'react-select'
import EmptyState from '../EmptyState/EmptyState'
import EmptyExternalLinks from '../../assets/img/empty-externallinks@2x.png'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Link } from '../../assets/icons/ic-link.svg'
import { URLS } from '../../config'
import { OptionType } from '../app/types'
import {
    AddExternalLinkType,
    AppLevelExternalLinksType,
    AppliedFilterChipsType,
    ClusterFilterType,
    ConfigureLinkActionType,
    DeleteExternalLinkType,
    ExternalLink,
    LinkAction,
    NodeLevelExternalLinksType,
    OptionTypeWithIcon,
    URLModificationType,
} from './ExternalLinks.type'
import { deleteExternalLink, getExternalLinks, saveExternalLinks, updateExternalLink } from './ExternalLinks.service'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import {
    customMultiSelectStyles,
    getMonitoringToolIcon,
    getParsedURL,
    MONITORING_TOOL_ICONS,
    onImageLoadError,
    sortByUpdatedOn,
} from './ExternalLinks.utils'
import './externalLinks.component.scss'

export const ClusterFilter = ({
    clusters,
    appliedClusters,
    setAppliedClusters,
    queryParams,
    history,
}: ClusterFilterType): JSX.Element => {
    const [selectedCluster, setSelectedCluster] = useState<MultiValue<OptionType>>([])
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [clusterSearchInput, setClusterSearchInput] = useState('')

    // To update the dropdown selections on query param value change or page reload
    useEffect(() => {
        if (clusters.length > 0 && queryParams.has('clusters')) {
            const _appliedClustersIds = queryParams.get('clusters').split(',')
            const _appliedClusters = clusters.filter((cluster) => _appliedClustersIds.includes(cluster.value))

            setAppliedClusters(_appliedClusters)
            setSelectedCluster(_appliedClusters)
        } else {
            setSelectedCluster([])
        }
    }, [clusters, queryParams.get('clusters')])

    const handleFilterQueryChanges = (): void => {
        setClusterSearchInput('')
        setMenuOpen(false)
        setAppliedClusters(selectedCluster)

        if (selectedCluster.length > 0) {
            const ids = selectedCluster.map((cluster) => cluster.value)
            ids.sort()

            queryParams.set('clusters', ids.toString())
        } else {
            queryParams.delete('clusters')
        }

        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    const handleMenuState = (menuOpenState: boolean): void => {
        setClusterSearchInput('')
        setMenuOpen(menuOpenState)
    }

    const handleSelectedFilters = (selected: MultiValue<OptionType>): void => {
        setSelectedCluster(selected)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
        setSelectedCluster(appliedClusters)
    }

    return (
        <div className="filters-wrapper">
            <Select
                menuIsOpen={isMenuOpen}
                placeholder="Cluster : All"
                name="cluster"
                value={selectedCluster}
                options={clusters}
                onChange={handleSelectedFilters}
                isMulti={true}
                isSearchable={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuOpen={() => handleMenuState(true)}
                onMenuClose={handleCloseFilter}
                inputValue={clusterSearchInput}
                onBlur={() => {
                    setClusterSearchInput('')
                }}
                onInputChange={(value: string, actionMeta: InputActionMeta) => {
                    if (actionMeta.action === 'input-change') {
                        setClusterSearchInput(value)
                    }
                }}
                components={{
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList: (props) => <MenuList {...props} handleFilterQueryChanges={handleFilterQueryChanges} />,
                }}
                styles={{
                    ...multiSelectStyles,
                    ...customMultiSelectStyles,
                    menuList: (base, state) => ({
                        ...base,
                        borderRadius: '4px',
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                }}
            />
        </div>
    )
}

const ValueContainer = (props: any): JSX.Element => {
    const length = props.getValue().length

    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && (
                        <>
                            Cluster: {length === props.options.length ? 'All' : <span className="badge">{length}</span>}
                        </>
                    )}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

const MenuList = (props: any): JSX.Element => {
    return (
        <components.MenuList {...props}>
            {props.children}
            <div className="flex react-select__bottom bcn-0 p-8">
                <button className="flex cta apply-filter" onClick={props.handleFilterQueryChanges}>
                    Apply Filter
                </button>
            </div>
        </components.MenuList>
    )
}

export const SearchInput = ({ queryParams, history }: URLModificationType): JSX.Element => {
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '')
    const [searchApplied, setSearchApplied] = useState(!!queryParams.get('search'))

    const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(event.target.value || '')
    }

    const filterExternalLinksUsingSearch = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            event.preventDefault()

            if (!searchTerm) {
                setSearchApplied(false)
                queryParams.delete('search')
            } else {
                setSearchApplied(true)
                queryParams.set('search', searchTerm)
            }

            history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
        }
    }

    const clearSearch = (): void => {
        setSearchTerm('')
        setSearchApplied(false)

        queryParams.delete('search')
        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    return (
        <div className="search-wrapper">
            <Search className="search__icon icon-dim-18" />
            <input
                type="text"
                name="app_search_input"
                autoComplete="off"
                value={searchTerm}
                placeholder="Search by name or tool name"
                className="search__input bcn-1"
                onKeyDown={filterExternalLinksUsingSearch}
                onChange={handleSearchTermChange}
            />
            {searchApplied && (
                <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button>
            )}
        </div>
    )
}

export const AddLinkButton = ({ handleOnClick }: { handleOnClick: () => void }): JSX.Element => {
    return (
        <button onClick={handleOnClick} className="add-link cta flex">
            <AddIcon className="icon-dim-16 mr-8" />
            Add link
        </button>
    )
}

export const NoExternalLinksView = ({ handleAddLinkClick }: { handleAddLinkClick: () => void }): JSX.Element => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={EmptyExternalLinks} alt="Empty external links" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">Connect any monitoring tool for a seamless debugging experience</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Quickly access any monitoring tool in your stack without losing context of the microserve, pod or
                container you're interested in.
            </EmptyState.Subtitle>
            <EmptyState.Button>
                <AddLinkButton handleOnClick={handleAddLinkClick} />
            </EmptyState.Button>
        </EmptyState>
    )
}

export const NoMatchingResults = (): JSX.Element => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={NoResults} width="250" height="200" alt="No matching results" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9">No matching results</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>We couldn't find any matching external link configuration</EmptyState.Subtitle>
        </EmptyState>
    )
}

const formatOptionLabelClusters = (option: OptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 ellipsis-right">{option.label}</span>
            {option.value === '*' && (
                <>
                    <small className="cn-6">All existing and future clusters</small>
                    <div className="modal__dropdown-divider" />
                </>
            )}
        </div>
    )
}

const getErrorLabel = (field: string): JSX.Element => {
    const errorLabel = (label: string): JSX.Element => {
        return (
            <div className="error-label flex left align-start fs-11 mt-4">
                <div className="error-label-icon">
                    <Error className="icon-dim-20" />
                </div>
                <div className="ml-4 cr-5">{label}</div>
            </div>
        )
    }
    switch (field) {
        case 'tool':
            return errorLabel('Please select monitoring tool')
        case 'name':
            return errorLabel('Please provide name for the tool you want to link')
        case 'clusters':
            return errorLabel('Please select one or more clusters')
        case 'url':
            return errorLabel('Please enter URL template')
        case 'invalidProtocol':
            return errorLabel('The url should start with http:// or https://')
        default:
            return <></>
    }
}

const customOption = (data: OptionTypeWithIcon, className = '') => {
    return (
        <div className={`flex left ${className}`}>
            <img
                src={MONITORING_TOOL_ICONS[data.label.toLowerCase()] || MONITORING_TOOL_ICONS.other}
                alt={data.label}
                style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                }}
                onError={onImageLoadError}
            />
            <span className="ellipsis-right">{data.label}</span>
        </div>
    )
}

const OptionWithIcon = (props) => {
    const { data } = props
    return <components.Option {...props}>{customOption(data)}</components.Option>
}

const ValueContainerWithIcon = (props) => {
    const { selectProps } = props
    return (
        <components.ValueContainer {...props}>
            {selectProps.value ? (
                <>
                    {!props.selectProps.menuIsOpen && customOption(selectProps.value, 'absolute-option')}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

const ConfigureLinkAction = ({
    index,
    link,
    clusters,
    selectedClusters,
    monitoringTools,
    showDelete,
    onMonitoringToolSelection,
    onClusterSelection,
    onNameChange,
    onUrlTemplateChange,
    deleteLinkData,
}: ConfigureLinkActionType): JSX.Element => {
    const [clusterSearchInput, setClusterSearchInput] = useState('')

    return (
        <div id={`link-action-${index}`} className="configure-link-action-wrapper">
            <div className="link-monitoring-tool mb-8">
                <div className="monitoring-tool mr-8">
                    <span>Monitoring Tool*</span>
                    <Select
                        placeholder="Select tool"
                        name={`monitoring-tool-${index}`}
                        value={link.tool}
                        options={monitoringTools}
                        isMulti={false}
                        hideSelectedOptions={false}
                        onChange={(selected) => onMonitoringToolSelection(index, selected)}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
                            Option: OptionWithIcon,
                            ValueContainer: ValueContainerWithIcon,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            ...customMultiSelectStyles,
                            option: (base, state) => ({
                                ...customMultiSelectStyles.option(base, state),
                                backgroundColor: state.isSelected
                                    ? 'var(--B100)'
                                    : state.isFocused
                                    ? 'var(--N100)'
                                    : 'white',
                                color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                            }),
                            container: (base, state) => ({
                                ...base,
                                marginTop: '6px',
                            }),
                            control: (base, state) => ({
                                ...customMultiSelectStyles.control(base, state),
                                width: '150px',
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: '0 10px',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                        }}
                    />
                    {link.invalidTool && getErrorLabel('tool')}
                </div>
                <div className="link-name mr-12">
                    <label>Name*</label>
                    <input
                        placeholder="Enter name"
                        value={link.name}
                        onChange={(e) => onNameChange(index, e.target.value)}
                    />
                    {link.invalidName && getErrorLabel('name')}
                </div>
                <div className="link-clusters mr-12">
                    <span>Clusters*</span>
                    <Select
                        placeholder="Select clusters"
                        name={`link-clusters-${index}`}
                        value={selectedClusters}
                        options={clusters}
                        formatOptionLabel={formatOptionLabelClusters}
                        onChange={(selected) => onClusterSelection(index, selected)}
                        isMulti={true}
                        hideSelectedOptions={false}
                        closeMenuOnSelect={false}
                        inputValue={clusterSearchInput}
                        onBlur={() => {
                            setClusterSearchInput('')
                        }}
                        onInputChange={(value: string, actionMeta: InputActionMeta) => {
                            if (actionMeta.action === 'input-change') {
                                setClusterSearchInput(value)
                            }
                        }}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
                            ValueContainer,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            ...customMultiSelectStyles,
                            menuList: (base, state) => ({
                                ...customMultiSelectStyles.menuList(base, state),
                                maxHeight: '210px',
                            }),
                            container: (base, state) => ({
                                ...base,
                                marginTop: '6px',
                            }),
                            control: (base, state) => ({
                                ...customMultiSelectStyles.control(base, state),
                                width: '278px',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                        }}
                    />
                    {link.invalidClusters && getErrorLabel('clusters')}
                </div>
                {showDelete && (
                    <div className="link-delete mt-24 cursor">
                        <Delete className="icon-dim-20" onClick={() => deleteLinkData(index)} />
                    </div>
                )}
            </div>
            <div className="link-text-area">
                <label>URL Template*</label>
                <textarea
                    placeholder="Enter URL template"
                    value={link.urlTemplate}
                    onChange={(e) => onUrlTemplateChange(index, e.target.value)}
                />
                {link.invalidUrlTemplate && getErrorLabel('url')}
                {link.invalidProtocol && getErrorLabel('invalidProtocol')}
            </div>
        </div>
    )
}

export const AddExternalLinkDialog = ({
    monitoringTools,
    clusters,
    selectedLink,
    setExternalLinks,
    handleDialogVisibility,
}: AddExternalLinkType): JSX.Element => {
    const [linksData, setLinksData] = useState<LinkAction[]>([])
    const [savingLinks, setSavingLinks] = useState(false)

    useEffect(() => {
        if (selectedLink) {
            const monitoringTool = monitoringTools.find((tool) => tool.value === selectedLink.monitoringToolId)
            const selectedClusters =
                selectedLink.clusterIds.length === 0
                    ? clusters
                    : clusters.filter((cluster) => selectedLink.clusterIds.includes(+cluster.value))

            setLinksData([
                {
                    tool: {
                        label: monitoringTool.label,
                        value: monitoringTool.value,
                        icon: monitoringTool.icon,
                    },
                    name: selectedLink.name,
                    clusters: selectedClusters,
                    urlTemplate: selectedLink.url,
                },
            ])
        } else {
            setLinksData([
                {
                    tool: null,
                    name: '',
                    clusters: [],
                    urlTemplate: '',
                },
            ])
        }
    }, [])

    const handleLinksDataActions = (
        action: string,
        key?: number,
        value?: OptionType | MultiValue<OptionType> | string,
    ): void => {
        switch (action) {
            case 'add':
                linksData.splice(0, 0, {
                    tool: null,
                    name: '',
                    clusters: [],
                    urlTemplate: '',
                })
                break
            case 'delete':
                linksData.splice(key, 1)
                break
            case 'onMonitoringToolSelection':
                linksData[key].tool = value as OptionTypeWithIcon
                break
            case 'onClusterSelection':
                const _selectedOption = value as MultiValue<OptionType>
                const areAllOptionsSelected = _selectedOption.findIndex((option) => option.value === '*') !== -1
                const areAllOptionsAlredySeleted =
                    Array.isArray(linksData[key].clusters) && linksData[key].clusters[0]?.value === '*'

                if (areAllOptionsSelected && !areAllOptionsAlredySeleted) {
                    linksData[key].clusters = [{ label: 'All clusters', value: '*' }]
                } else if (!areAllOptionsSelected && areAllOptionsAlredySeleted) {
                    linksData[key].clusters = []
                } else if (areAllOptionsSelected && _selectedOption.length !== clusters.length) {
                    linksData[key].clusters = _selectedOption.filter((option) => option.value !== '*')
                } else if (!areAllOptionsSelected && _selectedOption.length === clusters.length - 1) {
                    linksData[key].clusters = [{ label: 'All clusters', value: '*' }]
                } else {
                    linksData[key].clusters = _selectedOption
                }
                break
            case 'onNameChange':
                linksData[key].name = value as string
                break
            case 'onUrlTemplateChange':
                linksData[key].urlTemplate = value as string
                break
            default:
                break
        }

        setLinksData([...linksData])
    }

    const linksLen = linksData.length

    const renderConfigureLinkActionColumn = (): JSX.Element => {
        return (
            <div className="configure-link-action-container">
                {!selectedLink && (
                    <div
                        className="link-add-another fs-13 fw-6 mb-16 cursor"
                        onClick={() => handleLinksDataActions('add')}
                    >
                        <AddIcon className="icon-dim-20 mr-8" /> Add another
                    </div>
                )}
                {linksData &&
                    linksData.map((link, idx) => {
                        return (
                            <Fragment key={`ConfigureLinkAction-${idx}`}>
                                <ConfigureLinkAction
                                    index={idx}
                                    link={link}
                                    clusters={clusters}
                                    selectedClusters={
                                        Array.isArray(link.clusters) && link.clusters[0]?.value === '*'
                                            ? clusters
                                            : link.clusters
                                    }
                                    monitoringTools={monitoringTools}
                                    onMonitoringToolSelection={(key, selected) => {
                                        handleLinksDataActions('onMonitoringToolSelection', key, selected)

                                        if (
                                            selected.label.toLowerCase() !== 'other' &&
                                            (!link.name ||
                                                monitoringTools.findIndex((tool) => tool.label === link.name) !== -1)
                                        ) {
                                            handleLinksDataActions('onNameChange', key, selected.label)
                                        }
                                    }}
                                    onClusterSelection={(key, selected) =>
                                        handleLinksDataActions('onClusterSelection', key, selected)
                                    }
                                    onNameChange={(key, name) => handleLinksDataActions('onNameChange', key, name)}
                                    onUrlTemplateChange={(key, urlTemplate) =>
                                        handleLinksDataActions('onUrlTemplateChange', key, urlTemplate)
                                    }
                                    showDelete={linksLen > 1}
                                    deleteLinkData={(key) => handleLinksDataActions('delete', key)}
                                />
                                {linksLen > 1 && idx !== linksLen - 1 && (
                                    <hr className="external-links-divider mt-16 mb-16" />
                                )}
                            </Fragment>
                        )
                    })}
            </div>
        )
    }

    const renderConfigureLinkInfoColumn = (): JSX.Element => {
        return (
            <div className="configure-link-info-container">
                <div className="configure-link-info-heading">
                    <Help />
                    <span className="cn-9">Configuring an external link</span>
                </div>
                <ol className="configure-link-info-list">
                    <li>Monitoring Tool</li>
                    <p className="mb-16">
                        Select a monitoring tool from the drop-down list. To add a different tool, select 'Other'.
                    </p>
                    <li>Clusters</li>
                    <p className="mb-16">Choose the clusters for which you want to configure the selected tool.</p>
                    <li>URL Template</li>
                    <p className="mb-20">
                        The configured URL template is used by apps deployed on the selected clusters.
                        <br />
                        By combining one or more of the available env variables, a URL with the structure shown below
                        can be created:
                    </p>
                    <p className="mb-12">
                        {`http://www.domain.com/{namespace}/{appName}/details/{appId}/env/{envId}/details/{podName}`}
                    </p>
                    <ul className="fs-12 fw-4">
                        <li>{`{appName}`}</li>
                        <li>{`{appId}`}</li>
                        <li>{`{envId}`}</li>
                        <li>{`{namespace}`}</li>
                        <li>{`{podName}`}</li>
                        <li>{`{containerName}`}</li>
                    </ul>
                    <a
                        href="https://docs.devtron.ai/devtron/setup/global-configurations/external-links"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Learn more
                    </a>
                </ol>
            </div>
        )
    }

    const getValidatedLinksData = (): LinkAction[] => {
        const validatedLinksData = linksData.map((link) => ({
            tool: link.tool,
            invalidTool: !link.tool,
            name: link.name.trim(),
            invalidName: !link.name.trim(),
            clusters: link.clusters,
            invalidClusters: !link.clusters || link.clusters.length <= 0,
            urlTemplate: link.urlTemplate.replace(/\s+/g, ''),
            invalidUrlTemplate: !link.urlTemplate.trim(),
            invalidProtocol: link.urlTemplate.trim() && !link.urlTemplate.trim().startsWith('http'),
        }))
        setLinksData(validatedLinksData)

        return validatedLinksData
    }

    const saveLinks = async (): Promise<void> => {
        try {
            const validatedLinksData = getValidatedLinksData()
            const invalidData = validatedLinksData.some(
                (link) =>
                    link.invalidTool ||
                    link.invalidName ||
                    link.invalidClusters ||
                    link.invalidUrlTemplate ||
                    link.invalidProtocol,
            )

            if (invalidData) {
                toast.error('Some required fields are missing or have invalid input.')
                return
            }

            setSavingLinks(true)
            if (selectedLink) {
                const link = validatedLinksData[0]
                const payload: ExternalLink = {
                    id: selectedLink.id,
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    clusterIds:
                        link.clusters.findIndex((_cluster) => _cluster.value === '*') === -1
                            ? link.clusters.map((_cluster) => +_cluster.value)
                            : [],
                    url: link.urlTemplate,
                }

                const { result } = await updateExternalLink(payload)

                if (result?.success) {
                    toast.success('Updated successfully!')
                }
            } else {
                const payload = validatedLinksData.map((link) => ({
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    clusterIds:
                        link.clusters.findIndex((_cluster) => _cluster.value === '*') === -1
                            ? link.clusters.map((_cluster) => +_cluster.value)
                            : [],
                    url: link.urlTemplate,
                }))

                // Reversing because on 'Add another', new link fields are added & displayed at the top of linksData
                const { result } = await saveExternalLinks(payload.reverse())

                if (result?.success) {
                    toast.success('Saved successfully!')
                }
            }

            const { result } = await getExternalLinks()
            setExternalLinks(result?.sort(sortByUpdatedOn) || [])
            setSavingLinks(false)
            handleDialogVisibility()
        } catch (e) {
            showError(e)
            setSavingLinks(false)
            handleDialogVisibility()
        }
    }

    return (
        <VisibleModal className="add-external-link-dialog" {...(!savingLinks && { onEscape: handleDialogVisibility })}>
            <div className="modal__body">
                <div className="modal__header">
                    <h3 className="modal__title fs-16">{selectedLink ? 'Update link' : 'Add link'}</h3>
                    <button
                        type="button"
                        className={`transparent ${savingLinks ? 'cursor-not-allowed' : 'cursor'}`}
                        onClick={handleDialogVisibility}
                        disabled={savingLinks}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <hr className="modal__divider mt-0 mb-0" />
                <div className="modal__content">
                    {renderConfigureLinkActionColumn()}
                    {renderConfigureLinkInfoColumn()}
                </div>
                <hr className="modal__divider mt-0 mb-0" />
                <div className="modal__buttons">
                    <button className="cta" onClick={saveLinks} disabled={savingLinks}>
                        {savingLinks ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}

export const DeleteExternalLinkDialog = ({
    selectedLink,
    isAPICallInProgress,
    setAPICallInProgress,
    setExternalLinks,
    setShowDeleteConfirmation,
}: DeleteExternalLinkType): JSX.Element => {
    const deleteLink = async (): Promise<void> => {
        try {
            setAPICallInProgress(true)
            const { result } = await deleteExternalLink(selectedLink.id)

            if (result?.success) {
                toast.success('Deleted successfully!')

                const { result } = await getExternalLinks()
                setExternalLinks(result?.sort(sortByUpdatedOn) || [])
            }
        } catch (e) {
            showError(e)
        } finally {
            setAPICallInProgress(false)
            setShowDeleteConfirmation(false)
        }
    }

    return (
        <DeleteDialog
            title={`Delete external link "${selectedLink.name}"`}
            delete={deleteLink}
            closeDelete={() => setShowDeleteConfirmation(false)}
            apiCallInProgress={isAPICallInProgress}
        >
            <DeleteDialog.Description>
                <p>{selectedLink.name} links will no longer be shown in applications.</p>
                <p>Are you sure ?</p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}

export const AppliedFilterChips = ({
    appliedClusters,
    setAppliedClusters,
    queryParams,
    history,
}: AppliedFilterChipsType): JSX.Element => {
    const removeFilter = (filter: OptionType): void => {
        const filteredClusters = appliedClusters.filter((cluster) => cluster.value !== filter.value)
        const ids = filteredClusters.map((cluster) => cluster.value)
        ids.sort()

        setAppliedClusters(filteredClusters)

        if (ids.length > 0) {
            queryParams.set('clusters', ids.toString())
        } else {
            queryParams.delete('clusters')
        }

        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    const removeAllFilters = (): void => {
        setAppliedClusters([])
        queryParams.delete('clusters')
        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    return (
        <div className="saved-filters__wrap position-rel pl-0 pr-20 mb-10">
            {appliedClusters.map((filter) => {
                return (
                    <div key={filter.label} className="saved-filter">
                        <span className="fw-6">Cluster</span>
                        <span className="saved-filter-divider ml-6 mr-6"></span>
                        <span>{filter.label}</span>
                        <button type="button" className="saved-filter__clear-btn" onClick={() => removeFilter(filter)}>
                            <Close className="icon-dim-12" />
                        </button>
                    </div>
                )
            })}
            <button
                type="button"
                className="saved-filters__clear-btn fs-13"
                onClick={() => {
                    removeAllFilters()
                }}
            >
                Clear All Filters
            </button>
        </div>
    )
}

export const AppLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    externalLinks,
    monitoringTools,
}: AppLevelExternalLinksType): JSX.Element | null => {
    const [appLevelExternalLinks, setAppLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const details = appDetails || helmAppDetails

    useEffect(() => {
        if (externalLinks.length > 0 && monitoringTools.length > 0) {
            const filteredLinks = externalLinks.filter(
                (link) => !link.url.includes('{podName}') && !link.url.includes('{containerName}'),
            )
            setAppLevelExternalLinks(
                filteredLinks.map((link) => ({
                    label: link.name,
                    value: link.url,
                    icon: getMonitoringToolIcon(monitoringTools, link.monitoringToolId),
                })),
            )
        } else {
            setAppLevelExternalLinks([])
        }
    }, [externalLinks, monitoringTools])

    const getExternalLinkChip = (linkOption: OptionTypeWithIcon, idx: number) => {
        return (
            <Tippy
                key={`${linkOption.label}-${idx}`}
                className="default-tt"
                arrow={false}
                placement="top"
                content={`${linkOption.label} (opens in new tab)`}
            >
                <a
                    key={linkOption.label}
                    href={getParsedURL(true, linkOption.value, details)}
                    target="_blank"
                    className="external-link-chip flex left br-4"
                >
                    <img src={linkOption.icon} alt={linkOption.label} onError={onImageLoadError} />
                    <span className="ellipsis-right">{linkOption.label}</span>
                </a>
            </Tippy>
        )
    }

    return appLevelExternalLinks.length > 0 ? (
        <div className="app-level__external-links flex left mb-14">
            <div className="app-level__external-links-icon">
                <Link className="external-links-icon icon-dim-20 fc-9" />
            </div>
            <div className="flex left flex-wrap">
                {appLevelExternalLinks.map((link, idx) => getExternalLinkChip(link, idx))}
            </div>
        </div>
    ) : null
}

export const NodeLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    nodeLevelExternalLinks,
    podName,
    containerName,
    addExtraSpace,
}: NodeLevelExternalLinksType): JSX.Element | null => {
    const details = appDetails || helmAppDetails

    const Option = (props: any): JSX.Element => {
        const { data } = props

        return (
            <Tippy className="default-tt" arrow={false} placement="left" content={`${data.label} (opens in new tab)`}>
                <a
                    key={data.label}
                    href={getParsedURL(false, data.value, details, podName, containerName)}
                    target="_blank"
                    className="external-link-option flex left br-4"
                >
                    <img src={data.icon} alt={data.label} onError={onImageLoadError} />
                    <span className="ellipsis-right">{data.label}</span>
                </a>
            </Tippy>
        )
    }

    return nodeLevelExternalLinks.length > 0 ? (
        <div className={`node-level__external-links flex column${addExtraSpace ? ' mr-4' : ''}`}>
            <Select
                placeholder={`${nodeLevelExternalLinks.length} Link${nodeLevelExternalLinks.length > 1 ? 's' : ''}`}
                name={`${podName}-external-links`}
                options={nodeLevelExternalLinks}
                isMulti={false}
                isSearchable={false}
                closeMenuOnSelect={true}
                components={{
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    Option,
                }}
                styles={{
                    ...multiSelectStyles,
                    ...customMultiSelectStyles,
                    menu: (base) => ({
                        ...base,
                        width: '150px',
                    }),
                    control: (base) => ({
                        ...base,
                        minWidth: '67px',
                        maxWidth: '112px',
                        minHeight: '24px',
                        backgroundColor: 'var(--N50)',
                        border: '1px solid var(--N200)',
                        cursor: 'pointer',
                    }),
                    option: (base) => ({
                        ...base,
                        cursor: 'pointer',
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        padding: 0,
                        paddingLeft: '8px',
                    }),
                    dropdownIndicator: (base, state) => ({
                        ...customMultiSelectStyles.dropdownIndicator(base, state),
                        padding: '0 8px 0 4px',
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: 'var(--N700)',
                        margin: 0,
                        minWidth: '45px',
                        maxWidth: '60px',
                    }),
                }}
            />
        </div>
    ) : null
}
