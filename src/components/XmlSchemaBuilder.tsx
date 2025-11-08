import { useState, useEffect } from 'react';
import { useXmlSchemaStore } from '../store/xmlSchemaStore';
import { ArrowLeft, Save, Undo, Redo, Plus, FileDown, FileUp, Copy } from 'lucide-react';
import { downloadJSON, readFileAsText } from '../utils/helpers';
import XmlElementEditor from './XmlElementEditor';
import XmlPreview from './XmlPreview';

const XmlSchemaBuilder = () => {
  const {
    currentSchema,
    updateSchema,
    selectSchema,
    canUndo,
    canRedo,
    undo,
    redo,
    exportSchema,
    generateExampleXml,
    saveSchemas,
  } = useXmlSchemaStore();
  
  const [schemaName, setSchemaName] = useState(currentSchema?.name || '');
  const [schemaDesc, setSchemaDesc] = useState(currentSchema?.description || '');
  const [rootElement, setRootElement] = useState(currentSchema?.rootElement || 'root');

  useEffect(() => {
    if (currentSchema) {
      setSchemaName(currentSchema.name);
      setSchemaDesc(currentSchema.description || '');
      setRootElement(currentSchema.rootElement);
    }
  }, [currentSchema]);

  if (!currentSchema) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">No Schema Selected</h2>
          <p className="text-gray-400">Please select a schema from the dashboard</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateSchema(currentSchema.id, {
      name: schemaName.trim() || currentSchema.name,
      description: schemaDesc.trim() || undefined,
      rootElement: rootElement.trim() || 'root',
    });
    saveSchemas();
  };

  const handleExport = () => {
    const json = exportSchema(currentSchema.id);
    const filename = `${currentSchema.name}-${Date.now()}.json`;
    downloadJSON(json, filename);
  };

  const handleExportXml = () => {
    const xml = generateExampleXml(currentSchema.id);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSchema.name}-${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const imported = JSON.parse(content);
      // Merge imported elements into current schema
      if (imported.elements && Array.isArray(imported.elements)) {
        updateSchema(currentSchema.id, { elements: imported.elements });
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
      <header className="glass border-b border-gray-700/30 px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => selectSchema(null)}
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors text-gray-300 hover:text-white"
              title="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                onBlur={handleSave}
                className="text-2xl font-bold bg-transparent border-none outline-none focus:bg-primary-800/50 px-3 py-1 rounded text-gray-100 placeholder-gray-500"
                placeholder="Schema Name"
              />
              {currentSchema.description && (
                <p className="text-sm text-gray-400 mt-1">{currentSchema.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
              onClick={handleExportXml}
              className="btn-secondary flex items-center gap-2"
              title="Export as XML"
            >
              <Copy size={18} />
              Export XML
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
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white"
              title="Undo"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white"
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

      {/* Settings Bar */}
      <div className="glass border-b border-white/10 px-8 py-4">
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Root Element Name
            </label>
            <input
              type="text"
              value={rootElement}
              onChange={(e) => setRootElement(e.target.value)}
              onBlur={handleSave}
              className="input-field text-sm w-40"
              placeholder="root"
            />
          </div>
          {currentSchema.namespace && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Namespace
              </label>
              <span className="text-sm text-gray-400">{currentSchema.namespace}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Editor Panel */}
        <div className="w-1/2 border-r border-white/10 glass overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3 text-gray-100">XML Structure</h2>
              <p className="text-base text-gray-400">
                Define your XML schema structure. Add elements and configure their attributes with nested support.
              </p>
            </div>

            <div className="space-y-4">
              {currentSchema.elements.map((element) => (
                <XmlElementEditor
                  key={element.id}
                  element={element}
                  level={0}
                />
              ))}

              <button
                onClick={() => {
                  const { addElement } = useXmlSchemaStore.getState();
                  addElement(null, {
                    name: 'newElement',
                    type: 'element',
                    required: false,
                  });
                }}
                className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <Plus size={18} />
                Add Element
              </button>
            </div>
          </div>
        </div>

        {/* XML Preview Panel */}
        <div className="w-1/2 overflow-y-auto bg-navy-900/50">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3 text-gray-100">Live XML Preview</h2>
              <p className="text-base text-gray-400">
                Preview of the generated XML structure in real-time
              </p>
            </div>
            <XmlPreview schema={currentSchema} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default XmlSchemaBuilder;


