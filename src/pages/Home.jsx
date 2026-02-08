import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Church, Image as ImageIcon, Phone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

const HeroSection = () => {
  const { siteData } = useData();

  return (
    <section className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-1 gap-12 items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight">
              Bem-vindo à sua casa de fé
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">{siteData.home.welcomeMessage}</p>
            <Link to="/quem-somos">
              <Button size="lg" className="mt-8">
                Conheça nossa história <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CarouselSection = () => {
  const { siteData } = useData();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (siteData.home.heroImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % siteData.home.heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [siteData.home.heroImages.length]);

  if (siteData.home.heroImages.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[60vh] overflow-hidden bg-blue-900">
      {siteData.home.heroImages.map((image, index) => (
        <motion.div
          key={image.id}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: index === currentIndex ? 1 : 0, scale: index === currentIndex ? 1 : 1.05 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <img src={image.src} alt={image.alt} className="w-full h-full object-contain" />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Momentos da nossa Comunidade
        </motion.h2>
      </div>
    </section>
  );
};

const PatronessSection = () => {
  const { siteData } = useData();
  const fallbackImage = '/assets/Imagem_da_Santa.png';
  const patronessSrc = siteData.home.patronessImage || fallbackImage;

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img
              src={patronessSrc}
              alt="Imagem de Nossa Senhora da Conceição"
              className="max-h-96"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Nossa Padroeira, Nossa Senhora da Conceição
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">{siteData.home.patronessText}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Shortcuts = () => {
  const shortcuts = [
    { to: '/comunidades', icon: Church, label: 'Comunidades' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/galeria', icon: ImageIcon, label: 'Galeria' },
    { to: '/pastorais', icon: Users, label: 'Pastorais' },
    { to: '/contato', icon: Phone, label: 'Contato' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {shortcuts.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={item.to}>
                <Button
                  variant="outline"
                  className="w-full h-32 flex flex-col justify-center items-center gap-2 text-lg bg-white hover:bg-blue-50 hover:shadow-lg transition-all duration-300 group"
                >
                  <item.icon className="h-8 w-8 text-blue-800 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">{item.label}</span>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Início - Paróquia de Nossa Senhora da Conceição</title>
        <meta
          name="description"
          content="Bem-vindo ao site da Paróquia de Nossa Senhora da Conceição em Nova Parnamirim. Conheça nossa comunidade, agenda de eventos, pastorais e muito mais."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
        <CarouselSection />
        <PatronessSection />
        <Shortcuts />
      </motion.div>
    </>
  );
};

export default Home;

