import React from 'react';
import Select, { components } from 'react-select';
import { multiSelectStyles } from '../common';
import { Option } from '../v2/common/ReactSelect.utils';
import './EnvironmentSelect.scss'

export default function HyperionEnvironmentSelect({ selectEnvironment, environments, selectedEnvironment }) {
    const clusterValueContainer = (props) => {
        let length = props
            .getValue()
            .filter((opt) => opt.value && !opt.value.startsWith('#') && !opt.value.startsWith('*')).length;
        const value = props.getValue()[0]?.clusterName + "/" + props.getValue()[0]?.namespace;
        return (
            <components.ValueContainer {...props}>
                {length > 0 ? (
                    <div className='flex'>
                        {!props.selectProps.menuIsOpen && value}
                        {React.cloneElement(props.children[1])}
                    </div>
                ) : (
                    <>{props.children}</>
                )}
            </components.ValueContainer>
        );
    };

    function formatGroupLabel(option) {
        return (
            <div>
                <span>{'Cluster : ' + option.label}</span>
            </div>
        );
    }

    function formatOptionLabelClusterEnv(option, { inputValue }) {
        return (
            <div
                className={
                    'flex left column ' +
                    (option.value &&
                        (option.value.startsWith('#') || option.value.startsWith('*')) &&
                        'cluster-label-all')
                }
            >
                {!inputValue ? (
                    <>
                        <span>{option.label}</span>
                        <small className="light-color">
                            {option.clusterName + (option.clusterName ? '/' : '') + option.namespace}
                        </small>
                    </>
                ) : (
                    <>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: option.label.replace(
                                    new RegExp(inputValue, 'gi'),
                                    (highlighted) => `<mark>${highlighted}</mark>`,
                                ),
                            }}
                        />
                        {option.clusterName && option.namespace && (
                            <small
                                className="light-color"
                                dangerouslySetInnerHTML={{
                                    __html: (option.clusterName + '/' + option.namespace).replace(
                                        new RegExp(inputValue, 'gi'),
                                        (highlighted) => `<mark>${highlighted}</mark>`,
                                    ),
                                }}
                            ></small>
                        )}
                    </>
                )}
            </div>
        );
    }

    function customFilter(option, searchText) {
        if (
            option.data.label.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.clusterName.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.namespace.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return true;
        } else {
            return false;
        }
    }
    return (
        <Select
            value={selectedEnvironment}
            name="environment"
            options={environments}
            formatOptionLabel={formatOptionLabelClusterEnv}
            formatGroupLabel={formatGroupLabel}
            filterOption={customFilter}
            className="basic-multi-select cluster-select"
            classNamePrefix="select"
            hideSelectedOptions={false}
            styles={{
                ...multiSelectStyles,
                option: (base, state) => ({
                    ...base,
                    padding: '4px 12px',
                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                    color: 'var(--N900)',
                }),
            }}
            components={{
                ClearIndicator: null,
                Option,
                ValueContainer: clusterValueContainer,
                IndicatorSeparator: null,
            }}
            onChange={selectEnvironment}
        />
    );
}