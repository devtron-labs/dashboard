import React, { useCallback, useEffect, useReducer, useState } from 'react';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import { mapByKey, showError, useEffectAfterMount } from '../../../common';
import { useParams } from 'react-router';
import YAML from 'yaml';
import { toast } from 'react-toastify';
import { getPreviousDeploymentTemplate, getDeploymentTemplateVersion } from './service';
import { chartRefAutocomplete } from '../../../EnvironmentOverride/service';

function DeploymentTemplateHistory({ setTempValue, currentConfiguration }) {
    const { appId, envId, pipelineId } = useParams<{ appId; envId; pipelineId }>();
    const [chartRefLoading, setChartRefLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [baseDeploymentTemplate, setBaseDeploymentTemplate] = useState<any>();
    const [charts, setCharts] = useState<Map<any, any>>();
    const [chartRefId, setChartRefId] = useState(0);
    const [previousChartVersion, setPreviousChartVersion] = useState();

    useEffect(() => {
        setLoading(true);
        initialise();
    }, [envId]);

    useEffect(() => {
        if (!chartRefLoading && chartRefId) {
            fetchDeploymentTemplate();
        }
    }, [chartRefLoading]);

    useEffect(() => {
        async function getDeploymentTemplatefromchartRef() {
            try {
                const { result } = await getDeploymentTemplateVersion(appId, chartRefId);
                setPreviousChartVersion(result.globalConfig.refChartTemplateVersion);
            } catch (err) {
                showError(err);
            }
        }
        getDeploymentTemplatefromchartRef();
    }, []);

    async function initialise() {
        setChartRefLoading(true);
        try {
            const { result } = await chartRefAutocomplete(+appId, +envId);
            setCharts(mapByKey(result.chartRefs, 'id'));
            setChartRefId(result.latestEnvChartRef || result.latestAppChartRef || result.latestChartRef);
        } catch (err) {
            showError(err);
        } finally {
            setChartRefLoading(false);
        }
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getPreviousDeploymentTemplate(+appId, +envId, chartRefId);
            setBaseDeploymentTemplate(result);
            console.log(result);
        } catch (err) {
            showError(err);
        }
    }


    let isTemplateDiff = isDeploymentConfigDiff()
    
    function isDeploymentConfigDiff () : boolean {
        if (currentConfiguration && currentConfiguration.templateVersion !== previousChartVersion) {
           return true;
        } 
        return
    };

    return (
        
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20">
                <div className="">
                    <div className={`${isTemplateDiff ? 'bcr-1' : ''} pl-16 pr-16 pt-16 pb-16`}>
                        <div className="cn-6">Chart version</div>
                        <div className="cn-9">{currentConfiguration?.templateVersion}</div>
                    </div>
                    <div className={`${isTemplateDiff ? 'bcr-1' : ''} pl-16 pr-16 pt-16 pb-16`}>
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">Disabled</div>
                    </div>
                </div>
                <div className="">
                    <div className={`${isTemplateDiff ? 'bcg-1' : ''} pl-16 pr-16 pt-16 pb-16`}>
                        <div className={`cn-6`}>Chart version</div>
                        <div className="cn-9">{previousChartVersion}</div>
                    </div>
                    <div className={`${isTemplateDiff ? 'bcg-1' : ''} pl-16 pr-16 pt-16 pb-16`}>
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">Enabled</div>
                    </div>
                </div>
            </div>

            <div className="form__row form__row--code-editor-container en-2 bw-1 br-4 mr-20 ml-20">
                <div className="border-bottom br-4 pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">values.yaml</div>
                <div className="code-editor-container">
                    {baseDeploymentTemplate &&
                        baseDeploymentTemplate.globalConfig &&
                        currentConfiguration &&
                        currentConfiguration.template && (
                            <CodeEditor
                                value={YAML.stringify(baseDeploymentTemplate.globalConfig, { indent: 2 })}
                                onChange={(res) => setTempValue(res)}
                                defaultValue={currentConfiguration.template}
                                mode="yaml"
                                diffView={true}
                                readOnly={true}
                                loading={chartRefLoading}
                            ></CodeEditor>
                        )}
                </div>
            </div>
        </div>
    );
}

export default DeploymentTemplateHistory;
