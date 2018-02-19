import {EntityId} from "../../infr/Entity";
import {Card} from "../../domain/card/Card";
import {CardRepository} from "../../infr/card/CardRepository";

class CardsOnTableUseCases {
  static cardDied(cardId: EntityId) {
    let cardsOnTable: CardsOnTable = CardsOnTableRepository.get();

    cardsOnTable.cardDied(cardId);

    CardsOnTableRepository.save(cardsOnTable);
  }
}
