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
}

export default function CDSuccessModal({ appId, envId, closeSuccessPopup }: CDSuccessModalType) {
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
                <div className="flex left br-4 p-15 mb-20 en-2">
                    <div className="icon-container">
                        <GotToBuildDeploy />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <div className="fw-6 fs-13">Deploy this app on prod-devtroncd</div>
                        <div>
                            <NavLink to={`${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`} className="cb-5 no-decor">
                                Go to Build & Deploy
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="flex left br-4 p-15 mb-20 en-2">
                    <div className="icon-container">
                        <GoToEnvOverride />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <div className="fw-6 fs-13">Override deployment configurations for prod-devtroncd</div>
                        <div>
                            <NavLink
                                to={`${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}`}
                                className="cb-5 no-decor"
                            >
                                Go to environment override
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="close-button-container">
                    <button type="button" className="fw-6 fs-13 lh-20 cta" onClick={closeSuccessPopup}>
                        Close
                    </button>
                </div>
            </div>
        </VisibleModal>
    );
}
