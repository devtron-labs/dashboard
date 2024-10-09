import {
    InfoIconTippy,
    OverrideMergeStrategyType,
    OverrideStrategyTippyContent,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    DOCUMENTATION_HOME_PAGE,
} from '@devtron-labs/devtron-fe-common-lib'
import { MERGE_STRATEGY_OPTIONS } from './constants'
import { SelectMergeStrategyProps } from './types'

const SelectMergeStrategy = ({ mergeStrategy, handleMergeStrategyChange, isDisabled }: SelectMergeStrategyProps) => {
    const handleChange = (selectedOption: SelectPickerOptionType) => {
        handleMergeStrategyChange(selectedOption.value as OverrideMergeStrategyType)
    }

    return (
        <div className="flexbox dc__gap-4 dc__align-items-center">
            <InfoIconTippy
                heading="Merge strategy"
                additionalContent={<OverrideStrategyTippyContent />}
                documentationLink={DOCUMENTATION_HOME_PAGE}
            />

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="m-0 cn-7 fs-12 fw-4 lh-16" htmlFor="config-toolbar-select-strategy">
                Merge strategy
            </label>

            <SelectPicker
                inputId="config-toolbar-select-strategy"
                onChange={handleChange}
                value={MERGE_STRATEGY_OPTIONS.find((option) => option.value === mergeStrategy)}
                options={MERGE_STRATEGY_OPTIONS}
                isDisabled={isDisabled}
                variant={SelectPickerVariantType.BORDER_LESS}
            />
        </div>
    )
}

export default SelectMergeStrategy
