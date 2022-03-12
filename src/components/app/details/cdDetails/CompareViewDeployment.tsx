import React, { useEffect, useState } from 'react';
import { showError } from '../../../common';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import HistoryDiff from './HistoryDiff';
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service';
import { useParams } from 'react-router';

function CompareViewDeployment() {
    const [deploymentTemplateDiff, setDeploymentTemplateDiff] = useState([]);
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] = useState<{ value: string; label: string }>();
    const [currentTemplate, setCurrentTemplate] = useState<any>();
    const { appId, envId, pipelineId } = useParams<{ appId; envId; pipelineId }>();

    useEffect(() => {
        if (selectedDeploymentTemplate) {
            try {
                getDeploymentTemplateDiffId(appId, pipelineId, selectedDeploymentTemplate.value).then((response) => {
                    setCurrentTemplate(response.result);
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
                let currentId = response.result.map((res) => res.id);
            });
        } catch (err) {
            showError(err);
        }
    }, []);

    return (
        <div>
            <CompareWithBaseConfig
                deploymentTemplateDiffRes={deploymentTemplateDiff}
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSeletedDeploymentTemplate={setSeletedDeploymentTemplate}
            />
            <HistoryDiff currentTemplate={currentTemplate} />
        </div>
    );
}

export default CompareViewDeployment;
