import { PATTERNS } from "../../config";

export class ValidationRules {

    name = (name: string): { isValid: boolean, message: string } => {
        if ((name.length)) {
            let regex = new RegExp(PATTERNS.CD_PIPELINE_NAME);
            if (regex.test(name)) return { isValid: true, message: null };
            else return {
                isValid: false,
                message: `Must follow the pattern ${PATTERNS.CD_PIPELINE_NAME}`
            };
        }
        else return { isValid: false, message: 'This is a required field' };
    }

    environment = (id: number): { isValid: boolean, message: string } => {
        if (!id) return { isValid: false, message: 'This is a required field' };
        else return { isValid: true, message: null };
    }

    isGitProvider = (material) => {
        if ((material.gitProviderId)) return { isValid: true, message: '' };
        else return { isValid: false, message: 'This is a required field' };
    }
    namespace = this.name;
} 
