import React, { useEffect } from 'react';
import ReactSelect from 'react-select';
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-forward.svg';
import { multiSelectStyles, Select } from '../../../common';
import { useHistory, useRouteMatch } from 'react-router';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { Moment12HourFormat } from '../../../../config';

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
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
}

function CompareWithBaseConfig({
    deploymentTemplateDiffRes,
    selectedDeploymentTemplate,
    setSeletedDeploymentTemplate,
    setShowTemplate,
}: CompareWithBaseConfig) {
    const { url } = useRouteMatch()
    const history = useHistory()
    const deploymentTemplateOption: { label: string; value: string }[] = deploymentTemplateDiffRes.map((p) => {
        return { value: String(p.id), label: moment(p.deployedOn).format(Moment12HourFormat) };
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
        if (!selectedDeploymentTemplate && deploymentTemplateOption && deploymentTemplateOption.length > 0) {
            setSeletedDeploymentTemplate(deploymentTemplateOption[0]);
        }
    }, [deploymentTemplateOption]);

    return (
        <div className="border-bottom pl-20 pr-20 flex left bcn-0">
            <div className="border-right flex">
                {/* TODO: use To instead of history.goBack(); */}
                <NavLink
                  className=''
                    to=""
                    onClick={(e) => {
                        e.preventDefault();
                        setShowTemplate(false);
                        history.goBack();
                    }}
                >
                    <LeftIcon className="rotate icon-dim-24 mr-16" style={{ ['--rotateBy' as any]: '180deg' }} />
                </NavLink>
                <div className='pt-12 pb-12 pl-4 border-left pr-12'>
                    <div className="cn-6 pl-12">Compare with</div>
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
            <div className="pt-12 pb-12 pl-16 pr-16">
                <span className="cn-6">Base configuration</span>
                <div>Mon, 17 Jun 2019, 11:32 AM</div>
            </div>
        </div>
    );
}

export default CompareWithBaseConfig;
