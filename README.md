# Schema Designer

A modern React.js application for creating, editing, and managing complex data schemas through an intuitive visual interface. All data is stored locally in your browser - no backend required.

## Features

### ✨ Core Functionality
- **Visual Schema Creation**: Create and manage multiple schemas with a clean, modern interface
- **Entity Management**: Add, edit, delete, and rename entities with drag-and-drop positioning
- **Field Management**: Define fields with various data types (string, number, boolean, date, object, array, etc.)
- **Relationship Modeling**: Create relationships between entities (one-to-one, one-to-many, many-to-many)
- **Visual Connections**: See relationship lines connecting entities on the canvas

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI built with TailwindCSS
- **Drag-and-Drop**: Intuitive entity positioning with smooth drag interactions
- **Real-time Editing**: Edit entity names and field properties inline
- **Visual Canvas**: Grid-based canvas with visual relationship lines

### 💾 Data Management
- **Local Storage**: All schemas are automatically saved to browser localStorage
- **Export/Import**: Export schemas as JSON files or import existing schemas
- **Undo/Redo**: Full history support for undoing and redoing changes
- **Schema Validation**: Validates schemas before import to ensure data integrity

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **State Management**: Zustand for efficient state management
- **Performance**: Optimized for handling complex schemas with many entities
- **No Backend**: Completely client-side application

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating a Schema
1. Click "New Schema" on the dashboard
2. Enter a name and optional description
3. Click "Create"

### Adding Entities
1. Open a schema to enter the editor
2. Click "Entity" in the sidebar
3. Enter an entity name and click the "+" button
4. Entities appear on the canvas and can be dragged to reposition

### Adding Fields
1. Click on an entity card or use the "+" button in the fields section
2. Enter field name, select data type, and set required status
3. Fields can be edited inline by clicking the edit icon

### Creating Relationships
1. Click "Relationship" in the sidebar
2. Select "From Entity" and "To Entity"
3. Choose relationship type (one-to-one, one-to-many, many-to-many)
4. Optionally add a relationship name
5. Visual lines connect entities on the canvas

### Exporting/Importing
- **Export**: Click "Export" in the editor or "Export All" on the dashboard
- **Import**: Click "Import" and select a JSON schema file

### Undo/Redo
- Use the undo/redo buttons in the editor header to navigate through your editing history

## Project Structure

```
src/
├── components/          # React components
│   ├── SchemaDashboard.tsx
│   ├── SchemaEditor.tsx
│   ├── EntityCanvas.tsx
│   ├── EntityCard.tsx
│   ├── EntityPanel.tsx
│   ├── RelationshipPanel.tsx
│   ├── FieldList.tsx
│   ├── FieldItem.tsx
│   └── RelationshipLine.tsx
├── store/              # State management
│   └── schemaStore.ts
├── types/              # TypeScript type definitions
│   └── schema.ts
├── utils/              # Utility functions
│   ├── storage.ts
│   └── helpers.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Zustand** - State management
- **@dnd-kit** - Drag and drop functionality
- **lucide-react** - Icons

## Browser Support

Works in all modern browsers that support:
- ES6+
- localStorage
- CSS Grid and Flexbox

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.


