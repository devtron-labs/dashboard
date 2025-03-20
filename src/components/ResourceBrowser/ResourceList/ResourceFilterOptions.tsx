/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef, useState, useMemo, ComponentProps, KeyboardEvent } from 'react'
import { useLocation, useParams, useHistory } from 'react-router-dom'
import {
    useAsync,
    useRegisterShortcut,
    OptionType,
    SearchBar,
    SelectPicker,
    ALL_NAMESPACE_OPTION,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as NamespaceIcon } from '@Icons/ic-env.svg'
import { ResourceFilterOptionsProps, URLParams } from '../Types'
import { NAMESPACE_NOT_APPLICABLE_OPTION, NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import { convertToOptionsList, importComponentFromFELibrary } from '../../common'
import { namespaceListByClusterId } from '../ResourceBrowser.service'
import { URLS } from '../../../config'

const FilterButton = importComponentFromFELibrary('FilterButton', null, 'function')

const ResourceFilterOptions = ({
    selectedResource,
    selectedCluster,
    searchText,
    setSearchText,
    isSearchInputDisabled,
    renderRefreshBar,
    areFiltersHidden = false,
    searchPlaceholder,
}: ResourceFilterOptionsProps) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
    const location = useLocation()
    const { replace } = useHistory()
    const { clusterId, namespace, group } = useParams<URLParams>()
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const showShortcutKey = !isInputFocused && !searchText

    const [, namespaceByClusterIdList] = useAsync(() => namespaceListByClusterId(clusterId), [clusterId])

    const namespaceOptions = useMemo(
        () => [ALL_NAMESPACE_OPTION, ...convertToOptionsList(namespaceByClusterIdList?.result?.sort() || [])],
        [namespaceByClusterIdList],
    )

    const selectedNamespace = useMemo(
        () => namespaceOptions.find((option) => option.value.toLowerCase() === namespace) || namespaceOptions[0],
        [namespace, namespaceOptions],
    )

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
    }

    const handleShowFilterModal = () => {
        setShowFilterModal(true)
    }

    useEffect(() => {
        registerShortcut({ keys: ['R'], callback: handleInputShortcut })
        registerShortcut({ keys: ['F'], callback: handleShowFilterModal })

        return (): void => {
            unregisterShortcut(['F'])
            unregisterShortcut(['R'])
        }
    }, [])

    const handleFilterKeyUp = (e: KeyboardEvent): void => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            searchInputRef.current?.blur()
        }
    }

    const handleOnChangeSearchText: ComponentProps<typeof SearchBar>['handleSearchChange'] = (text) => {
        setSearchText(text)
        if (!text) {
            searchInputRef.current?.focus()
        }
    }

    const handleNamespaceChange = (selected: OptionType): void => {
        if (selected.value === selectedNamespace?.value) {
            return
        }
        const url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${selected.value}/${selectedResource.gvk.Kind.toLowerCase()}/${group}${location.search}`
        replace(url)
    }

    useEffect(() => {
        if (namespace === selectedNamespace.value || namespaceOptions.length === 1) {
            return
        }
        const matchedOption = namespaceOptions.find((option) => option.value === namespace)
        handleNamespaceChange(!matchedOption ? (ALL_NAMESPACE_OPTION as any) : matchedOption)
    }, [namespace, namespaceOptions])

    const handleInputBlur = () => setIsInputFocused(false)

    const handleInputFocus = () => setIsInputFocused(true)

    return (
        <>
            {typeof renderRefreshBar === 'function' && renderRefreshBar()}
            <div className="resource-filter-options-container flexbox dc__content-space pt-16 pr-20 pb-12 pl-20 w-100">
                <div className="resource-filter-options-container__search-box dc__position-rel">
                    <SearchBar
                        inputProps={{
                            placeholder: searchPlaceholder || `Search ${selectedResource?.gvk?.Kind || ''}`,
                            disabled: isSearchInputDisabled,
                            onBlur: handleInputBlur,
                            onFocus: handleInputFocus,
                            ref: searchInputRef,
                            onKeyUp: handleFilterKeyUp,
                        }}
                        handleSearchChange={handleOnChangeSearchText}
                        initialSearchText={searchText}
                    />
                    {showShortcutKey && (
                        <ShortcutKeyBadge
                            shortcutKey="r"
                            rootClassName="resource-search-shortcut-key"
                            onClick={handleInputShortcut}
                        />
                    )}
                </div>
                {!areFiltersHidden && (
                    <div className="flexbox dc__gap-8 dc__zi-3">
                        {FilterButton && (
                            <FilterButton
                                clusterName={selectedCluster?.label || ''}
                                showModal={showFilterModal}
                                setShowModal={setShowFilterModal}
                            />
                        )}
                        <SelectPicker
                            inputId="resource-filter-select"
                            placeholder="Select Namespace"
                            options={namespaceOptions}
                            value={selectedResource?.namespaced ? selectedNamespace : NAMESPACE_NOT_APPLICABLE_OPTION}
                            onChange={handleNamespaceChange}
                            isDisabled={!selectedResource?.namespaced}
                            icon={<NamespaceIcon className="fcn-6" />}
                            disabledTippyContent={NAMESPACE_NOT_APPLICABLE_TEXT}
                            shouldMenuAlignRight
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default ResourceFilterOptions
