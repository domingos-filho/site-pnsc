
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Target, Eye, Heart } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const AboutCard = ({ icon, title, children, delay }) => {
    const IconComponent = icon;
    return (
        <motion.div
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
        >
            <div className="p-4 bg-blue-100 rounded-full mb-4">
                <IconComponent className="h-8 w-8 text-blue-800" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{children}</p>
        </motion.div>
    );
}

const YouTubeVideo = ({ url }) => {
    if (!url) return null;

    const getYouTubeEmbedUrl = (videoUrl) => {
        try {
            const urlObj = new URL(videoUrl);
            let videoId;
            if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.split('/')[1];
            } else if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v');
            }
            // Remove playlist and other params to ensure single video embed
            if (videoId) {
                const searchParams = new URLSearchParams(urlObj.search);
                searchParams.delete('list');
                searchParams.delete('index');
                searchParams.delete('t');
                const cleanSearchParams = searchParams.toString() ? `?${searchParams.toString()}`: '';
                return `https://www.youtube.com/embed/${videoId}${cleanSearchParams}`;
            }
            return null;
        } catch (error) {
            console.error("Invalid YouTube URL:", error);
            return null;
        }
    };

    const embedUrl = getYouTubeEmbedUrl(url);

    if (!embedUrl) {
        return (
            <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                Link do vídeo inválido. Verifique o link nas configurações.
            </div>
        );
    }

    return (
        <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
            <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    );
};

const About = () => {
    const { siteData, loading } = useData();

    if (loading) {
        return <div>Carregando...</div>;
    }

    const { history, mission, vision, values, youtubeVideoUrl } = siteData.about;

    return (
        <>
            <Helmet>
                <title>Quem Somos - Paróquia de Nossa Senhora da Conceição</title>
                <meta name="description" content="Conheça a história, missão, visão e valores da Paróquia de Nossa Senhora da Conceição." />
            </Helmet>
            <div className="bg-gray-50">
                <header className="bg-gradient-to-br from-blue-800 to-blue-600 text-white text-center py-20">
                    <motion.h1 
                        className="text-5xl font-extrabold"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        Nossa História e Missão
                    </motion.h1>
                    <motion.p 
                        className="mt-4 text-lg max-w-3xl mx-auto text-blue-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Um farol de fé e comunidade em Nova Parnamirim.
                    </motion.p>
                </header>

                <main className="container mx-auto px-4 py-16 space-y-20">
                    {youtubeVideoUrl && (
                        <motion.section
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <YouTubeVideo url={youtubeVideoUrl} />
                        </motion.section>
                    )}

                    <section>
                        <AboutCard icon={BookOpen} title="Nossa História" delay={0}>
                            {history}
                        </AboutCard>
                    </section>
                    
                    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AboutCard icon={Target} title="Missão" delay={0.2}>
                            {mission}
                        </AboutCard>
                        <AboutCard icon={Eye} title="Visão" delay={0.4}>
                            {vision}
                        </AboutCard>
                        <AboutCard icon={Heart} title="Valores" delay={0.6}>
                            {values}
                        </AboutCard>
                    </section>
                </main>
            </div>
        </>
    );
};

export default About;
