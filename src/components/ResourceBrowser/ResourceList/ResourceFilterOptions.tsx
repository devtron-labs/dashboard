import React from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { Option } from '../../../components/v2/common/ReactSelect.utils'
import { ResourceFilterOptionsProps } from '../Types'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ClusterOptionWithIcon, ResourceValueContainerWithIcon, tippyWrapper } from './ResourceList.component'
import { ALL_NAMESPACE_OPTION, getCommonResourceFilterStyle, NAMESPACE_NOT_APPLICABLE_OPTION } from '../Constants'
import { ConditionalWrap } from '../../common'
import { OptionType } from '../../app/types'

export default function ResourceFilterOptions({
    selectedResource,
    resourceList,
    clusterOptions,
    selectedCluster,
    onChangeCluster,
    namespaceOptions,
    selectedNamespace,
    setSelectedNamespace,
    hideSearchInput,
    searchText,
    setSearchText,
    searchApplied,
    setSearchApplied,
    handleFilterChanges,
    clearSearch,
    isNamespaceSelectDisabled,
    isSearchInputDisabled,
}: ResourceFilterOptionsProps) {
    const { push } = useHistory()
    const location = useLocation()
    const { namespace } = useParams<{
        namespace: string
    }>()

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Backspace' && searchText.length === 0) {
            clearSearch()
        } else {
            handleFilterChanges(event.target.value, resourceList)
            setSearchApplied(true)
        }
    }

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
    }

    const handleClusterChange = (selected: OptionType): void => {
        onChangeCluster(selected)
    }

    const handleNamespaceChange = (selected: OptionType): void => {
        if (selected.value === selectedNamespace?.value) {
            return
        }
        setSelectedNamespace(selected)
        push({
            pathname: location.pathname.replace(`/${namespace}/`, `/${selected.value}/`),
        })
    }

    return (
        <div
            className={`resource-filter-options-container flexbox ${
                hideSearchInput ? 'dc__content-end' : 'dc__content-space'
            } pt-16 pr-20 pb-12 pl-20 w-100`}
        >
            {!hideSearchInput && (
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-16" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedResource?.gvk?.Kind || ''}`}
                        value={searchText}
                        className={`search__input ${isSearchInputDisabled ? 'cursor-not-allowed' : ''}`}
                        onChange={handleOnChangeSearchText}
                        onKeyUp={handleFilterKeyPress}
                        disabled={isSearchInputDisabled}
                    />
                    {searchApplied && (
                        <button className="search__clear-button" type="button" onClick={clearSearch}>
                            <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                        </button>
                    )}
                </div>
            )}
            <div className="resource-filter-options-wrapper flex">
                <ReactSelect
                    className="w-220"
                    classNamePrefix="resource-filter-select"
                    placeholder="Select Cluster"
                    options={clusterOptions}
                    value={selectedCluster}
                    onChange={handleClusterChange}
                    blurInputOnSelect={true}
                    styles={getCommonResourceFilterStyle({
                        input: (base, state) => ({
                            ...base,
                            paddingLeft: '24px',
                        }),
                    })}
                    components={{
                        IndicatorSeparator: null,
                        Option: ClusterOptionWithIcon,
                        ValueContainer: ResourceValueContainerWithIcon,
                    }}
                />
                <ConditionalWrap condition={selectedResource && !selectedResource.namespaced} wrap={tippyWrapper}>
                    <ReactSelect
                        placeholder="Select Namespace"
                        className="w-220 ml-8"
                        classNamePrefix="resource-filter-select"
                        options={namespaceOptions}
                        value={
                            isNamespaceSelectDisabled
                                ? ALL_NAMESPACE_OPTION
                                : selectedResource?.namespaced
                                ? selectedNamespace
                                : NAMESPACE_NOT_APPLICABLE_OPTION
                        }
                        onChange={handleNamespaceChange}
                        blurInputOnSelect={true}
                        isDisabled={isNamespaceSelectDisabled ?? !selectedResource?.namespaced}
                        styles={getCommonResourceFilterStyle({
                            input: (base) => ({
                                ...base,
                                paddingLeft: '24px',
                                maxWidth: '150px',
                            }),
                        })}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            ValueContainer: ResourceValueContainerWithIcon,
                        }}
                    />
                </ConditionalWrap>
            </div>
        </div>
    )
}
