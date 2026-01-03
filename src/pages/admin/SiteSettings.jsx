import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, UploadCloud } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Helper component for managing list items
const CrudItem = ({ item, onEdit, onDelete, children }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
  >
    <div>{children}</div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(item.id || item.name)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </motion.div>
);


// #region SettingsHomePage
const SettingsHomePage = () => {
    const { siteData, updateSiteData } = useData();
    const { toast } = useToast();
    const [heroFiles, setHeroFiles] = useState([]);
    const [patronessFile, setPatronessFile] = useState(null);

    const onHeroDrop = useCallback(acceptedFiles => {
        const imageFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setHeroFiles(prev => [...prev, ...imageFiles]);
    }, []);
    
    const onPatronessDrop = useCallback(acceptedFiles => {
        if (acceptedFiles[0]) {
            const file = acceptedFiles[0];
            setPatronessFile(Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
        }
    }, []);

    const { getRootProps: getHeroRootProps, getInputProps: getHeroInputProps, isDragActive: isHeroDragActive } = useDropzone({
        onDrop: onHeroDrop,
        accept: { 'image/*': [] }
    });
    
    const { getRootProps: getPatronessRootProps, getInputProps: getPatronessInputProps, isDragActive: isPatronessDragActive } = useDropzone({
        onDrop: onPatronessDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const welcomeMessage = e.target.welcomeMessage.value;
        const patronessText = e.target.patronessText.value;
        
        const newHeroImages = heroFiles.map(file => ({
            id: Date.now() + Math.random(),
            src: file.preview,
            alt: file.name
        }));
        const updatedHeroImages = [...siteData.home.heroImages, ...newHeroImages];
        
        const updatedPatronessImage = patronessFile ? patronessFile.preview : siteData.home.patronessImage;

        updateSiteData({
            ...siteData,
            home: {
                ...siteData.home,
                welcomeMessage,
                patronessText,
                heroImages: updatedHeroImages,
                patronessImage: updatedPatronessImage
            }
        });
        
        setHeroFiles([]);
        if (patronessFile) {
            URL.revokeObjectURL(siteData.home.patronessImage); // Revoke old if it's a blob
            setPatronessFile(null);
        }
        toast({ title: "Sucesso!", description: "Página inicial atualizada." });
    };

    const handleDeleteImage = (id) => {
        const imageToDelete = siteData.home.heroImages.find(img => img.id === id);
        if (imageToDelete && imageToDelete.src.startsWith('blob:')) {
            URL.revokeObjectURL(imageToDelete.src);
        }
        const updatedImages = siteData.home.heroImages.filter(img => img.id !== id);
        updateSiteData({ ...siteData, home: { ...siteData.home, heroImages: updatedImages } });
        toast({ title: 'Sucesso!', description: 'Imagem do banner removida.' });
    };


    return (
        <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="text-lg font-semibold">Mensagem de Boas-Vindas</Label>
                <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={siteData.home.welcomeMessage} rows={4} className="bg-white" />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Banner Rotativo</h3>
                <div {...getHeroRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center justify-center">
                    <input {...getHeroInputProps()} />
                    <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                    {isHeroDragActive ? <p>Solte as imagens aqui...</p> : <p>Arraste e solte imagens aqui, ou clique para selecionar</p>}
                    <p className="text-xs text-gray-500 mt-2">Recomenda-se usar imagens de alta qualidade.</p>
                </div>
                {heroFiles.length > 0 && (
                     <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Novas imagens para o banner:</h4>
                        {heroFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                                <img src={file.preview} alt="preview" className="w-16 h-16 object-contain rounded bg-gray-200"/>
                                <span className="text-sm truncate">{file.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Imagens atuais no banner:</h4>
                    <AnimatePresence>
                        {siteData.home.heroImages.map(image => (
                            <motion.div key={image.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4"><img src={image.src} alt={image.alt} className="w-20 h-20 object-contain rounded-md bg-gray-200" /><span className="text-sm text-gray-600 truncate">{image.alt}</span></div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteImage(image.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seção da Padroeira</h3>
                <div className="space-y-2">
                    <Label htmlFor="patronessText">Texto da Padroeira</Label>
                    <Textarea id="patronessText" name="patronessText" defaultValue={siteData.home.patronessText} rows={4} className="bg-white" />
                </div>
                <div className="space-y-2">
                    <Label>Imagem da Padroeira</Label>
                    <div {...getPatronessRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center justify-center">
                        <input {...getPatronessInputProps()} />
                        <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                        {isPatronessDragActive ? <p>Solte a imagem aqui...</p> : <p>Arraste e solte uma imagem aqui, ou clique para selecionar</p>}
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div>
                            <p className="text-sm font-semibold">Imagem Atual:</p>
                             <img src={siteData.home.patronessImage} alt="Padroeira Atual" className="w-32 h-32 object-contain rounded bg-gray-200 mt-2" />
                        </div>
                        {patronessFile && (
                            <div>
                                <p className="text-sm font-semibold">Nova Imagem:</p>
                                <img src={patronessFile.preview} alt="Nova Padroeira" className="w-32 h-32 object-contain rounded bg-gray-200 mt-2" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Button type="submit">Salvar Alterações da Página Inicial</Button>
        </form>
    );
};
// #endregion

// #region SettingsCommunities
const SettingsCommunities = () => {
  const { siteData, updateSiteData } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const openDialog = (item = null) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  };
  
  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        address: formData.get('address'),
        massTimes: formData.get('massTimes'),
        coordinator: formData.get('coordinator'),
    };

    let updatedCommunities;
    if (currentItem) {
      updatedCommunities = siteData.communities.map(c => c.id === currentItem.id ? { ...c, ...data } : c);
    } else {
      const newId = data.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
      updatedCommunities = [...siteData.communities, { id: newId, ...data }];
    }
    updateSiteData({ ...siteData, communities: updatedCommunities });
    toast({ title: "Sucesso!", description: `Comunidade ${currentItem ? 'atualizada' : 'criada'}.` });
    setIsDialogOpen(false);
    setCurrentItem(null);
  };

  const handleDelete = (id) => {
    const updatedCommunities = siteData.communities.filter(c => c.id !== id);
    updateSiteData({ ...siteData, communities: updatedCommunities });
    toast({ title: "Sucesso!", description: "Comunidade excluída." });
  };
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gerenciar Comunidades</h3>
            <Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2"/>Nova Comunidade</Button>
        </div>
        <div className="space-y-4">
            <AnimatePresence>
                {siteData.communities.map(item => (
                    <CrudItem key={item.id} item={item} onEdit={openDialog} onDelete={handleDelete}>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                    </CrudItem>
                ))}
            </AnimatePresence>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setCurrentItem(null); }}>
            <DialogContent>
                <DialogHeader><DialogTitle>{currentItem ? 'Editar' : 'Nova'} Comunidade</DialogTitle></DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1"><Label htmlFor="name">Nome</Label><Input id="name" name="name" defaultValue={currentItem?.name} required /></div>
                    <div className="space-y-1"><Label htmlFor="description">Descrição/Histórico</Label><Textarea id="description" name="description" defaultValue={currentItem?.description} /></div>
                    <div className="space-y-1"><Label htmlFor="address">Endereço</Label><Input id="address" name="address" defaultValue={currentItem?.address} /></div>
                    <div className="space-y-1"><Label htmlFor="massTimes">Horário de Missas</Label><Input id="massTimes" name="massTimes" defaultValue={currentItem?.massTimes} /></div>
                    <div className="space-y-1"><Label htmlFor="coordinator">Coordenador/Contato</Label><Input id="coordinator" name="coordinator" defaultValue={currentItem?.coordinator} /></div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose><Button type="submit">Salvar</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
};
// #endregion

// #region SettingsPastorals
const SettingsPastorals = () => {
    const { siteData, updateSiteData } = useData();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);

    const openDialog = (category, item = null) => {
        setCurrentCategory(category);
        setCurrentItem(item);
        setIsDialogOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        let updatedCategoryItems;
        if (currentItem) {
            updatedCategoryItems = siteData.pastorals[currentCategory].map(p => p.name === currentItem.name ? { ...currentItem, ...data } : p);
        } else {
            updatedCategoryItems = [...siteData.pastorals[currentCategory], data];
        }

        updateSiteData({ ...siteData, pastorals: { ...siteData.pastorals, [currentCategory]: updatedCategoryItems }});
        toast({ title: "Sucesso!", description: `Item ${currentItem ? 'atualizado' : 'criado'}.` });
        setIsDialogOpen(false);
        setCurrentItem(null);
        setCurrentCategory(null);
    };

    const handleDelete = (category, name) => {
        const updatedCategoryItems = siteData.pastorals[category].filter(p => p.name !== name);
        updateSiteData({ ...siteData, pastorals: { ...siteData.pastorals, [category]: updatedCategoryItems }});
        toast({ title: "Sucesso!", description: "Item excluído." });
    };

    const categories = { pastorais: 'Pastorais', movimentos: 'Movimentos', servicos: 'Serviços' };

    return (
        <div className="space-y-8">
            {Object.entries(categories).map(([key, title]) => (
                <div key={key}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <Button onClick={() => openDialog(key)}><Plus className="h-4 w-4 mr-2"/>Adicionar</Button>
                    </div>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {(siteData.pastorals[key] || []).map(item => (
                                <CrudItem key={item.name} item={{...item, id: item.name}} onEdit={() => openDialog(key, item)} onDelete={() => handleDelete(key, item.name)}>
                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                </CrudItem>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) { setCurrentItem(null); setCurrentCategory(null); }}}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{currentItem ? 'Editar' : 'Novo'} Item</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1"><Label htmlFor="name">Nome</Label><Input id="name" name="name" defaultValue={currentItem?.name} required /></div>
                        <div className="space-y-1"><Label htmlFor="objective">Objetivo</Label><Textarea id="objective" name="objective" defaultValue={currentItem?.objective} /></div>
                        <div className="space-y-1"><Label htmlFor="responsible">Responsáveis</Label><Input id="responsible" name="responsible" defaultValue={currentItem?.responsible} /></div>
                        <div className="space-y-1"><Label htmlFor="howToParticipate">Como Participar</Label><Input id="howToParticipate" name="howToParticipate" defaultValue={currentItem?.howToParticipate} /></div>
                        <div className="space-y-1"><Label htmlFor="meeting">Dia e Horário</Label><Input id="meeting" name="meeting" defaultValue={currentItem?.meeting} /></div>
                        <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose><Button type="submit">Salvar</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
// #endregion

// #region SettingsTeam
const SettingsTeam = () => {
    const { siteData, updateSiteData } = useData();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles[0]) {
            const file = acceptedFiles[0];
            setImageFile(Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });
    
    const openDialog = (item = null) => {
        setCurrentItem(item);
        setImageFile(null);
        setIsDialogOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            role: formData.get('role'),
            bio: formData.get('bio'),
            contact: formData.get('contact'),
        };
        
        const newImageSrc = imageFile ? imageFile.preview : currentItem?.image;
        if (imageFile && currentItem?.image && currentItem.image.startsWith('blob:')) {
             URL.revokeObjectURL(currentItem.image);
        }
        
        let updatedTeam;
        if (currentItem) {
            updatedTeam = siteData.team.map(t => t.id === currentItem.id ? { ...t, ...data, image: newImageSrc } : t);
        } else {
            updatedTeam = [...siteData.team, { id: Date.now(), ...data, image: newImageSrc || 'https://via.placeholder.com/300x400' }];
        }
        updateSiteData({ ...siteData, team: updatedTeam });
        toast({ title: "Sucesso!", description: `Membro ${currentItem ? 'atualizado' : 'adicionado'}.` });
        setIsDialogOpen(false);
        setCurrentItem(null);
        setImageFile(null);
    };

    const handleDelete = (id) => {
        const itemToDelete = siteData.team.find(t => t.id === id);
        if (itemToDelete?.image && itemToDelete.image.startsWith('blob:')) {
            URL.revokeObjectURL(itemToDelete.image);
        }
        const updatedTeam = siteData.team.filter(t => t.id !== id);
        updateSiteData({ ...siteData, team: updatedTeam });
        toast({ title: "Sucesso!", description: "Membro da equipe removido." });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gerenciar Equipe</h3>
                <Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2"/>Adicionar Membro</Button>
            </div>
            <div className="space-y-4">
                <AnimatePresence>
                {siteData.team.map(item => (
                    <CrudItem key={item.id} item={item} onEdit={openDialog} onDelete={handleDelete}>
                        <div className="flex items-center gap-4">
                           <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-md bg-gray-200" />
                            <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.role}</p>
                            </div>
                        </div>
                    </CrudItem>
                ))}
                </AnimatePresence>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) { setIsDialogOpen(false); setCurrentItem(null); setImageFile(null);} }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{currentItem ? 'Editar' : 'Adicionar'} Membro</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1"><Label htmlFor="name">Nome</Label><Input id="name" name="name" defaultValue={currentItem?.name} required /></div>
                        <div className="space-y-1"><Label htmlFor="role">Função</Label><Input id="role" name="role" defaultValue={currentItem?.role} /></div>
                        <div className="space-y-1"><Label htmlFor="bio">Mini Biografia</Label><Textarea id="bio" name="bio" defaultValue={currentItem?.bio} /></div>
                        <div className="space-y-1"><Label htmlFor="contact">Contato</Label><Input id="contact" name="contact" defaultValue={currentItem?.contact} /></div>
                        
                        <div>
                            <Label>Foto</Label>
                            <div {...getRootProps()} className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
                                <input {...getInputProps()} />
                                <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                {isDragActive ? <p>Solte a foto aqui...</p> : <p>Arraste uma foto ou clique para selecionar</p>}
                                <p className="text-xs text-gray-500 mt-1">Recomendação: proporção 3:4</p>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <div>
                                    <p className="text-sm font-semibold">Foto Atual:</p>
                                    <img src={currentItem?.image || 'https://via.placeholder.com/300x400'} alt="Atual" className="w-24 h-32 object-cover rounded bg-gray-200 mt-1" />
                                </div>
                                {imageFile && (
                                    <div>
                                        <p className="text-sm font-semibold">Nova Foto:</p>
                                        <img src={imageFile.preview} alt="Nova" className="w-24 h-32 object-cover rounded bg-gray-200 mt-1" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose><Button type="submit">Salvar</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
// #endregion

// #region SettingsContactAbout
const SettingsContactAbout = () => {
    const { siteData, updateSiteData } = useData();
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const updatedData = {
            ...siteData,
            contact: {
                ...siteData.contact,
                address: formData.get('address'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                whatsapp: formData.get('whatsapp'),
                officeHours: formData.get('officeHours'),
                social: {
                    facebook: formData.get('facebook'),
                    instagram: formData.get('instagram'),
                    youtube: formData.get('youtube'),
                }
            },
            about: {
                ...siteData.about,
                history: formData.get('history'),
                mission: formData.get('mission'),
                vision: formData.get('vision'),
                values: formData.get('values'),
                youtubeVideoUrl: formData.get('youtubeVideoUrl'),
            }
        };

        updateSiteData(updatedData);
        toast({ title: "Sucesso!", description: "Informações atualizadas." });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Página "Quem Somos"</h3>
                <div className="space-y-1"><Label htmlFor="youtubeVideoUrl">Link do Vídeo do YouTube</Label><Input id="youtubeVideoUrl" name="youtubeVideoUrl" defaultValue={siteData.about.youtubeVideoUrl} /></div>
                <div className="space-y-1"><Label htmlFor="history">História</Label><Textarea id="history" name="history" defaultValue={siteData.about.history} rows={5} /></div>
                <div className="space-y-1"><Label htmlFor="mission">Missão</Label><Textarea id="mission" name="mission" defaultValue={siteData.about.mission} /></div>
                <div className="space-y-1"><Label htmlFor="vision">Visão</Label><Textarea id="vision" name="vision" defaultValue={siteData.about.vision} /></div>
                <div className="space-y-1"><Label htmlFor="values">Valores</Label><Input id="values" name="values" defaultValue={siteData.about.values} /></div>
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Informações de Contato</h3>
                <div className="space-y-1"><Label htmlFor="address">Endereço</Label><Input id="address" name="address" defaultValue={siteData.contact.address} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="phone">Telefone</Label><Input id="phone" name="phone" defaultValue={siteData.contact.phone} /></div>
                    <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={siteData.contact.email} /></div>
                    <div className="space-y-1"><Label htmlFor="whatsapp">WhatsApp (somente números)</Label><Input id="whatsapp" name="whatsapp" defaultValue={siteData.contact.whatsapp} /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="officeHours">Horário de Atendimento</Label><Textarea id="officeHours" name="officeHours" defaultValue={siteData.contact.officeHours} rows={3} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1"><Label htmlFor="facebook">URL do Facebook</Label><Input id="facebook" name="facebook" defaultValue={siteData.contact.social.facebook} /></div>
                    <div className="space-y-1"><Label htmlFor="instagram">URL do Instagram</Label><Input id="instagram" name="instagram" defaultValue={siteData.contact.social.instagram} /></div>
                    <div className="space-y-1"><Label htmlFor="youtube">URL do YouTube</Label><Input id="youtube" name="youtube" defaultValue={siteData.contact.social.youtube} /></div>
                </div>
            </div>
            <Button type="submit">Salvar Todas as Alterações</Button>
        </form>
    );
};
// #endregion

const SiteSettings = () => {
  return (
    <>
      <Helmet>
        <title>Configurações do Site - Dashboard</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Configurações do Site</h1>
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="homepage">Página Inicial</TabsTrigger>
            <TabsTrigger value="communities">Comunidades</TabsTrigger>
            <TabsTrigger value="pastorals">Pastorais</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="contact">Contato/Sobre</TabsTrigger>
          </TabsList>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <TabsContent value="homepage"><SettingsHomePage /></TabsContent>
            <TabsContent value="communities"><SettingsCommunities /></TabsContent>
            <TabsContent value="pastorals"><SettingsPastorals /></TabsContent>
            <TabsContent value="team"><SettingsTeam /></TabsContent>
            <TabsContent value="contact"><SettingsContactAbout /></TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default SiteSettings;