import React from 'react';
import { ReactComponent as InfoIcon } from '../assets/icons/ic-info-outline-gray.svg';
import { ReactComponent as MultipleContainer } from '../assets/icons/ic-select-container.svg';
import { Pod as PodIcon, Progressing } from '../../common';

export enum MsgUIType {
    LOADING = 'loading',
    POD = 'pod',
    MULTI_CONTAINER = 'multi_container',
}

export interface MsgUIProps {
    msg: string;
    icon?: MsgUIType;
    bodyStyle?: any;
    msgStyle?: any;
    size: number;
    isShowActionButton?: boolean;
    actionButtonText?: string;
    onActionButtonClick?: () => void;
}

const MessageUI: React.FC<MsgUIProps> = ({
    msg,
    icon,
    bodyStyle,
    msgStyle,
    size = 24,
    isShowActionButton,
    actionButtonText,
    onActionButtonClick,
}) => {
    return (
        <div
            className="text-center dark-background w-100 "
            style={{ ...bodyStyle, paddingTop: '200px', minHeight: '600px', flex: '1' }}
        >
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
                        case MsgUIType.MULTI_CONTAINER:
                            return <MultipleContainer />;
                        default:
                            return <InfoIcon className="fcn-0" width={size} height={size} />;
                    }
                })()}
            </div>
            <div className="fs-14" style={{ ...msgStyle, marginTop: '8px', color: 'white' }}>
                {msg}
            </div>
            {isShowActionButton && (
                <div
                    className="cursor"
                    onClick={onActionButtonClick}
                    style={{ fontSize: '14px', textDecoration: 'underline', color: 'var(--B300)' }}
                >
                    {actionButtonText}
                </div>
            )}
        </div>
    );
};

export default MessageUI;
