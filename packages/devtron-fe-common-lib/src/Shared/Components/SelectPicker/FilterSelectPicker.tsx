/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { useEffect, useMemo, useState } from 'react'
import { ReactComponent as ICFilter } from '@Icons/ic-filter.svg'
import { ReactComponent as ICFilterApplied } from '@Icons/ic-filter-applied.svg'
import SelectPicker from './SelectPicker.component'
import { FilterSelectPickerProps, SelectPickerOptionType, SelectPickerProps } from './type'

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
                <button
                    type="button"
                    className="dc__unset-button-styles w-100 br-4 h-28 flex bcb-5 cn-0 fw-6 lh-28 fs-12 h-28 br-4 pt-5 pr-12 pb-5 pl-12"
                    onClick={handleApplyClick}
                    aria-label="Apply filters"
                >
                    Apply
                </button>
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
