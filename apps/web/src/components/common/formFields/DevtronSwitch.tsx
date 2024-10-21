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

import React, { Component, createContext } from 'react'

const SwitchContext = createContext({ name: '', value: '', onChange: (event) => {} })

export interface DevtronSwitchItemProps {
    value: string
}

export class DevtronSwitchItem extends Component<DevtronSwitchItemProps> {
    render() {
        return (
            <SwitchContext.Consumer>
                {(value) => {
                    return (
                        <label className="radio">
                            <input
                                type="checkbox"
                                className=""
                                name={value.name}
                                onChange={value.onChange}
                                value={this.props.value}
                                checked={value.value === this.props.value}
                            />
                            <span className="radio__item-label">{this.props.children}</span>
                        </label>
                    )
                }}
            </SwitchContext.Consumer>
        )
    }
}

export interface DevtronSwitchProps {
    value: string
    name: string
    onChange: (event) => void
}

export class DevtronSwitch extends Component<DevtronSwitchProps> {
    render() {
        return (
            <div className="flex left radio-group">
                <SwitchContext.Provider
                    value={{
                        name: this.props.name,
                        value: this.props.value,
                        onChange: this.props.onChange,
                    }}
                >
                    {this.props.children}
                </SwitchContext.Provider>
            </div>
        )
    }
}
