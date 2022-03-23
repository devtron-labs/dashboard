import React from 'react';
import { ReactComponent as InfoIcon } from '../assets/icons/ic-info-outline-gray.svg';
import { ReactComponent as MultipleContainer } from '../assets/icons/ic-select-container.svg';
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg';
import { Pod as PodIcon, Progressing } from '../../common';

export enum MsgUIType {
    LOADING = 'loading',
    POD = 'pod',
    MULTI_CONTAINER = 'multi_container',
    ERROR = 'error',
}

export interface MsgUIProps {
    msg: string;
    icon?: MsgUIType;
    theme?: 'white' | 'dark' | 'light-gray';
    iconClassName?: string;
    bodyStyle?: any;
    msgStyle?: any;
    actionButtonStyle?: any;
    size: number;
    isShowActionButton?: boolean;
    actionButtonText?: string;
    onActionButtonClick?: () => void;
}

const MessageUI: React.FC<MsgUIProps> = ({
    msg,
    icon,
    theme,
    iconClassName,
    bodyStyle,
    msgStyle,
    actionButtonStyle,
    size = 24,
    isShowActionButton,
    actionButtonText,
    onActionButtonClick,
}: MsgUIProps) => {
    return (
        <div
            className={`text-center ${theme || 'dark'}-background w-100 `}
            style={{ paddingTop: '200px', minHeight: '600px', flex: '1', ...bodyStyle }}
        >
            <div>
                {(() => {
                    switch (icon) {
                        case MsgUIType.LOADING:
                            return (
                                <div className={`fcn-0 ${iconClassName || ''}`}>
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
                            return <MultipleContainer className={iconClassName || ''} />;
                        case MsgUIType.ERROR:
                            return <ErrorIcon className={iconClassName || ''} width={size} height={size} />;
                        default:
                            return <InfoIcon className={`fcn-0 ${iconClassName || ''}`} width={size} height={size} />;
                    }
                })()}
            </div>
            <div className="fs-14" style={{ marginTop: '8px', color: 'white', ...msgStyle }}>
                {msg}
            </div>
            {isShowActionButton && (
                <div
                    className="cursor"
                    onClick={onActionButtonClick}
                    style={{
                        fontSize: '14px',
                        textDecoration: 'underline',
                        color: 'var(--B300)',
                        ...actionButtonStyle,
                    }}
                >
                    {actionButtonText}
                </div>
            )}
        </div>
    );
};

export default MessageUI;
