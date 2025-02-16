import { Card } from "./entities/Card";
import { Deck } from "./entities/Deck";

export interface GetGamesResponse {
  Games: GameDto[];
}

export interface DecksResponse {
  Decks: Deck[];
}

export interface GameDto {
  _id: string;
  type: string;
  date: string;
  gameServerId: string;
  started: boolean;
  deckId1: string | null;
  deckId2: string | null;
  deckId3?: string | null;
  deckId4?: string | null;
  deckName1: string;
  deckName2: string;
  deckName3?: string;
  deckName4?: string;
}

export interface CardDto extends Card {
  image: string;
  sounds: CardSoundDto;
}

export type CardSoundDto = Record<string, { url: string, soundName: string}>;
