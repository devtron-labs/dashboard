import React from 'react';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import { VisibleModal } from '../common';
import { ReactComponent as SuccessIcon } from '../../assets/icons/ic-success-with-light-background.svg';
import { ReactComponent as GotToBuildDeploy } from '../../assets/icons/go-to-buildanddeploy@2x.svg';
import { ReactComponent as GoToEnvOverride } from '../../assets/icons/go-to-envoverride@2x.svg';

interface CDSuccessModalType {
    appId: string;
    envId: number;
    closeSuccessPopup: () => void;
    envName: string;
}

export default function CDSuccessModal({ appId, envId, closeSuccessPopup, envName }: CDSuccessModalType) {
    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body" style={{ width: '600px' }}>
                <div className="flexbox mb-20">
                    <div className="pr-16">
                        <SuccessIcon />
                    </div>
                    <div>
                        <div className="fw-6 fs-16">Deployment pipeline created</div>
                        <div className="fs-13">What do you want to do next?</div>
                    </div>
                </div>
                <NavLink to={`${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`} className="cb-5 no-decor">
                    <div className="flex left br-4 p-15 mb-12 en-2 bw-1 action-card">
                        <div className="icon-container">
                            <GotToBuildDeploy />
                        </div>
                        <div className="ml-16 mr-16 flex-1">
                            <div className="fw-6 fs-13 cn-9">Deploy this app on {envName}</div>
                            <div>Go to Build & Deploy</div>
                        </div>
                    </div>
                </NavLink>
                <NavLink
                    to={`${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}`}
                    className="cb-5 no-decor"
                >
                    <div className="flex left br-4 p-15 mb-12 en-2 bw-1 action-card">
                        <div className="icon-container">
                            <GoToEnvOverride />
                        </div>
                        <div className="ml-16 mr-16 flex-1">
                            <div className="fw-6 fs-13 cn-9">Override deployment configurations for {envName}</div>
                            <div>Go to environment override</div>
                        </div>
                    </div>
                </NavLink>
                <div className="close-button-container">
                    <button type="button" className="fw-6 fs-13 lh-20 cta" onClick={closeSuccessPopup}>
                        Close
                    </button>
                </div>
            </div>
        </VisibleModal>
    );
}
