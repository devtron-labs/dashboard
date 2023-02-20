import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { multiSelectStyles, PopupMenu, showError } from '../../../common';
import './sourceInfo.css';
import IndexStore from '../index.store';
import { AppEnvironment } from './environment.type';
import { useParams, useHistory, useRouteMatch, useLocation } from 'react-router';

import { getAppOtherEnvironment } from '../appDetails.api';
import { useSharedState } from '../../utils/useSharedState';
import { AppType, DeploymentAppType } from "../appDetails.type";
import { ReactComponent as ScaleObjects } from '../../../../assets/icons/ic-scale-objects.svg';
import { ReactComponent as ArgoCD } from '../../../../assets/icons/argo-cd-app.svg'
import { ReactComponent as Helm } from '../../../../assets/icons/helm-app.svg'
import ScaleWorkloadsModal from './scaleWorkloads/ScaleWorkloadsModal.component';
import Tippy from '@tippyjs/react';
import { TriggerUrlModal } from '../../../app/list/TriggerUrl';
import { ReactComponent as LinkIcon }  from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-interactive.svg'
import { deleteApplicationRelease } from '../../../external-apps/ExternalAppService';
import { deleteInstalledChart } from '../../../charts/charts.service';
import { toast } from 'react-toastify';
import { ReactComponent as Dots} from '../../assets/icons/ic-menu-dot.svg'
import { DeleteChartDialog } from '../../values/chartValuesDiff/ChartValuesView.component';
import { checkIfDevtronOperatorHelmRelease, URLS } from '../../../../config';
import  BinWithDots from '../../../../assets/img/delete-bin-with-dots.png'

function EnvironmentSelectorComponent({isExternalApp, _init}: {isExternalApp: boolean; _init?: () => void}) {
    const params = useParams<{ appId: string; envId?: string }>();
    const { url } = useRouteMatch();
    const history = useHistory();
    const [showWorkloadsModal, setWorkloadsModal] = useState(false);
    const [environments, setEnvironments] = useState<Array<AppEnvironment>>();
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable());
    const [canScaleWorkloads, setCanScaleWorkloads] = useState(false)
    const [urlInfo, showUrlInfo] = useState<boolean>(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const isGitops = appDetails?.deploymentAppType === DeploymentAppType.argo_cd
    const location = useLocation()


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

    const closeUrlInfo = (): void => {
        showUrlInfo(false)
    }

    const showInfoUrl = (): void => {
        showUrlInfo(true)
    }

    const showDeleteConfitmationPopup = () => {
        setShowDeleteConfirmation(true)
    }

    //Local storage for the first time empty state show

    const Popup = () => {
        return (
            <div className="pod-info__popup-container">
                <span
                    className="flex pod-info__popup-row pod-info__popup-row--red cr-5"
                    onClick={showDeleteConfitmationPopup}
                >
                    <span>Delete application</span>
                    <Trash className="icon-dim-20 scr-5" />
                </span>
            </div>
        )
    }

    const getDeleteApplicationApi = (): Promise<any> => {
        if (isExternalApp) {
            return deleteApplicationRelease(params.appId)
        } else {
            return deleteInstalledChart(params.appId, isGitops)
        }
    }

    const toggleShowDeleteConfirmation = () => {
        setShowDeleteConfirmation(!showDeleteConfirmation)
    }


    async function deleteResourceAction() {
        try {
            await getDeleteApplicationApi()
            setShowDeleteConfirmation(false)
            toast.success('Deletion initiated successfully.')
            _init()
        } catch (error) {
            showError(error)
        }
    }

    const deployedAppDetail = isExternalApp && params.appId && params.appId.split('|')

    return (
        <div className="flexbox flex-justify pl-20 pr-20 pt-16 pb-16">
            <div>
                <div className="flex left">
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
                                        handleEnvironmentChange(selected.value)
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
                    {appDetails?.deploymentAppType && (
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content={`Deployed using ${isGitops ? `GitOps` : `Helm`}`}
                        >
                            {isGitops ? (
                                <ArgoCD className="icon-dim-32 ml-16" />
                            ) : (
                                <Helm className="icon-dim-32 ml-16" />
                            )}
                        </Tippy>
                    )}
                     {appDetails?.deploymentAppDeleteRequest && (
                    <>
                     <img src={BinWithDots} alt="error" className='icon-dim-20 mr-4 ml-12' />
                        <span className="cr-5 fw-6">Deleting deployment pipeline </span>
                        <span className="dc__loading-dots cr-5" />
                    </>
                )}
                </div>
            </div>

            <div className="flex">
                {!appDetails.deploymentAppDeleteRequest && (
                    <button className="flex left small cta cancel pb-6 pt-6 pl-12 pr-12 en-2" onClick={showInfoUrl}>
                        <LinkIcon className="icon-dim-16 mr-6 icon-color-n7" />
                        Urls
                    </button>
                )}
                {appDetails.appType === AppType.EXTERNAL_HELM_CHART && !showWorkloadsModal && (
                    <>
                        {canScaleWorkloads ? (
                            <button
                                className="scale-workload__btn flex left cta cancel pb-6 pt-6 pl-12 pr-12 en-2 ml-6"
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
                                <button className="scale-workload__btn flex left cta pb-6 pt-6 pl-12 pr-12 not-allowed">
                                    <ScaleObjects className="scale-workload-icon mr-4" /> Scale workloads
                                </button>
                            </Tippy>
                        )}
                    </>
                )}

                {!(
                    deployedAppDetail &&
                    checkIfDevtronOperatorHelmRelease(deployedAppDetail[2], deployedAppDetail[1], deployedAppDetail[0])
                ) && (
                    <div>
                        <PopupMenu autoClose>
                            <PopupMenu.Button rootClassName="flex" isKebab={true}>
                                <Dots className="pod-info__dots ml-8 icon-dim-20 icon-color-n6" />
                            </PopupMenu.Button>
                            <PopupMenu.Body>
                                <Popup />
                            </PopupMenu.Body>
                        </PopupMenu>
                        {showDeleteConfirmation && (
                            <DeleteChartDialog
                                appName={appDetails.appName}
                                handleDelete={deleteResourceAction}
                                toggleConfirmation={toggleShowDeleteConfirmation}
                                isCreateValueView={false}
                            />
                        )}
                    </div>
                )}
            </div>

            {urlInfo && (
                <TriggerUrlModal
                    installedAppId={params.appId}
                    isEAMode={appDetails.appType === AppType.EXTERNAL_HELM_CHART}
                    appId={appDetails.appType === AppType.EXTERNAL_HELM_CHART ? params.appId : ''}
                    envId={params.envId}
                    close={closeUrlInfo}
                />
            )}
            {showWorkloadsModal && (
                <ScaleWorkloadsModal appId={params.appId} onClose={() => setWorkloadsModal(false)} history={history} />
            )}
        </div>
    )
}

export default EnvironmentSelectorComponent;
