import { useContext } from "react";
import { DOCUMENTATION } from "../../../config";
import { HelpOptionType } from "./header.type";
import { ReactComponent as Discord } from '../../../assets/icons/ic-discord-fill.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as EditFile } from '../../../assets/icons/ic-edit-file.svg'
import { ReactComponent as Files } from '../../../assets/icons/ic-files.svg'
import { InstallationType } from "../../v2/devtronStackManager/DevtronStackManager.type";
import { mainContext } from "../navigation/NavigationRoutes";


export const { currentServerInfo } = useContext(mainContext)
export const isEnterprise = currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
export const FEEDBACK_FORM_ID = `UheGN3KJ#source=${window.location.hostname}`

export const CommonHelpOptions: HelpOptionType[] = [
    {
        name: 'View documentation',
        link: DOCUMENTATION.HOME_PAGE,
        icon: File,
        showSeparator: true,
    },
    
    {
        name: 'Join discord community',
        link: 'https://discord.devtron.ai/',
        icon: Discord,
        showSeparator: isEnterprise,
    },
    
]

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