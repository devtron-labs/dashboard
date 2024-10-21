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

import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactSelect, { MenuListProps, ValueContainerProps } from 'react-select'
import { OptionType } from '../../../Common'
import { LoadingIndicator, MenuListWithApplyButton, MultiSelectValueContainer } from '../ReactSelect'
import { GenericSectionErrorState } from '../GenericSectionErrorState'
import { PluginTagSelectProps } from './types'
import { PluginTagOption, pluginTagSelectStyles } from './utils'

const PluginTagSelect = ({
    availableTags,
    handleUpdateSelectedTags,
    selectedTags,
    isLoading,
    hasError,
    reloadTags,
}: PluginTagSelectProps) => {
    const getInitialSelectedOptions = () => selectedTags?.map((tag) => ({ label: tag, value: tag })) ?? []
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const [localSelectedOptions, setLocalSelectedOptions] = useState<OptionType[]>(getInitialSelectedOptions())

    useEffect(() => {
        setLocalSelectedOptions(getInitialSelectedOptions())
    }, [selectedTags])

    const tagOptions: OptionType[] = useMemo(
        () => availableTags?.map((tag) => ({ label: tag, value: tag })) || [],
        [availableTags],
    )

    const handleLocalSelection = (selectedOptions: OptionType[]) => {
        setLocalSelectedOptions(selectedOptions)
    }

    const handleMenuOpen = () => {
        setIsMenuOpen(true)
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false)
        setLocalSelectedOptions(getInitialSelectedOptions())
    }

    const renderNoOptionsMessage = () => {
        if (hasError) {
            return <GenericSectionErrorState reload={reloadTags} />
        }
        return <p className="m-0 cn-7 fs-13 fw-4 lh-20 py-6 px-8">No tags found</p>
    }

    const renderMenuList = useCallback(
        (props: MenuListProps<OptionType, true>) => {
            const selectedOptions = props.getValue() || []

            const handleApplyFilters = () => {
                handleMenuClose()
                handleUpdateSelectedTags(selectedOptions.map((option) => option.value))
            }

            return <MenuListWithApplyButton {...props} handleApplyFilter={handleApplyFilters} />
        },
        [handleUpdateSelectedTags],
    )

    const renderValueContainer = useCallback(
        (props: ValueContainerProps<OptionType, true>) => <MultiSelectValueContainer {...props} title="Tags" />,
        [],
    )

    return (
        <ReactSelect<OptionType, true>
            styles={pluginTagSelectStyles}
            options={tagOptions}
            isMulti
            value={localSelectedOptions}
            components={{
                IndicatorSeparator: null,
                ClearIndicator: null,
                LoadingIndicator,
                NoOptionsMessage: renderNoOptionsMessage,
                MenuList: renderMenuList,
                Option: PluginTagOption,
                ValueContainer: renderValueContainer,
            }}
            menuIsOpen={isMenuOpen}
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
            isLoading={isLoading}
            onChange={handleLocalSelection}
            backspaceRemovesValue={false}
            closeMenuOnSelect={false}
            controlShouldRenderValue={false}
            hideSelectedOptions={false}
            blurInputOnSelect={false}
            maxMenuHeight={200}
            placeholder="Search tags"
            inputId="plugin-tag-select"
            className="w-150"
        />
    )
}

export default PluginTagSelect
