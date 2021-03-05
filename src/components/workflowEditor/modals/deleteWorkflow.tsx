import React, { Component } from 'react';
import { DeleteDialog } from '../../common';

export interface DeleteWorkflowProps {
    closeDelete: () => void;
    deleteWorkflow: () => void;
    workflowName: string;
    description: string;
}

export class DeleteWorkflow extends Component<DeleteWorkflowProps> {
    render() {
        return <DeleteDialog closeDelete={this.props.closeDelete}
            delete={this.props.deleteWorkflow}
            title={this.props.workflowName}
            description={this.props.description}>
        </DeleteDialog>
    }
}

