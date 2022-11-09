import React, { useState } from 'react'
import ReactSelect, { InputActionMeta } from 'react-select'
import { multiSelectStyles, Option } from '../../common'
import { ReactComponent as Delete } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { ConfigureLinkActionType } from '../ExternalLinks.type'
import { customMultiSelectStyles } from '../ExternalLinks.utils'
import {
    customOptionWithIcon,
    customValueContainerWithIcon,
    formatOptionLabelClusters,
    ValueContainer,
} from '../ExternalLinks.component'

export default function ConfigureLinkAction({
    index,
    link,
    clusters,
    selectedClusters,
    monitoringTools,
    showDelete,
    onMonitoringToolSelection,
    onClusterSelection,
    onNameChange,
    onUrlTemplateChange,
    deleteLinkData,
}: ConfigureLinkActionType): JSX.Element {
    const [clusterSearchInput, setClusterSearchInput] = useState('')

    const getErrorLabel = (field: string): JSX.Element => {
        const errorLabel = (label: string): JSX.Element => {
            return (
                <div className="error-label flex left dc__align-start fs-11 mt-4">
                    <div className="error-label-icon">
                        <Error className="icon-dim-20" />
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
            case 'clusters':
                return errorLabel('Please select one or more clusters')
            case 'url':
                return errorLabel('Please enter URL template')
            case 'invalidProtocol':
                return errorLabel('The url should start with http:// or https://')
            default:
                return <></>
        }
    }

    return (
        <div id={`link-action-${index}`} className="configure-link-action-wrapper">
            <div className="link-monitoring-tool mb-8">
                <div className="monitoring-tool mr-8">
                    <span>Monitoring Tool*</span>
                    <ReactSelect
                        placeholder="Select tool"
                        name={`monitoring-tool-${index}`}
                        value={link.tool}
                        options={monitoringTools}
                        isMulti={false}
                        hideSelectedOptions={false}
                        onChange={(selected) => onMonitoringToolSelection(index, selected)}
                        components={{
                            IndicatorSeparator: null,
                            ClearIndicator: null,
                            Option: customOptionWithIcon,
                            ValueContainer: customValueContainerWithIcon,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            ...customMultiSelectStyles,
                            option: (base, state) => ({
                                ...customMultiSelectStyles.option(base, state),
                                backgroundColor: state.isSelected
                                    ? 'var(--B100)'
                                    : state.isFocused
                                    ? 'var(--N100)'
                                    : 'white',
                                color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                            }),
                            container: (base, state) => ({
                                ...base,
                                marginTop: '6px',
                            }),
                            control: (base, state) => ({
                                ...customMultiSelectStyles.control(base, state),
                                width: '150px',
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: '0 10px',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                        }}
                    />
                    {link.invalidTool && getErrorLabel('tool')}
                </div>
                <div className="link-name mr-12">
                    <label>Name*</label>
                    <input
                        placeholder="Enter name"
                        value={link.name}
                        onChange={(e) => onNameChange(index, e.target.value)}
                    />
                    {link.invalidName && getErrorLabel('name')}
                </div>
                <div className="link-clusters mr-12">
                    <span>Clusters*</span>
                    <ReactSelect
                        placeholder="Select clusters"
                        name={`link-clusters-${index}`}
                        value={selectedClusters}
                        options={clusters}
                        formatOptionLabel={formatOptionLabelClusters}
                        onChange={(selected) => onClusterSelection(index, selected)}
                        isMulti={true}
                        hideSelectedOptions={false}
                        closeMenuOnSelect={false}
                        inputValue={clusterSearchInput}
                        onBlur={() => {
                            setClusterSearchInput('')
                        }}
                        onInputChange={(value: string, actionMeta: InputActionMeta) => {
                            if (actionMeta.action === 'input-change') {
                                setClusterSearchInput(value)
                            }
                        }}
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
                            container: (base, state) => ({
                                ...base,
                                marginTop: '6px',
                            }),
                            control: (base, state) => ({
                                ...customMultiSelectStyles.control(base, state),
                                width: '278px',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: 'var(--N500)',
                            }),
                        }}
                    />
                    {link.invalidClusters && getErrorLabel('clusters')}
                </div>
                {showDelete && (
                    <div className="link-delete mt-24 cursor">
                        <Delete className="icon-dim-20" onClick={() => deleteLinkData(index)} />
                    </div>
                )}
            </div>
            <div className="link-text-area">
                <label>URL Template*</label>
                <textarea
                    placeholder="Enter URL template"
                    value={link.urlTemplate}
                    onChange={(e) => onUrlTemplateChange(index, e.target.value)}
                />
                {link.invalidUrlTemplate && getErrorLabel('url')}
                {link.invalidProtocol && getErrorLabel('invalidProtocol')}
            </div>
        </div>
    )
}
