import React, { Component } from 'react';
import { VisibleModal } from '../../common';
import { ReactComponent as Warn } from '../../../assets/icons/ic-warning.svg';
import close from '../../../assets/icons/ic-close.svg';

export class ValuesYamlConfirmDialog extends Component<{
    className: string;
    title: string;
    description: string;
    closeOnESC: boolean;
    copyYamlToClipboard: (event) => void;
    discardYamlChanges: (...args) => void;
    close: (event: React.MouseEvent) => void;
}>{

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
        return <>
            <VisibleModal className="" >
                <div className={`modal__body`}>
                    <div className="flexbox flex-justify">
                        <Warn className="modal__main-img" />
                        <img src={close} alt="close" className="icon-dim-24 cursor" onClick={this.props.close} />
                    </div>
                    <div className="modal__body-content">
                        <h1 className="modal__title">{this.props.title}</h1>
                        <p className="fs-13 cn-7 lh-1-54">{this.props.description}</p>
                    </div>
                    <div className="flex right">
                        <button type="button" className="cta cancel mr-16" onClick={this.props.copyYamlToClipboard}>Copy edited yaml</button>
                        <button type="button" className="cta" onClick={this.props.discardYamlChanges}>Discard Changes</button>
                    </div>
                </div>
            </VisibleModal >
        </>
    }
}