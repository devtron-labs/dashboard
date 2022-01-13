import React from 'react';
import appDetailEmpty from '../../../assets/img/ic-empty-ea-app-detail.png';
import chartsEmpty from '../../../assets/img/ic-empty-ea-charts.png';
import securityEmpty from '../../../assets/img/ic-empty-ea-security.png';
import './eaEmptyState.css';

export enum EAEmptyType {
    DEVTRONAPPS = 'devtron_apps',
    HELMCHARTS = 'helm_charts',
    SECURITY = 'security',
    DEPLOYMENTGROUPS = 'deployment_groups',
    BULKEDIT = 'bulk_edit',
}

function EAEmptyState({ title, msg, img, knowMoreHandler, checkInstallHandler }) {
    return (
        <div className="ea-empty__wrapper cn-9 text-center">
            <div className="fs-20 fw-6 mb-12">{title}</div>
            <div className="fs-14 m-auto w-600">{msg}</div>
            <div className="m-tb-20">
                {(() => {
                    switch (img) {
                        case EAEmptyType.DEVTRONAPPS:
                            return (
                                <img className="ea-empty-img" src={appDetailEmpty} width="600" alt="no apps found" />
                            );
                        case EAEmptyType.HELMCHARTS:
                            return <img className="ea-empty-img" src={chartsEmpty} alt="no apps found" />;
                        case EAEmptyType.BULKEDIT:
                            return <img className="ea-empty-img" src={appDetailEmpty} alt="no apps found" />;
                        case EAEmptyType.DEPLOYMENTGROUPS:
                            return <img src={appDetailEmpty} alt="no apps found" />;
                        case EAEmptyType.SECURITY:
                            return <img className="ea-empty-img" src={securityEmpty} alt="no apps found" />;
                    }
                })()}
            </div>
            <div>
                <button
                    type="button"
                    className="saved-filter__clear-btn saved-filter__clear-btn--dark mr-16"
                    onClick={knowMoreHandler}
                >
                    Know more
                </button>
                <button type="button" className="cta" onClick={checkInstallHandler}>
                    Check how to install
                </button>
            </div>
        </div>
    );
}

export default EAEmptyState;
