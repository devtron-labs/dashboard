import React, { useEffect } from 'react';
import ReactSelect, { components } from 'react-select';
import { multiSelectStyles, Select } from '../../../common';
import { useHistory, useRouteMatch } from 'react-router';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { Moment12HourFormat } from '../../../../config';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg';
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-forward.svg';
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
    selectedDeploymentTemplate: { label: string; value: string; author: string };
    setSeletedDeploymentTemplate: (selected) => void;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string;
}

function CompareWithBaseConfig({
    deploymentTemplateDiffRes,
    selectedDeploymentTemplate,
    setSeletedDeploymentTemplate,
    setShowTemplate,
    baseTimeStamp,
}: CompareWithBaseConfig) {
    const { url } = useRouteMatch();
    const history = useHistory();
    const deploymentTemplateOption: { label: string; value: string; author: string }[] = deploymentTemplateDiffRes.map(
        (p) => {
            return { value: String(p.id), label: moment(p.deployedOn).format(Moment12HourFormat), author: p.emailId };
        },
    );
    const onClickTimeStampSelector = (selected: { label: string; value: string }) => {
        handleSelector(selected.value);
        setSeletedDeploymentTemplate(selected);
    };

    const handleSelector = (deploymentId) => {
        let deploymentTemp = deploymentTemplateDiffRes.find((e) => e.id.toString() === deploymentId.toString());
        setSeletedDeploymentTemplate(deploymentTemp);
    };

    useEffect(() => {
        if (!selectedDeploymentTemplate && deploymentTemplateOption && deploymentTemplateOption.length > 0) {
            setSeletedDeploymentTemplate(deploymentTemplateOption[0]);
        }
    }, [deploymentTemplateOption]);

    return (
        <div className="border-bottom pl-20 pr-20 flex left bcn-0">
            <div className="border-right flex">
                {/* TODO: use To instead of history.goBack(); */}
                <NavLink
                    className=""
                    to=""
                    onClick={(e) => {
                        e.preventDefault();
                        setShowTemplate(false);
                        history.goBack();
                    }}
                >
                    <LeftIcon className="rotate icon-dim-24 mr-16" style={{ ['--rotateBy' as any]: '180deg' }} />
                </NavLink>
                <div className="pt-12 pb-12 pl-4 border-left pr-12">
                    <div className="cn-6 pl-12">Compare with</div>
                    <div style={{ minWidth: '200px' }}>
                        <ReactSelect
                            placeholder="Select Timestamp"
                            styles={{
                                ...multiSelectStyles,
                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: 'transparent',
                                    minHeight: '24px !important',
                                    cursor: 'pointer',
                                    border: 0,
                                    padding: 0
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
                                    cursor: 'pointer',
                                   
                                }),
                            }}
                            onChange={onClickTimeStampSelector}
                            options={deploymentTemplateOption}
                            components={{
                                IndicatorSeparator: null,
                                Option: (props) => {
                                    return (
                                        <components.Option {...props}>
                                            <div className="flex left">
                                                {props.isSelected ? (
                                                    <div>
                                                        <Check className="icon-dim-16 scb-5 mr-8" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-block icon-dim-16 mr-8"></div>
                                                )}

                                                <div>
                                                    <div> {props.label}</div>
                                                    <div>{props.data.author}</div>
                                                </div>
                                            </div>
                                        </components.Option>
                                    );
                                },
                            }}
                            value={selectedDeploymentTemplate || deploymentTemplateOption[0]}
                        />
                    </div>
                </div>
            </div>
            <div className="pt-12 pb-12 pl-16 pr-16">
                <span className="cn-6">Base configuration</span>
                <div className="cn-9">{baseTimeStamp}</div>
            </div>
        </div>
    );
}

export default CompareWithBaseConfig;
