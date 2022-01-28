import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify';
import { showError, Progressing, ErrorScreenManager, DeleteDialog } from '../../../common';
import { getReleaseInfo, ReleaseInfoResponse, ReleaseInfo, deleteApplicationRelease, UninstallReleaseResponse } from '../../../external-apps/ExternalAppService';
import { ServerErrors } from '../../../../modals/commonTypes';
import ReadmeColumn  from '../common/ReadmeColumn.component';
import CodeEditor from '../../../CodeEditor/CodeEditor'
import { URLS } from '../../../../config'
import YAML from 'yaml';
import '../../../charts/modal/DeployChart.scss';

function ExternalAppValues({appId}) {
    const history = useHistory()

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateInProgress, setUpdateInProgress] = useState(false);
    const [isDeleteInProgress, setDeleteInProgress] = useState(false);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true);
    const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo>(undefined);
    const [deleteAppConfirmation, toggleDeleteAppConfirmation] = useState(false);

    // component load
    useEffect(() => {
        getReleaseInfo(appId)
            .then((releaseInfoResponse: ReleaseInfoResponse) => {
                setReleaseInfo(releaseInfoResponse.result);
                setIsLoading(false);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setErrorResponseCode(errors.code);
                setIsLoading(false);
            });
    }, []);


    const deleteApplication = () =>  {
        if (isDeleteInProgress){
            return;
        }
        setDeleteInProgress(true);
        toggleDeleteAppConfirmation(false);
        deleteApplicationRelease(appId)
            .then(() => {
                setDeleteInProgress(false);
                toast.success('Successfully deleted.')
                let _url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`;
                history.push(_url);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setDeleteInProgress(false);
            });
    }


    function renderData() {
        return <div className={`deploy-chart-container bcn-0 ${readmeCollapsed ? 'readmeCollapsed' : 'readmeOpen'}`} style={{height: 'calc(100vh - 50px)'}}>
            <div className="header-container flex column"></div>
            <ReadmeColumn readmeCollapsed={readmeCollapsed} toggleReadmeCollapsed={toggleReadmeCollapsed} readme={releaseInfo.readme} />
            <div className="deploy-chart-body">
                <div className="overflown">
                    <div className="hide-scroll">
                        <label className="form__row form__row--w-100">
                            <span className="form__label">Release Name</span>
                            <input className="form__input" value={releaseInfo.deployedAppDetail.appName} autoFocus disabled={true} />
                        </label>
                        <label className="form__row form__row--w-100">
                            <span className="form__label">Environment</span>
                            <input className="form__input" value={`${releaseInfo.deployedAppDetail.environmentDetail.clusterName}/${releaseInfo.deployedAppDetail.environmentDetail.namespace}`} autoFocus disabled={true} />
                        </label>
                        <label className="form__row form__row--w-100">
                            <span className="form__label">Chart</span>
                            <input className="form__input" value={`${releaseInfo.deployedAppDetail.chartName} (${releaseInfo.deployedAppDetail.chartVersion})`} autoFocus disabled={true} />
                        </label>
                        <div className="code-editor-container">
                            <CodeEditor
                                value={YAML.stringify(JSON.parse(releaseInfo.mergedValues))}
                                noParsing
                                mode="yaml"
                                readOnly={true}>
                                <CodeEditor.Header>
                                    <span className="bold">values.yaml</span>
                                </CodeEditor.Header>
                            </CodeEditor>
                        </div>
                    </div>
                </div>
            </div>
            <div className="cta-container">
                <button className="cta delete" disabled={isUpdateInProgress || isDeleteInProgress}
                        onClick={e => toggleDeleteAppConfirmation(true)}>
                    { isDeleteInProgress ?
                        <div className="flex">
                            <span>Deleting</span>
                            <span className="ml-10">
                                <Progressing />
                            </span>
                        </div> :
                        'Delete Application'
                    }
                </button>
                <button type="button" tabIndex={6}
                        disabled={isUpdateInProgress || isDeleteInProgress}
                        className={`cta flex-1 ml-16 mr-16 ${(isUpdateInProgress || isDeleteInProgress) ? 'disabled' : ''}`}
                        /*onClick={deploy}*/>
                    {isUpdateInProgress ? <Progressing /> : 'Update and deploy'}
                </button>
            </div>
            { deleteAppConfirmation &&
                <DeleteDialog title={`Delete application '${releaseInfo.deployedAppDetail.appName}' ?`} delete={() => deleteApplication()} closeDelete={() => toggleDeleteAppConfirmation(false)}>
                    <DeleteDialog.Description >
                        <p>This will delete all resources associated with this application.</p>
                        <p>Deleted applications cannot be restored.</p>
                    </DeleteDialog.Description>
                </DeleteDialog>
            }
        </div>
    }

    return (
        <>
            { isLoading &&
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            }

            { !isLoading && errorResponseCode &&
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            }

            { !isLoading && !errorResponseCode &&
                renderData()
            }

        </>

    )
};

export default ExternalAppValues
