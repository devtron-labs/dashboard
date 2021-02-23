import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';
import React, { Component } from 'react';
import './customInput.css';

export interface CustomInputProps {
    label: string;
    value: string | number;
    labelClassName?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: { name: string }[];
    helperText?: string;
    name?: string;
    tabIndex?: number;
    autoComplete: string;
    onChange: (...args) => void;
}

export class CustomInput extends Component<CustomInputProps, any> {

    render() {
        let isError: boolean = !!this.props.error;
        let labelClasses = `form__label`;
        if (this.props.labelClassName) labelClasses = `${labelClasses} ${this.props.labelClassName}`;
        return <>
            <label className={labelClasses}>{this.props.label}</label>
            <input type="text"
                autoComplete={this.props.autoComplete}
                tabIndex={this.props.tabIndex}
                name={this.props.name}
                placeholder={this.props.placeholder}
                className={isError ? "form__input form__input--error" : "form__input"}
                onChange={e => { e.persist(); this.props.onChange(e) }}
                value={this.props.value}
                disabled={this.props.disabled} />
            {this.props.error?.length && <div className="form__error">
                {this.props.error.map((error) => {
                    return <>
                        <Error className="form__icon form__icon--error" />
                        {error.name}</>
                })}
            </div>}

            {this.props.helperText ? <>
                <div className="form__text-field-info">
                    <Info className="form__icon form__icon--info" />
                    <p className="sentence-case">{this.props.helperText}</p>
                </div>
            </> : null}
        </>
    }
}