export interface Card {
    _id: string;
    counter: number;
    type: string; // creature
    imageName: string;
    text: string;
    date: string;
    hero: boolean;
    imageId: string;
    draft: false;
    big: false;
    summoned: false;
    name: string;
    maxHp: number;
    damage: number;
    manaCost: number;
    movingPoints: number;
    abilities: Abilities;
    tags: string[];
    soundPackId: string;
}

export interface Abilities {}
