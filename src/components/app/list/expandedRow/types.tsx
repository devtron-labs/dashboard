import { App } from "../types";

export interface ExpandedRowProps {
    app: App;
    redirect: (app, envId: number) => string;
    close: () => void;
}