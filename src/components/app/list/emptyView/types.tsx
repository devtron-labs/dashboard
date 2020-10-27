import { RouteComponentProps } from "react-router-dom";

export interface EmptyProps  {
    title: string;
    view: string;
    message: string;
    buttonLabel: string;
    clickHandler: (e) => void;
}
