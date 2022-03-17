import React, { useEffect, useState } from 'react';
import { showError, sortCallback } from '../../../common';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import HistoryDiff from './HistoryDiff';
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service';
import { useParams } from 'react-router';

function CompareViewDeployment({
    showTemplate,
    setShowTemplate,
}: {
    showTemplate: boolean;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [deploymentTemplateDiff, setDeploymentTemplateDiff] = useState([]);
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] =
        useState<{ value: string; label: string; author: string; status: string }>();
    const [currentConfiguration, setCurrentConfiguration] = useState<any>();
    const { appId, pipelineId } = useParams<{ appId; pipelineId }>();
    const [loader, setLoader] = useState(false);
    const [baseTemplateId, setBaseTemplateId] = useState<number | string>();
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<any>();
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
                setDeploymentTemplateDiff(response.result.sort((a, b) => sortCallback('id', b, a)));
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
                deploymentTemplateDiffRes={deploymentTemplateDiff}
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
