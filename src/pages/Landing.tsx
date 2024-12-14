import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Menu,
  X as CloseIcon,
  ShoppingCart,
  Users,
  MessageCircle,
  Bot,
  Calculator,
  CheckCircle2,
  Scale,
  BarChart3
} from 'lucide-react';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isSticky ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">Verduleros Online</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('inicio')} className="text-gray-600 hover:text-green-600">Inicio</button>
              <button onClick={() => scrollToSection('caracteristicas')} className="text-gray-600 hover:text-green-600">Características</button>
              <button onClick={() => scrollToSection('porque-elegirnos')} className="text-gray-600 hover:text-green-600">¿Por qué elegirnos?</button>
              <button onClick={() => scrollToSection('planes')} className="text-gray-600 hover:text-green-600">Planes</button>
              <button onClick={() => scrollToSection('testimonios')} className="text-gray-600 hover:text-green-600">Testimonios</button>
              <Link to="/login" className="px-6 py-2 text-green-600 hover:text-green-700 transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/register" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                Crea tu tienda ahora
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <CloseIcon /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => scrollToSection('inicio')} className="block px-3 py-2 text-gray-600 hover:text-green-600 w-full text-left">Inicio</button>
              <button onClick={() => scrollToSection('caracteristicas')} className="block px-3 py-2 text-gray-600 hover:text-green-600 w-full text-left">Características</button>
              <button onClick={() => scrollToSection('porque-elegirnos')} className="block px-3 py-2 text-gray-600 hover:text-green-600 w-full text-left">¿Por qué elegirnos?</button>
              <button onClick={() => scrollToSection('planes')} className="block px-3 py-2 text-gray-600 hover:text-green-600 w-full text-left">Planes</button>
              <button onClick={() => scrollToSection('testimonios')} className="block px-3 py-2 text-gray-600 hover:text-green-600 w-full text-left">Testimonios</button>
              <Link to="/login" className="block px-3 py-2 text-green-600 hover:text-green-700 transition-colors text-center">
                Iniciar sesión
              </Link>
              <Link to="/register" className="block px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center">
                Crea tu tienda ahora
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0 transform transition-all duration-500 hover:translate-x-2">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-gray-900 leading-tight">
                Crea tu tienda online de <span className="text-green-600 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">frutas y verduras</span> en minutos
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                La manera más fácil y rápida de digitalizar tu negocio y llevarlo directamente a tus clientes.
              </p>
              <Link to="/register" className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                Empieza gratis hoy mismo
              </Link>
            </div>
            <div className="md:w-1/2 transform transition-all duration-500 hover:translate-y-2">
              <img src="/hero-image.png" alt="Tienda móvil de frutas y verduras" className="w-full rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* What is Verduleros Online Section */}
      <section id="que-es" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 transform transition-all duration-500">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Tu verdulería, ahora también online</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Verduleros Online es una plataforma pensada especialmente para verdulerías y fruterías. Te permite crear una tienda online fácilmente, optimizada para frutas y verduras, y ofrecer a tus clientes una experiencia de compra personalizada.
              </p>
              <ul className="space-y-6 mb-10">
                <li className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Compra por gramos (100 g, 250 g, 500 g, 1 kg)</span>
                </li>
                <li className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Sin complicaciones, con herramientas avanzadas</span>
                </li>
              </ul>
              <Link to="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                Digitaliza tu negocio ahora
              </Link>
            </div>
            <div className="md:w-1/2 transform transition-all duration-500 hover:translate-y-2">
              <img src="/store-demo.png" alt="Demo de la tienda" className="w-full rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="caracteristicas" className="py-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Todo lo que tu negocio necesita para vender más</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Store className="w-10 h-10 text-green-600" />,
                title: "Tu propia tienda online",
                description: "Optimizada para frutas y verduras"
              },
              {
                icon: <Scale className="w-10 h-10 text-green-600" />,
                title: "Compra personalizada",
                description: "Los clientes eligen cantidades exactas"
              },
              {
                icon: <ShoppingCart className="w-10 h-10 text-green-600" />,
                title: "Diseño móvil",
                description: "Perfecto para compras desde el celular"
              },
              {
                icon: <BarChart3 className="w-10 h-10 text-green-600" />,
                title: "Gestión sencilla",
                description: "Administra productos y pedidos fácilmente"
              },
              {
                icon: <Bot className="w-10 h-10 text-green-600" />,
                title: "Asistente IA",
                description: "Recomendaciones personalizadas"
              },
              {
                icon: <Calculator className="w-10 h-10 text-green-600" />,
                title: "Herramientas avanzadas",
                description: "Análisis y calculadoras de negocio"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="mb-6 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">{benefit.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-gray-600 text-lg">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Planes accesibles para todos los negocios</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="border-2 border-green-100 rounded-2xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-green-200">
              <h3 className="text-3xl font-bold mb-4">Básico</h3>
              <p className="text-4xl font-bold mb-8">$4.99<span className="text-xl text-gray-600">/mes</span></p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Tu propia tienda online</span>
                </li>
                <li className="flex items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Gestión de productos y pedidos</span>
                </li>
                <li className="flex items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Optimización móvil</span>
                </li>
                <li className="flex items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Bot IA para clientes (básico)</span>
                </li>
              </ul>
              <Link to="/register" className="block text-center px-6 py-3 bg-green-600 text-white rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                Comenzar con Básico
              </Link>
            </div>

            {/* Advanced Plan */}
            <div className="border-2 border-green-100 rounded-2xl p-10 bg-green-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-green-200">
              <h3 className="text-3xl font-bold mb-4">Avanzado</h3>
              <p className="text-4xl font-bold mb-8">$9.99<span className="text-xl text-gray-600">/mes</span></p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center p-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Todo lo del plan básico</span>
                </li>
                <li className="flex items-center p-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Bot IA avanzado para dueños</span>
                </li>
                <li className="flex items-center p-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Herramientas avanzadas de negocio</span>
                </li>
                <li className="flex items-center p-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-3 h-6 w-6" />
                  <span className="text-lg">Calculadoras de rentabilidad</span>
                </li>
              </ul>
              <Link to="/register" className="block text-center px-6 py-3 bg-green-600 text-white rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                Comenzar con Avanzado
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">¿Tienes dudas? Aquí las resolvemos</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">¿Qué es Verduleros Online?</h3>
              <p className="text-gray-600">Es una solución diseñada para que verdulerías y fruterías tengan su propia tienda online.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">¿Es difícil de usar?</h3>
              <p className="text-gray-600">No, es intuitivo y fácil para cualquier dueño de negocio.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">¿Puedo probarlo antes?</h3>
              <p className="text-gray-600">Sí, contamos con una demo gratuita.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Digitaliza tu verdulería hoy mismo</h2>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-green-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
            Empieza gratis ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Verduleros Online</h3>
              <p className="text-gray-400">La plataforma líder para verdulerías y fruterías online.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('inicio')} className="text-gray-400 hover:text-white">Inicio</button></li>
                <li><button onClick={() => scrollToSection('caracteristicas')} className="text-gray-400 hover:text-white">Características</button></li>
                <li><button onClick={() => scrollToSection('planes')} className="text-gray-400 hover:text-white">Planes</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-white">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">soporte@verdulerosonline.com</li>
                <li className="text-gray-400">+54 11 1234-5678</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><MessageCircle /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Users /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Verduleros Online. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
