
import React from 'react';
import { Product, UserRole, User } from './types';

const now = new Date().toISOString();

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nebula Pro Headphones',
    description: 'Immersive spatial audio with active noise cancellation.',
    price: 2500,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/seed/nebula/600/600',
    stock: 15,
    isActive: true,
    createdAt: now,
  },
  {
    id: '2',
    name: 'Zenith Smart Watch',
    description: 'Track your health and stay connected with a 7-day battery life.',
    price: 1800,
    category: 'Wearables',
    imageUrl: 'https://picsum.photos/seed/watch/600/600',
    stock: 22,
    isActive: true,
    createdAt: now,
  },
  {
    id: '3',
    name: 'Lumina Mechanical Keyboard',
    description: 'Customizable RGB backlighting with tactile mechanical switches.',
    price: 1200,
    category: 'Peripherals',
    imageUrl: 'https://picsum.photos/seed/keyboard/600/600',
    stock: 8,
    isActive: true,
    createdAt: now,
  },
  {
    id: '4',
    name: 'Titan Gaming Mouse',
    description: 'Ultra-lightweight design with a 26K DPI optical sensor.',
    price: 750,
    category: 'Peripherals',
    imageUrl: 'https://picsum.photos/seed/mouse/600/600',
    stock: 30,
    isActive: true,
    createdAt: now,
  },
  {
    id: '5',
    name: 'Vortex VR Headset',
    description: 'The next generation of virtual reality experiences.',
    price: 4500,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/seed/vr/600/600',
    stock: 5,
    isActive: true,
    createdAt: now,
  },
  {
    id: '6',
    name: 'Solar Backpack',
    description: 'Eco-friendly backpack with integrated solar charging panel.',
    price: 950,
    category: 'Accessories',
    imageUrl: 'https://picsum.photos/seed/bag/600/600',
    stock: 12,
    isActive: true,
    createdAt: now,
  }
];

export const CATEGORIES = ['All', 'Electronics', 'Wearables', 'Peripherals', 'Accessories'];

export const MOCK_USER: User = {
  uid: 'u1',
  displayName: 'Alex Sterling',
  email: 'alex@example.com',
  balance: 5000,
  role: UserRole.CUSTOMER,
  photoURL: 'https://picsum.photos/seed/avatar1/200/200',
  createdAt: now,
  updatedAt: now
};

export const MOCK_ADMIN: User = {
  uid: 'a1',
  displayName: 'Admin Sarah',
  email: 'admin@pointshop.com',
  balance: 999999,
  role: UserRole.ADMIN,
  photoURL: 'https://picsum.photos/seed/admin/200/200',
  createdAt: now,
  updatedAt: now
};
