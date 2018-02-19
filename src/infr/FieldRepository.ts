import { Field } from '../domain/field/Field';
import { Event } from './Event';

let FieldRepository = {
  get (): Field {
    return new Field(5, 5);
  },

  save (field: Field): void {
    field.changes.forEach((event: Event) => {

    });
  }
};

export { FieldRepository };
