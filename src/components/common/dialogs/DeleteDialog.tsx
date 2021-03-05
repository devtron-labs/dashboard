import React, { Component } from 'react';
import warn from '../../../assets/img/warning-medium.svg';
import ConfirmationDialog from './ConfirmationDialog';

export interface DeleteDialogProps {
    title: string;
    description: string;
    closeDelete: () => void;
    delete: () => void;
}

export class DeleteDialog extends Component<DeleteDialogProps> {
    render() {
        return <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warn} />
            <ConfirmationDialog.Body title={this.props.title} >
                <p className="fs-13 cn-7 lh-1-54">{this.props.description}</p>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <div className="flex right">
                    <button type="button" className="cta cancel cta-cd-delete-modal ml-16" onClick={this.props.closeDelete}>Cancel</button>
                    <button type="button" className="cta delete cta-cd-delete-modal ml-16" onClick={this.props.delete}>Delete</button>
                </div>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog >
    }
}
