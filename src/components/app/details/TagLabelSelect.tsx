import React, { useState, useCallback, } from 'react';
import Creatable from 'react-select/creatable';
import { components } from 'react-select';
import { ClearIndicator, MultiValueRemove } from '../../common';
import { ReactComponent as RedWarning } from '../../../assets/icons/ic-error-medium.svg';

export default function TagLabelSelect({ validateTags, labelTags, onInputChange, onKeyDown, onTagsChange, onCreatableBlur }) {

    const CreatableStyle = {
        multiValue: (base, state) => {
            return ({
                ...base,
                border: validateTags(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
                borderRadius: `4px`,
                background: validateTags(state.data.value) ? 'white' : 'var(--R100)',
                height: '30px',
                margin: '0 8px 4px 0',
                padding: '2px',
                fontSize: '12px',
            })
        },
        control: (base, state) => ({
            ...base,
            border: state.isFocused ? '1px solid #06c' : '1px solid #d0d4d9', // default border color
            boxShadow: 'none', // no box-shadow
            minHeight: '72px',
            alignItems: "end",
        }),
    }

    const MultiValueContainer = ({ validator, ...props }) => {
        const { children, data, innerProps, selectProps } = props
        const { label, value } = data
        const isValidEmail = validator ? validator(value) : true
        return (
            <components.MultiValueContainer {...{ data, innerProps, selectProps }} >
                <div className={`flex fs-12 ml-4`}>
                    {!isValidEmail && <RedWarning className="mr-4" />}
                    <div className={`${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
                </div>
                {children[1]}
            </components.MultiValueContainer>
        );
    };
  
    return (
        <div>
            <span className="form__label cn-6"> Tags (only key:value allowed)</span>
            <Creatable
                className={"create-app_tags"}
                components={{
                    DropdownIndicator: () => null,
                    ClearIndicator,
                    MultiValueRemove,
                    MultiValueContainer: ({ ...props }) => <MultiValueContainer {...props} validator={validateTags} />,
                    IndicatorSeparator: () => null,
                    Menu: () => null,
                }}
                styles={CreatableStyle}
                autoFocus
                isMulti
                isClearable
                inputValue={labelTags.inputTagValue}
                placeholder="Add a tag..."
                isValidNewOption={() => false}
                backspaceRemovesValue
                value={labelTags.tags}
                onBlur={onCreatableBlur}
                onInputChange={onInputChange}
                onKeyDown={onKeyDown}
                onChange={onTagsChange}
            />
        </div>
    )
}

