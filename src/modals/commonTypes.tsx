export class ServerError {
    code: number;
    internalMessage: string | null;
    userMessage: string | null;
    moreInfo?: string | null;

    constructor(error) {
        this.code = error.code || 0;
        this.userMessage = error.userMessage || '';
        this.internalMessage = error.internalMessage || '';
        this.moreInfo = error.moreInfo || '';
    }
}

export class ServerErrors extends Error {
    code: number;
    errors: ServerError[];

    constructor(obj: { code: number; errors: ServerError[] }) {
        super();
        this.code = obj.code;
        let message = obj.errors.reduce((str: string, err: ServerError) => {
            str += `${err.internalMessage || err.userMessage}`;
            return str;
        }, '');
        this.name = `[${obj.code.toString()}]`;
        this.message = message;
        this.errors = obj.errors.map((err) => new ServerError(err));
    }
}
export interface ForceDeleteDialogType {
  onClickDelete: () => void
  closeDeleteModal: () => void
  forceDeleteDialogTitle: string
  forceDeleteDialogMessage: string
}
