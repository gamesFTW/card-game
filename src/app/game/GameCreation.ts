import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { Player } from '../../domain/player/Player';
import { EntityId } from '../../infr/Entity';
import { Card, CardCreationData } from '../../domain/card/Card';

class GameCreation {
  static async execute (
      player1CardsData: Array<CardCreationData>,
      player2CardsData: Array<CardCreationData>
  ): Promise<EntityId> {
    // Кажется, что знание к какому из изроков нужно применять handicap, это бизнес логика.
    // Но тогда game должен создавать игроков.

    // Нужно ли сохранять handicap внутри Player?
    let player1 = await GameCreation.createPlayer(player1CardsData, true);

    let player2 = await GameCreation.createPlayer(player2CardsData, false);

    let game = await GameCreation.createGame(player1, player2);

    return game.id;
  }

  private static async createGame (player1: Player, player2: Player): Promise<Game> {
    let game = new Game();
    game.create(player1, player2);
    await Repository.save(game);

    return game;
  }

  private static async createPlayer (
      cardsCreationData: Array<CardCreationData>,
      handicap: boolean
  ): Promise<Player> {
    let cards = await Promise.all(cardsCreationData.map(GameCreation.createCard));

    let player = new Player();
    player.create(cards);

    // Я думаю это упакуется в другое место.
    player.shuffleDeck();
    player.drawStartingHand(handicap);

    await Repository.save(player);

    return player;
  }

  private static async createCard (cardCreationData: CardCreationData): Promise<Card> {
    let card = new Card();
    card.create(cardCreationData);
    await Repository.save(card);

    return card;
  }
}

export {GameCreation};
