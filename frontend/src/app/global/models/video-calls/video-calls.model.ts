import {UserModel} from "../users/user.model";

export interface VideoOptions {
    isMuted: boolean,
    hasCamera: boolean
}

export interface ParticipantWithLiveStatus {
    user: UserModel,
    videoOptions: VideoOptions,
    isInCall: boolean,
    device: string
}
export interface ParticipantWithPosNumber {
    user: UserModel,
    videoOptions: VideoOptions,
    pos: [number,number],
    device: string
}
