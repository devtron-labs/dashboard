import React, { useEffect, useState } from 'react'
import { components, InputActionMeta } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { tempMultiSelectStyles } from '../../ciConfig/CIConfig.utils'
import { Checkbox, CHECKBOX_VALUE, ClearIndicator, MultiValueRemove, noop, Option } from '../../common'
import { ExternalLinkIdentifierType, ExternalLinkScopeType, IdentifierSelectorProps } from '../ExternalLinks.type'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'

export default function IdentifierSelector({
    index,
    link,
    selectedIdentifiers,
    clusters,
    allApps,
    handleLinksDataActions,
    getErrorLabel,
    validateLinksData,
}: IdentifierSelectorProps) {
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
                        <span className="fs-13 fw-4 lh-20 cb-5">External helm app ‘{identifierSearchInput}’</span>
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
                    <div className="flex left">
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
                    {data.value === '*' && (
                        <small className="cn-6">
                            All existing and future
                            {props.selectProps.name.includes('Clusters') ? ' clusters' : ' Devtron + Helm applications'}
                        </small>
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
        validateLinksData()
        clearIdentifierSearchInput()
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
                    <CreatableSelect
                        value={selectedIdentifiers}
                        options={clusters}
                        isMulti={true}
                        closeMenuOnSelect={false}
                        inputValue={identifierSearchInput}
                        onInputChange={handleOnInputChange}
                        placeholder="Select clusters"
                        name={`Link-Clusters-${index}`}
                        className="basic-multi-select mb-4"
                        classNamePrefix="link-clusters__select"
                        onChange={handleClusterSelection}
                        hideSelectedOptions={false}
                        noOptionsMessage={noMatchingIdentifierOptions}
                        onBlur={handleCreatableBlur}
                        isValidNewOption={() => false}
                        onKeyDown={handleKeyDown}
                        captureMenuScroll={false}
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
                    />
                </>
            ) : (
                <>
                    <label>Applications*</label>
                    <CreatableSelect
                        value={selectedIdentifiers}
                        options={allApps}
                        isMulti={true}
                        closeMenuOnSelect={false}
                        inputValue={identifierSearchInput}
                        onInputChange={handleOnInputChange}
                        name={`Link-Applications-${index}`}
                        placeholder="Select or enter app name"
                        className="basic-multi-select mb-4"
                        classNamePrefix="link-applications__select"
                        onChange={handleAppChange}
                        hideSelectedOptions={false}
                        noOptionsMessage={noMatchingIdentifierOptions}
                        onBlur={handleCreatableBlur}
                        isValidNewOption={() => false}
                        onKeyDown={handleKeyDown}
                        captureMenuScroll={false}
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
