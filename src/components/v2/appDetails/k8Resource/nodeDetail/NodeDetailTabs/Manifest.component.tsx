import React, { useEffect, useState } from 'react';
import {useLocation, useHistory} from 'react-router';
import { ManifestTabJSON } from '../../../../utils/tabUtils/tab.json';
import { iLink } from '../../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../../utils/tabUtils/useTab';
import { useParams, useRouteMatch } from 'react-router';
import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg';
import { NodeDetailTab } from '../nodeDetail.type';
import {
    createResource,
    getDesiredManifestResource,
    getManifestResource,
    updateManifestResourceHelmApps,
} from '../nodeDetail.api';
import CodeEditor from '../../../../../CodeEditor/CodeEditor';
import IndexStore from '../../../index.store';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';
import { AppType } from '../../../appDetails.type';
import YAML from 'yaml';
import { toast } from 'react-toastify';
import { showError, ToastBody } from '../../../../../common';

function ManifestComponent({ selectedTab, isDeleted }) {
    const location = useLocation();
    const history = useHistory();
    const [{ tabs, activeTab }, dispatch] = useTab(ManifestTabJSON);
    const { url } = useRouteMatch();
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();
    const [manifest, setManifest] = useState('');
    const [modifiedManifest, setModifiedManifest] = useState('');
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('');
    const [desiredManifest, setDesiredManifest] = useState('');
    const appDetails = IndexStore.getAppDetails();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [isEditmode, setIsEditmode] = useState(false);
    const [showDesiredAndCompareManifest, setShowDesiredAndCompareManifest] = useState(false);
    const [isResourceMissing, setIsResourceMissing] = useState(false);

    useEffect(() => {
        const selectedResource = appDetails.resourceTree.nodes.filter(
            (data) => data.name === params.podName && data.kind.toLowerCase() === params.nodeType,
        )[0];

        let _isResourceMissing = appDetails.appType === AppType.EXTERNAL_HELM_CHART && selectedResource.health?.status === 'Missing';
        setIsResourceMissing(_isResourceMissing);
        let _showDesiredAndCompareManifest = appDetails.appType === AppType.EXTERNAL_HELM_CHART && !selectedResource.parentRefs?.length;
        setShowDesiredAndCompareManifest(_showDesiredAndCompareManifest);

        setLoading(true);
        selectedTab(NodeDetailTab.MANIFEST, url);

        if (appDetails.appType === AppType.EXTERNAL_HELM_CHART) {
            markActiveTab('Live manifest');
        }
        try {
            Promise.all([
                !_isResourceMissing && getManifestResource(appDetails, params.podName, params.nodeType),
                _showDesiredAndCompareManifest && getDesiredManifestResource(appDetails, params.podName, params.nodeType),
            ])
                .then((response) => {
                    let _manifest;
                    if (appDetails.appType === AppType.EXTERNAL_HELM_CHART) {
                        _manifest = JSON.stringify(response[0]?.result?.manifest);
                        setDesiredManifest(response[1]?.result?.manifest || '');
                    } else {
                        _manifest = response[0]?.result?.manifest;
                    }
                    if (_manifest) {
                        setManifest(_manifest);
                        setActiveManifestEditorData(_manifest);
                        setModifiedManifest(_manifest);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setError(true);
                    showError(err);
                    setLoading(false);
                });
        } catch (err) {
            console.log('err', err);
        }
    }, [params.podName, params.nodeType]);

    useEffect(() => {
        if (!isEditmode && activeManifestEditorData !== modifiedManifest) {
            setActiveManifestEditorData(modifiedManifest);
        }
    }, [isEditmode]);

    //For External

    const handleEditorValueChange = (codeEditorData: string) => {
        if (activeTab === 'Live manifest' && isEditmode) {
            setModifiedManifest(codeEditorData);
        }
    };
    const handleEditLiveManifest = () => {
        setIsEditmode(true);
        markActiveTab('Live manifest');
        setActiveManifestEditorData(modifiedManifest);
    };

    const handleApplyChanges = () => {
        setLoading(true);
        let manifestString;
        try {
            manifestString = JSON.stringify(YAML.parse(modifiedManifest));
        } catch (err2) {
            setErrorText(`Encountered data validation error while saving. “${err2}”`);
        }
        if (!manifestString) {
            setLoading(false);
        }
        manifestString &&
            updateManifestResourceHelmApps(appDetails, params.podName, params.nodeType, manifestString)
                .then((response) => {
                    setIsEditmode(false);
                    const _manifest = JSON.stringify(response?.result?.manifest);
                    if (_manifest) {
                        setManifest(_manifest);
                        setErrorText(``);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    if (err.code === 403) {
                        toast.info(<ToastBody title="Access denied" subtitle="You don't have access to perform this action." />, {
                          className: 'devtron-toast unauthorized',
                        });
                    } else if (err.code === 500) {
                        const error = err['errors'] && err['errors'][0];
                        if (error && error.code && error.userMessage) {
                            setErrorText(`ERROR ${error.code} > Message: “${error.userMessage}”`);
                        } else {
                            showError(err);
                        }
                    } else {
                        showError(err);
                    }
                });
    };

    const recreateResource = () => {
        setLoading(true);
        setActiveManifestEditorData('');
        createResource(appDetails, params.podName, params.nodeType)
            .then((response) => {
                const _manifest = JSON.stringify(response?.result?.manifest);
                if (_manifest) {
                    setManifest(_manifest);
                    setActiveManifestEditorData(_manifest);
                    setModifiedManifest(_manifest);
                    setIsResourceMissing(false);
                }
                setLoading(false);
                _refetchAppDetailData();
            })
            .catch((err) => {
                setLoading(false);
                showError(err);
            });
    };

    const _refetchAppDetailData = () => {
        const queryParams = new URLSearchParams(location.search);
        queryParams.append('refetchData', 'true');
        history.replace({
            search: queryParams.toString(),
        })
    }

    const handleCancel = () => {
        setIsEditmode(false);
        setModifiedManifest(manifest);
        setActiveManifestEditorData('');
    };

    const markActiveTab = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName,
        });
    };

    const updateEditor = (_tabName: string) => {
        switch (_tabName) {
            case 'Live manifest':
                setActiveManifestEditorData(modifiedManifest);
                break;
            case 'Compare':
                setActiveManifestEditorData(manifest);
                break;
            case 'Desired manifest':
                setActiveManifestEditorData(desiredManifest);
                break;
        }
    };

    const handleTabClick = (_tab: iLink) => {
        if (_tab.isDisabled || loading) {
            return;
        }
        markActiveTab(_tab.name);
        updateEditor(_tab.name);
    };

    useEffect(() => {
        if (params.actionName) {
            markActiveTab(params.actionName);
        }
    }, [params.actionName]);

    return isDeleted ? (
        <div>
            <MessageUI msg="This resource no longer exists" size={32} />
        </div>
    ) : (
        <div style={{ minHeight: '600px', background: '#0B0F22', flex: 1 }}>
            {error && !loading && <MessageUI msg="Manifest not available" size={24} />}
            {!error && (
                <>
                    <div className="bcn-0">
                        {appDetails.appType === AppType.EXTERNAL_HELM_CHART && (
                            <div className="flex left pl-20 pr-20 border-bottom manifest-tabs-row">
                                {tabs.map((tab: iLink, index) => {
                                    return !showDesiredAndCompareManifest &&
                                        (tab.name == 'Desired manifest' || tab.name == 'Compare') ? (
                                        <></>
                                    ) : (
                                        <div
                                            key={index + 'tab'}
                                            className={` ${
                                                tab.isDisabled || loading ? 'no-drop' : 'cursor'
                                            } pl-4 pt-8 pb-8 pr-4`}
                                        >
                                            <div
                                                className={`${
                                                    tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'
                                                } bw-1 pl-6 pr-6 br-4 en-2 no-decor flex left`}
                                                onClick={() => handleTabClick(tab)}
                                            >
                                                {tab.name}
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeTab === 'Live manifest' && !loading && !isResourceMissing && (
                                    <>
                                        <div className="pl-16 pr-16">|</div>
                                        {!isEditmode ? (
                                            <div className="flex left cb-5 cursor" onClick={handleEditLiveManifest}>
                                                <Edit className="icon-dim-16 pr-4 fc-5 edit-icon" /> Edit Live manifest
                                            </div>
                                        ) : (
                                            <div>
                                                <button className="apply-change" onClick={handleApplyChanges}>
                                                    Apply Changes
                                                </button>
                                                <button className="cancel-change" onClick={handleCancel}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {isResourceMissing && !loading ? (
                            <MessageUI
                                msg="Manifest not available"
                                size={24}
                                isShowActionButton={showDesiredAndCompareManifest}
                                actionButtonText="Recreate this resource"
                                onActionButtonClick={recreateResource}
                            />
                        ) : (
                            <CodeEditor
                                defaultValue={desiredManifest}
                                diffView={activeTab === 'Compare'}
                                theme="vs-dark--dt"
                                height={700}
                                value={activeManifestEditorData}
                                mode="yaml"
                                readOnly={activeTab !== 'Live manifest' || !isEditmode}
                                onChange={handleEditorValueChange}
                                loading={loading}
                                customLoader={<MessageUI msg="fetching manifest" icon={MsgUIType.LOADING} size={24} />}
                                focus={isEditmode}
                            >
                                {activeTab === 'Compare' && (
                                    <CodeEditor.Header hideDefaultSplitHeader={true}>
                                        <div className="split-header">
                                            <div className="left-pane">Desired manifest</div>
                                            <div className="right-pane">Live manifest</div>
                                        </div>
                                    </CodeEditor.Header>
                                )}
                                {activeTab === 'Live manifest' && errorText && <CodeEditor.ErrorBar text={errorText} />}
                            </CodeEditor>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ManifestComponent;
