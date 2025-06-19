import {
    ComponentSizeType,
    getNoMatchingResultText,
    SelectPicker,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ContextSwitcherTypes } from './types'
import { customSelect, getDisabledOptions } from './utils'

export const ContextSwitcher = ({
    inputId,
    options = [],
    inputValue,
    onInputChange,
    isLoading,
    noOptionsMessage,
    value,
    onChange,
    placeholder,
}: ContextSwitcherTypes) => {
    const selectedOptions = options?.map((section) => ({
        ...section,
        options: section.label === 'Recently Visited' ? section.options.slice(1) : section.options,
    }))
    return (
        <SelectPicker
            inputId={inputId}
            options={selectedOptions}
            inputValue={inputValue}
            onInputChange={onInputChange}
            isLoading={isLoading}
            noOptionsMessage={noOptionsMessage ?? getNoMatchingResultText}
            onChange={onChange}
            value={value}
            variant={SelectPickerVariantType.BORDER_LESS}
            placeholder={placeholder}
            isOptionDisabled={getDisabledOptions}
            size={ComponentSizeType.xl}
            filterOption={customSelect}
        />
    )
}
