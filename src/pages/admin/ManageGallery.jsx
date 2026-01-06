import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, ImagePlus, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteStoragePaths, isSupabaseReady, uploadImageFile } from '@/lib/supabaseStorage';

const ManageGallery = ({ onUpdate }) => {
  const { toast } = useToast();
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [isPhotosDialogOpen, setIsPhotosDialogOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
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
    setAlbums(storedAlbums);
    setPhotos(storedPhotos);
  }, []);

  const saveAlbums = (updatedAlbums) => {
    localStorage.setItem('paroquia_gallery_albums', JSON.stringify(updatedAlbums));
    setAlbums(updatedAlbums);
    if (onUpdate) onUpdate();
  };

  const savePhotos = (updatedPhotos) => {
    localStorage.setItem('paroquia_gallery_photos', JSON.stringify(updatedPhotos));
    setPhotos(updatedPhotos);
    if (onUpdate) onUpdate();
  };

  const handleSaveAlbum = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const albumData = {
      name: formData.get('name'),
      year: formData.get('year'),
      community: formData.get('community'),
    };

    if (!albumData.year) {
      toast({ title: 'Erro', description: "O campo 'Ano' é obrigatório.", variant: 'destructive' });
      return;
    }

    if (currentAlbum && currentAlbum.id) {
      const updatedAlbums = albums.map((album) =>
        album.id === currentAlbum.id ? { ...album, ...albumData } : album
      );
      saveAlbums(updatedAlbums);
      toast({ title: 'Sucesso!', description: 'Álbum atualizado.' });
    } else {
      const newAlbum = { id: Date.now(), ...albumData };
      saveAlbums([...albums, newAlbum]);
      toast({ title: 'Sucesso!', description: 'Álbum criado.' });
    }
    closeAlbumDialog();
  };

  const handleDeleteAlbum = async (id) => {
    const updatedAlbums = albums.filter((album) => album.id !== id);
    const albumPhotos = photos.filter((photo) => photo.albumId === id);
    const updatedPhotos = photos.filter((photo) => photo.albumId !== id);
    const storagePaths = albumPhotos.map((photo) => photo.path).filter(Boolean);

    if (storagePaths.length > 0 && isSupabaseReady) {
      try {
        await deleteStoragePaths(storagePaths);
      } catch (error) {
        toast({ title: 'Aviso', description: 'Não foi possível remover arquivos do storage.' });
      }
    }

    saveAlbums(updatedAlbums);
    savePhotos(updatedPhotos);
    toast({ title: 'Sucesso!', description: 'Álbum e suas fotos foram excluídos.' });
  };

  const openAlbumDialog = (album = null) => {
    setCurrentAlbum(album);
    setIsAlbumDialogOpen(true);
  };

  const closeAlbumDialog = () => {
    setCurrentAlbum(null);
    setIsAlbumDialogOpen(false);
  };

  const openPhotosDialog = (album) => {
    setCurrentAlbum(album);
    setFiles([]);
    setIsPhotosDialogOpen(true);
  };

  const closePhotosDialog = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setCurrentAlbum(null);
    setIsPhotosDialogOpen(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));
    const newFiles = imageFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const removeFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const handleUploadPhotos = async () => {
    if (files.length === 0 || !currentAlbum) return;

    if (!isSupabaseReady) {
      toast({ title: 'Erro', description: 'Supabase não configurado para upload.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const results = await Promise.allSettled(
        files.map((file) => uploadImageFile({ file, folder: `gallery/${currentAlbum.id}` }))
      );

      const uploaded = [];
      const failedFiles = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          uploaded.push(result.value);
          if (files[index]?.preview) {
            URL.revokeObjectURL(files[index].preview);
          }
        } else {
          failedFiles.push(files[index]);
        }
      });

      if (uploaded.length === 0) {
        const firstError = results.find((result) => result.status === 'rejected')?.reason;
        toast({
          title: 'Erro',
          description: firstError?.message || 'Falha ao enviar imagens.',
          variant: 'destructive',
        });
        return;
      }

      const baseId = Date.now();
      const newPhotos = uploaded.map((item, index) => ({
        id: baseId + index,
        albumId: currentAlbum.id,
        url: item.publicUrl,
        path: item.path,
      }));

      savePhotos([...photos, ...newPhotos]);

      if (failedFiles.length > 0) {
        toast({ title: 'Aviso', description: `${failedFiles.length} imagens falharam no upload.` });
        setFiles(failedFiles);
      } else {
        toast({ title: 'Sucesso!', description: `${uploaded.length} fotos adicionadas ao álbum.` });
        closePhotosDialog();
      }
      } catch (error) {
        toast({
          title: 'Erro',
          description: error?.message || 'Falha ao enviar imagens.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
  };

  const handleDeletePhoto = async (photoId) => {
    const photoToDelete = photos.find((p) => p.id === photoId);
    if (photoToDelete?.path && isSupabaseReady) {
      try {
        await deleteStoragePaths([photoToDelete.path]);
      } catch (error) {
        toast({ title: 'Aviso', description: 'Não foi possível remover o arquivo do storage.' });
      }
    }
    savePhotos(photos.filter((p) => p.id !== photoId));
    toast({ title: 'Sucesso!', description: 'Foto removida.' });
  };

  const clearGalleryCache = () => {
    const confirmed = window.confirm('Deseja limpar o cache local da galeria?');
    if (!confirmed) return;
    localStorage.removeItem('paroquia_gallery_albums');
    localStorage.removeItem('paroquia_gallery_photos');
    setAlbums([]);
    setPhotos([]);
    if (onUpdate) onUpdate();
    toast({ title: 'Cache limpo', description: 'Os dados locais da galeria foram removidos.' });
  };

  return (
    <>
      <Helmet>
        <title>Gerenciar Galeria - Paróquia de Nossa Senhora da Conceição</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Galeria</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={clearGalleryCache}>
              Limpar cache
            </Button>
            <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openAlbumDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Álbum
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentAlbum ? 'Editar Álbum' : 'Adicionar Novo Álbum'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveAlbum} className="space-y-4">
                <Input name="id" type="hidden" defaultValue={currentAlbum?.id} />
                <div>
                  <Label htmlFor="name">Nome do Álbum</Label>
                  <Input id="name" name="name" defaultValue={currentAlbum?.name} required />
                </div>
                <div>
                  <Label htmlFor="year">Ano (Obrigatório)</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={currentAlbum?.year || new Date().getFullYear()}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="community">Comunidade</Label>
                  <Input id="community" name="community" defaultValue={currentAlbum?.community} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-8">
          {albums &&
            albums.map((album) => (
              <motion.div key={album.id} layout className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {album.name} ({album.year})
                    </h2>
                    <p className="text-sm text-gray-500">{album.community}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openPhotosDialog(album)}>
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Adicionar Fotos
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openAlbumDialog(album)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso excluirá o álbum e TODAS as suas fotos. Essa ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAlbum(album.id)} className="bg-red-600 hover:bg-red-700">
                            Sim, excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {photos
                      .filter((p) => p.albumId === album.id)
                      .map((photo) => (
                        <motion.div
                          key={photo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="relative group cursor-zoom-in"
                          onClick={() => setPreviewPhoto(photo)}
                        >
                          <img
                            src={photo.url}
                            className="w-full h-32 object-contain bg-white rounded-md"
                            alt=""
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" onClick={(event) => event.stopPropagation()}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Não</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)}>Sim</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
                {photos.filter((p) => p.albumId === album.id).length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhuma foto neste álbum. Adicione algumas!</p>
                )}
              </motion.div>
            ))}
        </div>
        <Dialog open={isPhotosDialogOpen} onOpenChange={setIsPhotosDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Adicionar Fotos ao Álbum: {currentAlbum?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center justify-center"
              >
                <input {...getInputProps()} />
                <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p>Solte as imagens aqui...</p>
                ) : (
                  <p>Arraste e solte as imagens aqui, ou clique para selecionar</p>
                )}
                <p className="text-xs text-gray-500 mt-2">As imagens serão redimensionadas para web</p>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-12 w-12 rounded-md object-contain bg-white"
                        />
                        <span className="text-sm truncate w-48">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(file)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 p-8">Nenhuma imagem selecionada.</div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={closePhotosDialog} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleUploadPhotos} disabled={files.length === 0 || isUploading}>
                {isUploading ? 'Enviando...' : `Adicionar ${files.length} Foto(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={Boolean(previewPhoto)}
          onOpenChange={(open) => {
            if (!open) setPreviewPhoto(null);
          }}
        >
          <DialogContent className="max-w-[95vw] w-auto p-2 bg-transparent border-none shadow-none">
            {previewPhoto && (
              <img
                src={previewPhoto.url}
                alt="Foto ampliada"
                className="max-h-[85vh] max-w-[95vw] object-contain rounded-md bg-white"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ManageGallery;





