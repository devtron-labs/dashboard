import { HelpOptionType } from "./header.type";
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as EditFile } from '../../../assets/icons/ic-edit-file.svg'
import { ReactComponent as Files } from '../../../assets/icons/ic-files.svg'
import { DISCORD_LINK, OPEN_NEW_TICKET, RAISE_ISSUE, VIEW_ALL_TICKETS } from "../../../config";

export const EnterpriseHelpOptions: HelpOptionType[] = [

    {
        name: 'Open new ticket',
        link: OPEN_NEW_TICKET,
        icon: EditFile,
    },
    {
        name: 'View all tickets',
        link: VIEW_ALL_TICKETS,
        icon: Files,
    },

]

export const OSSHelpOptions: HelpOptionType[] = [

    {
        name: 'Chat with support',
        link: DISCORD_LINK,
        icon: Chat,
        showSeparator: true,
    },

    {
        name: 'Raise an issue/request',
        link: RAISE_ISSUE,
        icon: EditFile,
    }
]
