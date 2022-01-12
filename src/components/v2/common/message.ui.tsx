import React from 'react';
import { ReactComponent as InfoIcon } from '../assets/icons/ic-info-outline-gray.svg';
import { Spinner } from 'patternfly-react';
import { Pod as PodIcon, Progressing } from '../../common';

export enum MsgUIType {
    LOADING = 'loading',
    POD = 'pod',
    NO_CONTAINER = 'no_container',
}

export interface MsgUIProps {
    msg: string;
    icon?: MsgUIType;
    bodyStyle?: any;
    msgStyle?: any;
    size: number;
}

const MessageUI: React.FC<MsgUIProps> = ({ msg, icon, bodyStyle, msgStyle, size = 24 }) => {
    return (
        <div className="flex column dark-background w-100 " style={{ ...bodyStyle, minHeight: '600px' }}>
            <div>
                {(() => {
                    switch (icon) {
                        case MsgUIType.LOADING:
                            return (
                                <div className="fcn-0">
                                    <Progressing />
                                </div>
                            );
                        case MsgUIType.POD:
                            return (
                                <PodIcon
                                    color="var(--N400)"
                                    style={{ width: '48px', height: '48px', marginBottom: '12px' }}
                                />
                            );
                        case MsgUIType.NO_CONTAINER:
                            return (
                                <div className="no-pod__container-icon">
                                    {Array(6)
                                        .fill(0)
                                        .map((z, idx) => (
                                            <span key={idx} className="bcn-0"></span>
                                        ))}
                                </div>
                            );
                        default:
                            return <InfoIcon className="fcn-0" width={size} height={size} />;
                    }
                })()}
            </div>
            <div className="fs-14" style={{ ...msgStyle, marginTop: '8px', color: 'white' }}>
                {msg}
            </div>
        </div>
    );
};

export default MessageUI;
