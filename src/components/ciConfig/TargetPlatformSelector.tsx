import React from 'react'
import { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { TARGET_PLATFORM_LIST, tempMultiSelectStyles } from './CIConfig.utils'

export interface TargetPlatformSelector {
    allowOverride: boolean
    selectedTargetPlatforms: any
    setSelectedTargetPlatforms: any
    showCustomPlatformWarning: boolean
    setShowCustomPlatformWarning: (value: boolean) => void
    targetPlatformMap: any
    parentState?
}

function TargetPlatformSelector({
    allowOverride,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
    targetPlatformMap,
    parentState,
}: TargetPlatformSelector) {
    const platformMenuList = (props): JSX.Element => {
        return (
            <components.MenuList {...props}>
                <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">
                    Type to enter a target platform. Press Enter to accept.
                </div>
                {props.children}
            </components.MenuList>
        )
    }

    const noMatchingPlatformOptions = (): string => {
        return 'No matching options'
    }
    const handlePlatformChange = (selectedValue): void => {
        setSelectedTargetPlatforms(selectedValue)
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
            setSelectedTargetPlatforms([
                ...selectedTargetPlatforms,
                {
                    label: event.target.value,
                    value: event.target.value,
                },
            ])
            if (!showCustomPlatformWarning) {
                setShowCustomPlatformWarning(!targetPlatformMap.get(event.target.value))
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
        let targetPlatform =
            parentState?.selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform
        if (!targetPlatform?.includes(',')) {
          return <div className="en-2 bw-1 br-4">{targetPlatform}</div>
        } else {
          return (
            <div className="flex left ">
                {targetPlatform.split(',').map((val) => {
                    return <div className="en-2 bw-1 br-4 dc__w-fit-content pl-8 pr-8 pt-2 pb-2 mr-8">{val}</div>
                })}
            </div>
        )
        }
    }

    return (
        <div className="mb-20">
            <div className="fs-13 fw-6">{!allowOverride ? 'Target' : 'Set target'} platform for the build</div>
            <div className="fs-13 fw-4 cn-7 mb-12">
                If target platform is not set, Devtron will build image for architecture and operating system of the k8s
                node on which CI is running
            </div>
            {!allowOverride ? (
                getOverridenValue()
            ) : (
                <CreatableSelect
                    value={selectedTargetPlatforms}
                    isMulti={true}
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
                <span className="flexbox cy-7">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-5 mt-2" />
                    You have entered a custom target platform, please ensure it is valid.
                </span>
            )}
        </div>
    )
}

export default TargetPlatformSelector
