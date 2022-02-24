import React from 'react';
import ReactSelect from 'react-select';
import { menuList } from '../../../charts/charts.util';
import { DropdownIndicator } from '../appDetails/utils';
import { styles } from '../metrics/deploymentMetrics.util';

function CompareWithBaseConfig() {
  return <div className='border-bottom ml-20 mr-20 mt-12 mb-12'>
    <div>
     <div>Compare with</div> 
							<ReactSelect
              className='w-200'
								components={{
									IndicatorSeparator: null,
									DropdownIndicator
								}}
                value={{label:'tetsinh', value: 'testing'}}
								placeholder="Select Project"
								styles={{
									...styles,
									...menuList,
								}}
							/>
    </div>
     
  </div>;
}

export default CompareWithBaseConfig;
