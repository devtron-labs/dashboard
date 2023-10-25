import { SyntheticEvent } from "react";

export interface EditCatalogModalProps {
    onClose: (e: SyntheticEvent) => void
}

export interface CatalogProps {
    updatedBy: string
    updatedOn: string
}
