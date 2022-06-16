import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { multiSelectStyles } from '../../../common';
import './sourceInfo.css';
import IndexStore from '../index.store';
import { AppEnvironment } from './environment.type';
import { useParams, useHistory, useRouteMatch } from 'react-router';

import { getAppOtherEnvironment } from '../appDetails.api';
import { useSharedState } from '../../utils/useSharedState';
import { AppType } from "../appDetails.type";
import { ReactComponent as ScaleObjects } from '../../../../assets/icons/ic-scale-objects.svg';
import ScaleWorkloadsModal from './scaleWorkloads/ScaleWorkloadsModal.component';
import Tippy from '@tippyjs/react';

function EnvironmentSelectorComponent() {
    const params = useParams<{ appId: string; envId?: string }>();
    const { url, path } = useRouteMatch();
    const history = useHistory();
    const [showWorkloadsModal, setWorkloadsModal] = useState(false);
    const [environments, setEnvironments] = useState<Array<AppEnvironment>>();
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable());
    const [canScaleWorkloads, setCanScaleWorkloads] = useState(false)

    useEffect(() => {
        if (appDetails.appType != AppType.EXTERNAL_HELM_CHART) {
            getAppOtherEnvironment(params.appId)
                .then((response) => {
                    setEnvironments(response.result || []);
                })
                .catch((error) => {
                    console.error('error in fetching environments');
                    setEnvironments([]);
                });
        }
    }, [params.appId]);

    useEffect(() => {
        if (!params.envId && appDetails.environmentId) {
            handleEnvironmentChange(appDetails.environmentId);
        }
    }, [appDetails.environmentId]);

    useEffect(() => {
        if (appDetails.appType === AppType.EXTERNAL_HELM_CHART && appDetails.resourceTree?.nodes) {
            setCanScaleWorkloads(
                appDetails.resourceTree.nodes.some(
                    (node) => node.canBeHibernated && node.health?.status?.toLowerCase() !== 'missing',
                ),
            )
        }
    }, [appDetails])

    const handleEnvironmentChange = (envId: number) => {
        history.push(`${url}/${envId}`);
    };

    return (
        <div className="flexbox flex-justify pl-20 pr-20 pt-16 pb-16">
            <div>
                <div className="flexbox">
                    <div style={{ width: 'clamp( 100px, 30%, 200px )', height: '100%', position: 'relative' }}>
                        <svg
                            viewBox="0 0 200 40"
                            preserveAspectRatio="none"
                            style={{ width: '100%', height: '100%', display: 'flex' }}
                        >
                            <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="#0066cc" />
                            <path d="M0 10 L0, 30" strokeWidth="2" stroke="#0066cc" />
                        </svg>
                        <div
                            className="bcb-5 br-10 cn-0 pl-8 pr-8"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            ENV
                        </div>
                    </div>

                    <div className="fw-6 fs-14 cb-5">
                        {/* <div>{appDetails.environmentName}</div> */}
                        <div style={{ minWidth: '200px' }}>
                            {environments && environments.length > 0 && (
                                <Select
                                    placeholder="Select Environment"
                                    options={
                                        Array.isArray(environments)
                                            ? environments.map((environment) => ({
                                                  label: environment.environmentName,
                                                  value: environment.environmentId,
                                              }))
                                            : []
                                    }
                                    value={
                                        appDetails.environmentId
                                            ? { value: +appDetails.environmentId, label: appDetails.environmentName }
                                            : null
                                    }
                                    onChange={(selected) => {
                                        handleEnvironmentChange(selected.value);
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                        menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                        control: (base, state) => ({
                                            ...base,
                                            border: '0px',
                                            backgroundColor: 'transparent',
                                            minHeight: '24px !important',
                                        }),
                                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                        indicatorsContainer: (provided, state) => ({
                                            ...provided,
                                            height: '24px',
                                        }),
                                    }}
                                    className="bw-1 eb-2 br-4 bcn-0"
                                    components={{
                                        IndicatorSeparator: null,
                                    }}
                                />
                            )}

                            {(!environments || environments.length === 0) && appDetails && (
                                <div
                                    className="bw-1 eb-2 br-4 bcn-0 pl-12 pr-12 pt-4 pb-4"
                                    style={{ minWidth: '200px' }}
                                >
                                    {appDetails.environmentName || <span>&nbsp;</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {appDetails.appType === AppType.EXTERNAL_HELM_CHART && !showWorkloadsModal && (
                <>
                    {canScaleWorkloads ? (
                        <button
                            className="scale-workload__btn flex left cta cancel pb-6 pt-6 pl-12 pr-12 en-2"
                            onClick={() => setWorkloadsModal(true)}
                        >
                            <ScaleObjects className="mr-4" /> Scale workloads
                        </button>
                    ) : (
                        <Tippy
                            placement="top"
                            arrow={false}
                            className="default-tt"
                            content={'No scalable workloads available'}
                        >
                            <button
                                className="scale-workload__btn flex left cta pb-6 pt-6 pl-12 pr-12 not-allowed"
                            >
                                <ScaleObjects className="scale-workload-icon mr-4" /> Scale workloads
                            </button>
                        </Tippy>
                    )}
                </>
            )}
            {showWorkloadsModal && (
                <ScaleWorkloadsModal appId={params.appId} onClose={() => setWorkloadsModal(false)} history={history} />
            )}
        </div>
    );
}

export default EnvironmentSelectorComponent;
