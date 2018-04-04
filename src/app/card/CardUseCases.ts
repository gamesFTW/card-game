import { Card } from '../../domain/card/Card';
import { CardRepository } from '../../infr/repositories/CardRepository';
import { FieldRepository } from '../../infr/repositories/FieldRepository';
import { EntityId, Entity} from '../../infr/Entity';
import { CardDied } from '../../domain/card/CardEvents';
import { Point } from '../../infr/Point';
// import { DamageService } from '../../legacy/DamageService';

let CardUseCases = {
  async getCard (cardId: EntityId): Promise<Card> {
    return await CardRepository.get(cardId);
  },

  async getCards (): Promise<Array<any>> {
    let cards = await CardRepository.getAll();
    // let field = FieldRepository.get();
    let response: Array<any> = [];

    cards.forEach((card) => {
      // let point = field.getPointByCard(card);

      response.push({
        id: card.id,
        name: card.name,
        hp: card.hp,
        damage: card.damage,
        armor: card.armor,
        alive: card.alive,
        tapped: card.tapped//,
        //x: point.x,
        //y: point.y
      });
    });

    return response;
  },

  async createCard (name: string, hp: number, damage: number, armor: number, point: Point): Promise<EntityId> {
    let card: Card = new Card();
    card.init(name, hp, damage, armor);

    let field = FieldRepository.get();

    field.addCardToField(card, point);

    FieldRepository.save(field);
    await CardRepository.save(card);

    return card.id;
  },

  async cardTookDamage (cardId: EntityId, damage: number) {
    let card: Card = await CardRepository.get(cardId);

    card.takeDamage(damage);

    await CardRepository.save(card);

    return card;
  },

  async moveCard (cardId: EntityId, point: Point) {
    let card = await CardRepository.get(cardId);
    let field = FieldRepository.get();
    field.moveCardToPoint(card, point);

    FieldRepository.save(field);

    return card;
  }//,

  // async cardAttack (attackingCardId: EntityId, defendingCardId: EntityId) {
  //   let attackingCard = await CardRepository.get(attackingCardId);
  //   let defendingCard = await CardRepository.get(defendingCardId);
  //   let field = FieldRepository.get();
  //
  //   DamageService.cardAttackCard(attackingCard, defendingCard, field);
  //
  //   CardRepository.save(attackingCard);
  //   CardRepository.save(defendingCard);
  // }
};

export {CardUseCases};
