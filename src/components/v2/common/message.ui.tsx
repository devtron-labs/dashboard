import React from 'react'
import { ReactComponent as InfoIcon } from '../assets/icons/ic-info-outline-gray.svg'
import { Spinner } from 'patternfly-react';
import { Pod as PodIcon } from '../../common';


export enum MsgUIType {
    LOADING = 'loading',
    POD = 'pod'
}

export interface MsgUIProps {
    msg: string
    icon?: MsgUIType
    bodyStyle?: any
    msgStyle?: any
    size: number
}

const MessageUI: React.FC<MsgUIProps> = ({ msg, icon, bodyStyle, msgStyle, size }) => {
    return (
        <div className='flex column' style={{ ...bodyStyle, paddingTop: '100px' }}>
            <div>
                {(() => {
                    switch (icon) {
                        case MsgUIType.LOADING:
                            return <Spinner loading></Spinner>
                        case MsgUIType.POD:
                            return <PodIcon color="var(--N400)" style={{ width: '48px', height: '48px', marginBottom: '12px' }} />
                        default:
                            return <InfoIcon width={size} height={size}/>
                    }
                })()}
            </div>
            <div className='fs-14' style={{ ...msgStyle, marginTop: '8px', color: 'rgb(156, 148, 148)' }}>{msg}</div>
        </div>
    )
}


export default MessageUI

