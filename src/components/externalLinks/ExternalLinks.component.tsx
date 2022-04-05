import React, { useEffect, useState } from 'react'
import { multiSelectStyles, Option, VisibleModal } from '../common'
import Select, { components } from 'react-select'
import EmptyState from '../EmptyState/EmptyState'
import NotAuthorized from '../../assets/img/ic-not-authorized.svg'
import EmptyExternalLinks from '../../assets/img/ic-empty-external-links.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete.svg'
import { URLS } from '../../config'

export const ClusterFilter = ({ clusters, applyFilter, queryParams, history }) => {
    const [selectedCluster, setSelectedCluster] = useState([])
    const [appliedClusters, setAppliedClusters] = useState([])
    const [isMenuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        if (clusters.length > 0) {
            const appliedClusterIds = queryParams.get('cluster')?.split(',')

            if (appliedClusterIds && appliedClusterIds.length > 0) {
                const filteredClusterIds = clusters.filter((cluster) => appliedClusterIds.includes(cluster.value))
                setSelectedCluster(filteredClusterIds)
                setAppliedClusters(filteredClusterIds)
            }
        }
    }, [clusters])

    const handleFilterQueryChanges = () => {
        setMenuOpen(false)
        setAppliedClusters(selectedCluster)
        applyFilter(selectedCluster)

        if (selectedCluster.length > 0) {
            console.log(selectedCluster, queryParams.toString())
            const ids = selectedCluster.map((cluster) => cluster.value)
            ids.sort()
            queryParams.set('cluster', ids.toString())

            history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
        } else {
            queryParams.delete('cluster')
            history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
        }
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

export const SearchInput = ({ queryParams, externalLinks, setFilteredExternalLinks, history }) => {
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '')
    const [searchApplied, setSearchApplied] = useState(!!queryParams.get('search'))

    const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(event.target.value || '')
    }

    const filterExternalLinksUsingSearch = (event: React.KeyboardEvent): void => {
        if (searchTerm && event.key === 'Enter') {
            const _searchTerm = searchTerm.trim()
            const _filteredExternalLinks = externalLinks.filter(
                (link) => link.name === _searchTerm || link.toolName === _searchTerm,
            )

            setSearchApplied(true)
            setFilteredExternalLinks(_filteredExternalLinks)

            queryParams.set('search', searchTerm)
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

export const AddLinkButton = ({ handleOnClick }) => {
    return (
        <button onClick={handleOnClick} className="add-link cta flex">
            <AddIcon className="mr-8" />
            Add link
        </button>
    )
}

export const NoAccessView = () => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={NotAuthorized} alt="Not authorized" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">Not authorized</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>Information on this page is available only to superadmin users.</EmptyState.Subtitle>
        </EmptyState>
    )
}

export const NoExternalLinksView = ({ handleAddLinkClick }) => {
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

export const AddExternalLinkDialog = ({ handleDialogVisibility }) => {
    // const [links, setLinks] = useState<Map<number, any>>()

    const getConfigureLinkAction = () => {
        return (
            <div className="configure-link-action">
                <div className="monitoring-tool">
                    <span>Monitoring Tool</span>
                    <Select
                        placeholder="Select tool"
                        name="monitoring-tool"
                        options={[
                            {
                                label: 'Grafana',
                                value: 'Grafana',
                            },
                        ]}
                        isMulti={false}
                        hideSelectedOptions={false}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
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
                <div className="monitoring-tool">
                    <span>Monitoring Tool</span>
                    <Select
                        placeholder="Select tool"
                        name="monitoring-tool"
                        options={[
                            {
                                label: 'Grafana',
                                value: 'Grafana',
                            },
                        ]}
                        isMulti={false}
                        hideSelectedOptions={false}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
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
                <div className="monitoring-tool">
                    <span>Monitoring Tool</span>
                    <Select
                        placeholder="Select tool"
                        name="monitoring-tool"
                        options={[
                            {
                                label: 'Grafana',
                                value: 'Grafana',
                            },
                        ]}
                        isMulti={false}
                        hideSelectedOptions={false}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
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
                <Delete className="ml-8" />
            </div>
        )
    }

    const getConfigureLinkActionColumn = () => {
        return (
            <div className="configure-link-action-container">
                <div>
                    <AddIcon /> Add another
                </div>
                {getConfigureLinkAction()}
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
                    <p>{'http://www.domain.com/grafana/{app_name}/details/1/env/4/details/pod'}</p>
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

    return (
        <VisibleModal className="add-external-link-dialog" onEscape={handleDialogVisibility}>
            <div className="modal__body">
                <div className="modal__header">
                    <h3 className="modal__title">Add link</h3>
                    <button type="button" className="transparent" onClick={handleDialogVisibility}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <hr className="checklist__divider mt-0 mb-0" />
                <div className="modal__content">
                    {getConfigureLinkActionColumn()}
                    {getConfigureLinkInfoColumn()}
                </div>
                <hr className="checklist__divider mt-0 mb-0" />
                <div className="modal__buttons">
                    <button className="cta">Save</button>
                </div>
            </div>
        </VisibleModal>
    )
}
