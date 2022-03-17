import React, { useEffect, useState } from 'react';
import { showError, sortCallback } from '../../../common';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import HistoryDiff from './HistoryDiff';
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service';
import { useParams } from 'react-router';
import { DeploymentTemplateConfiguration } from './cd.type';

function CompareViewDeployment({
    showTemplate,
    setShowTemplate,
}: {
    showTemplate: boolean;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { appId, pipelineId } = useParams<{ appId; pipelineId }>();
    const [deploymentTemplatesConfiguration, setDeploymentTemplatesConfiguration] = useState([]);
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] =
        useState<{ value: string; label: string; author: string; status: string }>();
    const [currentConfiguration, setCurrentConfiguration] = useState<DeploymentTemplateConfiguration>();
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<DeploymentTemplateConfiguration>();

    const [loader, setLoader] = useState<boolean>(false);
    const [baseTemplateId, setBaseTemplateId] = useState<number | string>();
    const [codeEditorLoading, setCodeEditorLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoader(true);
        if (selectedDeploymentTemplate) {
            try {
                getDeploymentTemplateDiffId(appId, pipelineId, selectedDeploymentTemplate.value).then((response) => {
                    setCurrentConfiguration(response.result);
                    setLoader(false);
                });
            } catch (err) {
                showError(err);
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
    }, []);

    return (
        <div>
            <CompareWithBaseConfig
                deploymentTemplatesConfiguration={deploymentTemplatesConfiguration}
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSeletedDeploymentTemplate={setSeletedDeploymentTemplate}
                setShowTemplate={setShowTemplate}
                setBaseTemplateId={setBaseTemplateId}
                baseTemplateId={baseTemplateId}
            />
            <HistoryDiff
                currentConfiguration={currentConfiguration}
                loader={loader}
                codeEditorLoading={codeEditorLoading}
                baseTemplateConfiguration={baseTemplateConfiguration}
            />
        </div>
    );
}

export default CompareViewDeployment;
