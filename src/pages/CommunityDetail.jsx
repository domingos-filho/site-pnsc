import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CommunityDetail = () => {
  const { id } = useParams();

  const communitiesData = {
    'nossa-senhora-das-gracas': {
      name: 'Nossa Senhora das Graças',
      description: 'A Comunidade Nossa Senhora das Graças é um espaço de fé e acolhimento, onde celebramos a presença maternal de Maria em nossas vidas. Nossa comunidade se dedica à oração, à evangelização e ao serviço aos mais necessitados.',
      address: 'Rua das Graças, 123 - Nova Parnamirim, Parnamirim/RN',
      masses: [
        { day: 'Domingo', time: '8h00' },
        { day: 'Quarta-feira', time: '19h00' }
      ],
      coordinator: 'Maria das Graças Silva',
      images: [
        'Community church of Nossa Senhora das Graças exterior view',
        'Mass celebration at Nossa Senhora das Graças community',
        'Community members gathering for prayer'
      ]
    },
    'nossa-senhora-auxiliadora': {
      name: 'Nossa Senhora Auxiliadora',
      description: 'Sob a proteção de Nossa Senhora Auxiliadora, nossa comunidade busca viver o Evangelho através da educação na fé, especialmente voltada para os jovens. Seguimos o carisma salesiano de Dom Bosco.',
      address: 'Rua Auxiliadora, 456 - Nova Parnamirim, Parnamirim/RN',
      masses: [
        { day: 'Domingo', time: '10h00' },
        { day: 'Sexta-feira', time: '19h00' }
      ],
      coordinator: 'João Paulo Santos',
      images: [
        'Nossa Senhora Auxiliadora chapel with youth group',
        'Salesian youth activities in the community',
        'Community celebration with families'
      ]
    },
    'santa-dulce-dos-pobres': {
      name: 'Santa Dulce dos Pobres',
      description: 'Inspirados pelo exemplo de caridade de Santa Dulce dos Pobres, nossa comunidade se dedica ao serviço aos mais necessitados, promovendo ações sociais e obras de misericórdia.',
      address: 'Rua da Caridade, 789 - Nova Parnamirim, Parnamirim/RN',
      masses: [
        { day: 'Domingo', time: '17h00' },
        { day: 'Quinta-feira', time: '19h00' }
      ],
      coordinator: 'Ana Paula Oliveira',
      images: [
        'Community charity work helping the poor',
        'Santa Dulce community social action',
        'Volunteers serving meals to the needy'
      ]
    },
    'sao-joao-paulo-ii': {
      name: 'São João Paulo II',
      description: 'Nossa comunidade segue os ensinamentos de São João Paulo II, promovendo a nova evangelização e o protagonismo juvenil. Somos uma comunidade jovem e missionária.',
      address: 'Rua João Paulo, 321 - Nova Parnamirim, Parnamirim/RN',
      masses: [
        { day: 'Domingo', time: '19h00' },
        { day: 'Terça-feira', time: '19h00' }
      ],
      coordinator: 'Pedro Henrique Costa',
      images: [
        'Youth mass at São João Paulo II community',
        'Young people in evangelization mission',
        'Community prayer group meeting'
      ]
    },
    'sagrado-coracao-de-jesus': {
      name: 'Sagrado Coração de Jesus',
      description: 'Devotos ao Sagrado Coração de Jesus, nossa comunidade cultiva a espiritualidade do amor misericordioso de Cristo, promovendo adoração eucarística e obras de caridade.',
      address: 'Rua do Coração, 654 - Nova Parnamirim, Parnamirim/RN',
      masses: [
        { day: 'Domingo', time: '7h00' },
        { day: 'Primeira Sexta-feira', time: '19h00' }
      ],
      coordinator: 'José Carlos Ferreira',
      images: [
        'Sacred Heart of Jesus altar in the community',
        'Eucharistic adoration at the community',
        'Community members in prayer before the Blessed Sacrament'
      ]
    }
  };

  const community = communitiesData[id];

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comunidade não encontrada</h2>
        <Link to="/comunidades">
          <Button>Voltar para Comunidades</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{community.name} - Paróquia de Nossa Senhora da Conceição</title>
        <meta name="description" content={community.description} />
      </Helmet>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/comunidades">
            <Button variant="ghost" className="text-white hover:text-blue-100 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Comunidades
            </Button>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            {community.name}
          </motion.h1>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre a Comunidade</h2>
                <p className="text-gray-600 leading-relaxed">{community.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Galeria de Fotos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {community.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                      <img className="w-full h-48 object-cover" alt={`${community.name} - Foto ${index + 1}`} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-50 rounded-xl p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Informações</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Endereço</p>
                      <p className="text-gray-600 text-sm">{community.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">Horário de Missas</p>
                      {community.masses.map((mass, index) => (
                        <p key={index} className="text-gray-600 text-sm">
                          {mass.day}: {mass.time}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Coordenador</p>
                      <p className="text-gray-600 text-sm">{community.coordinator}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                  <Link to="/contato">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Entre em Contato
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CommunityDetail;