import express from 'express';
import { Store } from '../models/Store';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { storeName, ownerName, email, password, phone, address } = req.body;

    // Check if store already exists
    const existingStore = await Store.findOne({ 
      $or: [{ email }, { storeName }] 
    });

    if (existingStore) {
      return res.status(400).json({ 
        message: existingStore.email === email 
          ? 'Este email ya está registrado' 
          : 'Este nombre de tienda ya está en uso' 
      });
    }

    // Create new store
    const store = new Store({
      storeName,
      ownerName,
      email,
      password,
      phone,
      address
    });

    await store.save();

    // Generate JWT token
    const token = jwt.sign(
      { storeId: store._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Tienda creada exitosamente',
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        email: store.email
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al crear la tienda' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find store by email
    const store = await Store.findOne({ email });
    if (!store) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Check password
    const isMatch = await store.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { storeId: store._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        email: store.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

export default router;
