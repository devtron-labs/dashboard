import React, { useEffect, useState } from 'react'
import { DeleteDialog, multiSelectStyles, Option, Progressing, showError, VisibleModal } from '../common'
import Select, { components, MultiValue } from 'react-select'
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
import { AppDetails, OptionType } from '../app/types'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'
import {
    ConfigureLinkActionType,
    ExternalLink,
    LinkAction,
    MonitoringTool,
    OptionTypeWithIcon,
} from './ExternalLinks.type'
import { saveExternalLinks, updateExternalLink } from './ExternalLinks.service'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import { toast } from 'react-toastify'
import { OptionWithIcon, ValueContainerWithIcon } from '../v2/common/ReactSelect.utils'

export const ClusterFilter = ({ clusters, appliedClusters, setAppliedClusters, applyFilter, queryParams, history }) => {
    const [selectedCluster, setSelectedCluster] = useState([])
    const [isMenuOpen, setMenuOpen] = useState(false)

    // Revisit
    useEffect(() => {
        if (appliedClusters.length > 0) {
            setSelectedCluster(appliedClusters)
        } else if (queryParams.get('cluster')) {
            const appliedClusterIds = queryParams.get('cluster').split(',')

            if (appliedClusterIds && appliedClusterIds.length > 0) {
                const filteredClusterIds = clusters.filter((cluster) => appliedClusterIds.includes(cluster.value))
                setSelectedCluster(filteredClusterIds)
                setAppliedClusters(filteredClusterIds)
            }
        } else {
            setSelectedCluster([])
        }
    }, [appliedClusters])

    const handleFilterQueryChanges = () => {
        setMenuOpen(false)
        setAppliedClusters(selectedCluster)
        applyFilter(selectedCluster)

        if (selectedCluster.length > 0) {
            const ids = selectedCluster.map((cluster) => cluster.value)
            ids.sort()

            queryParams.set('cluster', ids.toString())
        } else {
            queryParams.delete('cluster')
        }

        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    const handleMenuState = () => {
        setMenuOpen(!isMenuOpen)
    }

    const handleSelectedFilters = (selected) => {
        setSelectedCluster(selected as Array<any>)
    }

    const handleCloseFilter = () => {
        handleMenuState()
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
                isClearable={false}
                isMulti={true}
                isSearchable={isMenuOpen}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                blurInputOnSelect={false}
                onMenuOpen={handleMenuState}
                onMenuClose={handleCloseFilter}
                components={{
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList: (props) => <MenuList {...props} handleFilterQueryChanges={handleFilterQueryChanges} />,
                }}
                styles={{
                    ...multiSelectStyles,
                    menu: (base, state) => ({
                        ...base,
                        top: 'auto',
                        width: '100%',
                    }),
                    menuList: (base, state) => ({
                        ...base,
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                    option: (base, state) => ({
                        ...base,
                        padding: '10px 12px',
                        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                        color: 'var(--N900)',
                    }),
                    control: (base, state) => ({
                        ...base,
                        width: '160px',
                        minHeight: '32px',
                        border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
                        backgroundColor: 'var(--N50)',
                        justifyContent: 'flex-start',
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        padding: '0 8px',
                    }),
                    dropdownIndicator: (base, state) => ({
                        ...base,
                        color: 'var(--N400)',
                        transition: 'all .2s ease',
                        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        padding: '0 8px',
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: 'var(--N900)',
                    }),
                }}
            />
        </div>
    )
}

export const ValueContainer = (props) => {
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

export const MenuList = (props) => {
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

export const SearchInput = ({
    queryParams,
    externalLinks,
    monitoringTools,
    setFilteredExternalLinks,
    history,
}: {
    externalLinks: ExternalLink[]
    monitoringTools: MultiValue<OptionTypeWithIcon>
    queryParams: URLSearchParams
    setFilteredExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
    history: any
}) => {
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
                setFilteredExternalLinks(externalLinks)
                queryParams.delete('search')
            } else {
                const _searchTerm = searchTerm.trim().toLowerCase()
                const _filteredExternalLinks = externalLinks.filter(
                    (link: ExternalLink) =>
                        link.name.toLowerCase().includes(_searchTerm) ||
                        monitoringTools
                            .find((tool) => tool.value === link.monitoringToolId)
                            ?.label.toLowerCase()
                            .includes(_searchTerm),
                )

                setSearchApplied(true)
                setFilteredExternalLinks(_filteredExternalLinks)
                queryParams.set('search', searchTerm)
            }

            history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
        }
    }

    const clearSearch = (): void => {
        setSearchTerm('')
        setSearchApplied(false)
        setFilteredExternalLinks(externalLinks)

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

export const AddLinkButton = ({ handleOnClick }) => {
    return (
        <button onClick={handleOnClick} className="add-link cta flex">
            <AddIcon className="mr-8" />
            Add link
        </button>
    )
}

export const NoExternalLinksView = ({ handleAddLinkClick }): JSX.Element => {
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

const formatOptionLabelClusters = (option) => {
    return (
        <div className="flex left column">
            <span>{option.label}</span>
            {option.value === '*' && (
                <>
                    <small className="cn-6">All existing and future clusters</small>
                    <div className="modal__dropdown-divider" />
                </>
            )}
        </div>
    )
}

const getErrorLabel = (field: string) => {
    const errorLabel = (label: string) => {
        return (
            <div className="error-label flex left align-start fs-11 mt-4">
                <Error className="icon-dim-20" />
                <div className="ml-4 cr-5">{label}</div>
            </div>
        )
    }
    switch (field) {
        case 'tool':
            return errorLabel('Please select monitoring tool.')
        case 'name':
            return errorLabel('Please provide name for the tool you want to link.')
        case 'cluster':
            return errorLabel('Please select one or more clusters.')
        case 'url':
            return errorLabel('Please enter URL template.')
        default:
            return ''
    }
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
}: ConfigureLinkActionType) => {
    console.log(link.name, link)
    return (
        <div id={`link-action-${index}`} className="configure-link-action-wrapper">
            <div className="link-monitoring-tool mb-8">
                <div className="monitoring-tool mr-8">
                    <span>Monitoring Tool*</span>
                    <Select
                        key={`monitoring-tool-${index}`}
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
                            container: (base, state) => ({
                                ...base,
                                marginTop: '6px',
                            }),
                            menu: (base, state) => ({
                                ...base,
                                top: 'auto',
                                width: '100%',
                            }),
                            menuList: (base, state) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }),
                            option: (base, state) => ({
                                ...base,
                                padding: '10px 12px',
                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                color: 'var(--N900)',
                            }),
                            control: (base, state) => ({
                                ...base,
                                width: '150px',
                                minHeight: '32px',
                                border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
                                backgroundColor: 'var(--N50)',
                                justifyContent: 'flex-start',
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: '0 10px',
                            }),
                            dropdownIndicator: (base, state) => ({
                                ...base,
                                color: 'var(--N400)',
                                transition: 'all .2s ease',
                                transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                padding: '0 8px',
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
                        key={`link-clusters-${index}`}
                        placeholder="Select clusters"
                        name={`link-clusters-${index}`}
                        value={selectedClusters}
                        options={clusters}
                        formatOptionLabel={formatOptionLabelClusters}
                        onChange={(selected) => onClusterSelection(index, selected)}
                        isMulti={true}
                        hideSelectedOptions={false}
                        closeMenuOnSelect={false}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
                            ValueContainer,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            container: (base, state) => ({
                                ...base,
                                marginTop: '6px',
                            }),
                            menu: (base, state) => ({
                                ...base,
                                top: 'auto',
                                width: '100%',
                            }),
                            menuList: (base, state) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }),
                            option: (base, state) => ({
                                ...base,
                                padding: '10px 12px',
                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                color: 'var(--N900)',
                            }),
                            control: (base, state) => ({
                                ...base,
                                width: '278px',
                                minHeight: '32px',
                                border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
                                backgroundColor: 'var(--N50)',
                                justifyContent: 'flex-start',
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: '0 8px',
                            }),
                            dropdownIndicator: (base, state) => ({
                                ...base,
                                color: 'var(--N400)',
                                transition: 'all .2s ease',
                                transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                padding: '0 8px',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                        }}
                    />
                    {link.invalidClusters && getErrorLabel('cluster')}
                </div>
                {showDelete && <Delete className="mt-24 cursor" onClick={() => deleteLinkData(index)} />}
            </div>
            <div className="link-text-area">
                <label>URL template*</label>
                <textarea
                    placeholder="Enter URL template"
                    value={link.urlTemplate}
                    onChange={(e) => onUrlTemplateChange(index, e.target.value)}
                />
                {link.invalidUrlTemplate && getErrorLabel('url')}
            </div>
        </div>
    )
}

export const AddExternalLinkDialog = ({
    monitoringTools,
    clusters,
    selectedLink,
    externalLinks,
    setExternalLinks,
    handleDialogVisibility,
}: {
    monitoringTools: MultiValue<OptionTypeWithIcon>
    clusters: MultiValue<OptionType>
    handleDialogVisibility: () => void
    selectedLink: ExternalLink
    externalLinks
    setExternalLinks
}) => {
    const [linksData, setLinksData] = useState<LinkAction[]>([])
    const [savingLinks, setSavingLinks] = useState(false)

    useEffect(() => {
        if (selectedLink) {
            const monitoringTool = monitoringTools.find((tool) => tool.value === selectedLink.monitoringToolId)
            const selectedClusters =
                selectedLink.clusterIds[0] === '*'
                    ? clusters
                    : clusters.filter((cluster) => selectedLink.clusterIds.includes(cluster.value))

            setLinksData([
                {
                    tool: { label: monitoringTool.label, value: monitoringTool.value, icon: monitoringTool.icon },
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
                    clusters: null,
                    urlTemplate: '',
                },
            ])
        }
    }, [])

    const handleLinksDataActions = (
        action: string,
        key?: number,
        value?: OptionType | MultiValue<OptionType> | string,
    ) => {
        switch (action) {
            case 'add':
                setLinksData(
                    linksData.concat({
                        tool: null,
                        name: '',
                        clusters: null,
                        urlTemplate: '',
                    }),
                )
                break
            case 'delete':
                linksData.splice(key, 1)
                break
            case 'onMonitoringToolSelection':
                linksData[key].tool = value as OptionTypeWithIcon
                break
            case 'onClusterSelection':
                linksData[key].clusters = value as MultiValue<OptionType>
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

        if (action !== 'add') {
            setLinksData([...linksData])
        }
    }

    const linksLen = linksData.length

    const getConfigureLinkActionColumn = () => {
        return (
            <div className="configure-link-action-container">
                {!selectedLink && (
                    <div className="link-add-another mb-16 cursor" onClick={() => handleLinksDataActions('add')}>
                        <AddIcon /> Add another
                    </div>
                )}
                {linksData &&
                    linksData.map((link, idx) => {
                        return (
                            <>
                                <ConfigureLinkAction
                                    key={`ConfigureLinkAction-${idx}`}
                                    index={idx}
                                    link={link}
                                    clusters={clusters}
                                    selectedClusters={link.clusters}
                                    monitoringTools={monitoringTools}
                                    onMonitoringToolSelection={(key, selected) => {
                                        handleLinksDataActions('onMonitoringToolSelection', key, selected)

                                        if (!link.name && selected.label.toLowerCase() !== 'other') {
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
                            </>
                        )
                    })}
            </div>
        )
    }

    const getConfigureLinkInfoColumn = () => {
        return (
            <div className="configure-link-info-container">
                <div className="configure-link-info-heading">
                    <Help />
                    <span>Configuring an external link</span>
                </div>
                <ol className="configure-link-info-list">
                    <li>Monitoring tool</li>
                    <p>Select a monitoring tool you use. Choose from the list or add your own by selecting 'Other'.</p>
                    <li>Clusters</li>
                    <p>Select clusters for which you want to configure the selected tool.</p>
                    <li>URL template</li>
                    <p>Applications deployed on the selected clusters will use the configured URL template.</p>
                    <p>Use following variables in the URL template in place of name or ID.</p>
                    <ul>
                        <li>{`{appName}`}</li>
                        <li>{`{appId}`}</li>
                        <li>{`{envId}`}</li>
                        <li>{`{namespace}`}</li>
                        <li>{`{podName}`}</li>
                        <li>{`{containerName}`}</li>
                    </ul>
                    <li>Sample URL template:</li>
                    <p>{'http://www.domain.com/grafana/{appName}/details/1/env/4/details/pod'}</p>
                    <a
                        href="https://docs.devtron.ai/devtron/user-guide/creating-application/workflow/cd-pipeline"
                        target="_blank"
                    >
                        View detailed documentation
                    </a>
                </ol>
            </div>
        )
    }

    const getValidatedLinksData = (): LinkAction[] => {
        const validatedLinksData = linksData.map((link) => ({
            tool: link.tool,
            invalidTool: !link.tool,
            name: link.name,
            invalidName: !link.name,
            clusters: link.clusters,
            invalidClusters: !link.clusters,
            urlTemplate: link.urlTemplate,
            invalidUrlTemplate: !link.urlTemplate,
        }))
        setLinksData(validatedLinksData)

        return validatedLinksData
    }

    const saveLinks = async () => {
        try {
            const validatedLinksData = getValidatedLinksData()
            const invalidData = validatedLinksData.some(
                (link) => link.invalidTool || link.invalidName || link.invalidClusters || link.invalidUrlTemplate,
            )

            if (invalidData) {
                return
            }

            setSavingLinks(true)
            if (selectedLink) {
                const link = validatedLinksData[0]
                const payload: ExternalLink = {
                    id: selectedLink.id,
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    clusterIds: link.clusters.map((value) => value.value),
                    url: link.urlTemplate,
                }

                const updatedLinks = externalLinks.map((link) => {
                    if (link.id === selectedLink.id) {
                        link = payload
                        return link
                    } else {
                        return link
                    }
                })
                setExternalLinks(updatedLinks)
                // updateExternalLink(payload)
            } else {
                const payload = validatedLinksData.map((link) => ({
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    clusterIds: link.clusters.map((value) => value.value),
                    url: link.urlTemplate,
                }))

                const updatedLinks = externalLinks.concat(payload)
                setExternalLinks(updatedLinks)

                // saveExternalLinks(payload)
            }

            setTimeout(() => {
                setSavingLinks(false)
                handleDialogVisibility()
            }, 1500)
        } catch (e) {
            showError(e)
            handleDialogVisibility()
        }
    }

    return (
        <VisibleModal className="add-external-link-dialog" onEscape={handleDialogVisibility}>
            <div className="modal__body">
                <div className="modal__header">
                    <h3 className="modal__title">{selectedLink ? 'Update link' : 'Add link'}</h3>
                    <button
                        type="button"
                        className="transparent"
                        onClick={handleDialogVisibility}
                        disabled={savingLinks}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <hr className="modal__divider mt-0 mb-0" />
                <div className="modal__content">
                    {getConfigureLinkActionColumn()}
                    {getConfigureLinkInfoColumn()}
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
    externalLinks,
    isAPICallInProgress,
    setAPICallInProgress,
    setExternalLinks,
    setShowDeleteConfirmation,
}: {
    selectedLink: ExternalLink
    externalLinks: ExternalLink[]
    isAPICallInProgress: boolean
    setAPICallInProgress: React.Dispatch<React.SetStateAction<boolean>>
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
    setShowDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const deleteLink = async () => {
        try {
            setAPICallInProgress(true)
            // const { result } = await deleteExternalLink(link.id)

            // if (result?.success) {
            //     const { result } = await getExternalLinks()
            //     setExternalLinks(result || [])
            // }

            setExternalLinks(
                externalLinks.filter((link) => link.id !== selectedLink.id && link.name !== selectedLink.name),
            )

            setTimeout(() => {
                toast.success('Deleted successfully!')
                setAPICallInProgress(false)
                setShowDeleteConfirmation(false)
            }, 1500)
        } catch (e) {
            showError(e)
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

export const AppliedFilterChips = ({ clusters, appliedClusters, setAppliedClusters, queryParams, history }) => {
    // Revisit
    useEffect(() => {
        if (appliedClusters.length === 0 && queryParams.get('cluster')) {
            const appliedClusterIds = queryParams.get('cluster').split(',')

            if (appliedClusterIds && appliedClusterIds.length > 0) {
                const filteredClusterIds = clusters.filter((cluster) => appliedClusterIds.includes(cluster.value))
                setAppliedClusters(filteredClusterIds)
            }
        }
    }, [appliedClusters])

    const removeFilter = (filter): void => {
        const filteredClusters = appliedClusters.filter((cluster) => cluster.value !== filter.value)
        const ids = filteredClusters.map((cluster) => cluster.value)
        ids.sort()

        setAppliedClusters(filteredClusters)

        if (ids.length > 0) {
            queryParams.set('cluster', ids.toString())
        } else {
            queryParams.delete('cluster')
        }

        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    const removeAllFilters = (): void => {
        setAppliedClusters([])
        queryParams.delete('cluster')
        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    return (
        <div className="saved-filters__wrap position-rel">
            {appliedClusters.map((filter) => {
                return (
                    <div key={filter.key} className="saved-filter">
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

const getParsedURL = (
    isAppLevel: boolean,
    url: string,
    appDetails: AppDetails | HelmAppDetails,
    podName?: string,
    containerName?: string,
): string => {
    let parsedUrl = url
        .replace('{appName}', appDetails.appName)
        .replace('{appId}', `${appDetails.appId}`)
        .replace('{envId}', `${appDetails.environmentId}`)
        .replace('{namespace}', `${appDetails.namespace}`)

    if (!isAppLevel) {
        parsedUrl = parsedUrl.replace('{podName}', podName).replace('{containerName}', `${containerName}`)
    }

    return parsedUrl
}

export const AppLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    externalLinks,
    monitoringTools,
}: {
    appDetails?: AppDetails
    helmAppDetails?: HelmAppDetails
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
}): JSX.Element | null => {
    const [appLevelExternalLinks, setAppLevelExternalLinks] = useState<ExternalLink[]>([])
    const details = appDetails || helmAppDetails

    useEffect(() => {
        if (externalLinks.length > 0) {
            const filteredLinks = externalLinks.filter(
                (link) => !link.url.includes('{podName}') && !link.url.includes('{containerName}'),
            )
            setAppLevelExternalLinks(filteredLinks)
        }
    }, [externalLinks])

    const getExternalLinkChip = (link: ExternalLink) => {
        const monitoringTool = monitoringTools.find((tool) => tool.value === link.monitoringToolId)

        return (
            <a
                key={link.name}
                href={getParsedURL(true, link.url, details)}
                target="_blank"
                className="flex left br-4 ml-8"
                style={{
                    border: '1px solid var(--N200)',
                    backgroundColor: 'var(--N50)',
                    height: '24px',
                    padding: '4px 6px',
                    textDecoration: 'none',
                    color: 'var(--N700)',
                }}
            >
                <img
                    src={monitoringTool.icon}
                    alt={link.name}
                    style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '12px',
                    }}
                />
                {link.name}
            </a>
        )
    }

    return appLevelExternalLinks.length > 0 ? (
        <div
            className="flex left mb-14 pt-16 pb-16 pl-20 pr-20"
            style={{
                width: '100%',
                height: '56px',
                background: '#FFFFFF',
            }}
        >
            <Link className="icon-dim-20 mr-16" />
            {appLevelExternalLinks.map((link) => getExternalLinkChip(link))}
        </div>
    ) : null
}

export const NodeLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    nodeLevelExternalLinks,
    podName,
    containerName,
}: {
    appDetails?: AppDetails
    helmAppDetails?: HelmAppDetails
    nodeLevelExternalLinks: OptionTypeWithIcon[]
    podName?: string
    containerName?: string
}): JSX.Element | null => {
    const details = appDetails || helmAppDetails

    const Option = (props: any) => {
        const { data } = props
        return (
            <a
                key={data.label}
                href={getParsedURL(false, data.value, details, podName, containerName)}
                target="_blank"
                className="flex left br-4 ml-8"
                style={{
                    border: '1px solid var(--N200)',
                    backgroundColor: 'var(--N50)',
                    height: '24px',
                    padding: '4px 6px',
                    textDecoration: 'none',
                    color: 'var(--N700)',
                }}
            >
                <img
                    src={data.icon}
                    alt={data.label}
                    style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '12px',
                    }}
                />
                {data.label}
            </a>
        )
    }

    return (
        <div>
            <Select
                // menuIsOpen={true}
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
                    control: (base) => ({
                        ...base,
                        minWidth: '67px',
                        maxWidth: '112px',
                        minHeight: '24px',
                        backgroundColor: 'var(--N50)',
                        border: '1px solid var(--N200)',
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        padding: 0,
                        paddingLeft: '8px'
                    }),
                    dropdownIndicator: (base, state) => ({
                        ...base,
                        color: 'var(--N400)',
                        transition: 'all .2s ease',
                        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        padding: '0 8px 0 4px',
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: 'var(--N700)',
                        margin: 0,
                        minWidth: '45px',
                        maxWidth: '60px'
                    }),
                }}
            />
        </div>
    )
}
