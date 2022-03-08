import React from 'react';
import ReactSelect from 'react-select';
import { menuList } from '../../../charts/charts.util';
import { DropdownIndicator } from '../appDetails/utils';
import { styles } from '../metrics/deploymentMetrics.util';
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-forward.svg'

function CompareWithBaseConfig() {
    return (
        <div className="border-bottom pl-20 pr-20 pt-12 pb-12 flex left">
            <div className='border-right'>
            <a href=''><LeftIcon className="rotate icon-dim-20 mr-16" style={{ ['--rotateBy' as any]: '180deg' }}/></a>
            <div>
                <div className='cn-6'>Compare with</div>
                <ReactSelect
                    className="w-200"
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                    }}
                    value={{ label: 'tetsinh', value: 'testing' }}
                    placeholder="Select Project"
                    styles={{
                        ...styles,
                        ...menuList,
                    }}
                />
            </div>
            </div>
            <div className="ml-16">
                <span className='cn-6'>Base configuration</span>
                <div>Mon, 17 Jun 2019, 11:32 AM</div>
            </div>
        </div>
    );
}

export default CompareWithBaseConfig;
