import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { Option } from './ciPipeline.util';
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg';
import { multiSelectStyles } from '../common'

export function WebhookSelectorCondition({ conditionIndex, masterSelectorList, selectorCondition, onSelectorChange, onSelectorValueChange, deleteWebhookCondition, canEditSelectorCondition}) {
    return (
        <div className="ci-webhook-condition mb-16 flex left">
            <ReactSelect
                className="w-200 bcn-1"
                components={{
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    // Option,
                }}
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
                    }
                }}
                options={masterSelectorList}
                value = {
                    masterSelectorList.filter(_selector =>
                        _selector.value == selectorCondition.selectorId)
                }
                onChange={(selectedSelector) => onSelectorChange(conditionIndex, selectedSelector.value)}
                isDisabled={!canEditSelectorCondition}
            />
            <input type="text" className="form__input" placeholder="Enter regex" disabled={!canEditSelectorCondition}
                   onChange={(event) => { onSelectorValueChange(conditionIndex, event.target.value) }}
                   value={selectorCondition.value}
            />
            {
                canEditSelectorCondition &&
                <CloseIcon className="pointer icon-dim-20" onClick={(e) => deleteWebhookCondition(conditionIndex)} />
            }

        </div>
    )
}