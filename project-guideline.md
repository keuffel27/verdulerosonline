# Verduleros Online - Guía del Proyecto

## 1. Estructura del Proyecto

```
/src
  /assets        - Recursos estáticos (imágenes, iconos, etc.)
  /components    - Componentes reutilizables de React
  /hooks         - Custom hooks de React
  /layouts       - Layouts y estructuras de página
  /lib          - Configuraciones y utilidades de bibliotecas
  /pages         - Páginas y rutas principales de la aplicación
  /services      - Servicios y llamadas a APIs
  /stores        - Estado global usando Zustand
  /types         - Definiciones de tipos TypeScript
  /utils         - Funciones auxiliares y utilidades
/server         - Código del servidor y APIs
/supabase       - Configuración y tipos de Supabase
/public         - Archivos estáticos públicos
```

## 2. Tecnologías y Dependencias

### Frontend
- **React (v18.3.1)** - Biblioteca principal para la interfaz de usuario
- **TypeScript** - Lenguaje principal con tipado estático
- **Vite** - Herramienta de construcción y desarrollo
- **TailwindCSS (v3.4)** - Framework de CSS utilitario
- **Zustand (v4.5)** - Gestión de estado global
- **React Router DOM (v6.28)** - Enrutamiento de la aplicación

### UI/UX
- **@headlessui/react** - Componentes UI accesibles
- **@heroicons/react** - Iconos vectoriales
- **react-hot-toast** - Notificaciones y toasts
- **tailwind-merge** - Utilidad para combinar clases de Tailwind

### Backend y Datos
- **Supabase** - Base de datos y autenticación
- **axios** - Cliente HTTP para peticiones API

### Utilidades
- **date-fns** - Manipulación de fechas
- **zod** - Validación de esquemas
- **nanoid** - Generación de IDs únicos
- **react-hook-form** - Manejo de formularios

## 3. Funcionalidades Clave

### Sistema de Carrito
- Implementado usando Zustand para estado global
- Persistencia local de datos del carrito
- Gestión de cantidades y productos

### Gestión de Productos
- Catálogo de productos con búsqueda y filtros
- Sistema de categorías
- Integración con Supabase para almacenamiento

### Interfaz de Usuario
- Diseño responsive usando TailwindCSS
- Componentes modulares y reutilizables
- Sistema de notificaciones con react-hot-toast

## 4. Convenciones de Codificación

### Nomenclatura
- **Componentes**: PascalCase (ej: `ProductCard.tsx`)
- **Hooks**: camelCase con prefijo "use" (ej: `useCart.ts`)
- **Utilidades**: camelCase (ej: `formatPrice.ts`)
- **Tipos**: PascalCase con sufijo descriptivo (ej: `ProductType.ts`)

### Estructura de Componentes
- Componentes funcionales con TypeScript
- Props tipadas explícitamente
- Uso de custom hooks para lógica reutilizable

### Estilos
- TailwindCSS para estilos principales
- Clases utilitarias organizadas con tailwind-merge
- Componentes estilizados modulares

## 5. Flujo de Datos

### Estado Global (Zustand)
```typescript
// Ejemplo de estructura del carrito
interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  // ...
}
```

### Manejo de Datos
- Estado local con React hooks
- Estado global con Zustand
- Persistencia en Supabase
- Cache local para optimización

## 6. Pendientes y Futuras Mejoras

### Funcionalidades Pendientes
- [ ] Sistema de autenticación de usuarios
- [ ] Panel de administración completo
- [ ] Historial de pedidos
- [ ] Sistema de búsqueda avanzada

### Optimizaciones Propuestas
- [ ] Implementar lazy loading para imágenes
- [ ] Mejorar el rendimiento del carrito con grandes cantidades
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar PWA para mejor experiencia móvil

## 7. Notas Adicionales

- El proyecto utiliza ESLint para mantener la calidad del código
- Se recomienda usar pnpm como gestor de paquetes
- La configuración de desarrollo está optimizada para Vite
- Se mantiene compatibilidad con las últimas versiones de navegadores modernos
