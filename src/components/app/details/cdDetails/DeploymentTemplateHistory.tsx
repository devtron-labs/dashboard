import React from 'react';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import {DeploymentTemplateHistoryType} from './cd.type'

function DeploymentTemplateHistory({ currentConfiguration, baseTemplateConfiguration, codeEditorLoading }: DeploymentTemplateHistoryType) {
    let isTemplateVersionDiff = isDeploymentConfigDiff();

    function isDeploymentConfigDiff(): boolean {
        if (
            currentConfiguration &&
            currentConfiguration?.templateVersion !== baseTemplateConfiguration?.templateVersion
        ) {
            return true;
        }
        return;
    }

    function isApplicationMetricesDiff(): boolean {
        if (
            currentConfiguration &&
            currentConfiguration?.isAppMetricsEnabled !== baseTemplateConfiguration?.isAppMetricsEnabled
        ) {
            return true;
        }
        return;
    }

    return (
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20 pt-8 pb-8">
                <div className="">
                    <div className={`${isTemplateVersionDiff ? 'bcr-1' : ''} pl-16 pr-16 pt-8 pb-8`}>
                        <div className="cn-6">Chart version</div>
                        {currentConfiguration?.templateVersion ? (
                            <div className="cn-9">{currentConfiguration?.templateVersion}</div>
                        ) : (
                            <div className=" inline-block"></div>
                        )}
                    </div>
                    <div className={`${isApplicationMetricesDiff ? 'bcr-1' : ''} pl-16 pr-16 pt-8 pb-8`}>
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">{currentConfiguration?.isAppMetricsEnabled ? 'Enable' : 'Disable'}</div>
                    </div>
                </div>
                <div className="">
                    <div className={`${isTemplateVersionDiff ? 'bcg-1' : ''} pl-16 pr-16 pt-8 pb-8`}>
                        <div className={`cn-6`}>Chart version</div>
                        {baseTemplateConfiguration ? (
                            <div className="cn-9">{baseTemplateConfiguration?.templateVersion}</div>
                        ) : (
                            <div className=" inline-block"></div>
                        )}
                    </div>
                    <div className={`${isTemplateVersionDiff ? 'bcg-1' : ''} pl-16 pr-16 pt-8 pb-8`}>
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">{baseTemplateConfiguration?.isAppMetricsEnabled}</div>
                    </div>
                </div>
            </div>

            <div className=" form__row form__row--code-editor-container en-2 bw-1 br-4 mr-20 ml-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                    values.yaml
                </div>
                <div>
                    {baseTemplateConfiguration &&
                        baseTemplateConfiguration.template &&
                        currentConfiguration &&
                        currentConfiguration.template && (
                            <CodeEditor
                                value={baseTemplateConfiguration.template}
                                defaultValue={currentConfiguration.template}
                                mode="yaml"
                                diffView={true}
                                readOnly={true}
                                loading={codeEditorLoading}
                            ></CodeEditor>
                        )}
                </div>
            </div>
        </div>
    );
}

export default DeploymentTemplateHistory;
