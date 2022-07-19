import { RouteComponentProps } from 'react-router'
import { ServerError } from '../../modals/commonTypes'
import { ResponseType } from '../../services/service.types'

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
