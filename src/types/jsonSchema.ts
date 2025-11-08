export type JsonSchemaType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'null'
  | 'object'
  | 'array';

export interface JsonSchemaField {
  id: string;
  key: string;
  type: JsonSchemaType;
  required: boolean;
  // For array type: what type of items does it contain
  arrayItemType?: JsonSchemaType | JsonSchemaField[];
  // For object type: nested fields
  nestedFields?: JsonSchemaField[];
  // For primitive types: default value
  defaultValue?: string | number | boolean | null;
  // Constraints
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

export interface JsonSchema {
  id: string;
  name: string;
  description?: string;
  rootType: 'object' | 'array';
  fields: JsonSchemaField[];
  createdAt: number;
  updatedAt: number;
}


