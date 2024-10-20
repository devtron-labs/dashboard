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

import React, { Component } from 'react'
import { CheckboxProps } from './Types'

/*
Valid States of Checkbox:
1. disabled: true, checked: false, value: XXX
2. disabled: true, checked: true, value: INTERMIDIATE
3. disabled: true, checked: true, value: CHECKED
4. disabled: true, checked: false, value: XXX
5. disabled: false, checked: true,  value: INTERMIDIATE
6. disabled: false, checked: true,  value: CHECKED
*/
// TODO: Associate label with input element
export class Checkbox extends Component<CheckboxProps> {
    render() {
        const rootClassName = `${this.props.rootClassName ? this.props.rootClassName : ''}`
        return (
            <label className={`dc__position-rel flex left cursor ${rootClassName}`} onClick={this.props?.onClick}>
                <input
                    {...(this.props.name ? { name: this.props.name } : {})}
                    type="checkbox"
                    className="form__checkbox"
                    disabled={this.props.disabled}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    tabIndex={this.props.tabIndex}
                    checked={this.props.isChecked}
                    id={this.props.id}
                    data-testid={this.props.dataTestId}
                />
                <span className="form__checkbox-container" data-testid={`${this.props.dataTestId}-chk-span`} />
                <span className="form__checkbox-label">{this.props.children}</span>
            </label>
        )
    }
}
