import { useState, useEffect } from 'react';
import { useJsonSchemaStore } from '../store/jsonSchemaStore';
import { JsonSchemaField, JsonSchemaType } from '../types/jsonSchema';
import { ArrowLeft, Save, Undo, Redo, Plus, FileDown, FileUp, Copy, Download } from 'lucide-react';
import { downloadJSON, readFileAsText } from '../utils/helpers';
import JsonSchemaFieldEditor from './JsonSchemaFieldEditor';
import JsonPreview from './JsonPreview';

const JsonSchemaBuilder = () => {
  const {
    currentSchema,
    updateSchema,
    selectSchema,
    canUndo,
    canRedo,
    undo,
    redo,
    exportSchema,
    generateExampleData,
    saveSchemas,
  } = useJsonSchemaStore();
  
  const [schemaName, setSchemaName] = useState(currentSchema?.name || '');
  const [schemaDesc, setSchemaDesc] = useState(currentSchema?.description || '');

  useEffect(() => {
    if (currentSchema) {
      setSchemaName(currentSchema.name);
      setSchemaDesc(currentSchema.description || '');
    }
  }, [currentSchema]);

  if (!currentSchema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Schema Selected</h2>
          <p className="text-gray-500">Please select a schema from the dashboard</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateSchema(currentSchema.id, {
      name: schemaName.trim() || currentSchema.name,
      description: schemaDesc.trim() || undefined,
    });
    saveSchemas();
  };

  const handleExport = () => {
    const json = exportSchema(currentSchema.id);
    const filename = `${currentSchema.name}-${Date.now()}.json`;
    downloadJSON(json, filename);
  };

  const handleExportExample = () => {
    const example = generateExampleData(currentSchema.id);
    if (example) {
      const filename = `${currentSchema.name}-example-${Date.now()}.json`;
      downloadJSON(JSON.stringify(example, null, 2), filename);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const imported = JSON.parse(content);
      // Merge imported fields into current schema
      if (imported.fields && Array.isArray(imported.fields)) {
        updateSchema(currentSchema.id, { fields: imported.fields });
      }
    } catch (error) {
      alert('Failed to import schema. Please check the file format.');
      console.error(error);
    }
    
    event.target.value = '';
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)' }}>
      {/* Header */}
      <header className="glass border-b border-white/10 px-8 py-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => selectSchema(null)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:scale-105"
              title="Back to dashboard"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                onBlur={handleSave}
                className="text-3xl font-bold bg-transparent border-none outline-none focus:bg-white/5 px-4 py-2 rounded-xl text-gray-100 placeholder-gray-500 transition-all"
                placeholder="Schema Name"
              />
              {currentSchema.description && (
                <p className="text-sm text-gray-400 mt-1 ml-4">{currentSchema.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="btn-secondary cursor-pointer flex items-center gap-2">
              <FileUp size={18} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportExample}
              className="btn-secondary flex items-center gap-2"
              title="Export Example Data"
            >
              <Copy size={18} />
              Example
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
            >
              <FileDown size={18} />
              Export
            </button>
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white hover:scale-105"
              title="Undo"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white hover:scale-105"
              title="Redo"
            >
              <Redo size={20} />
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Editor Panel */}
        <div className="w-1/2 border-r border-white/10 glass overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3 text-gray-100">Schema Structure</h2>
              <p className="text-base text-gray-400">
                Define your JSON schema structure. Add keys and specify their types with infinite nesting support.
              </p>
            </div>

            <div className="space-y-4">
              {currentSchema.fields.map((field) => (
                <JsonSchemaFieldEditor
                  key={field.id}
                  field={field}
                  level={0}
                />
              ))}

              <button
                onClick={() => {
                  const { addField } = useJsonSchemaStore.getState();
                  addField(null, {
                    key: 'newKey',
                    type: 'string',
                    required: false,
                  });
                }}
                className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <Plus size={18} />
                Add Field
              </button>
            </div>
          </div>
        </div>

        {/* JSON Preview Panel - Now shows both views */}
        <div className="w-1/2 overflow-y-auto bg-navy-900/50">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3 text-gray-100">Live Preview</h2>
              <p className="text-base text-gray-400">
                View the generated JSON and formatted structure with types in real-time
              </p>
            </div>
            <JsonPreview schema={currentSchema} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonSchemaBuilder;


