import React, { useState } from 'react'
import { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { KeyValueInput } from '../configMaps/ConfigMap'
import { ReactComponent as PluginIcon } from '../../assets/icons/ic-plugin.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { TARGET_PLATFORM_LIST, tempMultiSelectStyles } from './CIConfig.utils'

export default function CIAdvancedConfig({
    args,
    setArgs,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    targetPlatformMap,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleCollapse = (): void => {
        setIsCollapsed(!isCollapsed)
    }

    const handleArgsChange = (index, k, v): void => {
        setArgs((arr) => {
            arr[index] = { k: k, v: v, keyError: '', valueError: '' }
            return Array.from(arr)
        })
    }

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
    const handlePlatformChange = (selectedValue): void => {
        setSelectedTargetPlatforms(selectedValue)
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

    return (
        <>
            <div onClick={toggleCollapse} className="flex left cursor mb-20">
                <div className="icon-dim-40 mr-16">
                    <PluginIcon />
                </div>
                <div>
                    <div className="fs-14 fw-6 ">Advanced options</div>
                    <div className="form-row__add-parameters">
                        <span className="fs-13 fw-4 cn-7">Set target platform for build, Docker build arguments</span>
                    </div>
                </div>
                <span className="ml-auto">
                    <Dropdown
                        className="icon-dim-32 rotate "
                        style={{ ['--rotateBy' as any]: isCollapsed ? '180deg' : '0deg' }}
                    />
                </span>
            </div>
            {isCollapsed && (
                <>
                    <div className="mb-20">
                        <div className="fs-13 fw-6">Set target platform for the build</div>
                        <div className="fs-13 fw-4 cn-7 mb-12">
                            If target platform is not set, Devtron will build image for architecture and operating
                            system of the k8s node on which CI is running
                        </div>
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
                        {showCustomPlatformWarning && (
                            <span className="flexbox cy-7">
                                <WarningIcon className="warning-icon-y7 icon-dim-16 mr-5 mt-2" />
                                You have entered a custom target platform, please ensure it is valid.
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="fs-13 fw-6 mb-8">Docker build arguments</div>
                        {args &&
                            args.map((arg, idx) => (
                                <KeyValueInput
                                    keyLabel={'Key'}
                                    valueLabel={'Value'}
                                    {...arg}
                                    key={idx}
                                    index={idx}
                                    onChange={handleArgsChange}
                                    onDelete={(e) => {
                                        let argsTemp = [...args]
                                        argsTemp.splice(idx, 1)
                                        setArgs(argsTemp)
                                    }}
                                    valueType="text"
                                />
                            ))}
                        <div
                            className="add-parameter pointer fs-14 cb-5 mb-20"
                            onClick={(e) =>
                                setArgs((args) => [{ k: '', v: '', keyError: '', valueError: '' }, ...args])
                            }
                        >
                            <span className="fa fa-plus mr-8"></span>Add parameter
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
