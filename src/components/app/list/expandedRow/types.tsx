import { App } from "../types";

export interface ExpandedRowProps {
    app: App;
    handleEdit: (appId: number) => void;
    redirect: (app, envId: number) => string;
    close: () => void;
}