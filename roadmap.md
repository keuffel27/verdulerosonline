# Roadmap: Verduleros Online

## Estructura Actual del Proyecto
- Frontend: React + TypeScript
- Backend: Supabase + Node.js
- Base de datos: Supabase
- Estilizado: Tailwind CSS
- Gestión de estado: Zustand (useAuthStore)
- Notificaciones: react-hot-toast
- Subida de imágenes: ImgBB API

## Estructura de Base de Datos
- Archivos SQL: `/supabase/*.sql`
- Archivo principal: `reset_and_setup.sql`
- Tabla principal de apariencia: `store_appearance`
  - Campos actuales:
    - logo_url
    - banner_url
    - store_address
    - welcome_text
    - display_name (nuevo)
    - products_background_url (nuevo)

## Ubicación de Componentes Clave
- Tiendas Públicas: `src/pages/store/StorePage.tsx`
  - Responsable de la visualización pública de las tiendas
  - Maneja productos, categorías, carrito y diseño
  - Usa campos personalizables:
    - display_name para título principal
    - products_background_url para fondo de productos

## Componentes Existentes
1. Autenticación
   - [x] Login/Register
   - [x] Protección de rutas
   - [x] Persistencia de sesión

2. Panel de Tienda
   - [x] Gestión de productos
   - [x] Categorías
   - [x] Redes sociales
   - [x] Configuración básica
   - [x] Apariencia mejorada
     - [x] Título personalizable
     - [x] Fondo de productos personalizable
     - [x] UI/UX optimizada
     - [x] Guardado manual de cambios
   - [x] Horarios

3. Carrito de Compras
   - [x] Contexto de carrito
   - [x] Formulario de checkout

## Servicios Implementados
- [x] Autenticación (auth.ts)
- [x] Gestión de productos (products.ts)
- [x] Gestión de órdenes (orders.ts)
- [x] Configuración de tienda (storeConfig.ts)
- [x] Analítica básica (analytics.ts)
- [x] Subida de imágenes (imageUpload.ts)
  - Integración con ImgBB API
  - Manejo de errores y validaciones
  - Límite de tamaño: 5MB
  - Formatos soportados: PNG, JPG, WebP
- [x] Gestión de horarios (schedule.ts)

## Optimizaciones Implementadas
1. [x] Optimización de rendimiento
   - [x] Lazy loading de componentes principales
   - [x] Sistema de caché de imágenes
   - [x] Componente OptimizedImage con:
     - Caché automático
     - Lazy loading nativo
     - Placeholders durante carga
     - Manejo de errores
   - [x] Corrección de exportaciones para lazy loading
   - [x] Componente ImageUploader mejorado:
     - Integración con ImgBB API
     - Validación de tipos y tamaños
     - UI/UX mejorada con estados de carga
     - Previsualizaciones optimizadas
     - Manejo de errores robusto

2. [x] Mejoras de UX en Panel de Apariencia
   - [x] Estado local para cambios pendientes
   - [x] Botón "Guardar Cambios" condicional
   - [x] Botón flotante en móviles
   - [x] Indicadores visuales de estado
   - [x] Transiciones y animaciones
   - [x] Mensajes de ayuda mejorados
   - [x] Layout responsive optimizado

## Próximos Pasos
1. [x] Mejoras de Personalización de Tienda
   - [x] Edición del título principal de la tienda (display_name)
   - [x] Personalización del fondo de productos (products_background_url)
   - [x] Más opciones de diseño en panel de administración

2. [ ] Mejoras de UX
   - [ ] Feedback visual en acciones
   - [ ] Estados de carga
   - [ ] Manejo de errores mejorado

3. [ ] Funcionalidades Adicionales
   - [ ] Sistema de búsqueda
   - [ ] Filtros avanzados
   - [ ] Historial de pedidos
   - [ ] Dashboard de análisis

4. [ ] Seguridad
   - [ ] Validación de datos
   - [ ] Rate limiting
   - [ ] Sanitización de inputs

## Notas Técnicas
- Base de datos: Supabase (URL: dplpnxzyjcorfjdotozm.supabase.co)
- API de imágenes: ImgBB
  - Límite de tamaño: 5MB
  - Formatos: PNG, JPG, WebP
  - Endpoint: https://api.imgbb.com/1/upload
  - Implementación en: imageUpload.ts
- Backend en puerto 3001
- Persistencia de sesión implementada
- Sistema de rutas protegidas activo
- Para editar aspectos de las tiendas públicas, modificar `StorePage.tsx`
- Para modificar la estructura de la BD, crear nuevas migraciones en `/supabase/migrations`
- Correcciones recientes:
  - Reemplazo de refetchStore por loadAppearance en StoreAppearance.tsx
  - Implementación de estado local para cambios pendientes
  - Mejora en el manejo de errores y notificaciones
  - Corrección del ImageUploader para usar ImgBB API correctamente
  - Simplificación de la interfaz de ImageUploader
  - Mejora en el manejo de estados de carga y errores

_Este documento se actualizará según avancemos en el proyecto._
