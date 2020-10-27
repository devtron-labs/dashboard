import React, { Component } from 'react';
import { VisibleModal } from '../modals/VisibleModal';
import warn from '../../../assets/img/warning-medium.svg';

export interface DeleteDialogProps {
    title: string;
    description: string;
    closeDelete: () => void;
    delete: () => void;
}

export class DeleteDialog extends Component<DeleteDialogProps> {
    render() {
        return <VisibleModal className="">
            <div className="modal__body">
                <DialogTitle title={this.props.title} description={this.props.description}> {this.props.children} </DialogTitle>
                <DialogBody>{this.props.children}</DialogBody>
                <div className="flex right">
                    <button type="button" className="cta cancel cta-cd-delete-modal mr-16" onClick={this.props.closeDelete}>Cancel</button>
                    <button type="button" className="cta delete cta-cd-delete-modal" onClick={this.props.delete}>Delete</button>
                </div>
            </div>
        </VisibleModal >
    }
}

class DialogTitle extends Component<{ title: string; description: string }> {
    render() {
        return < >
            <img src={warn} alt="warn" className="modal__main-img" />
            <div className="modal__body-content">
                <h1 className="modal__title">Delete '{`${this.props.title}`}' ?</h1>
                <p className="modal__description">{this.props.description}</p>
            </div>
        </ >
    }
}

export class DialogBody extends Component<{}> {
    render() {
        return < >
            {this.props.children}
        </ >
    }
}

