'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function HeroImagesEditor() {
  const { showToast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.heroImages) {
          setImages(data.settings.heroImages);
        }
      })
      .catch(() => {});
  }, []);

  const addImage = () => {
    const url = newUrl.trim();
    if (!url) {
      showToast('Enter image URL', 'error');
      return;
    }
    if (!url.startsWith('http')) {
      showToast('URL must start with http or https', 'error');
      return;
    }
    setImages([...images, url]);
    setNewUrl('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroImages: images }),
    });
    if (res.ok) {
      showToast('Saved successfully', 'success');
    } else {
      showToast('Error saving', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Background image URL (https://...)"
          className="input-field flex-1 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && addImage()}
        />
        <button
          onClick={addImage}
          className="flex items-center gap-1 px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-lg hover:bg-falcon-blueDark transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-400 shrink-0">#{i + 1}</span>
              <div
                className="w-16 h-10 rounded bg-cover bg-center border border-gray-200 shrink-0"
                style={{ backgroundImage: `url(${url})` }}
              />
              <span className="text-xs text-gray-500 truncate flex-1">{url}</span>
              <button
                onClick={() => removeImage(i)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-gray-400">No background images. Add URLs to show image carousel on homepage.</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-lg hover:bg-falcon-blueDark transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Images'}
      </button>
    </div>
  );
}
