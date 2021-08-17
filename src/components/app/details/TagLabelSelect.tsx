import React, { useState,  useCallback, } from 'react';
import Creatable from 'react-select/creatable';
import { components } from 'react-select';
import { ClearIndicator, MultiValueRemove } from '../../common';
import { ReactComponent as RedWarning } from '../../../assets/icons/ic-error-medium.svg';

interface OptionType {
    label: string;
    value: string;
}

export default function TagLabelSelect({labels, validateTags }) {

    const [labelTags, setLabelTags] = useState<{ tags: OptionType[], inputTagValue: string, tagError: string }>({ tags: [], inputTagValue: '', tagError: '' })
   

    const CreatableStyle = {
        multiValue: (base, state) => {
            return ({
                ...base,
                // border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
                borderRadius: `4px`,
                // background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
                height: '30px',
                margin: '0 8px 4px 0',
                padding: '1px',
                fontSize: '12px',
            })
        },
        control: (base, state) => ({
            ...base,
            border: state.isFocused ? '1px solid #06c' : '1px solid #d0d4d9', // default border color
            boxShadow: 'none', // no box-shadow
            minHeight: '72px',
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

    const createOption = (label: string) => ({
        label: label,
        value: label,
    });

    const handleKeyDown = useCallback((event) => {
        // let { tags, inputTagValue } = ;
        labelTags.inputTagValue = labelTags.inputTagValue.trim();
        switch (event.key) {
            case 'Enter':
            case 'Tab':
            case ',':
            case ' ': // space
                if (labelTags.inputTagValue) {
                    let newTag = labelTags.inputTagValue.split(',').map((e) => { e = e.trim(); return createOption(e) });
                    setLabelTags({
                        inputTagValue: '',
                        tags: [...labelTags.tags, ...newTag],
                        tagError: '',
                    });
                }
                if (event.key !== 'Tab') {
                    event.preventDefault();
                }
                break;
        }
    }, [labelTags])

    function handleCreatableBlur(e) {
        labelTags.inputTagValue = labelTags.inputTagValue.trim()
        if (!labelTags.inputTagValue) return
        setLabelTags({
            inputTagValue: '',
            tags: [...labelTags.tags, createOption(e.target.value)],
            tagError: '',
        });
    };

    function handleTagsChange(newValue: any, actionMeta: any) {
         
    let _optionTypes = [];
    if (labels && labels.length > 0) {
        labels.forEach((_label)=>{
            _optionTypes.push({
                label: _label.value,
                value: _label.key
            })
        })
    }


        setLabelTags(tags => ({ ...tags, tags: newValue || [], tagError: '' }))
    };

    function handleInputChange(inputTagValue) {
        setLabelTags(tags => ({ ...tags, inputTagValue: inputTagValue, tagError: '' }))
    }

    return (
        <div>
            {console.log(labelTags.tags)}
            {console.log(labels)}

            <span className="form__label"> Tags (only key:value allowed)</span>
            <Creatable
                className={"create-app_tags"}
                components={{
                    DropdownIndicator: () => null,
                    ClearIndicator,
                    MultiValueRemove,
                    MultiValueContainer: ({ ...props }) => <MultiValueContainer {...props} validator={validateTags} />,
                    IndicatorSeparator: () => null,
                    Menu: () => null,
                }
                }
                styles={CreatableStyle}
                autoFocus
                isMulti
                isClearable
                inputValue={labelTags.inputTagValue}
                placeholder="Add a tag..."
                isValidNewOption={() => false}
                backspaceRemovesValue
                value={labelTags.tags}
                onBlur={handleCreatableBlur}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onChange={handleTagsChange}
            />
        </div>
    )
}

