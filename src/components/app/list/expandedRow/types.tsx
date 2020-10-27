import { App } from "../types";

export interface ExpandedRowProps {
    app: App;
    handleEdit: (appId: number) => void;
    openTriggerInfoModal: (appId: number | string, ciArtifactId: number, commit: string) => void;
    redirect: (app, envId: number) => string;
    close: () => void;
}