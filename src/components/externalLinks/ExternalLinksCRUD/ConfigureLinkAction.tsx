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

import React, { useState } from 'react'
import ReactSelect from 'react-select'
import {
    Checkbox,
    CHECKBOX_VALUE,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
    InfoIconTippy,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import {
    ConfigureLinkActionType,
    ExternalLinkScopeType,
    LinkValidationKeys,
    OptionTypeWithIcon,
} from '../ExternalLinks.type'
import { ToolSelectStyles } from '../ExternalLinks.utils'
import { customOptionWithIcon, customValueContainerWithIcon, ToolsMenuList } from '../ExternalLinks.component'
import IdentifierSelector from './IdentifierSelector'
import { CONFIGURE_LINK_NO_NAME } from '../../../config'

export default function ConfigureLinkAction({
    isFullMode,
    isAppConfigView,
    index,
    link,
    clusters,
    allApps,
    selectedIdentifiers,
    toolGroupedOptions,
    showDelete,
    onToolSelection,
    handleLinksDataActions,
}: ConfigureLinkActionType): JSX.Element {
    const [linkScope, setLinkScope] = useState<ExternalLinkScopeType>(link.type || ExternalLinkScopeType.ClusterLevel)

    const getErrorLabel = (field: string, type?: string): JSX.Element => {
        const errorLabel = (label: string): JSX.Element => {
            return (
                <div className="error-label flex left dc__align-start fs-11 mt-4">
                    <div className="error-label-icon icon-dim-16">
                        <Error className="icon-dim-16" />
                    </div>
                    <div className="ml-4 cr-5">{label}</div>
                </div>
            )
        }
        switch (field) {
            case 'tool':
                return errorLabel('Please select monitoring tool')
            case 'name':
                return errorLabel('Please provide name for the tool you want to link')
            case 'identifiers':
                return errorLabel(`Please select one or more ${type}`)
            case 'url':
                return errorLabel('Please enter URL template')
            case 'invalidProtocol':
                return errorLabel('The url should start with http:// or https://')
            default:
                return <></>
        }
    }

    const onNameChange = (e) => {
        handleLinksDataActions('onNameChange', index, e.target.value)
    }

    const onDescriptionChange = (e) => {
        handleLinksDataActions('onDescriptionChange', index, e.target.value)
    }

    const onEditableFlagToggle = () => {
        handleLinksDataActions('onEditableFlagToggle', index, !link.isEditable)
    }

    const onUrlTemplateChange = (e) => {
        handleLinksDataActions('onUrlTemplateChange', index, e.target.value)
    }

    const deleteLinkData = (key) => {
        handleLinksDataActions('delete', key)
    }

    const handleLinkScope = (e) => {
        setLinkScope(e.target.value)
        handleLinksDataActions('onScopeChange', index, e.target.value)
    }

    const handleToolSelection = (selected: OptionTypeWithIcon) => {
        onToolSelection(index, selected)

        if (link.invalidName) {
            validateAndUpdateLinksData(null, LinkValidationKeys.name)
        }
    }

    // validating name & urlTemplate fields data on blur
    const validateAndUpdateLinksData = (e, key?: LinkValidationKeys): void => {
        const validationKey = e?.target?.name || key
        switch (validationKey) {
            case LinkValidationKeys.name:
                link.invalidName = !link.name.trim()
                break
            case LinkValidationKeys.urlTemplate:
                const trimmedURLTemplate = link.urlTemplate.replace(/\s+/g, '')
                link.invalidUrlTemplate = !trimmedURLTemplate
                link.invalidProtocol = trimmedURLTemplate && !trimmedURLTemplate.startsWith('http')
                break
            default:
                break
        }
        handleLinksDataActions('validate', index, link)
    }

    return (
        <div id={`link-action-${index}`} className="configure-link-action-wrapper">
            <div className="link-monitoring-tool mb-8">
                <ReactSelect
                    placeholder="Select"
                    name={`monitoring-tool-${index}`}
                    value={link.tool}
                    options={toolGroupedOptions}
                    isMulti={false}
                    isSearchable={false}
                    hideSelectedOptions={false}
                    onChange={handleToolSelection}
                    components={{
                        IndicatorSeparator: null,
                        ClearIndicator: null,
                        Option: customOptionWithIcon,
                        ValueContainer: customValueContainerWithIcon,
                        MenuList: ToolsMenuList,
                    }}
                    styles={ToolSelectStyles}
                    classNamePrefix="link-icon__select"
                />
            </div>
            <div className="configure-link-action-content">
                <div className="link-name">
                    <CustomInput
                        name={LinkValidationKeys.name}
                        placeholder="Link name"
                        value={link.name}
                        onChange={onNameChange}
                        onBlur={validateAndUpdateLinksData}
                        data-testid="external-link-name-input"
                        error={link.invalidName && CONFIGURE_LINK_NO_NAME}
                    />
                </div>
                <div className="link-text-area">
                    <textarea
                        rows={1}
                        placeholder="Description"
                        value={link.description}
                        onChange={onDescriptionChange}
                        data-testid="external-link-description-input"
                    />
                </div>
                {!isAppConfigView && (
                    <div className="link-scope flex left">
                        <label className="mr-16">Show link in:</label>
                        <RadioGroup
                            className="external-link-scope__radio-group"
                            value={linkScope}
                            name={`external-link-scope-${index}`}
                            onChange={handleLinkScope}
                        >
                            <RadioGroupItem value={ExternalLinkScopeType.ClusterLevel}>
                                <span
                                    className={`dc__no-text-transform ${
                                        linkScope === ExternalLinkScopeType.ClusterLevel ? 'fw-6' : 'fw-4'
                                    }`}
                                    data-testid="specific-clusters-select"
                                >
                                    All apps in specific clusters
                                </span>
                            </RadioGroupItem>
                            <RadioGroupItem value={ExternalLinkScopeType.AppLevel}>
                                <span
                                    className={`dc__no-text-transform ${
                                        linkScope === ExternalLinkScopeType.AppLevel ? 'fw-6' : 'fw-4'
                                    }`}
                                    data-testid="specific-applications-select"
                                >
                                    Specific applications
                                </span>
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>
                )}
                {!isAppConfigView && (
                    <IdentifierSelector
                        isFullMode={isFullMode}
                        index={index}
                        link={link}
                        selectedIdentifiers={selectedIdentifiers}
                        clusters={clusters}
                        allApps={allApps}
                        handleLinksDataActions={handleLinksDataActions}
                        getErrorLabel={getErrorLabel}
                    />
                )}
                <div className="link-text-area">
                    <label className="dc__required-field">URL Template</label>
                    <textarea
                        name={LinkValidationKeys.urlTemplate}
                        rows={1}
                        placeholder="Link or URL template"
                        value={link.urlTemplate}
                        onChange={onUrlTemplateChange}
                        onBlur={validateAndUpdateLinksData}
                        data-testid="link-url-template-input"
                    />
                    {link.invalidUrlTemplate && getErrorLabel('url')}
                    {link.invalidProtocol && getErrorLabel('invalidProtocol')}
                </div>
                {isFullMode && !isAppConfigView && link.type === ExternalLinkScopeType.AppLevel && (
                    <div className="flex left">
                        <Checkbox
                            isChecked={link.isEditable}
                            rootClassName="link-admin-scope mb-0-imp"
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={onEditableFlagToggle}
                        >
                            <span className="fs-13 fw-4 lh-20 cn-9">App admins can edit</span>
                        </Checkbox>
                        <InfoIconTippy
                            heading="Who can edit this link?"
                            infoText="If allowed, this link will be visible in app configurations. Application admins and managers will be able to edit this link."
                            iconClassName="icon-dim-16 fcn-6 ml-4"
                        />
                    </div>
                )}
            </div>
            {showDelete && (
                <div className="link-delete icon-dim-20 cursor" data-testid="close-link">
                    <CloseIcon className="icon-dim-20 fcn-6" onClick={() => deleteLinkData(index)} />
                </div>
            )}
        </div>
    )
}
