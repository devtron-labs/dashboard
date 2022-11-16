import React, { useEffect, useState } from 'react'
import ReactSelect, { components, InputActionMeta } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { tempMultiSelectStyles } from '../../ciConfig/CIConfig.utils'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ClearIndicator,
    MultiValueRemove,
    noop,
    Option,
} from '../../common'
import { formatOptionLabelClusters, ValueContainer } from '../ExternalLinks.component'
import {
    ExternalLinkIdentifierType,
    ExternalLinkScopeType,
    IdentifierOptionType,
    LinkAction,
    OptionTypeWithIcon,
} from '../ExternalLinks.type'
import { customMultiSelectStyles } from '../ExternalLinks.utils'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'

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
        value?: string | boolean | IdentifierOptionType[] | OptionTypeWithIcon,
    ) => void
    getErrorLabel: (field: string, type?: string) => JSX.Element
}) {
    const [identifierSearchInput, setIdentifierSearchInput] = useState('')

    useEffect(() => {
        clearIdentifierSearchInput()
    }, [link.type])

    const clearIdentifierSearchInput = () => {
        if (identifierSearchInput) {
            setIdentifierSearchInput('')
        }
    }

    const handleClusterSelection = (selected) => {
        handleLinksDataActions('onClusterSelection', index, selected)
    }

    const handleOnBlur = (e) => {
        clearIdentifierSearchInput()
    }

    const handleOnInputChange = (value: string, actionMeta: InputActionMeta) => {
        if (actionMeta.action === 'input-change') {
            setIdentifierSearchInput(value)
        }
    }

    const identifierMenuList = (props): JSX.Element => {
        return (
            <components.MenuList {...props}>
                {identifierSearchInput ? (
                    <div className="flex left pl-8 pt-6 pb-6" onClick={markOptionAsExternalApp}>
                        <AddIcon className="icon-dim-16 fcb-5 mr-8" />
                        <span className="fs-13 fw-4 lh-20 cb-5">External helm app ‘apache-chart’</span>
                    </div>
                ) : (
                    <div className="cn-5 pl-8 pt-6 pb-6 dc__italic-font-style">
                        Enter app name for externally deployed helm apps
                    </div>
                )}
                {props.children}
            </components.MenuList>
        )
    }

    const noMatchingIdentifierOptions = (): string => {
        return 'No matching options'
    }

    const markOptionAsExternalApp = () => {
        handleLinksDataActions('onAppSelection', index, [
            ...selectedIdentifiers,
            {
                label: identifierSearchInput,
                value: identifierSearchInput,
                type: ExternalLinkIdentifierType.ExternalHelmApp,
            },
        ])
        clearIdentifierSearchInput()
    }

    const identifierMultiValueContainer = (props) => {
        const { children, data, innerProps, selectProps } = props
        const { label, value, type } = data

        if (
            !props.selectProps.value.some((_val) => _val.type === ExternalLinkIdentifierType.ExternalHelmApp) &&
            props.selectProps.value.length === props.selectProps.options.length &&
            value !== '*'
        ) {
            return null
        }

        return (
            <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
                <div className="pl-4 pr-4">
                    {type === ExternalLinkIdentifierType.ExternalHelmApp && (
                        <span className="fs-12 fw-6 cn-9 lh-20 dc__border-right pr-6 mr-6">Ext helm app</span>
                    )}
                    <span className="fs-12 fw-4 cn-9 lh-20">{label}</span>
                </div>
                {children[1]}
            </components.MultiValueContainer>
        )
    }

    const identifierOption = (props): JSX.Element => {
        const { isSelected, data } = props
        return (
            <components.Option {...props}>
                <div className="flex left cursor w-100">
                    {!data.__isNew__ ? (
                        <Checkbox
                            isChecked={isSelected}
                            rootClassName="link-identifier-option mb-0-imp"
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={noop}
                        >
                            <span className="fs-13 fw-4 lh-20 cn-9">{data.label}</span>
                        </Checkbox>
                    ) : (
                        <span className="fs-13 fw-4 lh-20 cn-9">{data.label}</span>
                    )}
                </div>
            </components.Option>
        )
    }
    const handleAppChange = (selectedValue): void => {
        handleLinksDataActions('onAppSelection', index, selectedValue)
        clearIdentifierSearchInput()
    }

    const handleCreatableBlur = (event): void => {
        if (event.target.value) {
            clearIdentifierSearchInput()
        }
    }

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
                        inputValue={identifierSearchInput}
                        onBlur={handleOnBlur}
                        onInputChange={handleOnInputChange}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
                            ValueContainer,
                            Option,
                        }}
                        styles={{
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
                    <label>Applications*</label>
                    <CreatableSelect
                        value={selectedIdentifiers}
                        isMulti={true}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator,
                            MultiValueRemove,
                            Option: identifierOption,
                            MenuList: identifierMenuList,
                            MultiValueContainer: identifierMultiValueContainer,
                        }}
                        styles={{
                            ...tempMultiSelectStyles,
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                            control: (base, state) => ({
                                ...tempMultiSelectStyles.control(base, state),
                                minHeight: '36px',
                                border: `solid 1px ${state.isFocused ? 'var(--N400)' : 'var(--N200)'}`,
                                backgroundColor: 'var(--N50)',
                                cursor: 'pointer',
                            }),
                        }}
                        closeMenuOnSelect={false}
                        inputValue={identifierSearchInput}
                        onInputChange={handleOnInputChange}
                        name="link-applications"
                        placeholder="Select or enter app name"
                        options={allApps}
                        className="basic-multi-select mb-4"
                        classNamePrefix="link-applications__select"
                        onChange={handleAppChange}
                        hideSelectedOptions={false}
                        noOptionsMessage={noMatchingIdentifierOptions}
                        onBlur={handleCreatableBlur}
                        isValidNewOption={() => false}
                        onKeyDown={handleKeyDown}
                        captureMenuScroll={false}
                    />
                </>
            )}
            {link.invalidIdentifiers &&
                getErrorLabel(
                    'identifiers',
                    link.type === ExternalLinkScopeType.ClusterLevel ? 'clusters' : 'applications',
                )}
        </div>
    )
}
