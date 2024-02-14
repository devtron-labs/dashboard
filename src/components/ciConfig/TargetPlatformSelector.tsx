import React from 'react'
import { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'
import { TARGET_PLATFORM_LIST, tempMultiSelectStyles } from './CIConfig.utils'
import { SelectorMessaging } from './ciConfigConstant'
import { TargetPlatformSelectorType } from './types'
import { noMatchingPlatformOptions } from '../v2/common/ReactSelect.utils'

const platformMenuList = (props): JSX.Element => {
    return (
        <components.MenuList {...props}>
            <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">{SelectorMessaging.TARGET_SELECTOR_MENU}</div>
            {props.children}
        </components.MenuList>
    )
}

const TargetPlatformSelector = ({
    allowOverride,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
    targetPlatformMap,
    targetPlatform,
    configOverrideView,
    updateDockerConfigOverride,
}: TargetPlatformSelectorType) => {
    const handlePlatformChange = (selectedValue): void => {
        setSelectedTargetPlatforms(selectedValue)

        if (configOverrideView) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.targetPlatform, selectedValue)
        }
    }

    const platformOption = (props): JSX.Element => {
        const { selectOption, data } = props
        return (
            <div
                onClick={(e) => selectOption(data)}
                className="flex left pl-12"
                style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
            >
                {!data.__isNew__ && (
                    <input
                        checked={props.isSelected}
                        type="checkbox"
                        style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
                    />
                )}
                <div className="flex left column w-100">
                    <components.Option className="w-100 option-label-padding" {...props} />
                </div>
            </div>
        )
    }

    const handleCreatableBlur = (event): void => {
        if (event.target.value) {
            const _selectedTargetPlatforms = [
                ...selectedTargetPlatforms,
                {
                    label: event.target.value,
                    value: event.target.value,
                },
            ]
            setSelectedTargetPlatforms(_selectedTargetPlatforms)
            setShowCustomPlatformWarning(!targetPlatformMap.get(event.target.value))

            if (configOverrideView) {
                updateDockerConfigOverride(DockerConfigOverrideKeys.targetPlatform, _selectedTargetPlatforms)
            }
        } else {
            setShowCustomPlatformWarning(
                selectedTargetPlatforms.some((targetPlatform) => !targetPlatformMap.get(targetPlatform.value)),
            )
        }
    }

    const handleKeyDown = (event): void => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    const getOverridenValue = () => {
        if (!targetPlatform) {
            return (
                <div className="bcn-1 br-4 flex cn-7 pt-8 pb-8">
                    {SelectorMessaging.PALTFORM_DESCRIPTION_WITH_NO_TARGET}
                </div>
            )
        }
        if (!targetPlatform.includes(',')) {
            return (
                <div
                    className="en-2 bw-1 br-4 dc__w-fit-content pl-8 pr-8 pt-2 pb-2 mr-8 dc__truncate-text "
                    style={{ maxWidth: '100px' }}
                >
                    {targetPlatform}
                </div>
            )
        }
        return (
            <div className="flex left ">
                {targetPlatform.split(',').map((val) => {
                    return (
                        <div
                            className="en-2 bw-1 br-4 dc__w-fit-content pl-8 pr-8 pt-2 pb-2 mr-8 dc__truncate-text "
                            style={{ maxWidth: '100px' }}
                        >
                            {val}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="mb-0">
            <div className="fs-13 fw-6">
                {!allowOverride && configOverrideView ? 'Target' : 'Set target'} platform for the build
            </div>
            <div className="fs-13 fw-4 cn-7 mb-12">{SelectorMessaging.PALTFORM_DESCRIPTION}</div>
            {!allowOverride && configOverrideView ? (
                getOverridenValue()
            ) : (
                <CreatableSelect
                    value={selectedTargetPlatforms}
                    isMulti
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        Option: platformOption,
                        MenuList: platformMenuList,
                    }}
                    styles={tempMultiSelectStyles}
                    closeMenuOnSelect={false}
                    name="targetPlatform"
                    placeholder="Type to select or create"
                    options={TARGET_PLATFORM_LIST}
                    className="basic-multi-select mb-4"
                    classNamePrefix="target-platform__select"
                    onChange={handlePlatformChange}
                    hideSelectedOptions={false}
                    noOptionsMessage={noMatchingPlatformOptions}
                    onBlur={handleCreatableBlur}
                    isValidNewOption={() => false}
                    onKeyDown={handleKeyDown}
                    captureMenuScroll={false}
                />
            )}
            {showCustomPlatformWarning && (
                <span className="flexbox cy-7 mt-2">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-5 mt-2" />
                    {allowOverride
                        ? SelectorMessaging.WARNING_WITH_NO_TARGET
                        : configOverrideView
                          ? SelectorMessaging.WARNING_WITH_USING_NO_TARGET
                          : SelectorMessaging.WARNING_WITH_NO_TARGET}
                </span>
            )}
        </div>
    )
}

export default TargetPlatformSelector
