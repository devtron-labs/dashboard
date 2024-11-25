import { useMemo } from 'react'
import {
    InfoIconTippy,
    OverrideMergeStrategyType,
    OverrideStrategyTippyContent,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    DOCUMENTATION_HOME_PAGE,
    ComponentSizeType,
    noop,
    getSelectPickerOptionByValue,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { MERGE_STRATEGY_OPTIONS } from './constants'
import { SelectMergeStrategyProps } from './types'

const PatchStrategyTooltipInfo = importComponentFromFELibrary('PatchStrategyTooltipInfo', null, 'function')
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', false, 'function')

const getIsOptionDisabled = (option: SelectPickerOptionType) =>
    !isFELibAvailable && option.value === OverrideMergeStrategyType.PATCH

const MERGE_STRATEGY_LABEL_CLASS = 'cn-7 fs-12 fw-4 lh-16'

const SelectMergeStrategy = ({
    mergeStrategy,
    handleMergeStrategyChange = noop,
    isDisabled = false,
    variant = 'dropdown',
    hidePatchOption,
}: SelectMergeStrategyProps) => {
    const handleChange = (selectedOption: SelectPickerOptionType) => {
        handleMergeStrategyChange(selectedOption.value as OverrideMergeStrategyType)
    }

    const options = useMemo(
        () =>
            MERGE_STRATEGY_OPTIONS.filter(({ value }) => !hidePatchOption || value !== OverrideMergeStrategyType.PATCH),
        [hidePatchOption],
    )

    const renderContent = () => {
        const selectedOption = getSelectPickerOptionByValue(options, mergeStrategy, null)

        if (variant === 'text') {
            return (
                <>
                    <span className={MERGE_STRATEGY_LABEL_CLASS}>Merge strategy</span>
                    <span className="cn-9 fs-12 fw-6 lh-20">{selectedOption?.label || '-'}</span>
                </>
            )
        }

        return (
            <>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={`m-0 ${MERGE_STRATEGY_LABEL_CLASS}`} htmlFor="config-toolbar-select-strategy">
                    Merge strategy
                </label>

                <SelectPicker
                    inputId="config-toolbar-select-strategy"
                    onChange={handleChange}
                    value={selectedOption}
                    options={options}
                    isDisabled={isDisabled}
                    variant={SelectPickerVariantType.BORDER_LESS}
                    isSearchable={false}
                    size={ComponentSizeType.small}
                    isOptionDisabled={getIsOptionDisabled}
                />
            </>
        )
    }

    return (
        <div className="flexbox dc__gap-6 dc__align-items-center">
            <InfoIconTippy
                heading="Merge strategy"
                additionalContent={
                    <OverrideStrategyTippyContent>
                        {PatchStrategyTooltipInfo && <PatchStrategyTooltipInfo />}
                    </OverrideStrategyTippyContent>
                }
                documentationLink={DOCUMENTATION_HOME_PAGE}
            />

            {renderContent()}
        </div>
    )
}

export default SelectMergeStrategy
