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
import { ReactComponent as Show } from '../../../assets/icons/ic-visibility-off.svg'
import { ReactComponent as FormError } from '../../../assets/icons/ic-warning.svg'
import './customPassword.css'

export const CustomPassword = ({ name, value, error, onChange, label, disabled = false }) => {
    const [showPassword, setShowPassword] = useState(false)
    const type = showPassword ? 'text' : 'password'
    return (
        <div className="flex column left top">
            <label className="form__label">{label}</label>
            <div className="pos-relative w-100">
                <input
                    type={type}
                    name={name}
                    className="form__input p-r-41"
                    onChange={(e) => {
                        e.persist()
                        onChange(e)
                    }}
                    value={value}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="dc__transparent custom-password__show-btn"
                    onClick={(e) => setShowPassword(!showPassword)}
                    style={{ bottom: error ? 28 : 7 }}
                >
                    <Show className={`icon-dim-24 ${showPassword ? 'icon-n5' : 'icon-n3'}`} />
                </button>
            </div>
            {error && (
                <div className="form__error">
                    <FormError className="form__icon form__icon--error" />
                    {error}
                </div>
            )}
        </div>
    )
}
