import React from 'react';
import ReactDOM from 'react-dom';

export class VisibleModal extends React.Component<{ className: string, noBackground?: boolean, close?: (e) => void; onEscape?: (e) => void; }> {

    modalRef = document.getElementById('visible-modal');

    constructor(props) {
        super(props);
        this.escFunction = this.escFunction.bind(this);
    }

    escFunction(event) {
        if (event.keyCode === 27 || event.key === "Escape") {
            if (this.props.onEscape) {
                this.props.onEscape(event);
            } else if (this.props.close) {
                this.props.close(event);
            }
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction);
        if (this.props.noBackground)
            this.modalRef.classList.add("show");
        else this.modalRef.classList.add("show-with-bg");
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction);
        this.modalRef.classList.remove("show");
        this.modalRef.classList.remove("show-with-bg");
    }

    render() {
        return ReactDOM.createPortal(
            <div className={`visible-modal__body ${this.props.className}`} onClick={this.props?.close}>
                {this.props.children}
            </div>, document.getElementById('visible-modal'))
    }
}