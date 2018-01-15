import {Card} from "../domain/Card";
import {Game} from "../domain/Game";


let gameEvents = Store.getEventsByEntityName('game');
let cardGroupEvents = Store.getEventsByEntityNameAndGroupById('card');

cardGroupEvents.forEach(createCard);

let game = new Game(gameEvents);

function createCard(cardEvents) {
  let card = new Card(cardEvents);
  game.state.cards.push(card);
}
