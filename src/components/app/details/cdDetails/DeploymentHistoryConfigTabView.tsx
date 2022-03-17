import React, { useEffect, useState } from 'react';
import { showError, sortCallback } from '../../../common';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import HistoryDiff from './HistoryDiff';
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service';
import { useParams } from 'react-router';
import {
    DeploymentTemplateConfiguration,
    DeploymentTemplateOptions,
    CompareViewDeploymentType,
    DeploymentTemplateViaTargetResponse,
} from './cd.type';
import CDEmptyState from './CDEmptyState';

function CompareViewDeployment({
    showTemplate,
    setShowTemplate,
    baseTimeStamp,
    baseTemplateId,
    setBaseTemplateId,
}: CompareViewDeploymentType) {
    const { appId, pipelineId } = useParams<{ appId: string; pipelineId: string }>();
    const [deploymentTemplatesConfiguration, setDeploymentTemplatesConfiguration] = useState<
        DeploymentTemplateViaTargetResponse[]
    >([]);
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] = useState<DeploymentTemplateOptions>();
    const [currentConfiguration, setCurrentConfiguration] = useState<DeploymentTemplateConfiguration>();
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<DeploymentTemplateConfiguration>();

    const [loader, setLoader] = useState<boolean>(false);
    const [codeEditorLoading, setCodeEditorLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoader(true);
        if (selectedDeploymentTemplate) {
            try {
                getDeploymentTemplateDiffId(appId, pipelineId, +selectedDeploymentTemplate.value).then((response) => {
                    setCurrentConfiguration(response.result);
                    setLoader(false);
                });
            } catch (err) {
                showError(err);
                setLoader(false);
            }
        }
    }, [selectedDeploymentTemplate]);

    useEffect(() => {
        try {
            setCodeEditorLoading(true);
            if (baseTemplateId) {
                getDeploymentTemplateDiffId(appId, pipelineId, baseTemplateId).then((response) => {
                    setBaseTemplateConfiguration(response.result);
                    setCodeEditorLoading(false);
                });
            }
        } catch (err) {
            showError(err);
            setCodeEditorLoading(false);
        }
    }, [baseTemplateId]);

    useEffect(() => {
        setLoader(true);
        try {
            getDeploymentTemplateDiff(appId, pipelineId).then((response) => {
                setDeploymentTemplatesConfiguration(response.result.sort((a, b) => sortCallback('id', b, a)));
                setLoader(false);
            });

            if (!showTemplate) {
                setShowTemplate(true);
            }
        } catch (err) {
            showError(err);
            setLoader(false);
        }

        return (): void => {
            if (showTemplate) {
                setShowTemplate(false);
            }
        };
    }, [pipelineId]);

    return !deploymentTemplatesConfiguration && deploymentTemplatesConfiguration.length < 1 && !loader ? (
        <CDEmptyState />
    ) : (
        <>
            <CompareWithBaseConfig
                deploymentTemplatesConfiguration={deploymentTemplatesConfiguration}
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSeletedDeploymentTemplate={setSeletedDeploymentTemplate}
                setShowTemplate={setShowTemplate}
                setBaseTemplateId={setBaseTemplateId}
                baseTemplateId={baseTemplateId}
                baseTimeStamp={baseTimeStamp}
            />
            <HistoryDiff
                currentConfiguration={currentConfiguration}
                loader={loader}
                codeEditorLoading={codeEditorLoading}
                baseTemplateConfiguration={baseTemplateConfiguration}
            />
        </>
    );
}

export default CompareViewDeployment;
