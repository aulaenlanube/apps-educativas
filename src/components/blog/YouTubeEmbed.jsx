import React, { useState } from 'react';
import { Play } from 'lucide-react';

// Placeholder + iframe lazy. Mostramos la miniatura de YouTube y solo cargamos
// el iframe cuando el usuario pulsa play (ahorra tráfico/CO2 y no rompe el LCP).
export default function YouTubeEmbed({ videoId, title }) {
  const [playing, setPlaying] = useState(false);

  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-slate-900">
      {playing ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title || 'Vídeo de YouTube'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group"
          aria-label={`Reproducir vídeo: ${title || ''}`}
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title || 'Vista previa del vídeo'}
            loading="lazy"
            onError={(e) => {
              // maxresdefault puede no existir; cae a hqdefault.
              e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center justify-center w-20 h-20 rounded-full bg-red-600/90 group-hover:bg-red-600 group-hover:scale-110 transition-all shadow-2xl">
              <Play className="w-9 h-9 text-white fill-white ml-1" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
