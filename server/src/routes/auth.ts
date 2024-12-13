import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';  

const router = express.Router();

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('🚨 Error crítico: Variables de entorno de Supabase no configuradas');
  throw new Error('Supabase environment variables not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Register endpoint
router.post('/register', async (req, res) => {
  const { storeName, ownerName, email, password } = req.body;
  
  try {
    logger.info(`📝 Iniciando registro para tienda: ${storeName}, email: ${email}`);

    // 1. Verificar si la tienda ya existe
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id, owner_email')
      .eq('owner_email', email)
      .single();

    if (existingStore) {
      logger.warn(`⚠️ Intento de registro con email existente: ${email}`);
      return res.status(400).json({ 
        message: 'Este email ya está registrado'
      });
    }

    // 2. Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      logger.error(`🚨 Error al crear usuario en auth: ${authError.message}`);
      throw authError;
    }

    // 3. Crear registro en stores
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([{
        name: storeName,
        owner_name: ownerName,
        owner_email: email,
        owner_id: authData.user.id,
        slug: storeName.toLowerCase().replace(/\s+/g, '-'),
        trial_start_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (storeError) {
      logger.error(`🚨 Error al crear tienda: ${storeError.message}`);
      // Rollback: eliminar usuario creado
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw storeError;
    }

    logger.info(`✅ Registro exitoso para tienda: ${storeName}`);
    res.status(201).json({
      message: 'Tienda creada exitosamente',
      store: {
        id: store.id,
        name: store.name,
        email: store.owner_email
      }
    });

  } catch (error) {
    logger.error(`🚨 Error en proceso de registro: ${error.message}`);
    res.status(500).json({ 
      message: 'Error al crear la tienda',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    logger.info(`🔐 Intento de login para email: ${email}`);

    // 1. Autenticar usuario
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      logger.warn(`⚠️ Error de autenticación para ${email}: ${authError.message}`);
      return res.status(401).json({ 
        message: 'Email o contraseña incorrectos'
      });
    }

    // 2. Obtener información de la tienda
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_email', email)
      .single();

    if (storeError || !store) {
      logger.error(`🚨 Usuario autenticado pero sin tienda asociada: ${email}`);
      return res.status(404).json({ 
        message: 'No se encontró una tienda asociada a este email'
      });
    }

    // 3. Verificar estado de suscripción
    if (store.subscription_status === 'expired') {
      logger.warn(`⚠️ Intento de login con suscripción expirada: ${email}`);
      return res.status(403).json({ 
        message: 'Tu período de prueba ha expirado. Por favor, contacta con soporte.'
      });
    }

    logger.info(`✅ Login exitoso para tienda: ${store.name}`);
    res.json({
      message: 'Login exitoso',
      session: authData.session,
      store: {
        id: store.id,
        name: store.name,
        email: store.owner_email,
        subscription_status: store.subscription_status
      }
    });

  } catch (error) {
    logger.error(`🚨 Error en proceso de login: ${error.message}`);
    res.status(500).json({ 
      message: 'Error al iniciar sesión',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
