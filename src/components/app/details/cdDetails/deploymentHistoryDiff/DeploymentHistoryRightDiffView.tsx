import CodeEditor from '../../../../CodeEditor/CodeEditor';
import { DeploymentTemplateHistoryType } from '../cd.type';
import YAML from 'yaml';
import { Progressing } from '../../../../common';
import React, { useEffect } from 'react';


// const configList = [ 'Chart version', 'Application metrics']

function DeploymentHistoryRightDiffView({
    currentConfiguration,
    baseTemplateConfiguration,
    codeEditorLoading,
}: DeploymentTemplateHistoryType) {
    function isDeploymentConfigDiff(): boolean {
        return currentConfiguration?.templateVersion !== baseTemplateConfiguration?.templateVersion;
    }

    function isApplicationMetricesDiff(): boolean {
        return (
            (currentConfiguration?.isAppMetricsEnabled && !baseTemplateConfiguration?.isAppMetricsEnabled) ||
            (!currentConfiguration?.isAppMetricsEnabled && baseTemplateConfiguration?.isAppMetricsEnabled)
        );
    }

    const renderHistoryFieldDiff = (configuration, isBaseTemplate) => {
        const commonStyle = 'pl-16 pr-16 pt-8 pb-8';
        const bgColorDeploymentDiff = isDeploymentConfigDiff() ? (isBaseTemplate ? 'bcg-1' : 'bcr-1') : '';
        const bgColorForAppMetricesDiff = isApplicationMetricesDiff() ? (isBaseTemplate ? 'bcg-1' : 'bcr-1') : '';

        return (
            <div>
                <div className={`${bgColorDeploymentDiff} ${commonStyle}`}>
                    <div className="cn-6">Chart version</div>
                    {configuration?.templateVersion ? (
                        <div className="cn-9 fs-13">{configuration.templateVersion}</div>
                    ) : (
                        <div className=" inline-block"></div>
                    )}
                </div>
                <div className={`${bgColorForAppMetricesDiff} ${commonStyle}`}>
                    <div className="cn-6">Application metrics</div>
                    <div className="cn-9 fs-13">{configuration?.isAppMetricsEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
            </div>
        );
    };

    const renderDeploymentDiffViaCodeEditor = () => {
        return codeEditorLoading ? (
            <div className="w-100 flex" style={{ minHeight: '500px' }}>
                <Progressing pageLoader />
            </div>
        ) : (
            <>
                {baseTemplateConfiguration?.template && currentConfiguration?.template && (
                    <CodeEditor
                        value={YAML.stringify(JSON.parse(baseTemplateConfiguration.template))}
                        defaultValue={currentConfiguration.template}
                        height={600}
                        mode="yaml"
                        diffView={true}
                        readOnly={true}
                        loading={codeEditorLoading}
                    ></CodeEditor>
                )}
            </>
        );
    };
    return (
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20 pt-8 pb-8">
                {renderHistoryFieldDiff(currentConfiguration, false)}
                {renderHistoryFieldDiff(baseTemplateConfiguration, true)}
            </div>

            <div className=" form__row form__row--code-editor-container en-2 bw-1 br-4 mb-20 mr-20 ml-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                    values.yaml
                </div>
                {renderDeploymentDiffViaCodeEditor()}
            </div>
        </div>
    );
}

export default DeploymentHistoryRightDiffView;
