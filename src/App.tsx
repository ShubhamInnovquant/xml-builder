import { useEffect, useState } from 'react';
import { useSchemaStore } from './store/schemaStore';
import { useJsonSchemaStore } from './store/jsonSchemaStore';
import { useXmlSchemaStore } from './store/xmlSchemaStore';
import SchemaDashboard from './components/SchemaDashboard';
import SchemaEditor from './components/SchemaEditor';
import JsonSchemaDashboard from './components/JsonSchemaDashboard';
import JsonSchemaBuilder from './components/JsonSchemaBuilder';
import XmlSchemaDashboard from './components/XmlSchemaDashboard';
import XmlSchemaBuilder from './components/XmlSchemaBuilder';
import { Database, FileJson, FileCode } from 'lucide-react';

type ViewMode = 'entity' | 'json' | 'xml';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('json');
  const { currentSchema, loadSchemas } = useSchemaStore();
  const { currentSchema: currentJsonSchema, loadSchemas: loadJsonSchemas } = useJsonSchemaStore();
  const { currentSchema: currentXmlSchema, loadSchemas: loadXmlSchemas } = useXmlSchemaStore();

  useEffect(() => {
    loadSchemas();
    loadJsonSchemas();
    loadXmlSchemas();
  }, [loadSchemas, loadJsonSchemas, loadXmlSchemas]);

  // Determine if we're on a dashboard (not in an editor)
  const isDashboard = 
    (viewMode === 'entity' && !currentSchema) ||
    (viewMode === 'json' && !currentJsonSchema) ||
    (viewMode === 'xml' && !currentXmlSchema);

  return (
    <div className="min-h-screen">
      {/* Mode Switcher - Only show on dashboard sections */}
      {isDashboard && (
        <div className="fixed top-6 right-6 z-50 flex gap-2 glass rounded-2xl shadow-2xl p-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => setViewMode('entity')}
            className={`rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
              viewMode === 'entity'
                ? 'text-white shadow-lg shadow-electric-500/40 scale-105'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            style={{
              padding: '12px 20px',
              minWidth: '100px',
              background: viewMode === 'entity' ? 'linear-gradient(to right, #06b6d4, #14b8a6)' : 'transparent',
            }}
          >
          
            <Database size={18} />
            Entity
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
              viewMode === 'json'
                ? 'text-white shadow-lg shadow-electric-500/40 scale-105'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            style={{
              padding: '12px 20px',
              minWidth: '100px',
              background: viewMode === 'json' ? 'linear-gradient(to right, #06b6d4, #14b8a6)' : 'transparent',
            }}
          >
            <FileJson size={18} />
            JSON
          </button>
          <button
            onClick={() => setViewMode('xml')}
            className={`rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
              viewMode === 'xml'
                ? 'text-white shadow-lg shadow-electric-500/40 scale-105'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            style={{
              padding: '12px 20px',
              minWidth: '100px',
              background: viewMode === 'xml' ? 'linear-gradient(to right, #06b6d4, #14b8a6)' : 'transparent',
            }}
          >
            <FileCode size={18} />
            XML
          </button>
        </div>
      )}

      {viewMode === 'entity' ? (
        currentSchema ? (
          <SchemaEditor />
        ) : (
          <SchemaDashboard />
        )
      ) : viewMode === 'json' ? (
        currentJsonSchema ? (
          <JsonSchemaBuilder />
        ) : (
          <JsonSchemaDashboard />
        )
      ) : (
        currentXmlSchema ? (
          <XmlSchemaBuilder />
        ) : (
          <XmlSchemaDashboard />
        )
      )}
    </div>
  );
}

export default App;

