import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';
import React, { Component } from 'react';
import './customInput.css';

export interface CustomInputProps {
    label: any;
    type?: 'text' | 'number';
    value: string | number;
    labelClassName?: string;
    autoFocus?: boolean;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    helperText?: string;
    name?: string;
    tabIndex?: number;
    autoComplete: string;
    showLink?: boolean;
    link?: string;
    linkText?: string;
    onChange: (...args) => void;
    onBlur?: (e) => void;
    onFocus?: (e) => void;
    dataTestid?:string;
}

export class CustomInput extends Component<CustomInputProps, any> {
    gitCreate = () => {
        return (
            <span>
                <a target="_blank" href={this.props.link} className="cursor fs-13 onlink">
                    {this.props.linkText}
                </a>
            </span>
        )
    }

    onBlur = (e) => {
        this.props.onBlur && this.props.onBlur(e)
    }

    onFocus = (e) => {
        this.props.onFocus && this.props.onFocus(e)
    }

    render() {
        let isError: boolean = !!this.props.error
        let type = this.props.type || 'text'
        let labelClasses = `form__label`
        if (this.props.labelClassName) labelClasses = `${labelClasses} ${this.props.labelClassName}`
        return (
            <div>
                <label className={labelClasses} data-testid={`label-${this.props.dataTestid}`}>
                    {this.props.label} {this.props.showLink && this.gitCreate()}
                </label>
                <input
                    type={type}
                    data-testid={this.props.dataTestid}
                    autoFocus={this.props.autoFocus}
                    autoComplete={this.props.autoComplete}
                    tabIndex={this.props.tabIndex}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    className={isError ? 'form__input' : 'form__input'}
                    onChange={(e) => {
                        e.persist()
                        this.props.onChange(e)
                    }}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    value={this.props.value}
                    disabled={this.props.disabled}
                />
                {this.props.error && (
                    <div className="form__error">
                        <Error className="form__icon form__icon--error" />
                        {this.props.error}
                    </div>
                )}
                {this.props.helperText ? (
                    <>
                        <div className="form__text-field-info">
                            <Info className="form__icon form__icon--info" />
                            <p className="sentence-case">{this.props.helperText}</p>
                        </div>
                    </>
                ) : null}
            </div>
        )
    }
}