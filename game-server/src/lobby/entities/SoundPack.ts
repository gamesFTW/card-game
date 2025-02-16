export interface SoundPack {
    _id: string;
    name: string;
    sounds: Sounds;
}

export interface Sounds {
    [key: string]: string;
    attack: string;
    die: string;
    move: string;
    select: string;
    play: string;
}
