import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'wizora_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  function addItem(book, qty = 1) {
    const id = book._id || book.id;
    setItems(list => {
      const existing = list.find(i => i.id === id);
      if (existing) return list.map(i => i.id === id ? { ...i, qty: i.qty + qty } : i);
      return [...list, { id, title: book.title, author: book.author, coverUrl: book.coverUrl || book.cover, price: book.sellingPrice ?? book.price ?? 0, qty }];
    });
  }

  function removeItem(id) { setItems(list => list.filter(i => i.id !== id)); }
  function updateQty(id, qty) { setItems(list => list.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)); }
  function clear() { setItems([]); }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);