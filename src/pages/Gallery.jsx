import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import ManageGallery from '@/pages/admin/ManageGallery';

const Gallery = () => {
  const { isMember } = useAuth();
  const [albumsByYear, setAlbumsByYear] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const updateAlbums = () => {
    const safeParse = (key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error(`Falha ao ler ${key}. Limpando cache local.`, error);
        localStorage.removeItem(key);
        return [];
      }
    };
    const storedAlbums = safeParse('paroquia_gallery_albums');
    const storedPhotos = safeParse('paroquia_gallery_photos');

    const albumsWithPhotos = storedAlbums.map((album) => ({
      ...album,
      photos: storedPhotos.filter((photo) => photo.albumId === album.id),
    }));

    const groupedByYear = albumsWithPhotos.reduce((acc, album) => {
      const year = album.year || 'Sem Ano';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(album);
      return acc;
    }, {});

    setAlbumsByYear(groupedByYear);
  };

  useEffect(() => {
    updateAlbums();
  }, []);

  if (isMember) {
    return <ManageGallery onUpdate={updateAlbums} />;
  }

  const sortedYears = Object.keys(albumsByYear).sort((a, b) => b - a);

  return (
    <>
      <Helmet>
        <title>Galeria de Fotos - Paróquia de Nossa Senhora da Conceição</title>
        <meta
          name="description"
          content="Reveja os momentos especiais da nossa paróquia através da galeria de fotos."
        />
      </Helmet>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeria de Fotos</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Recorde os momentos marcantes da nossa caminhada de fé.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {sortedYears.map((year) => (
            <div key={year} className="mb-16">
              <h2 className="text-4xl font-bold text-blue-800 mb-8 border-b-2 border-blue-200 pb-2">{year}</h2>
              {(albumsByYear[year] || []).map((album) => (
                <div key={album.id} className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-6">{album.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {album.photos &&
                      album.photos.map((photo) => (
                        <motion.div
                          key={photo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
                        >
                          <button
                            type="button"
                            className="block w-full h-full cursor-zoom-in"
                            onClick={() => setSelectedPhoto({ url: photo.url, album: album.name })}
                            aria-label="Ampliar foto"
                          >
                            <img
                              src={photo.url}
                              alt={`Foto do album ${album.name}`}
                              className="w-full h-48 object-contain bg-white"
                            />
                          </button>
                        </motion.div>
                      ))}
                  </div>
                  {(!album.photos || album.photos.length === 0) && (
                    <p className="text-gray-500">Nenhuma foto neste álbum ainda.</p>
                  )}
                </div>
              ))}
            </div>
          ))}
          {sortedYears.length === 0 && (
            <p className="text-center text-gray-500 text-lg">Nenhum álbum de fotos encontrado.</p>
          )}
        </div>
      </section>
      <Dialog
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      >
        <DialogContent className="max-w-[95vw] w-auto p-2 bg-transparent border-none shadow-none">
          {selectedPhoto && (
            <img
              src={selectedPhoto.url}
              alt="Foto ampliada"
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-md bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;



