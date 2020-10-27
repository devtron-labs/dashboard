import React from 'react'
import ReactDOM from 'react-dom';
import closeIcon from '../../../assets/icons/ic-close.svg'

export interface OpaqueModalProps {
    className?: string;
    onHide?: any;
    noBackground?: boolean;
}

export class OpaqueModal extends React.Component<OpaqueModalProps> {
    modalRef = document.getElementById('full-screen-modal');

    componentDidMount() {
        if (this.props.noBackground)
            this.modalRef.classList.add("show");
        else this.modalRef.classList.add("show-with-bg");
    }

    componentWillUnmount() {
        this.modalRef.classList.remove("show");
        this.modalRef.classList.remove("show-with-bg");
    }

    render() {
        const { className = "", onHide = null } = { ...this.props };

        return ReactDOM.createPortal(
            <div className={`full-screen-modal__body-container ${className}`}>
                {this.props.children}
                {typeof onHide === 'function' && <div className="close-btn icon-dim-24" onClick={e => onHide(false)}>
                    <img className="close-img" src={closeIcon} alt="close" />
                </div>}
            </div>, document.getElementById('full-screen-modal'))
    }
}