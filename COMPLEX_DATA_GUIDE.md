# Complex Data Structure Guide

This guide explains how to handle complex nested data structures in the Schema Designer application.

## Overview

The Schema Designer now supports complex nested data structures including:
- **Nested Objects**: Objects containing other objects with their own properties
- **Arrays of Primitives**: Arrays containing strings, numbers, booleans, etc.
- **Arrays of Objects**: Arrays where each item is an object with defined properties
- **Nested Arrays**: Arrays containing other arrays (multi-dimensional arrays)
- **Entity References**: Arrays or fields that reference other entities in your schema
- **Deep Nesting**: Unlimited depth for nested structures

## How to Create Complex Data Structures

### 1. Creating a Nested Object Field

1. Add a new field to an entity
2. Set the field type to **"Object"**
3. Click on the field to expand it
4. Click **"Add Property"** to add nested properties
5. Configure each property with its own type, name, and requirements

**Example Structure:**
```json
{
  "metadata": {
    "tags": ["tag1", "tag2"],
    "dimensions": {
      "width": 100,
      "height": 200,
      "depth": 50
    }
  }
}
```

### 2. Creating an Array of Primitives

1. Add a new field
2. Set the field type to **"Array"**
3. Expand the field
4. Select **"Primitive Type"** for the array item type
5. Choose the primitive type (string, number, boolean, date)

**Example Structure:**
```json
{
  "tags": ["electronics", "gadgets", "tech"]
}
```

### 3. Creating an Array of Objects

1. Add a new field with type **"Array"**
2. Expand the field
3. Select **"Object"** as the array item type
4. Add properties to define the object structure
5. Each array item will have these properties

**Example Structure:**
```json
{
  "reviews": [
    {
      "rating": 5,
      "comment": "Great product!",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "rating": 4,
      "comment": "Good value",
      "author": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

### 4. Creating Nested Arrays

1. Create an array field
2. Set the item type to **"Array (nested)"**
3. Configure the nested array's item type (can be primitive, object, or another array)

**Example Structure:**
```json
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}
```

### 5. Creating Entity References

1. Create an array or object field
2. If other entities exist in your schema, select **"Entity Reference"**
3. Choose which entity to reference
4. This creates a relationship at the field level

**Example Structure:**
```json
{
  "products": [
    // References to Product entities
  ]
}
```

## Visual Indicators

- **Complex Badge**: Fields with nested structures show a "Complex" badge
- **Expand/Collapse**: Click the chevron icon to expand/collapse nested structures
- **Type Indicators**: Array types show their item type in brackets: `array<string>`, `array<Object>`, etc.

## Example: Complex Product Schema

Here's a real-world example of a complex product schema:

```json
{
  "id": 1,
  "name": "Laptop",
  "price": 999.99,
  "metadata": {
    "tags": ["electronics", "computers"],
    "dimensions": {
      "width": 35,
      "height": 25,
      "depth": 2.5,
      "weight": 1.8
    },
    "specifications": {
      "processor": "Intel i7",
      "ram": "16GB",
      "storage": "512GB SSD"
    }
  },
  "reviews": [
    {
      "rating": 5,
      "comment": "Excellent laptop",
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "verified": true
      },
      "images": [
        "https://example.com/review1.jpg",
        "https://example.com/review2.jpg"
      ]
    }
  ],
  "relatedProducts": [
    // Array of Product entity references
  ]
}
```

## Best Practices

1. **Start Simple**: Begin with basic fields, then add complexity as needed
2. **Use Descriptive Names**: Name nested properties clearly
3. **Set Required Fields**: Mark critical nested fields as required
4. **Organize Hierarchically**: Group related data in nested objects
5. **Validate Structure**: Use the expand/collapse feature to verify your structure

## Editing Complex Fields

- **Expand to Edit**: Click the expand button to see and edit nested structures
- **Inline Editing**: Click the edit icon to modify field properties
- **Add Properties**: Use the "Add Property" button for nested objects
- **Delete Carefully**: Deleting a complex field removes all nested data

## Limitations

- Maximum nesting depth is technically unlimited, but very deep nesting may impact performance
- Entity references require the referenced entity to exist in the same schema
- Circular references in nested structures should be avoided

## Tips

- Use the dummy data examples to see complex structures in action
- Export your schema to JSON to see the full structure
- Test your schema with sample data to ensure it meets your needs
- Consider breaking very complex nested structures into separate entities with relationships


