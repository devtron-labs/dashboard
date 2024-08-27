/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from 'react'
import { components, InputActionMeta } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ClearIndicator,
    MultiValueRemove,
    noop,
    ReactSelectInputAction,
} from '@devtron-labs/devtron-fe-common-lib'
import { ExternalLinkIdentifierType, ExternalLinkScopeType, IdentifierSelectorProps } from '../ExternalLinks.type'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import { IdentifierSelectStyles } from '../ExternalLinks.utils'

export default function IdentifierSelector({
    isFullMode,
    index,
    link,
    selectedIdentifiers,
    clusters,
    allApps,
    handleLinksDataActions,
    getErrorLabel,
}: IdentifierSelectorProps) {
    const [identifierSearchInput, setIdentifierSearchInput] = useState('')

    useEffect(() => {
        clearIdentifierSearchInput()
    }, [link.type])

    const identifierMenuList = (props): JSX.Element => {
        return (
            <components.MenuList {...props}>
                {link.type === ExternalLinkScopeType.AppLevel && (
                    <>
                        {identifierSearchInput ? (
                            <div className="flex left pl-8 pt-6 pb-6" onClick={markOptionAsExternalApp}>
                                <AddIcon className="icon-dim-16 fcb-5 mr-8" />
                                <span className="fs-13 fw-4 lh-20 cb-5">
                                    {`${isFullMode ? 'External helm' : 'Helm'} app ‘${identifierSearchInput}’`}
                                </span>
                            </div>
                        ) : (
                            <div className="cn-5 pl-8 pt-6 pb-6 dc__italic-font-style">
                                {`Enter app name for${isFullMode ? ' externally ' : ' '}deployed helm apps`}
                            </div>
                        )}
                    </>
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
                <div className="flex column left cursor w-100">
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
                        <small className="cn-6 ml-21">
                            All existing and future
                            {link.type === ExternalLinkScopeType.ClusterLevel
                                ? ' clusters'
                                : ' Devtron + Helm applications'}
                        </small>
                    )}
                </div>
            </components.Option>
        )
    }

    const clearIdentifierSearchInput = () => {
        if (identifierSearchInput) {
            setIdentifierSearchInput('')
        }
    }

    const handleOnChange = (selected) => {
        handleLinksDataActions(
            link.type === ExternalLinkScopeType.ClusterLevel ? 'onClusterSelection' : 'onAppSelection',
            index,
            selectedIdentifiers.findIndex((_identifier) => _identifier.value === '*') !== -1 &&
                selected.findIndex((_identifier) => _identifier.value === '*') === -1
                ? []
                : selected,
        )
        clearIdentifierSearchInput()
    }

    const handleOnInputChange = (value: string, actionMeta: InputActionMeta) => {
        if (actionMeta.action === ReactSelectInputAction.inputChange) {
            setIdentifierSearchInput(value)
        }
    }

    const handleCreatableBlur = (event): void => {
        // validating identifiers field data on blur
        link.invalidIdentifiers = !link.identifiers || link.identifiers.length <= 0
        handleLinksDataActions('validate', index, link)
        clearIdentifierSearchInput()
    }

    const handleKeyDown = (event): void => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    const isValidNewOption = () => false

    return (
        <div className="link-identifiers">
            {link.type === ExternalLinkScopeType.ClusterLevel ? (
                <>
                    <label className="dc__required-field">Clusters</label>
                    <CreatableSelect
                        value={selectedIdentifiers}
                        options={clusters}
                        isMulti
                        closeMenuOnSelect={false}
                        inputValue={identifierSearchInput}
                        onInputChange={handleOnInputChange}
                        placeholder="Select clusters"
                        name={`Link-Clusters-${index}`}
                        className="basic-multi-select mb-4"
                        classNamePrefix="link-clusters__select"
                        onChange={handleOnChange}
                        hideSelectedOptions={false}
                        noOptionsMessage={noMatchingIdentifierOptions}
                        onBlur={handleCreatableBlur}
                        isValidNewOption={isValidNewOption}
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
                        styles={IdentifierSelectStyles}
                    />
                </>
            ) : (
                <>
                    <label className="dc__required-field">Applications</label>
                    <CreatableSelect
                        value={selectedIdentifiers}
                        options={allApps}
                        isMulti
                        closeMenuOnSelect={false}
                        inputValue={identifierSearchInput}
                        onInputChange={handleOnInputChange}
                        name={`Link-Applications-${index}`}
                        placeholder={`${isFullMode ? 'Select or enter ' : 'Enter '}app name`}
                        className="basic-multi-select mb-4"
                        classNamePrefix="link-applications__select"
                        onChange={handleOnChange}
                        hideSelectedOptions={false}
                        noOptionsMessage={noMatchingIdentifierOptions}
                        onBlur={handleCreatableBlur}
                        isValidNewOption={isValidNewOption}
                        onKeyDown={handleKeyDown}
                        captureMenuScroll={false}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator,
                            MultiValueRemove,
                            Option: identifierOption,
                            MenuList: identifierMenuList,
                            MultiValueContainer: identifierMultiValueContainer,
                            ...(!isFullMode && { NoOptionsMessage: () => null }),
                        }}
                        styles={IdentifierSelectStyles}
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
