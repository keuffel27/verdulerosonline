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
              <Link to="/auth/login" className="px-6 py-2 text-green-600 hover:text-green-700 transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/auth/register" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
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
              <Link to="/auth/login" className="block px-3 py-2 text-green-600 hover:text-green-700 transition-colors text-center">
                Iniciar sesión
              </Link>
              <Link to="/auth/register" className="block px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center">
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
                Digitaliza y automatiza tu <span className="text-green-600 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">frutería o verdulería</span> en minutos
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                La plataforma líder en Latinoamérica que combina tienda online con asistente virtual 24/7 para revolucionar tu negocio. Únete a cientos de negocios que ya están en el futuro.
              </p>
              <Link to="/auth/register" className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300">
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
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Automatización inteligente para tu negocio</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Verduleros Online es la solución completa para la digitalización de fruterías y verdulerias en Latinoamérica. Combina una potente tienda online con un asistente virtual inteligente vía WhatsApp que atiende a tus clientes 24/7, procesa pedidos automáticamente y te ayuda a crecer.
              </p>
              <ul className="space-y-6 mb-10">
                <li className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Tienda online + WhatsApp Bot con IA</span>
                </li>
                <li className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Panel unificado de pedidos y clientes</span>
                </li>
                <li className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Implementación en menos de 5 minutos</span>
                </li>
              </ul>
              <Link to="/auth/register" className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300">
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
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">La plataforma más completa para tu negocio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[/* ... */].map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="mb-6 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">{benefit.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-gray-600 text-lg">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Casos de éxito en Latinoamérica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[/* ... */].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-green-600">{testimonial.business}</p>
                    <p className="text-gray-500">{testimonial.country}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Planes diseñados para tu crecimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[/* ... */].map((plan, index) => (
              <div key={index} className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-green-500 transform scale-105' : ''}`}>
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Contactar" && <span className="text-gray-600">/mes</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle2 className="text-green-600 mr-2 h-5 w-5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth/register" className={`block text-center py-3 px-6 rounded-full transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' : 'border-2 border-green-600 text-green-600 hover:bg-green-50'}`}>
                  Comenzar ahora
                </Link>
              </div>
            ))}
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
          <Link to="/auth/register" className="inline-block px-10 py-4 bg-white text-green-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
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
