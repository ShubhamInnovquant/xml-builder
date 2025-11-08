export type DataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'object' 
  | 'array'
  | 'null'
  | 'undefined';

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

// Nested field structure for complex objects and arrays
export interface NestedField extends Omit<Field, 'nestedFields' | 'arrayItemType' | 'referencedEntityId'> {
  nestedFields?: NestedField[];
  arrayItemType?: ArrayItemType;
  referencedEntityId?: string; // For entity references
}

export type ArrayItemType = 
  | { type: 'primitive'; value: DataType }
  | { type: 'object'; fields: NestedField[] }
  | { type: 'array'; itemType: ArrayItemType }
  | { type: 'entity'; entityId: string };

export interface Field {
  id: string;
  name: string;
  type: DataType;
  required: boolean;
  defaultValue?: string;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  // Complex data support
  nestedFields?: NestedField[]; // For object type: defines the structure of the object
  arrayItemType?: ArrayItemType; // For array type: defines what type of items are in the array
  referencedEntityId?: string; // Reference to another entity (for relationships at field level)
}

export interface Relationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: RelationshipType;
  fromFieldId?: string;
  toFieldId?: string;
  name?: string;
}

export interface Entity {
  id: string;
  name: string;
  fields: Field[];
  position?: {
    x: number;
    y: number;
  };
}

export interface Schema {
  id: string;
  name: string;
  description?: string;
  entities: Entity[];
  relationships: Relationship[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryState {
  past: Schema[];
  present: Schema;
  future: Schema[];
}

