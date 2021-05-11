import React, { useState } from 'react';
import { ConfirmationDialog, Progressing, } from '../../../common';
import restoreIcon from '../../../../assets/icons/ic-restore.svg';
import warningIcon from '../../../../assets/icons/ic-warning.svg';

export function HibernateModal({ appDetails, handleHibernate, hibernating, hibernateConfirmationModal, setHibernateConfirmationModal }) {

    return (<>
        <ConfirmationDialog>
            <ConfirmationDialog.Icon
                src={hibernateConfirmationModal === 'hibernate' ? warningIcon : restoreIcon}
            />
            <ConfirmationDialog.Body
                title={`${hibernateConfirmationModal === 'hibernate' ? 'Hibernate' : 'Restore'} '${appDetails.appName
                    }' on '${appDetails.environmentName}'`}
                subtitle={
                    <p>
                        Pods for this application will be{' '}
                        <b>
                            scaled{' '}
                            {hibernateConfirmationModal === 'hibernate'
                                ? 'down to 0'
                                : ' upto its original count'}{' '}
                                    on {appDetails.environmentName}
                        </b>{' '}
                                environment.
                            </p>
                }
            >
                <p style={{ marginTop: '16px' }}>Are you sure you want to continue?</p>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <button className="cta cancel" onClick={(e) => setHibernateConfirmationModal('')}>
                    Cancel
                        </button>
                <button className="cta" disabled={hibernating} onClick={handleHibernate}>
                    {hibernating ? (
                        <Progressing />
                    ) : hibernateConfirmationModal === 'hibernate' ? (
                        `Hibernate App `
                    ) : (
                                'Restore App'
                            )}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    </>
    )
}
