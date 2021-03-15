import React from 'react'
import { ReactComponent as Trash } from '../../../assets/icons/ic-delete.svg';
import { ResizableTextarea } from './ResizableTextarea';

interface KeyValueInputInterface {
    keyLabel: string;
    valueLabel: string;
    k: string;
    v: string;
    index: number;
    onChange: any;
    onDelete: any;
    keyError?: string;
    valueError?: string;
    valueType?: string;
}

export const KeyValueInput: React.FC<KeyValueInputInterface> = React.memo(({ keyLabel, valueLabel, k, v, index, onChange, onDelete, keyError = "", valueError = "", valueType = "textarea", ...rest }) => {
    return (
        <article className="form__key-value-inputs">
            {typeof onDelete === 'function' && <Trash onClick={e => onDelete(e, index)} className="cursor icon-delete icon-n4" />}
            <div className="form__field">
                <label>{keyLabel}
                    <input type="text" autoComplete="off" placeholder="" value={k} onChange={e => onChange(index, e.target.value, v)} className="form__input" disabled={typeof onChange !== 'function'} />
                    {keyError ? <span className="form__error">{keyError}</span> : <div />}
                </label>
            </div>
            <div className="form__field">
                <label>{valueLabel}</label>
                {valueType === 'textarea' ?
                    <ResizableTextarea value={v} onChange={e => onChange(index, k, e.target.value)} disabled={typeof onChange !== 'function'} placeholder="" maxHeight={300} />
                    : <input type="text" autoComplete="off" value={v} onChange={e => onChange(index, k, e.target.value)} className="form__input" disabled={typeof onChange !== 'function'} />
                }
                {valueError ? <span className="form__error">{valueError}</span> : <div />}
            </div>
        </article>
    )
})
