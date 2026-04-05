/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Camera, Calendar, MapPin, HardHat, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '../types/erp';

interface PhotoGalleryProps {
  photos: Photo[];
  projectName?: string;
}

type FilterType = 'all' | 'phase' | 'element' | 'location';

const phaseLabels: Record<string, string> = {
  before: 'Sebelum',
  during: 'Proses',
  after: 'Sesudah',
};

const phaseColors: Record<string, string> = {
  before: 'bg-amber-500',
  during: 'bg-blue-500',
  after: 'bg-green-500',
};

const elementLabels: Record<string, string> = {
  bekisting: 'Bekisting',
  pembesian: 'Pembesian',
  cor_beton: 'Cor Beton',
  pondasi: 'Pondasi',
  struktur: 'Struktur',
  finishing: 'Finishing',
};

export default function PhotoGallery({ photos, projectName }: PhotoGalleryProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Get unique filter options
  const phases = [...new Set(photos.map(p => p.phase))];
  const elements = [...new Set(photos.map(p => p.element).filter(Boolean))];
  const locations = [...new Set(photos.map(p => p.location).filter(Boolean))];

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    if (filterType === 'all') return true;
    if (filterType === 'phase') return filterValue === '' || photo.phase === filterValue;
    if (filterType === 'element') return filterValue === '' || photo.element === filterValue;
    if (filterType === 'location') return filterValue === '' || photo.location === filterValue;
    return true;
  });

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const nextPhoto = () => {
    const next = (lightboxIndex + 1) % filteredPhotos.length;
    setLightboxIndex(next);
    setSelectedPhoto(filteredPhotos[next]);
  };

  const prevPhoto = () => {
    const prev = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxIndex(prev);
    setSelectedPhoto(filteredPhotos[prev]);
  };

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-headline font-semibold text-on-surface">
              Galeri Foto {projectName && `- ${projectName}`}
            </h3>
            <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-full text-xs font-medium">
              {filteredPhotos.length} foto
            </span>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-on-surface-variant" />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as FilterType); setFilterValue(''); }}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">Semua</option>
              <option value="phase">Fase</option>
              <option value="element">Elemen</option>
              <option value="location">Lokasi</option>
            </select>

            {filterType !== 'all' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">Pilih {filterType === 'phase' ? 'Fase' : filterType === 'element' ? 'Elemen' : 'Lokasi'}</option>
                {filterType === 'phase' && phases.map(p => (
                  <option key={p} value={p}>{phaseLabels[p] || p}</option>
                ))}
                {filterType === 'element' && elements.map(e => (
                  <option key={e} value={e}>{elementLabels[e] || e}</option>
                ))}
                {filterType === 'location' && locations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}

            {filterValue && (
              <button
                onClick={() => { setFilterType('all'); setFilterValue(''); }}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(photo, index)}
              className="group relative aspect-square bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant hover:border-primary transition-colors"
            >
              {/* Placeholder Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-8 h-8 text-on-surface-variant opacity-30" />
              </div>

              {/* Phase Badge */}
              <div className={`absolute top-2 left-2 px-2 py-0.5 ${phaseColors[photo.phase]} text-white rounded-full text-[10px] font-medium`}>
                {phaseLabels[photo.phase]}
              </div>

              {/* Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                <p className="text-xs font-medium line-clamp-1">{photo.caption || photo.itemName}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-white/80">
                  {photo.element && <span className="flex items-center gap-0.5"><HardHat className="w-3 h-3" /> {elementLabels[photo.element] || photo.element}</span>}
                  {photo.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {photo.location}</span>}
                </div>
                <p className="text-[10px] text-white/60 mt-1 flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(photo.takenAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
          <Camera className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-30" />
          <p className="text-on-surface-variant">Tidak ada foto yang sesuai filter</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-4xl max-h-[80vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface-container-high rounded-xl overflow-hidden">
              {/* Photo Placeholder */}
              <div className="aspect-video flex items-center justify-center bg-surface-container-high">
                <Camera className="w-16 h-16 text-on-surface-variant opacity-30" />
              </div>
              
              {/* Info */}
              <div className="p-4 bg-surface-container-lowest">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 ${phaseColors[selectedPhoto.phase]} text-white rounded-full text-xs font-medium`}>
                    {phaseLabels[selectedPhoto.phase]}
                  </span>
                  {selectedPhoto.element && (
                    <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium">
                      {elementLabels[selectedPhoto.element] || selectedPhoto.element}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-medium text-on-surface">{selectedPhoto.caption || selectedPhoto.itemName}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
                  {selectedPhoto.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedPhoto.location}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(selectedPhoto.takenAt).toLocaleDateString('id-ID')}</span>
                  <span>By: {selectedPhoto.takenBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
