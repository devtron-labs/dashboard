import { HelpOptionType } from "./header.type";
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as EditFile } from '../../../assets/icons/ic-edit-file.svg'
import { ReactComponent as Files } from '../../../assets/icons/ic-files.svg'

export const EnterpriseHelpOptions: HelpOptionType[] = [

    {
        name: 'Open New Ticket',
        link: 'https://enterprise.devtron.ai/portal/en/newticket',
        icon: EditFile,
    },
    {
        name: 'View All Tickets',
        link: 'https://enterprise.devtron.ai/portal/en/myarea',
        icon: Files,
    },

]

export const NotEnterpriseHelpOptions: HelpOptionType[] = [

    {
        name: 'Chat with support',
        link: 'https://discord.devtron.ai/',
        icon: Chat,
        showSeparator: true,
    },

    {
        name: 'Raise an issue/request',
        link: 'https://github.com/devtron-labs/devtron/issues/new/choose',
        icon: EditFile,
    }
]
