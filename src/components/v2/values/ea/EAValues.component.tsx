import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify';
import { showError, Progressing, ErrorScreenManager } from '../../../common';
import { getReleaseInfo, ReleaseInfoResponse, ReleaseInfo } from '../../../external-apps/ExternalAppService';
import { ServerErrors } from '../../../../modals/commonTypes';
import ReadmeColumn  from '../common/ReadmeColumn.component';
import CodeEditor from '../../../CodeEditor/CodeEditor'
import YAML from 'yaml';
import '../DeployChart.scss';

function ExternalAppValues({appId}) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true);
    const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo>(undefined);

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
