import { useState, useEffect } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { ArrowLeft, Save, Undo, Redo, Plus, FileDown, Settings } from 'lucide-react';
import EntityCanvas from './EntityCanvas';
import EntityPanel from './EntityPanel';
import RelationshipPanel from './RelationshipPanel';
import { downloadJSON } from '../utils/helpers';

const SchemaEditor = () => {
  const {
    currentSchema,
    updateSchema,
    selectSchema,
    canUndo,
    canRedo,
    undo,
    redo,
    exportSchema,
    saveSchemas,
  } = useSchemaStore();
  
  const [activePanel, setActivePanel] = useState<'entity' | 'relationship' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [schemaName, setSchemaName] = useState(currentSchema?.name || '');
  const [schemaDesc, setSchemaDesc] = useState(currentSchema?.description || '');

  useEffect(() => {
    if (currentSchema) {
      setSchemaName(currentSchema.name);
      setSchemaDesc(currentSchema.description || '');
    }
  }, [currentSchema]);

  if (!currentSchema) return null;

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
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors text-gray-300 hover:text-white"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
            >
              <FileDown size={18} />
              Export
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass border-b border-gray-700/30 px-6 py-4">
          <div className="max-w-2xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={schemaDesc}
              onChange={(e) => setSchemaDesc(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a description for this schema"
              className="input-field"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 glass border-r border-gray-700/30 flex flex-col">
          <div className="p-4 border-b border-gray-700/30">
            <h2 className="text-lg font-semibold mb-3 text-gray-100">Tools</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActivePanel(activePanel === 'entity' ? null : 'entity')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  activePanel === 'entity'
                    ? 'text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                }`}
                style={activePanel === 'entity' 
                  ? { background: 'linear-gradient(to right, #06b6d4, #14b8a6)' }
                  : { backgroundColor: 'rgba(17, 24, 39, 0.7)' }
                }
              >
                <Plus size={16} className="inline mr-2" />
                Entity
              </button>
              <button
                onClick={() => setActivePanel(activePanel === 'relationship' ? null : 'relationship')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  activePanel === 'relationship'
                    ? 'text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                }`}
                style={activePanel === 'relationship'
                  ? { background: 'linear-gradient(to right, #06b6d4, #14b8a6)' }
                  : { backgroundColor: 'rgba(17, 24, 39, 0.7)' }
                }
              >
                <Plus size={16} className="inline mr-2" />
                Relationship
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activePanel === 'entity' && <EntityPanel />}
            {activePanel === 'relationship' && <RelationshipPanel />}
            {!activePanel && (
              <div className="p-4 text-center text-gray-400">
                <p>Select a tool to get started</p>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden relative">
          <EntityCanvas />
        </main>
      </div>
    </div>
  );
};

export default SchemaEditor;

