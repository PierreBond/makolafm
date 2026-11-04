import { useState } from 'react';

interface AddPinDialogProps {
  latitude: number;
  longitude: number;
  onSave: (label: string, category: string, description: string) => void;
  onCancel: () => void;
}

export function AddPinDialog({ latitude, longitude, onSave, onCancel }: AddPinDialogProps) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('custom');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!label.trim()) return;
    onSave(label.trim(), category, description.trim());
  };

  return (
    <div className="absolute inset-0 bg-black/40 flex items-end z-30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto p-4 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Add Location</h3>
        <p className="text-xs text-gray-400 mb-3">
          {latitude.toFixed(5)}, {longitude.toFixed(5)} — saved on this device
        </p>

        <input
          type="text"
          placeholder="Name (e.g. Auntie Afia's stall)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
          className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none mb-2 focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none mb-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="custom">Other / Gem Spot</option>
          <option value="transit">Transit Stop</option>
          <option value="restroom">Restroom</option>
        </select>

        <textarea
          placeholder="Describe it (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none mb-3 resize-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
