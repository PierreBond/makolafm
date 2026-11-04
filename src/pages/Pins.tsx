import { useApp } from '../context/AppContext';

export default function Pins() {
  const { pins, deletePin } = useApp();

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this pin?')) {
      deletePin(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Saved Pins</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {pins.length} pin{pins.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pins.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No saved pins yet. Tap "Save Pin" on any POI to save it here.
          </div>
        ) : (
          pins.map((pin) => (
            <div
              key={pin.id}
              className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white"
            >
              <span className="text-lg">📌</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{pin.label}</div>
                {pin.description && (
                  <div className="text-xs text-gray-500 truncate">{pin.description}</div>
                )}
                <div className="text-xs text-gray-400">
                  {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                </div>
              </div>
              <button
                onClick={() => handleDelete(pin.id)}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
