import { RouteComponentProps } from 'react-router-dom';

export const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config',
    STACK_MANAGER: 'stack-manager'
}

export const COMMAND_REV = {
    app: 'Applications',
    chart: 'Charts',
    security: 'Security',
    env: 'environments',
    misc: 'misc',
    none: 'none',
    'global-config': 'Global Config',
}


export interface CommandProps extends RouteComponentProps<{}> {
    isCommandBarActive: boolean;
    toggleCommandBar: (flag: boolean) => void;
}

export interface ArgumentType {
    value: string;
    ref: any;
    readonly data: {
        readonly value?: string | number;
        readonly kind?: string;
        readonly url?: string;
        readonly group?: string;
        readonly isEOC: boolean;
    }
}

export interface CommandState {
    argumentInput: string;
    command: { label: string; argument: ArgumentType; }[];
    arguments: ArgumentType[];
    readonly allSuggestedArguments: ArgumentType[];
    suggestedArguments: ArgumentType[];
    isLoading: boolean;
    isSuggestionError: boolean;
    focussedArgument: number; //index of the higlighted argument
    tab: 'jump-to' | 'this-app';
    groupName: string | undefined;
}

export const PlaceholderText = "Search";

export type CommandSuggestionType = { allSuggestionArguments: ArgumentType[], groups: any[] }