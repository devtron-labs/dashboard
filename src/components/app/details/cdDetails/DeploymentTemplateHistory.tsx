import React, { useCallback, useEffect, useReducer, useState } from 'react';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import { mapByKey, showError, useEffectAfterMount } from '../../../common';
import { useParams } from 'react-router';
import YAML from 'yaml';
import { toast } from 'react-toastify';
import { getDeploymentTemplate, getDeploymentTemplateDiff } from './service';
import { chartRefAutocomplete } from '../../../EnvironmentOverride/service';

function DeploymentTemplateHistory({ setTempValue }) {
    const { appId, envId, pipelineId } = useParams<{ appId; envId; pipelineId }>();
    const [chartRefLoading, setChartRefLoading] = useState(null);
    const [loading, setLoading] = useState(false);

    const memoisedReducer = useCallback(
        (state, action) => {
            switch (action.type) {
                case 'setResult':
                    return {
                        ...state,
                        data: action.value,
                        duplicate:
                            action.value.IsOverride || state.duplicate
                                ? action.value.environmentConfig.envOverrideValues || action.value.globalConfig
                                : null,
                    };
                case 'setCharts':
                    return {
                        ...state,
                        charts: mapByKey(action.value.chartRefs, 'id'),
                        selectedChartRefId:
                            state.selectedChartRefId ||
                            action.value.latestEnvChartRef ||
                            action.value.latestAppChartRef ||
                            action.value.latestChartRef,
                    };
                case 'createDuplicate':
                    return { ...state, duplicate: action.value, selectedChartRefId: state.data.globalChartRefId };
                case 'removeDuplicate':
                    return { ...state, duplicate: null };
                case 'selectChart':
                    return { ...state, selectedChartRefId: action.value };
                case 'appMetricsLoading':
                    return { ...state, appMetricsLoading: true };
                case 'success':
                case 'error':
                    return { ...state, appMetricsLoading: false };
                case 'reset':
                    return { collapsed: true, charts: new Map(), selectedChartRefId: null };
                default:
                    return state;
            }
        },
        [appId, envId],
    );

    const initialState = {
        collapsed: true,
        charts: new Map(),
    };

    const [state, dispatch] = useReducer(memoisedReducer, initialState);

    useEffect(() => {
        dispatch({ type: 'reset' });
        setLoading(true);
        initialise();
    }, [envId]);

    useEffect(() => {
        if (typeof chartRefLoading === 'boolean' && !chartRefLoading && state.selectedChartRefId) {
            fetchDeploymentTemplate();
        }
    }, [chartRefLoading]);

    useEffectAfterMount(() => {
        if (!state.selectedChartRefId) return;
        initialise();
    }, [state.selectedChartRefId]);

    async function initialise() {
        setChartRefLoading(true);
        try {
            const { result } = await chartRefAutocomplete(+appId, +envId);
            dispatch({ type: 'setCharts', value: result });
        } catch (err) {
            showError(err);
        } finally {
            setChartRefLoading(false);
        }
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getDeploymentTemplate(
                +appId,
                +envId,
                state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
            );
            dispatch({ type: 'setResult', value: result });
            // setRes(result)
        } catch (err) {
            showError(err);
        } finally {
            if (state.appMetricsLoading) {
                toast.success(`Successfully ${state.data.appMetrics ? 'deactivated' : 'activated'} app metrics.`, {
                    autoClose: null,
                });
                dispatch({ type: 'success' });
            }
        }
    }
    return (
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20">
                <div className="pl-16 pr-16 pt-16">
                    <div className="pb-16">
                        <div className="cn-6">Chart version</div>
                        <div className="cn-9">3.8.0</div>
                    </div>
                    <div className="pb-16">
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">Disabled</div>
                    </div>
                    <div className="pb-16">
                        <div className="cn-6">When do you want the pipeline to execute?</div>
                        <div className="cn-9">Manual</div>
                    </div>
                </div>
                <div className="pl-16 pr-16 pt-16">
                    <div className="pb-16">
                        <div className="cn-6">Chart version</div>
                        <div className="cn-9">3.8.0</div>
                    </div>
                    <div className="pb-16">
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">Disabled</div>
                    </div>
                    <div className="pb-16">
                        <div className="cn-6">When do you want the pipeline to execute?</div>
                        <div className="cn-9">Manual</div>
                    </div>
                </div>
            </div>
            <div className="form__row form__row--code-editor-container en-2 bw-1 br-4 mr-20 ml-20">
                <div className="border-bottom br-4 pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">values.yaml</div>
                <div className="code-editor-container">
                    <CodeEditor
                        // value={state ? state.duplicate ? YAML.stringify(state.duplicate, { indent: 2 }) : YAML.stringify(state.data.globalConfig, { indent: 2 }) : ""}
                        onChange={(res) => setTempValue(res)}
                        defaultValue={
                            state && state.data && state.duplicate
                                ? YAML.stringify(state.data.globalConfig, { indent: 2 })
                                : ''
                        }
                        mode="yaml"
                        readOnly={!state.duplicate}
                        loading={chartRefLoading}
                    ></CodeEditor>
                </div>
            </div>
        </div>
    );
}

export default DeploymentTemplateHistory;
