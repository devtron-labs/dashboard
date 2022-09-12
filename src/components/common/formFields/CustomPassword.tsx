import { ReactComponent as Show } from '../../../assets/icons/ic-visibility-off.svg';
import { ReactComponent as FormError } from '../../../assets/icons/ic-warning.svg';
import React, { useState } from 'react';
import './customPassword.css';

export function CustomPassword({ name, value, error, onChange, label, disabled = false }) {
    const [showPassword, setShowPassword] = useState(false);
    let type = showPassword ? "text" : "password";
    return <div className="flex column left top">
        <label className="form__label">{label}</label>
        <div className="pos-relative w-100">
            <input type={type}
                name={name}
                className="form__input p-r-41"
                onChange={e => { e.persist(); onChange(e) }}
                value={value}
                disabled={disabled} />
            <button type="button" className="dc__transparent custom-password__show-btn" onClick={(e) => setShowPassword(!showPassword)} style={{bottom: error ? 28 : 7}}>
                <Show className={`icon-dim-24 ${showPassword ? 'icon-n5' : 'icon-n3'}`} />
            </button>
        </div>
        {error && <div className="form__error">
        <FormError className="form__icon form__icon--error" />
            {error}</div>}
    </div>
}