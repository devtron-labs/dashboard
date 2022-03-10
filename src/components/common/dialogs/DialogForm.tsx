import React, { Component, createContext } from 'react';
import { VisibleModal } from '../modals/VisibleModal';
import close from '../../../assets/icons/ic-close.svg';
import { Progressing } from '../icons/Progressing';
//TODO: may not need context
const DialogFormContext = createContext({ title: "", isLoading: false, close: (event) => { }, onSave: (event) => { } });

export interface DialogFormProps {
    className: string;
    title: string;
    isLoading: boolean;
    closeOnESC?: boolean;
    close: (event) => void;
    onSave: (event) => void;
    headerClassName?: string;
}

export class DialogForm extends Component<DialogFormProps> {

    constructor(props) {
        super(props);
        this.escFunction = this.escFunction.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction);
    }

    escFunction(event) {
        if (event.keyCode === 27 && this.props.closeOnESC) {
            this.props.close(event);
        }
    }

    render() {
        return <DialogFormContext.Provider value={{
            title: this.props.title,
            isLoading: this.props.isLoading,
            close: this.props.close,
            onSave: this.props.onSave,
        }}>
            <VisibleModal className="">
                <div className={`modal__body ${this.props.className || ''}`}>
                    <div className={`modal__header ${this.props.headerClassName}`}>
                        <h1 className="modal__title">{this.props.title}</h1>
                        <button type="button" className="transparent" onClick={this.props.close}> <img src={close} alt="close" /></button>
                    </div>
                    <DialogFormContext.Consumer>
                        {(context) => {
                            return <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!context.isLoading) {
                                    context.onSave(e);
                                }
                            }} >
                                {this.props.children}
                            </ form>
                        }}
                    </DialogFormContext.Consumer>
                </div>
            </VisibleModal >
        </DialogFormContext.Provider>
    }
}

export class DialogFormSubmit extends Component<{ tabIndex: number }>{
    render() {
        return <DialogFormContext.Consumer>
            {(context) => {
                return <button type="submit" className="cta align-right" tabIndex={this.props.tabIndex}>
                    {context.isLoading ? <Progressing />
                        : this.props.children}
                </ button>
            }}
        </DialogFormContext.Consumer>
    }
}