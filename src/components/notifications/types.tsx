import { RouteComponentProps } from 'react-router'
import { ServerError, ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export interface NotifierProps extends RouteComponentProps<{ id: string }> {}

export interface NotifierState {
    code: number
    errors: ServerError[]
    successMessage: string | null
    channel: string
}
export interface SMTPConfigResponseType extends ResponseType {
    result?: {
        configName: string
        port: number
        host: string
        authUser: string
        authPassword: string
        fromEmail: string
        default: boolean
    }
}

export enum EMAIL_AGENT {
    SES = 'SES',
    SMTP = 'SMTP',
}

export interface SMTPConfigModalProps {
    smtpConfigId: number
    shouldBeDefault: boolean
    selectSMTPFromChild?: (smtpConfigId: number) => void
    onSaveSuccess: () => void
    closeSMTPConfigModal: (event) => void
}

export interface SMTPConfigModalState {
    view: string
    form: {
        configName: string
        port: number
        host: string
        authUser: string
        authPassword: string
        fromEmail: string
        default: boolean
        isLoading: boolean
        isError: boolean
    }
    isValid: {
        configName: boolean
        port: boolean
        host: boolean
        authUser: boolean
        authPassword: boolean
        fromEmail: boolean
    }
}

export interface WebhookConfigModalProps {
    webhookConfigId: number;
    onSaveSuccess: () => void;
    closeWebhookConfigModal: (event) => void;
}

export interface WebhhookConfigModalState {
    view: string;
    form: {
        configName: string;
        webhookUrl: string;
        isLoading: boolean;
        isError: boolean;
        payload: string;
        header: HeaderType[];
    };
    isValid: {
        configName: boolean;
        webhookUrl: boolean;
        payload: boolean;
    };
    webhookAttribute: Record<string, string>;
    copyAttribute: boolean;
}

export interface HeaderType {
    key: string
    value: string
}

export interface CreateHeaderDetailsType {
    index: number;
    headerData: HeaderType;
    setHeaderData: (index: number, headerData: HeaderType) => void;
    removeHeader?: (index: number) => void;
    headerIndex?: number;
}

export interface HeaderValueSelectorType {
    selectedHeaderIndex: number;
    headerData: HeaderType,
    setHeaderData: (index: number, headerData: HeaderType) => void;
    headerInputType: "key" | "value";
    placeholder: string
    headerIndex: number,
}