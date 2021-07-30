import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { styles, menuList, DropdownIndicator } from '../charts/charts.util';
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg';

export function WebhookSelectorCondition({ conditionIndex, masterSelectorList, selectorCondition, onSelectorChange, onSelectorValueChange, deleteWebhookCondition}) {
    return (
        <div className="ci-webhook-condition mb-16 flex left">
            <ReactSelect
                className="w-200"
                autoFocus
                components={{
                    IndicatorSeparator: null,
                    ClearIndicator: null
                }}
                isSearchable={false}
                tabIndex="1"
                placeholder="Select Key"
                styles={{
                    ...styles,
                    ...menuList,
                }}
                options={masterSelectorList}
                value = {
                    masterSelectorList.filter(_selector =>
                        _selector.value == selectorCondition.selectorId)
                }
                onChange={(selectedSelector) => onSelectorChange(conditionIndex, selectedSelector.value)}
            />
            <input type="text" className="form__input" placeholder="Enter regex"
                   onChange={(event) => { onSelectorValueChange(conditionIndex, event.target.value) }}
                   value={selectorCondition.value}
            />
            <CloseIcon className="pointer icon-dim-20" onClick={(e) => deleteWebhookCondition(conditionIndex)} />
        </div>
    )
}