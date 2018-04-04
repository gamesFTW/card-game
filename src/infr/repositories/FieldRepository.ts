import { Field } from '../../domain/field/Field';
import { Event } from '../Event';
import {db} from "../DataBase";

class FieldRepository {
  static get (): Field {
    return new Field(db.field, 5, 5);
  }

  static save (field: Field): void {
    field.changes.forEach((event: Event) => {
      db.field = db.field ? db.field : [];

      db.field.push(event);
    });

    field.changes = [];

    db.save();
  }
}

export { FieldRepository };
