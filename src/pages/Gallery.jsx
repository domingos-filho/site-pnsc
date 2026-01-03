
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ManageGallery from '@/pages/admin/ManageGallery';

const Gallery = () => {
  const { isMember } = useAuth();
  const [albumsByYear, setAlbumsByYear] = useState({});

  const updateAlbums = () => {
    const storedAlbums = JSON.parse(localStorage.getItem('paroquia_gallery_albums')) || [];
    const storedPhotos = JSON.parse(localStorage.getItem('paroquia_gallery_photos')) || [];
    
    const albumsWithPhotos = storedAlbums.map(album => ({
      ...album,
      photos: storedPhotos.filter(photo => photo.albumId === album.id)
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
        <meta name="description" content="Reveja os momentos especiais da nossa paróquia através da galeria de fotos." />
      </Helmet>
      
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeria de Fotos</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Recorde os momentos marcantes da nossa caminhada de fé.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {sortedYears.map(year => (
            <div key={year} className="mb-16">
              <h2 className="text-4xl font-bold text-blue-800 mb-8 border-b-2 border-blue-200 pb-2">{year}</h2>
              {albumsByYear[year].map(album => (
                <div key={album.id} className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-6">{album.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {album.photos && album.photos.map(photo => (
                       <motion.div
                        key={photo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                      >
                        <img src={photo.url} alt={`Foto do álbum ${album.name}`} className="w-full h-48 object-cover" />
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
    </>
  );
};

export default Gallery;
