import React, { useEffect, useState } from 'react';
import { showError, sortCallback } from '../../../common';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import HistoryDiff from './HistoryDiff';
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service';
import { useParams } from 'react-router';
import { DeploymentTemplateConfiguration } from './cd.type';
import EmptyState from '../../../EmptyState/EmptyState';
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png';

function CompareViewDeployment({
    showTemplate,
    setShowTemplate,
}: {
    showTemplate: boolean;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { appId, pipelineId, compareId } = useParams<{ appId; pipelineId, compareId }>();
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

    // Will be picking later on

    // useEffect(()=>{
    //     setLoader(true);
    //     if (compareId) {
    //         try {
    //             getDeploymentTemplateDiffId(appId, pipelineId, compareId).then((response) => {
    //                 setCurrentConfiguration(response.result);
    //                 setLoader(false);
    //             });
    //         } catch (err) {
    //             showError(err);
    //         }
    //     }
    // },[compareId])

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

    const NoCDHistortData = () => {
     return   <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className='fw-6 fs-16'>Data not available</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Deployed configurations is not available for older deployments
            </EmptyState.Subtitle>
        </EmptyState>
    };

    return (!deploymentTemplatesConfiguration && deploymentTemplatesConfiguration.length < 1 && !loader )? (
        <>{NoCDHistortData()}</>
    ) : (
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
