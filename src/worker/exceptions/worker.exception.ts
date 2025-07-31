export class WorkerException extends Error {
    readonly isFatal: boolean = false;

    constructor(message: string, isFatal?: boolean) {
        super(message);

        this.isFatal = isFatal ?? this.isFatal;
    }
}
