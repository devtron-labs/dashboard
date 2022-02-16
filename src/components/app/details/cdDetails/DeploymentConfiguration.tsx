import React from 'react';
import { ReactComponent as RightArrow } from '../../../../assets/icons/ic-arrow-left.svg'

function DeploymentConfiguration() {
  return <div className='m-20 fs-13 cn-9'>
      <div className='bcn-0 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor'>
          Pipeline Configuration
          <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }}/>
      </div>
      <div className='bcn-0 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor'>
         <div>Deployment Change <span className='cn-6 ml-4'>2 changes from previous deployment</span></div> 
          <span ><RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }}/></span>
     </div>

     <div className='fw-6 mb-16'>ConfigMaps</div>
     <div className='bcn-0 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor'>
          random-configuration
          <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }}/>
      </div>
      <div className='bcn-0 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor'>
         <div>dashboard-cm <span className='cn-6 ml-4'>2 changes from previous deployment</span></div> 
          <span ><RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }}/></span>
     </div>

     <div className='fw-6 mb-16'>Secrets</div>
     <div className='bcn-0 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor'>
          secret-is-the-key
          <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }}/>
      </div>

  </div>;
}

export default DeploymentConfiguration;
