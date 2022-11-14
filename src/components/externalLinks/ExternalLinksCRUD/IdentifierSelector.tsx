import React, { useState } from 'react'
import ReactSelect, { InputActionMeta } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { OptionType } from '../../app/types'
import { multiSelectStyles, Option } from '../../common'
import { formatOptionLabelClusters, ValueContainer } from '../ExternalLinks.component'
import { ExternalLinkScopeType, IdentifierOptionType, LinkAction, OptionTypeWithIcon } from '../ExternalLinks.type'
import { customMultiSelectStyles } from '../ExternalLinks.utils'

export default function IdentifierSelector({
    index,
    link,
    selectedIdentifiers,
    clusters,
    allApps,
    handleLinksDataActions,
    getErrorLabel,
}: {
    index: number
    link: LinkAction
    selectedIdentifiers: IdentifierOptionType[]
    clusters: IdentifierOptionType[]
    allApps: IdentifierOptionType[]
    handleLinksDataActions: (
        action: string,
        key?: number,
        value?: string | boolean | OptionType[] | OptionTypeWithIcon,
    ) => void
    getErrorLabel: (field: string, type?: string) => JSX.Element
}) {
    const [clusterSearchInput, setClusterSearchInput] = useState('')
    const handleClusterSelection = (selected) => {
        handleLinksDataActions('onClusterSelection', index, selected)
    }

    const handleOnBlur = (e) => {
        setClusterSearchInput('')
    }

    const handleOnInputChange = (value: string, actionMeta: InputActionMeta) => {
        if (actionMeta.action === 'input-change') {
            setClusterSearchInput(value)
        }
    }

    // const platformMenuList = (props): JSX.Element => {
    //     return (
    //         <components.MenuList {...props}>
    //             <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">
    //                 Type to enter a target platform. Press Enter to accept.
    //             </div>
    //             {props.children}
    //         </components.MenuList>
    //     )
    // }

    // const noMatchingPlatformOptions = (): string => {
    //     return 'No matching options'
    // }

    // const platformOption = (props): JSX.Element => {
    //     const { selectOption, data } = props
    //     return (
    //         <div
    //             onClick={(e) => selectOption(data)}
    //             className="flex left pl-12"
    //             style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
    //         >
    //             {!data.__isNew__ && (
    //                 <input
    //                     checked={props.isSelected}
    //                     type="checkbox"
    //                     style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
    //                 />
    //             )}
    //             <div className="flex left column w-100">
    //                 <components.Option className="w-100 option-label-padding" {...props} />
    //             </div>
    //         </div>
    //     )
    // }
    // const handlePlatformChange = (selectedValue): void => {
    //     setSelectedTargetPlatforms(selectedValue)
    // }

    // const handleCreatableBlur = (event): void => {
    //     if (event.target.value) {
    //         setSelectedTargetPlatforms([
    //             ...selectedTargetPlatforms,
    //             {
    //                 label: event.target.value,
    //                 value: event.target.value,
    //             },
    //         ])
    //         if (!showCustomPlatformWarning) {
    //             setShowCustomPlatformWarning(!targetPlatformMap.get(event.target.value))
    //         }
    //     } else {
    //         setShowCustomPlatformWarning(
    //             selectedTargetPlatforms.some((targetPlatform) => !targetPlatformMap.get(targetPlatform.value)),
    //         )
    //     }
    // }

    const handleKeyDown = (event): void => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    return (
        <div className="link-identifiers">
            {link.type === ExternalLinkScopeType.ClusterLevel ? (
                <>
                    <label>Clusters*</label>
                    <ReactSelect
                        placeholder="Select clusters"
                        name={`link-clusters-${index}`}
                        value={selectedIdentifiers}
                        options={clusters}
                        formatOptionLabel={formatOptionLabelClusters}
                        onChange={handleClusterSelection}
                        isMulti={true}
                        hideSelectedOptions={false}
                        closeMenuOnSelect={false}
                        inputValue={clusterSearchInput}
                        onBlur={handleOnBlur}
                        onInputChange={handleOnInputChange}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
                            ValueContainer,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            ...customMultiSelectStyles,
                            menuList: (base, state) => ({
                                ...customMultiSelectStyles.menuList(base, state),
                                maxHeight: '210px',
                            }),
                            control: (base, state) => ({
                                ...customMultiSelectStyles.control(base, state),
                                width: '100%',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                        }}
                    />
                </>
            ) : (
                <>
                    {/* <CreatableSelect
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
                    /> */}
                </>
            )}
            {link.invalidIdentifiers &&
                getErrorLabel(link.type === ExternalLinkScopeType.ClusterLevel ? 'clusters' : 'applications')}
        </div>
    )
}
