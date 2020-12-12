interface FileReaderEventTarget extends EventTarget {
    result:string
}

export interface FileReaderEvent<T> extends ProgressEvent {
    target: FileReaderEventTarget;
    getMessage():string;
}
