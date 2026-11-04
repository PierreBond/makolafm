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
    <div className="absolute inset-0 bg-black/40 flex items-end z-30 p-5">
      <div className="bg-white rounded-3xl w-full max-w-md mx-auto p-5 shadow-card-float border border-black/[0.04] mb-16">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold tracking-tight text-brand-charcoal font-display">Add Gem Spot</h3>
          <button
            aria-label="Cancel"
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-charcoal rounded-full active:bg-neutral-100"
          >
            <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-brand-muted mb-3">
          {latitude.toFixed(5)}, {longitude.toFixed(5)} — saved on this device, shared when online
        </p>

        <input
          type="text"
          placeholder="Name (e.g. Auntie Afia's stall)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
          className="w-full px-4 py-3 bg-[#F4F5F8] border border-black/[0.04] rounded-2xl text-sm outline-none mb-2.5 focus:ring-2 focus:ring-brand-charcoal font-body"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-[#F4F5F8] border border-black/[0.04] rounded-2xl text-sm outline-none mb-2.5 focus:ring-2 focus:ring-brand-charcoal font-body"
        >
          <option value="custom">Gem Spot</option>
          <option value="transit">Transit Stop</option>
          <option value="restroom">Restroom</option>
        </select>

        <textarea
          placeholder="Describe it (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 bg-[#F4F5F8] border border-black/[0.04] rounded-2xl text-sm outline-none mb-3 resize-none focus:ring-2 focus:ring-brand-charcoal font-body"
        />

        <div className="grid grid-cols-12 gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!label.trim()}
            className="col-span-9 h-12 bg-brand-charcoal hover:bg-black active:scale-[0.98] text-white rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center transition-all disabled:opacity-40"
          >
            Add to the Map
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="col-span-3 h-12 bg-[#F4F5F8] hover:bg-[#EBEDF2] active:scale-[0.98] text-brand-charcoal rounded-2xl font-medium text-sm flex items-center justify-center transition-colors border border-black/[0.03]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
