
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const TeamMemberCard = ({ member, index }) => (
    <motion.div 
        className="bg-white rounded-2xl shadow-lg text-center overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
    >
        <div className="aspect-[3/4] bg-gray-200">
            <img src={member.image} alt={`Foto de ${member.name}`} className="w-full h-full object-cover object-center" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-2xl font-bold text-gray-800">{member.name}</h3>
            <p className="text-blue-700 font-semibold mb-3">{member.role}</p>
            <p className="text-gray-600 mb-4 text-sm flex-grow">{member.bio}</p>
            <a href={`mailto:${member.contact}`} className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 transition-colors mt-auto">
                <Mail className="h-4 w-4 mr-2" />
                {member.contact}
            </a>
        </div>
    </motion.div>
);

const Team = () => {
    const { siteData, loading } = useData();

    if (loading) {
        return <div>Carregando...</div>;
    }
    
    const { team } = siteData;

    return (
        <>
            <Helmet>
                <title>Equipe Pastoral - Paróquia de Nossa Senhora da Conceição</title>
                <meta name="description" content="Conheça os padres, diáconos e coordenadores que servem em nossa paróquia." />
            </Helmet>
            <div className="bg-gray-50 min-h-screen">
                 <header className="bg-gradient-to-br from-blue-800 to-blue-600 text-white text-center py-20">
                    <motion.h1 
                        className="text-5xl font-extrabold"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        Nossa Equipe Pastoral
                    </motion.h1>
                    <motion.p 
                        className="mt-4 text-lg max-w-3xl mx-auto text-blue-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Pessoas dedicadas ao serviço de Deus e da comunidade.
                    </motion.p>
                </header>
                
                <main className="container mx-auto px-4 py-16">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                           <TeamMemberCard key={member.id} member={member} index={index} />
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
};

export default Team;
