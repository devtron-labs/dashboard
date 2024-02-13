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
