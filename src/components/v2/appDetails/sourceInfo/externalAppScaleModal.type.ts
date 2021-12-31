export interface ScaleToZero {
    kind: string;
    name: string;
    isChecked: boolean;
    value: "INTERMEDIATE" | "CHECKED";
}

export interface ScalePodName {
    name: {
        isChecked: boolean;
        value: "INTERMEDIATE" | "CHECKED";
    }
}

export interface ExternalAppScaleModalState {
    view: string;
    scalePodsToZero: ScaleToZero[];
    objectToRestore: ScaleToZero[];
    scalePodName: ScalePodName;
    objectToRestoreName: ScalePodName;
    scalePodLoading: boolean;
    objectToRestoreLoading: boolean;
    showRestore: boolean;
}

export interface ExternalAppScaleModalProps {
    onClose: () => void
} 