// Tipos básicos
interface CartItem {
  id: string;
  name: string;
  presentation: string;
  price: number;
  quantity: number;
}

class SimpleCart {
  private items: CartItem[] = [];
  private listeners: Function[] = [];

  constructor() {
    // Cargar items del localStorage al iniciar
    const saved = localStorage.getItem('simple-cart');
    if (saved) {
      this.items = JSON.parse(saved);
    }
  }

  // Añadir un listener para actualizaciones
  subscribe(listener: Function) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar a todos los listeners
  private notify() {
    this.listeners.forEach(listener => listener(this.items));
    localStorage.setItem('simple-cart', JSON.stringify(this.items));
  }

  // Añadir item al carrito
  addItem(item: Omit<CartItem, 'quantity'>) {
    const existingIndex = this.items.findIndex(
      i => i.id === item.id && i.presentation === item.presentation
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }

    this.notify();
  }

  // Remover item del carrito
  removeItem(id: string, presentation: string) {
    this.items = this.items.filter(
      item => !(item.id === id && item.presentation === presentation)
    );
    this.notify();
  }

  // Obtener todos los items
  getItems(): CartItem[] {
    return this.items;
  }

  // Obtener el total
  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Obtener cantidad total de items
  getCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Limpiar carrito
  clear() {
    this.items = [];
    this.notify();
  }
}

// Exportar una única instancia
export const simpleCart = new SimpleCart();
