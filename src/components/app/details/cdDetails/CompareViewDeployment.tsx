import React, { useEffect, useState } from 'react';
import { showError, sortCallback } from '../../../common';
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
    baseTimeStamp: string;
}) {
    const [deploymentTemplateDiff, setDeploymentTemplateDiff] = useState([]);
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] = useState<{ value: string; label: string; author: string; status: string }>();
    const [currentConfiguration, setCurrentConfiguration] = useState<any>();
    const { appId, pipelineId } = useParams<{ appId; pipelineId }>();
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        setLoader(true)
        if (selectedDeploymentTemplate) {
            try {
                getDeploymentTemplateDiffId(appId, pipelineId, selectedDeploymentTemplate.value).then((response) => {
                    setCurrentConfiguration(response.result);
                        setLoader(false)
                });
            } catch (err) {
                showError(err);
            }
        }
    }, [selectedDeploymentTemplate]);

    useEffect(() => {
        setLoader(true)
        try {

            getDeploymentTemplateDiff(appId, pipelineId).then((response) => {
                setDeploymentTemplateDiff(response.result.sort((a, b) => sortCallback('id', b, a)))
                setLoader(false)
            });

            if (!showTemplate) {
                setShowTemplate(true);
            }
        } catch (err) {
            showError(err);
            setLoader(false)
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
            <HistoryDiff currentConfiguration={currentConfiguration} loader={loader} />
        </div>
    );
}

export default CompareViewDeployment;
