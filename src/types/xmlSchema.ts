export type XmlSchemaType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date'
  | 'element'
  | 'text';

export interface XmlAttribute {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  defaultValue?: string | number | boolean;
}

export interface XmlElement {
  id: string;
  name: string;
  type: XmlSchemaType;
  required: boolean;
  // For element type: child elements
  children?: XmlElement[];
  // Attributes for this element
  attributes?: XmlAttribute[];
  // For text content
  textContent?: string;
  // Min/max occurrences (for arrays/collections)
  minOccurs?: number;
  maxOccurs?: number | 'unbounded';
}

export interface XmlSchema {
  id: string;
  name: string;
  description?: string;
  rootElement: string;
  elements: XmlElement[];
  // XML namespace support
  namespace?: string;
  namespacePrefix?: string;
  createdAt: number;
  updatedAt: number;
}


