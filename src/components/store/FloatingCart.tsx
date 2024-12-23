import { useState, useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  productId: string;
  presentationId: string;
  name: string;
  presentation: string;
  price: number;
  quantity: number;
}

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setItems(cart);
      setItemCount(cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0));
    }

    const handleCartUpdate = (event: CustomEvent<{ cart: CartItem[] }>) => {
      setItems(event.detail.cart);
      setItemCount(event.detail.cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
  }, []);

  const updateItemQuantity = (productId: string, presentationId: string, delta: number) => {
    const newItems = items.map(item => {
      if (item.productId === productId && item.presentationId === presentationId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: newItems } }));
  };

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    const orderText = items
      .map(item => `${item.name} - ${item.presentation} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `*Pedido:*\n\n${orderText}\n\n*Total: ${formatCurrency(total)}*`;
    
    console.log('Pedido finalizado:', message);
    
    localStorage.setItem('cart', '[]');
    setItems([]);
    setItemCount(0);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl p-6 mb-4 w-96 max-h-[80vh] overflow-hidden flex flex-col relative"
          >
            {/* Efecto de brillo en las esquinas */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-2xl opacity-20 blur-lg" />
            
            {/* Contenido principal */}
            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <motion.h3 
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="text-xl font-semibold text-gray-800 flex items-center gap-2"
                >
                  Tu Carrito 
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-100 text-green-800 text-sm px-2 py-0.5 rounded-full"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </motion.h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Items */}
              <motion.div 
                className="flex-1 overflow-y-auto space-y-4 -mr-4 pr-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-500">Tu carrito está vacío</p>
                    <p className="text-sm text-gray-400 mt-1">¡Agrega algunos productos!</p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.productId}-${item.presentationId}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 
                                 shadow-sm hover:shadow-md transition-all duration-200
                                 border border-gray-100 hover:border-green-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <motion.h4 
                              layout="position"
                              className="font-medium text-gray-800"
                            >
                              {item.name}
                            </motion.h4>
                            <motion.p 
                              layout="position"
                              className="text-sm text-gray-500"
                            >
                              {item.presentation}
                            </motion.p>
                            <motion.p 
                              layout="position"
                              className="text-green-600 font-medium mt-1"
                            >
                              {formatCurrency(item.price)}
                            </motion.p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateItemQuantity(item.productId, item.presentationId, -1)}
                              className="p-1.5 hover:bg-red-50 rounded-full transition-colors text-red-500"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span 
                              layout
                              key={item.quantity}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="w-8 text-center font-medium"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateItemQuantity(item.productId, item.presentationId, 1)}
                              className="p-1.5 hover:bg-green-50 rounded-full transition-colors text-green-500"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>

              {/* Footer */}
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-600">Total</span>
                    <motion.span
                      key={items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-semibold text-gray-800"
                    >
                      {formatCurrency(items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </motion.span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinishOrder}
                    className="w-full relative overflow-hidden group"
                  >
                    {/* Fondo con gradiente y animación */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                    </div>
                    
                    {/* Contenido del botón */}
                    <div className="relative px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium">
                      <span>Finalizar Pedido</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {/* Efecto de brillo en hover */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute -inset-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-full opacity-75 blur-lg"
        />
        
        {/* Botón principal */}
        <motion.div
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            rotate: isOpen ? 180 : 0
          }}
          className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full shadow-lg
                   flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          
          {/* Contador de items */}
          <AnimatePresence>
            {itemCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="absolute -inset-0.5 bg-red-500 rounded-full blur opacity-50" />
                  <div className="relative bg-red-500 text-white text-xs w-6 h-6 
                               rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>
    </div>
  );
}
