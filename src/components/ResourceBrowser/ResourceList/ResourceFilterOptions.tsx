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
import { withShortcut, IWithShortcut } from 'react-keybind'
import { useAsync, useRegisterShortcut, OptionType, SearchBar, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'
import { ResourceFilterOptionsProps, URLParams } from '../Types'
import { ALL_NAMESPACE_OPTION, NAMESPACE_NOT_APPLICABLE_OPTION, NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import { convertToOptionsList, importComponentFromFELibrary } from '../../common'
import { namespaceListByClusterId } from '../ResourceBrowser.service'
import { URLS } from '../../../config'
import { ReactComponent as NamespaceIcon } from '../../../assets/icons/ic-env.svg'

const FilterButton = importComponentFromFELibrary('FilterButton', null, 'function')

const ResourceFilterOptions = ({
    selectedResource,
    selectedNamespace,
    selectedCluster,
    setSelectedNamespace,
    searchText,
    isOpen,
    setSearchText,
    isSearchInputDisabled,
    shortcut,
    renderRefreshBar,
    updateK8sResourceTab,
}: ResourceFilterOptionsProps & IWithShortcut) => {
    const { registerShortcut } = useRegisterShortcut()
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

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
    }

    const handleShowFilterModal = () => {
        setShowFilterModal(true)
    }

    useEffect(() => {
        if (registerShortcut && isOpen) {
            shortcut.registerShortcut(handleInputShortcut, ['r'], 'ResourceSearchFocus', 'Focus resource search')
            shortcut.registerShortcut(
                handleShowFilterModal,
                ['f'],
                'ResourceFilterDrawer',
                'Open resource filter drawer',
            )
        }
        return (): void => {
            shortcut.unregisterShortcut(['f'])
            shortcut.unregisterShortcut(['r'])
        }
    }, [registerShortcut, isOpen])

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
        updateK8sResourceTab(url)
        replace(url)
        setSelectedNamespace(selected)
    }

    useEffect(() => {
        if (!isOpen || namespace === selectedNamespace.value || namespaceOptions.length === 1) {
            return
        }
        const matchedOption = namespaceOptions.find((option) => option.value === namespace)
        handleNamespaceChange(!matchedOption ? ALL_NAMESPACE_OPTION : matchedOption)
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
                            placeholder: `Search ${selectedResource?.gvk?.Kind || ''}`,
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
                <div className="flexbox dc__gap-8 dc__zi-3">
                    {FilterButton && (
                        <FilterButton
                            clusterName={selectedCluster?.label || ''}
                            updateTabUrl={updateK8sResourceTab}
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
            </div>
        </>
    )
}

export default withShortcut(ResourceFilterOptions)
