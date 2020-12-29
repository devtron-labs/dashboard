export class ValidationRules {
    private showErrors: boolean;

    getShowErrors = (): boolean => {
        return this.showErrors;
    }

    setShowErrors = () => {
        this.showErrors = true;
    }

    clearShowErrors = () => {
        this.showErrors = false;
    }


    checkoutPath = (artifactList: any[]): { isValid: boolean, message: string } => {
        if (!this.showErrors) return { isValid: false, message: '' };

        if (artifactList.length > 1) {
            let isValid = artifactList.reduce((isValid: boolean, artifact) => {
                return (isValid && artifact.checkoutPath.length > 0)
            }, true);
            return { isValid, message: isValid ? '' : 'Mandatory for using multi-git' };
        }
        return { isValid: true, message: '' };
    }

    url = (url: string): { isValid: boolean, message: string } => {
        if (!this.showErrors) return { isValid: false, message: '' };

        if ((url.length > 0)) return { isValid: true, message: '' };
        else return { isValid: false, message: 'This is a required field' };
    }

    isGitProvider = (material) => {
        if (!this.showErrors) return { isValid: false, message: '' };

        if ((material.gitProviderId)) return { isValid: true, message: '' };
        else return { isValid: false, message: 'This is a required field' };
    }
    
    checkoutpathOld = (value: string, multi: boolean): { message: string | null, result: string | null, isValid: boolean } => {
        if (value.length === 0) return { message: null, result: null, isValid: false };

        if (multi && (value === "./" || !value.startsWith("./"))) {
            return { message: "Invalid Path", result: 'error', isValid: false };
        }
        else
            return { message: null, result: null, isValid: true };
    }

} 
