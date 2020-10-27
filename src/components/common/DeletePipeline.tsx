import React, { Component } from 'react';
import { DeleteDialog, DialogBody } from '.';

export interface DeletePipelineProps {
    closeDelete: () => void;
    deletePipeline: () => void;
    appName: string;
    shouldDeleteApp: boolean;
    setDeleteApp: () => void;
    pipelineName: string;
    description: string;
}

export class DeletePipeline extends Component<DeletePipelineProps> {

    render() {
        return <DeleteDialog closeDelete={this.props.closeDelete}
            delete={this.props.deletePipeline}
            title={this.props.pipelineName}
            description={this.props.description}>
            <DialogBody>
                <div>

                </div>
            </DialogBody>
        </DeleteDialog>
    }
}