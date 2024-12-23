import { useState } from 'react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../../utils/format';
import type { Product, ProductPresentation } from '../../../types/store';
import noImage from '../../../assets/no-image';
import { Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!product || !product.presentations) {
    return null;
  }

  const activePresentations = product.presentations
    .filter(p => p.status === 'active')
    .sort((a, b) => a.price - b.price);

  if (activePresentations.length === 0 || product.status !== 'active') {
    return null;
  }

  const formatPresentation = (quantity: number, unit: { name: string, symbol: string }) => {
    if (quantity === 1000 && unit.symbol === 'g') return '1 kg';
    return `${quantity} ${unit.symbol}`;
  };

  const handleAddToCart = (presentation: ProductPresentation) => {
    setSelectedPresentation(presentation.id);

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.productId === product.id && item.presentationId === presentation.id
    );

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        productId: product.id,
        presentationId: presentation.id,
        name: product.name,
        presentation: formatPresentation(presentation.quantity, presentation.unit),
        price: presentation.price,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { cart: currentCart }
    }));

    toast.success(
      `${formatPresentation(presentation.quantity, presentation.unit)} de ${product.name} agregado al carrito`,
      {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );

    setTimeout(() => {
      setSelectedPresentation(null);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
    >
      {/* Efecto de brillo en las esquinas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
      </motion.div>

      {/* Imagen con efectos */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <motion.img
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
          }}
          transition={{ duration: 0.4 }}
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <motion.div 
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"
        />
        
        {/* Etiqueta de categoría con efecto de brillo */}
        {product.category && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur opacity-30" />
              <span className="relative px-2.5 py-1 rounded-full text-xs font-medium
                           bg-white/90 text-green-800 shadow-lg backdrop-blur-sm">
                {product.category.name}
              </span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <motion.h3
          animate={{ 
            color: isHovered ? '#059669' : '#111827',
            y: isHovered ? -2 : 0
          }}
          transition={{ duration: 0.2 }}
          className="font-medium text-lg"
        >
          {product.name}
        </motion.h3>
        
        {product.description && (
          <motion.p 
            animate={{ opacity: isHovered ? 0.9 : 0.7 }}
            className="mt-1 text-sm text-gray-500 line-clamp-2"
          >
            {product.description}
          </motion.p>
        )}

        {/* Presentaciones */}
        <div className="mt-4 space-y-2">
          {activePresentations.map((presentation, index) => (
            <motion.button
              key={presentation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddToCart(presentation)}
              className={`w-full relative group/btn ${
                selectedPresentation === presentation.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white hover:bg-gray-50'
              } rounded-xl border border-green-100 hover:border-green-300
                shadow-sm hover:shadow-md transition-all duration-200 
                overflow-hidden`}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 
                           opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              
              {/* Contenido del botón */}
              <div className="relative px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: selectedPresentation === presentation.id ? 360 : 0,
                      scale: selectedPresentation === presentation.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${selectedPresentation === presentation.id
                                ? 'bg-white text-green-600'
                                : 'bg-green-600 text-white'}`}
                  >
                    {selectedPresentation === presentation.id ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </motion.div>
                  <span className={`font-medium ${
                    selectedPresentation === presentation.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    {formatPresentation(presentation.quantity, presentation.unit)}
                  </span>
                </div>
                <motion.span
                  animate={{
                    scale: selectedPresentation === presentation.id ? 1.1 : 1,
                  }}
                  className={`font-semibold ${
                    selectedPresentation === presentation.id ? 'text-white' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(presentation.price)}
                </motion.span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
