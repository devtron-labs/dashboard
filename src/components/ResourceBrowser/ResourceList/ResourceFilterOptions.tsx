import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { Option } from '../../v2/common/ReactSelect.utils'
import { ResourceFilterOptionsProps } from '../Types'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ClusterOptionWithIcon, ResourceValueContainerWithIcon, tippyWrapper } from './ResourceList.component'
import {
    ALL_NAMESPACE_OPTION,
    FILTER_SELECT_COMMON_STYLES,
    NAMESPACE_NOT_APPLICABLE_OPTION
} from '../Constants'
import { ConditionalWrap } from '../../common'
import { OptionType } from '../../app/types'
import { withShortcut, IWithShortcut } from 'react-keybind'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'

function ResourceFilterOptions({
    selectedResource,
    resourceList,
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
    shortcut,
    isCreateModalOpen,
    renderCallBackSync
}: ResourceFilterOptionsProps & IWithShortcut) {
    const { push } = useHistory()
    const location = useLocation()
    const { namespace } = useParams<{
        namespace: string
    }>()
    const [showShortcutKey, setShowShortcutKey] = useState(!searchApplied)
    const searchInputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (!isCreateModalOpen) {
            shortcut.registerShortcut(handleInputShortcut, ['r'], 'ResourceSearchFocus', 'Focus resource search')
        }

        return (): void => {
            shortcut.unregisterShortcut(['r'])
        }
    }, [isCreateModalOpen])

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
        setShowShortcutKey(false)
    }

    const handleFilterKeyPress = (e: React.KeyboardEvent<any>): void => {
        const _key = e.key
        if (_key === 'Escape' || _key === 'Esc') {
            searchInputRef.current?.blur()
        } else if (_key === 'Backspace' && searchText.length === 0) {
            clearSearch()
        } else {
            handleFilterChanges(e.currentTarget.value, resourceList)
            setSearchApplied(!!e.currentTarget.value)
        }
    }

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
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

    const focusHandler = (e) => {
        setShowShortcutKey(e.type === 'focus' ? false : !searchText)

        if (searchInputRef.current?.parentElement) {
            searchInputRef.current.parentElement.style.border =
                e.type === 'focus' ? '1px solid var(--B500)' : '1px solid var(--N200)'
        }
    }

    const clearSearchInput = () => {
        clearSearch()
        searchInputRef.current?.focus()
    }

    return (
        <>{typeof renderCallBackSync === 'function' && renderCallBackSync()}<div
            className={`resource-filter-options-container flexbox ${hideSearchInput ? 'dc__content-end' : 'dc__content-space'
                } pt-16 pr-20 pb-12 pl-20 w-100`}
        >
            {!hideSearchInput && (
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32 cursor-text">
                    <Search className="search__icon icon-dim-16" onClick={handleInputShortcut} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`Search ${selectedResource?.gvk?.Kind || ''}`}
                        value={searchText}
                        className={`search__input ${isSearchInputDisabled ? 'cursor-not-allowed' : ''}`}
                        onChange={handleOnChangeSearchText}
                        onKeyUp={handleFilterKeyPress}
                        onFocus={focusHandler}
                        onBlur={focusHandler}
                        disabled={isSearchInputDisabled}
                        data-testid="search-input-for-resource"
                    />
                    {searchApplied && (
                        <button className="search__clear-button" type="button" onClick={clearSearchInput}>
                            <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                        </button>
                    )}
                    {showShortcutKey && (
                        <ShortcutKeyBadge
                            shortcutKey="r"
                            rootClassName="resource-search-shortcut-key"
                            onClick={handleInputShortcut}
                        />
                    )}
                </div>
            )}
            <div className="resource-filter-options-wrapper flex">
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
                        styles={FILTER_SELECT_COMMON_STYLES}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            ValueContainer: ResourceValueContainerWithIcon,
                        }}
                    />
                </ConditionalWrap>
            </div>
        </div></>
    )
}

export default withShortcut(ResourceFilterOptions)
