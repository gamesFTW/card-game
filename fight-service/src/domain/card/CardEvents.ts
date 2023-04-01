// import { EventData, Event } from '../../infr/Event';
// import {EntityId} from "../../infr/Entity";
//
// // CardCreated
// class CardCreated extends Event {
//   static TYPE: string = 'CardCreated';
//
//   public data: CardCreatedData;
//
//   public constructor (data: CardCreatedData) {
//     super(CardCreated.TYPE, data);
//   }
// }
//
// interface CardCreatedData extends EventData {
//   name: string;
//   maxHp: number;
//   damage: number;
// }
//
// // CardTookDamage
// // class CardTookDamage extends Event {
// //   static TYPE: string = 'CardTookDamage';
// //
// //   public data: CardTookDamageData;
// //
// //   public constructor (data: CardTookDamageData) {
// //     super(CardTookDamage.TYPE, data);
// //   }
// // }
//
// // interface CardTookDamageData extends EventData {
// //   hp: number;
// // }
// //
// // // CardDied
// // class CardDied extends Event {
// //   static TYPE: string = 'CardDied';
// //
// //   public data: CardDiedData;
// //
// //   public constructor (data: CardDiedData) {
// //     super(CardDied.TYPE, data);
// //   }
// // }
// //
// // interface CardDiedData extends EventData {
// //   alive: boolean;
// // }
// //
// // // CardAttackTargetSet
// // class CardAttackTargetSet extends Event {
// //   static TYPE: string = 'CardAttackTargetSet';
// //
// //   public data: CardAttackTargetSetData;
// //
// //   public constructor (data: CardAttackTargetSetData) {
// //     super(CardAttackTargetSet.TYPE, data);
// //   }
// // }
// //
// // interface CardAttackTargetSetData extends EventData {
// //   targetId: EntityId;
// // }
// //
// // // CardTapped
// // class CardTapped extends Event {
// //   static TYPE: string = 'CardTapped';
// //
// //   public data: CardTappedData;
// //
// //   public constructor (data: CardTappedData) {
// //     super(CardTapped.TYPE, data);
// //   }
// // }
// //
// // interface CardTappedData extends EventData {
// //   tapped: boolean;
// // }
//
// export {CardCreated};
