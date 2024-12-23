import { useEffect, useState } from 'react';
import { ShoppingCart, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { supabase } from '../../services/supabase';
import { CheckoutForm } from './CheckoutForm';
import { CartItem } from '../../types/store';

interface Props {
  storeId: string;
}

export const FloatingCart: React.FC<Props> = ({ storeId }) => {
  const { items, removeItem: removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [socialMedia, setSocialMedia] = useState<any>(null);

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

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

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
    }
  };

  const total = items.reduce((sum, item) => sum + (item.presentation.price * item.quantity), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      {/* Cart Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleCart}
        className="relative"
      >
        {/* Efecto de brillo en hover */}
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0 }}
          className="absolute -inset-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-full opacity-75 blur-lg"
        />
        
        {/* Botón principal */}
        <motion.div
          animate={{ 
            scale: isOpen ? 1.05 : 1,
            rotate: isOpen ? 180 : 0
          }}
          className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full shadow-lg
                   flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          
          {/* Contador de items */}
          <AnimatePresence>
            {items.length > 0 && (
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
                    {items.length}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>

      {/* Cart Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleCart} />

            {/* Content */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
              {!showCheckoutForm ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-auto relative"
                >
                  {/* Close button */}
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleCart}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors absolute top-4 right-4"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>

                  {/* Cart items */}
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
                        {items.map((item) => (
                          <motion.div
                            key={`${item.product.id}-${item.presentation.id}`}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
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
                                  {item.product.name}
                                </motion.h4>
                                <motion.p 
                                  layout="position"
                                  className="text-sm text-gray-500"
                                >
                                  {`${item.presentation.quantity} ${item.presentation.unit.symbol}`}
                                </motion.p>
                                <motion.p 
                                  layout="position"
                                  className="text-green-600 font-medium mt-1"
                                >
                                  {formatCurrency(item.presentation.price)}
                                </motion.p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateQuantity(item.product.id, item.presentation.id, -1)}
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
                                  onClick={() => handleUpdateQuantity(item.product.id, item.presentation.id, 1)}
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

                  {/* Total and Checkout */}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    
                    {items.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCheckoutForm(true)}
                        className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg 
                                hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
                                focus:ring-offset-2 transition-colors"
                      >
                        Finalizar Pedido
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <CheckoutForm
                  onClose={() => {
                    setShowCheckoutForm(false);
                    toggleCart();
                  }}
                  whatsappNumber={socialMedia?.whatsapp_number || ''}
                  whatsappMessage={socialMedia?.whatsapp_message}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
