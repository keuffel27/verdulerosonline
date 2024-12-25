import { useEffect, useState, useRef } from 'react';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { supabase } from '../../services/supabase';
import { CartItem } from '../../types/store';
import { CheckoutForm } from './CheckoutForm';

interface Props {
  storeId: string;
}

export const FloatingCart: React.FC<Props> = ({ storeId }) => {
  const { items, removeItem: removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [socialMedia, setSocialMedia] = useState<any>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

  useEffect(() => {
    const loadSocialMedia = async () => {
      if (!storeId) return;
      
      try {
        const { data, error } = await supabase
          .from('store_social_media')
          .select('*')
          .eq('store_id', storeId)
          .single();

        if (error) throw error;
        setSocialMedia(data);
      } catch (error) {
        console.error('Error loading social media:', error);
      }
    };

    loadSocialMedia();
  }, [storeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        // Solo cerramos si se hace clic en el botón de cerrar
        if ((event.target as Element)?.closest('.close-cart-button')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Efecto para abrir el carrito cuando se agregan productos
  useEffect(() => {
    if (items.length > 0) {
      setIsOpen(true);
    }
  }, [items.length]);

  const handleUpdateQuantity = (productId: string, presentationId: string, delta: number) => {
    const item = items.find(
      item => item.product.id === productId && item.presentation.id === presentationId
    );
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + delta);
    if (newQuantity === 0) {
      removeFromCart(productId, presentationId);
    } else {
      updateQuantity(productId, presentationId, newQuantity);
      setLastAddedItem(`${productId}-${presentationId}`);
      setTimeout(() => setLastAddedItem(null), 1000);
    }
  };

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const total = items.reduce((sum, item) => sum + (item.presentation.price * item.quantity), 0);

  return (
    <div ref={cartRef} className="fixed bottom-4 right-4 z-50">
      {/* Botón del carrito con animación de pulso */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={items.length > 0 ? {
          scale: [1, 1.1, 1],
          transition: { duration: 0.3 }
        } : {}}
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-4 
                 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        <motion.span
          key={items.length}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 -right-2 bg-white text-green-600 
                  text-xs font-bold rounded-full w-5 h-5 flex items-center 
                  justify-center border-2 border-green-600"
        >
          {items.length}
        </motion.span>
      </motion.button>

      {/* Carrito desplegable con animaciones mejoradas */}
      <AnimatePresence>
        {isOpen && !showCheckoutForm && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-lg 
                     shadow-xl overflow-hidden max-h-[80vh]"
          >
            {/* Header con animación de gradiente */}
            <motion.div 
              className="flex items-center justify-between p-4 border-b
                       bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <h2 className="text-lg font-medium text-white">Tu Carrito</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="close-cart-button p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>

            {/* Lista de productos con animaciones */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(80vh - 200px)' }}>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Tu carrito está vacío</p>
                  <p className="text-sm">¡Agrega algunos productos!</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.presentation.id}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: lastAddedItem === `${item.product.id}-${item.presentation.id}` ? [1, 1.02, 1] : 1,
                      }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="flex items-start p-3 bg-white rounded-lg border 
                               hover:border-green-200 transition-all duration-300
                               hover:shadow-md"
                    >
                      {item.product.image_url && (
                        <motion.img
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-md object-cover mr-3"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.presentation.quantity} {item.presentation.unit.symbol}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <motion.p 
                            key={item.presentation.price * item.quantity}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-medium text-green-600"
                          >
                            {formatCurrency(item.presentation.price)}
                          </motion.p>
                          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdateQuantity(
                                item.product.id, 
                                item.presentation.id, 
                                -1
                              )}
                              className="p-1 rounded-full hover:bg-white 
                                       transition-colors text-red-500"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span 
                              key={item.quantity}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="w-6 text-center text-sm font-medium"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdateQuantity(
                                item.product.id, 
                                item.presentation.id, 
                                1
                              )}
                              className="p-1 rounded-full hover:bg-white 
                                       transition-colors text-green-500"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer con animación de total */}
            <motion.div 
              layout
              className="border-t bg-white p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total</span>
                <motion.span 
                  key={total}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-semibold"
                >
                  {formatCurrency(total)}
                </motion.span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 
                         text-white font-medium rounded-lg hover:shadow-lg
                         transition-all duration-300"
              >
                REALIZAR PEDIDO AHORA MISMO
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Formulario de checkout */}
        {showCheckoutForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                 onClick={() => setShowCheckoutForm(false)} />
            <div className="relative w-full max-w-md">
              <CheckoutForm
                onClose={() => {
                  setShowCheckoutForm(false);
                  setIsOpen(false);
                }}
                whatsappNumber={socialMedia?.whatsapp_number || ''}
                whatsappMessage={socialMedia?.whatsapp_message}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
