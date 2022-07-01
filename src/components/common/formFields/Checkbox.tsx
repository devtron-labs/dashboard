import React, { Component } from 'react'

export enum CHECKBOX_VALUE {
    CHECKED = 'CHECKED',
    INTERMEDIATE = 'INTERMEDIATE',
}
export interface CheckboxProps {
    onChange: (event) => void
    isChecked: boolean
    value: 'CHECKED' | 'INTERMEDIATE'
    disabled?: boolean
    tabIndex?: number
    rootClassName?: string
    onClick?: (event) => void
    id?: string
}

/*
Valid States of Checkbox:
1. disabled: true, checked: false, value: XXX
2. disabled: true, checked: true, value: INTERMIDIATE
3. disabled: true, checked: true, value: CHECKED
4. disabled: true, checked: false, value: XXX
5. disabled: false, checked: true,  value: INTERMIDIATE
6. disabled: false, checked: true,  value: CHECKED
*/
export class Checkbox extends Component<CheckboxProps> {
    render() {
        let rootClassName = `${this.props.rootClassName ? this.props.rootClassName : ''}`
        return (
            <>
                <label className={`position-rel flex left cursor ${rootClassName}`} onClick={this.props?.onClick}>
                    <input
                        type="checkbox"
                        className={'form__checkbox'}
                        disabled={this.props.disabled}
                        value={this.props.value}
                        onChange={this.props.onChange}
                        tabIndex={this.props.tabIndex}
                        checked={this.props.isChecked}
                        id={this.props.id}
                    />
                    <span className="form__checkbox-container"></span>
                    <span className={`form__checkbox-label`}>{this.props.children}</span>
                </label>
            </>
        )
    }
}
