import React, { useEffect } from 'react';
import ReactSelect from 'react-select';
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-forward.svg';
import { multiSelectStyles, Select } from '../../../common';
import { useParams } from 'react-router';

interface DeploymentTemplateDiffRes {
    appId: number;
    deployed: boolean;
    deployedBy: number;
    deployedOn: string;
    emailId: string;
    id: string;
    pipelineId: number;
}
interface CompareWithBaseConfig {
    deploymentTemplateDiffRes: DeploymentTemplateDiffRes[];
    selectedDeploymentTemplate: { label: string; value: string };
    setSeletedDeploymentTemplate: (selected) => void;
}

function CompareWithBaseConfig({
    deploymentTemplateDiffRes,
    selectedDeploymentTemplate,
    setSeletedDeploymentTemplate,
}: CompareWithBaseConfig) {
    const { appId, pipelineId } = useParams<{ appId; pipelineId }>();

    let deploymentTemplateOption: { label: string; value: string }[] = deploymentTemplateDiffRes.map((p) => {
        return { value: String(p.id), label: p.deployedOn };
    });

    const onClickTimeStampSelector = (selected: { label: string; value: string }) => {
        handleSelector(selected.value);
        setSeletedDeploymentTemplate(selected);
    };

    const handleSelector = (deploymentId) => {
        let deploymentTemp = deploymentTemplateDiffRes.find((e) => e.id.toString() === deploymentId.toString());
        setSeletedDeploymentTemplate(deploymentTemp);
    };

    useEffect(() => {
        if (deploymentTemplateOption && deploymentTemplateOption.length > 0) {
            setSeletedDeploymentTemplate(deploymentTemplateOption[0]);
        }
    }, []);

    return (
        <div className="border-bottom pl-20 pr-20 pt-12 pb-12 flex left">
            <div className="border-right flex">
                <a href="">
                    <LeftIcon className="rotate icon-dim-20 mr-16" style={{ ['--rotateBy' as any]: '180deg' }} />
                </a>
                <div>
                    <div className="cn-6">Compare with</div>
                    <div style={{ minWidth: '200px' }}>
                        <ReactSelect
                            placeholder="Select Timestamp"
                            styles={{
                                ...multiSelectStyles,
                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
                                control: (base, state) => ({
                                    ...base,
                                    borderColor: 'transparent',
                                    backgroundColor: 'transparent',
                                    minHeight: '24px !important',
                                    cursor: 'pointer',
                                }),
                                singleValue: (base, state) => ({
                                    ...base,
                                    fontWeight: 600,
                                    color: '#06c',
                                    direction: 'rtl',
                                    marginLeft: '2px',
                                }),
                                indicatorsContainer: (provided, state) => ({
                                    ...provided,
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                    color: 'var(--N900)',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    direction: 'rtl',
                                    cursor: 'pointer',
                                }),
                            }}
                            onChange={onClickTimeStampSelector}
                            options={deploymentTemplateOption}
                            components={{
                                IndicatorSeparator: null,
                            }}
                            value={selectedDeploymentTemplate || deploymentTemplateOption[0]}
                        />
                    </div>
                </div>
            </div>
            <div className="ml-16">
                <span className="cn-6">Base configuration</span>
                <div>Mon, 17 Jun 2019, 11:32 AM</div>
            </div>
        </div>
    );
}

export default CompareWithBaseConfig;
