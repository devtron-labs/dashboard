import React from 'react';
import warn from '../../../assets/img/warning-medium.svg';
import { Progressing } from '../icons/Progressing';
import ConfirmationDialog from './ConfirmationDialog';

export interface DeleteDialogProps {
    title: string;
    description?: string;
    closeDelete: () => void;
    delete: () => any;
    deletePrefix?: string
    apiCallInProgress?: boolean
}

export const DeleteDialog: React.FC<DeleteDialogProps> & { Description?: React.FC<any> } = function (props) {

    return <ConfirmationDialog className="confirmation-dialog__body--w-400">
        <ConfirmationDialog.Icon src={warn} />
        <ConfirmationDialog.Body title={props.title}>
            <div className="fs-13 cn-7 lh-1-54 w-100">
                {props.description ? props.description : null}
                {props.children}
            </div>
        </ConfirmationDialog.Body>
        <ConfirmationDialog.ButtonGroup>
            <div className="flex right">
                <button type="button" className="cta cancel cta-cd-delete-modal ml-16" onClick={props.closeDelete} disabled={props.apiCallInProgress}>Cancel</button>
                <button type="button" className="cta delete cta-cd-delete-modal ml-16" onClick={() => props.delete()} disabled={props.apiCallInProgress}>
                    {props.apiCallInProgress ? <Progressing /> :  `${props.deletePrefix || ''}Delete`}
                </button>
            </div>
        </ConfirmationDialog.ButtonGroup>
    </ConfirmationDialog >
}

function DeleteDialogDescription(props) {

    return <>
        {props.children}
    </>
}

DeleteDialog.Description = DeleteDialogDescription;