import React, { useEffect, useState } from 'react';
import { showError } from '../../../common';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import HistoryDiff from './HistoryDiff';
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service';
import { useParams } from 'react-router';

function CompareViewDeployment({
    showTemplate,
    setShowTemplate,
    baseTimeStamp
    
}: {
    showTemplate: boolean;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string
}) {
    const [deploymentTemplateDiff, setDeploymentTemplateDiff] = useState([]);
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] = useState<{ value: string; label: string }>();
    const [currentConfiguration, setCurrentConfiguration] = useState<any>();
    const { appId, pipelineId } = useParams<{ appId; pipelineId }>();

    useEffect(() => {
        if (selectedDeploymentTemplate) {
            try {
                getDeploymentTemplateDiffId(appId, pipelineId, selectedDeploymentTemplate.value).then((response) => {
                    setCurrentConfiguration(response.result);
                });
            } catch (err) {
                showError(err);
            }
        }
    }, [selectedDeploymentTemplate]);

    useEffect(() => {
        try {
            getDeploymentTemplateDiff(appId, pipelineId).then((response) => {
                setDeploymentTemplateDiff(response.result);
            });

            if (!showTemplate) {
                setShowTemplate(true);
            }
        } catch (err) {
            showError(err);
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
                baseTimeStamp={baseTimeStamp}
            />
            <HistoryDiff currentConfiguration={currentConfiguration} />
        </div>
    );
}

export default CompareViewDeployment;
