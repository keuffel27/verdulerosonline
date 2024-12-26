import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`fixed w-full z-50 transition-all duration-300 ${isSticky ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <span className="text-2xl font-bold text-green-600">Verduleros Online</span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => scrollToSection('inicio')} className="text-gray-600 hover:text-green-600 transition-colors">Inicio</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => scrollToSection('caracteristicas')} className="text-gray-600 hover:text-green-600 transition-colors">Características</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => scrollToSection('porque-elegirnos')} className="text-gray-600 hover:text-green-600 transition-colors">¿Por qué elegirnos?</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => scrollToSection('planes')} className="text-gray-600 hover:text-green-600 transition-colors">Planes</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => scrollToSection('testimonios')} className="text-gray-600 hover:text-green-600 transition-colors">Testimonios</motion.button>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link to="/auth/login" className="px-6 py-2 text-green-600 hover:text-green-700 transition-colors">
                  Iniciar sesión
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link to="/auth/register" className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full hover:shadow-lg transition-all duration-300">
                  Crea tu tienda ahora
                </Link>
              </motion.div>
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
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        id="inicio" 
        className="pt-32 pb-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              variants={fadeInUp}
              className="md:w-1/2 mb-12 md:mb-0">
              <motion.h1 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-6xl font-extrabold mb-8 text-gray-900 leading-tight">
                Digitaliza y automatiza tu <span className="text-green-600 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">frutería o verdulería</span> en minutos
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-10 leading-relaxed">
                La plataforma líder en Latinoamérica que combina tienda online con asistente virtual 24/7 para revolucionar tu negocio. Únete a cientos de negocios que ya están en el futuro.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link to="/auth/register" className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300">
                  Empieza gratis hoy mismo
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2">
              <motion.img 
                whileHover={{ scale: 1.02 }}
                src="/hero-image.png" 
                alt="Tienda móvil de frutas y verduras" 
                className="w-full rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* What is Verduleros Online Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        id="que-es" 
        className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2 transform transition-all duration-500">
              <motion.h2 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Automatización inteligente para tu negocio</motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed">
                Verduleros Online es la solución completa para la digitalización de fruterías y verdulerias en Latinoamérica. Combina una potente tienda online con un asistente virtual inteligente vía WhatsApp que atiende a tus clientes 24/7, procesa pedidos automáticamente y te ayuda a crecer.
              </motion.p>
              <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-6 mb-10">
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Tienda online + WhatsApp Bot con IA</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Panel unificado de pedidos y clientes</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                  <CheckCircle2 className="text-green-600 mr-4 h-6 w-6" />
                  <span className="text-lg">Implementación en menos de 5 minutos</span>
                </motion.li>
              </motion.ul>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link to="/auth/register" className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                  Digitaliza tu negocio ahora
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2 transform transition-all duration-500 hover:translate-y-2">
              <motion.img 
                whileHover={{ scale: 1.02 }}
                src="/store-demo.png" 
                alt="Demo de la tienda" 
                className="w-full rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        id="caracteristicas" 
        className="py-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            La plataforma más completa para tu negocio
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[/* ... */].map((benefit, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-6 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
                  {benefit.icon}
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-2xl font-semibold mb-4">
                  {benefit.title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-lg">
                  {benefit.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        id="testimonios" 
        className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Casos de éxito en Latinoamérica
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[/* ... */].map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <motion.h3 
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-xl font-semibold">
                      {testimonial.name}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-green-600">
                      {testimonial.business}
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-500">
                      {testimonial.country}
                    </motion.p>
                  </div>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 italic">
                  "{testimonial.quote}"
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        id="planes" 
        className="py-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Planes diseñados para tu crecimiento
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[/* ... */].map((plan, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-green-500 transform scale-105' : ''}`}>
                <motion.h3 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-2xl font-bold mb-4">
                  {plan.name}
                </motion.h3>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Contactar" && <span className="text-gray-600">/mes</span>}
                </motion.div>
                <motion.ul 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="flex items-center">
                      <CheckCircle2 className="text-green-600 mr-2 h-5 w-5" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <Link to="/auth/register" className={`block text-center py-3 px-6 rounded-full transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' : 'border-2 border-green-600 text-green-600 hover:bg-green-50'}`}>
                    Comenzar ahora
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        id="faq" 
        className="py-24 bg-green-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16">
            ¿Tienes dudas? Aquí las resolvemos
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8">
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg">
              <motion.h3 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold mb-4">
                ¿Qué es Verduleros Online?
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600">
                Es una solución diseñada para que verdulerías y fruterías tengan su propia tienda online.
              </motion.p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg">
              <motion.h3 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold mb-4">
                ¿Es difícil de usar?
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600">
                No, es intuitivo y fácil para cualquier dueño de negocio.
              </motion.p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg">
              <motion.h3 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold mb-4">
                ¿Puedo probarlo antes?
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600">
                Sí, contamos con una demo gratuita.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-8">
            Digitaliza tu verdulería hoy mismo
          </motion.h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <Link to="/auth/register" className="inline-block px-10 py-4 bg-white text-green-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
              Empieza gratis ahora
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div 
              variants={fadeInUp}
              className="md:w-1/2">
              <motion.h3 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold mb-4">
                Verduleros Online
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400">
                La plataforma líder para verdulerías y fruterías online.
              </motion.p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="md:w-1/2">
              <motion.h4 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="font-semibold mb-4">
                Enlaces
              </motion.h4>
              <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2">
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-400 hover:text-white">
                  <button onClick={() => scrollToSection('inicio')} className="text-gray-400 hover:text-white">Inicio</button>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-400 hover:text-white">
                  <button onClick={() => scrollToSection('caracteristicas')} className="text-gray-400 hover:text-white">Características</button>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-400 hover:text-white">
                  <button onClick={() => scrollToSection('planes')} className="text-gray-400 hover:text-white">Planes</button>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-400 hover:text-white">
                  <button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-white">FAQ</button>
                </motion.li>
              </motion.ul>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="md:w-1/2">
              <motion.h4 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="font-semibold mb-4">
                Contacto
              </motion.h4>
              <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2">
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-400">
                  soporte@verdulerosonline.com
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-400">
                  +54 11 1234-5678
                </motion.li>
              </motion.ul>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="md:w-1/2">
              <motion.h4 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="font-semibold mb-4">
                Síguenos
              </motion.h4>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex space-x-4">
                <motion.a 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  href="#" 
                  className="text-gray-400 hover:text-white">
                  <MessageCircle />
                </motion.a>
                <motion.a 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  href="#" 
                  className="text-gray-400 hover:text-white">
                  <Users />
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <motion.p 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}>
              &copy; {new Date().getFullYear()} Verduleros Online. Todos los derechos reservados.
            </motion.p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;
