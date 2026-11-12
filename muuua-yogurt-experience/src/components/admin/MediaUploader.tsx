import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface MediaUploaderProps {
  label: string;
  value?: string;
  accept?: string;
  onChange: (url: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  value,
  accept = 'image/*,video/*',
  onChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const res = await storageService.uploadMediaFile(file);
    if (res.error) {
      setError(res.error);
    } else if (res.url) {
      onChange(res.url);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold flex items-center gap-2 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{uploading ? 'Subiendo...' : 'Subir archivo'}</span>
          <input type="file" accept={accept} onChange={handleFile} className="hidden" />
        </label>

        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O pega URL directa..."
          className="flex-1 min-w-[160px] px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-xs text-white focus:border-pink-400 focus:outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Quitar archivo"
            className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {value && (
        <div className="mt-2 p-2 rounded-xl bg-black/30 border border-white/10 inline-block">
          {value.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || value.startsWith('data:video') ? (
            <video src={value} className="h-24 rounded-lg object-cover" muted loop autoPlay />
          ) : (
            <img src={value} alt="Preview" className="h-20 w-auto rounded-lg object-contain" />
          )}
        </div>
      )}
    </div>
  );
};
