import React from 'react';
import ReactSelect from 'react-select';
import { Option } from '../v2/common/ReactSelect.utils';
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg';
import { CustomInput, multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'

export function WebhookSelectorCondition({ conditionIndex, masterSelectorList, selectorCondition, onSelectorChange, onSelectorValueChange, deleteWebhookCondition, canEditSelectorCondition}) {
    return (
        <div className="ci-webhook-condition mb-16 flex left">
            <ReactSelect
                className="w-200 bcn-1"
                components={{
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    Option,
                }}
                classNamePrefix={`build-webhook-select-key-dropdown-${conditionIndex}`}
                isSearchable={true}
                tabIndex={1}
                placeholder="Select Key"
                styles={{
                    ...multiSelectStyles,
                    menuList: (base) => {
                        return {
                            ...base,
                            position: 'relative',
                            paddingBottom: '0px',
                            maxHeight: '176px',
                        }
                    },
                }}
                options={masterSelectorList}
                value={masterSelectorList.filter((_selector) => _selector.value == selectorCondition.selectorId)}
                onChange={(selectedSelector) => onSelectorChange(conditionIndex, selectedSelector.value)}
                isDisabled={!canEditSelectorCondition}
            />
            <CustomInput
                name="selector-value"
                data-testid={`build-webhook-select-key-input-${conditionIndex}`}
                placeholder="Enter regex"
                disabled={!canEditSelectorCondition}
                onChange={(event) => {
                    onSelectorValueChange(conditionIndex, event.target.value)
                }}
                value={selectorCondition.value}
            />
            {canEditSelectorCondition && (
                <CloseIcon className="pointer icon-dim-20" onClick={(e) => deleteWebhookCondition(conditionIndex)} />
            )}
        </div>
    )
}