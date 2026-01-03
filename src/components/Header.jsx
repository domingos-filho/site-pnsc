
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isMember } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Início', path: '/' },
    { name: 'Comunidades', path: '/comunidades' },
    { name: 'Pastorais', path: '/pastorais' },
    { name: 'Galeria', path: '/galeria' },
    { name: 'Agenda', path: '/agenda' },
    { name: 'Quem Somos', path: '/quem-somos' },
    { name: 'Equipe', path: '/equipe' },
    { name: 'Contato', path: '/contato' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center space-x-3 h-full">
            <img 
              src="https://horizons-cdn.hostinger.com/8926cfa8-6425-4293-b55f-e15069c2a814/105e1d822f2ce62f221e65e8659a802a.png" 
              alt="Brasão da Paróquia" 
              className="h-full py-2 object-contain"
            />
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-bold text-blue-800">Paróquia de Nossa Senhora da</span>
              <span className="text-4xl text-blue-600 font-Amoresa">Conceição</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                {item.name}
              </Link>
            ))}
            
            <div className="w-px h-6 bg-gray-200" />

            {user && isMember ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-700 hover:text-blue-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4"
            >
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t my-2" />
              {user && isMember ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
