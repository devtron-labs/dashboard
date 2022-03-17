import React from 'react';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import { DeploymentTemplateHistoryType } from './cd.type';
import YAML from 'yaml';

function DeploymentTemplateHistory({
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
        const bgColorDeploymentDiff = isDeploymentConfigDiff() ? (isBaseTemplate ? 'bcg-1' : 'bcr-1') : '';
        const bgColorForAppMetricesDiff = isApplicationMetricesDiff() ? (isBaseTemplate ? 'bcg-1' : 'bcr-1') : '';

        return (
            <div className="">
                <div className={`${bgColorDeploymentDiff} pl-16 pr-16 pt-8 pb-8`}>
                    <div className="cn-6">Chart version</div>
                    {configuration?.templateVersion ? (
                        <div className="cn-9 ">{configuration.templateVersion}</div>
                    ) : (
                        <div className=" inline-block"></div>
                    )}
                </div>
                <div className={`${bgColorForAppMetricesDiff} pl-16 pr-16 pt-8 pb-8`}>
                    <div className="cn-6">Application metrics</div>
                    <div className="cn-9 fs-13">{configuration?.isAppMetricsEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
            </div>
        );
    };
    return (
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20 pt-8 pb-8">
                {renderHistoryFieldDiff(currentConfiguration, false)}
                {renderHistoryFieldDiff(baseTemplateConfiguration, true)}
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
                                value={YAML.stringify(JSON.parse(baseTemplateConfiguration.template))}
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
