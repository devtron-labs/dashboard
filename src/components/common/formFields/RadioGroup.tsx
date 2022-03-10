import React, { Component, createContext } from 'react';
const RadioGroupContext = createContext({ name: "", value: "", disabled: false, onChange: (event) => { } });

export interface RadioGroupItemProps {
    value: string;
}

export class RadioGroupItem extends Component<RadioGroupItemProps> {

    render() {
        return <RadioGroupContext.Consumer>
            {(context) => {
                return <>
                    <label className={context.disabled ? "form__radio-item disabled" : "form__radio-item"}>
                        <input type="radio" className="form__checkbox" name={context.name} disabled={context.disabled}
                            onChange={context.onChange} value={this.props.value}
                            checked={context.value === this.props.value} />
                        <span className="form__radio-item-content">
                            <span className="radio__button"></span>
                            <span className="radio__title">{this.props.children}</span>
                        </span>
                    </label>
                </>
            }}
        </RadioGroupContext.Consumer>
    }
}


export interface RadioGroupProps {
    value: string;
    name: string;
    disabled?: boolean;
    onChange: (event) => void;
    className?: string;
}

export class RadioGroup extends Component<RadioGroupProps> {

    render() {
        return (
            <div className={`form__radio-group ${this.props.className ? this.props.className : ''}`}>
                <RadioGroupContext.Provider
                    value={{
                        name: this.props.name,
                        value: this.props.value,
                        disabled: this.props.disabled,
                        onChange: this.props.onChange,
                    }}
                >
                    {this.props.children}
                </RadioGroupContext.Provider>
            </div>
        );
    }
}