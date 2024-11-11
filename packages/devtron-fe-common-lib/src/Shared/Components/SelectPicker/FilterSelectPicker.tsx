/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { useEffect, useMemo, useState } from 'react'
import { ReactComponent as ICFilter } from '@Icons/ic-filter.svg'
import { ReactComponent as ICFilterApplied } from '@Icons/ic-filter-applied.svg'
import { ComponentSizeType } from '@Shared/constants'
import SelectPicker from './SelectPicker.component'
import { FilterSelectPickerProps, SelectPickerOptionType, SelectPickerProps } from './type'
import { Button } from '../Button'

const FilterSelectPicker = ({
    appliedFilterOptions,
    handleApplyFilter,
    options,
    ...props
}: FilterSelectPickerProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')

    const [selectedOptions, setSelectedOptions] = useState<SelectPickerOptionType[]>(
        structuredClone(appliedFilterOptions ?? []),
    )

    const appliedFiltersCount = appliedFilterOptions?.length ?? 0

    useEffect(() => {
        setSelectedOptions(appliedFilterOptions ?? [])
    }, [appliedFilterOptions])

    const filterIcon = useMemo(
        () => (appliedFiltersCount ? <ICFilterApplied className="p-2" /> : <ICFilter className="p-2" />),
        [appliedFiltersCount],
    )

    const openMenu = () => {
        setIsMenuOpen(true)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const handleSelectOnChange: SelectPickerProps<number | string, true>['onChange'] = (selectedOptionsToUpdate) => {
        setInputValue(inputValue)
        setSelectedOptions(structuredClone(selectedOptionsToUpdate) as SelectPickerOptionType[])
    }

    const handleMenuClose = () => {
        closeMenu()
        setSelectedOptions(structuredClone(appliedFilterOptions ?? []))
    }

    const renderApplyButton = () => {
        const handleApplyClick = () => {
            handleApplyFilter(selectedOptions)
            closeMenu()
        }

        return (
            <div className="p-8 dc__border-top-n1">
                <Button
                    text="Apply"
                    dataTestId="filter-select-picker-apply"
                    onClick={handleApplyClick}
                    size={ComponentSizeType.small}
                    fullWidth
                />
            </div>
        )
    }

    return (
        <div className="dc__mxw-250">
            <SelectPicker
                {...props}
                options={options}
                value={selectedOptions}
                isMulti
                menuIsOpen={isMenuOpen}
                onMenuOpen={openMenu}
                onMenuClose={handleMenuClose}
                onChange={handleSelectOnChange}
                renderMenuListFooter={renderApplyButton}
                controlShouldRenderValue={false}
                showSelectedOptionsCount
                isSearchable
                isClearable={false}
                customSelectedOptionsCount={appliedFiltersCount}
                icon={filterIcon}
                inputValue={inputValue}
                onInputChange={setInputValue}
            />
        </div>
    )
}

export default FilterSelectPicker
