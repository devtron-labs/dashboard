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
}: ContextSwitcherTypes) => (
    <SelectPicker
        inputId={inputId}
        options={options}
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
