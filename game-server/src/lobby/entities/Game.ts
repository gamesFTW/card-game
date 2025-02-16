export interface Game {
    _id: string;
    type: string;
    date: string;
    gameServerId: string;
    started: boolean;
    deckId1: string | null;
    deckId2: string | null;
    deckId3: string | null;
    deckId4: string | null;
}
