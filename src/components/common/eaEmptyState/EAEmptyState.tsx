import React from 'react';
import appDetailEmpty from '../../../assets/img/ic-empty-ea-app-detail.png';
import chartsEmpty from '../../../assets/img/ic-empty-ea-charts.png';
import securityEmpty from '../../../assets/img/ic-empty-ea--security.png';
import './eaEmptyState.css';

export enum EAType {
    DEVTRONAPPS = 'devtron_apps',
    HELMCHARTS = 'helm_charts',
    SECURITY = 'security',
    DEPLOYMENTGROUPS = 'deployment_groups',
    BULKEDIT = 'bulk_edit',
}

function EAEmptyState({ title, msg, img, knowMoreLink, checkInstallHandler, isHeader = false, headerText = '' }) {
    return (
        <div>
            {isHeader && (
                <div className="page-header brdr-btm pl-20">
                    <div className="page-header__title flex left fs-16 pt-16 pb-16 ">{headerText}</div>
                </div>
            )}
            <div className="ea-empty__wrapper cn-9 text-center">
                <div className="fs-20 fw-6 mb-8">{title}</div>
                <div className="fs-14 m-auto w-600">{msg}</div>
                <div className="m-tb-20">
                    {(() => {
                        switch (img) {
                            case EAType.DEVTRONAPPS:
                                return (
                                    <img
                                        className="ea-empty-img"
                                        src={appDetailEmpty}
                                        width="800"
                                        alt="no apps found"
                                    />
                                );
                            case EAType.HELMCHARTS:
                                return (
                                    <img className="ea-empty-img" src={chartsEmpty} width="800" alt="no apps found" />
                                );
                            case EAType.BULKEDIT:
                                return (
                                    <img
                                        className="ea-empty-img"
                                        src={appDetailEmpty}
                                        width="800"
                                        alt="no apps found"
                                    />
                                );
                            case EAType.DEPLOYMENTGROUPS:
                                return <img src={appDetailEmpty} alt="no apps found" width="800" />;
                            case EAType.SECURITY:
                                return (
                                    <img className="ea-empty-img" src={securityEmpty} width="800" alt="no apps found" />
                                );
                        }
                    })()}
                </div>
                <div>
                    <a
                        href={knowMoreLink}
                        target="_blank"
                        className="empty__know-more-btn cursor saved-filter__clear-btn saved-filter__clear-btn--dark mr-16"
                    >
                        Know more
                    </a>
                    <button type="button" className="cta empty__install-btn" onClick={checkInstallHandler}>
                        Check how to install
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EAEmptyState;
