'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  ChevronDown, 
  ChevronRight,
  Wheat, 
  Apple, 
  Laptop, 
  Shirt, 
  Home, 
  Sparkles, 
  Trophy, 
  Car, 
  Zap, 
  Wrench, 
  Briefcase,
} from 'lucide-react';
import { translateCategoryName } from '@/i18n/categoryNames';
import { useT } from '@/i18n/useT';
import { useEscape } from '@/hooks/useEscape';

// ─── STRUCTURE DE DONNÉES INSPIRÉE FIDÈLEMENT D'ALIEXPRESS ───
interface VisualProduct {
  title: string;
  image: string;
  query: string;
}

interface BrandTile {
  name: string;
  label: string;
  bg: string;
  text: string;
}

interface VisualSubGroup {
  title: string;
  items: VisualProduct[];
}

interface CategoryDetail {
  id: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  recommended: VisualProduct[];
  brands: BrandTile[];
  subgroups: VisualSubGroup[];
}

const MEGA_CATEGORIES_CATALOG: CategoryDetail[] = [
  {
    id: 'Agricole',
    name: 'Agricole',
    tagline: 'Récoltes du terroir & Direct producteurs',
    icon: Wheat,
    recommended: [
      { title: 'Farine & Fufu', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=75', query: 'fufu' },
      { title: 'Maïs en grains', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=160&q=75', query: 'mais' },
      { title: 'Huile de palme', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=160&q=75', query: 'huile' },
      { title: 'Haricots Kivu', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=160&q=75', query: 'haricots' },
      { title: 'Café Arabica', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=160&q=75', query: 'cafe' },
      { title: 'Pommes de terre', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=160&q=75', query: 'pomme+de+terre' },
      { title: 'Cossettes séchées', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'cossettes' },
      { title: 'Graines de soja', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=75', query: 'soja' },
      { title: 'Riz de Bumba', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=75', query: 'riz' },
      { title: 'Arachides bio', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=160&q=75', query: 'arachides' },
    ],
    brands: [
      { name: 'KIVU BIO', label: 'Kivu Bio Co-op', bg: '#2D5A27', text: '#FFFFFF' },
      { name: 'VIRUNGA', label: 'Virunga Coffee', bg: '#6F4E37', text: '#FFFFFF' },
      { name: 'AGRO-KIN', label: 'Agro-Kin Fermes', bg: '#059669', text: '#FFFFFF' },
      { name: 'MAYUMBE', label: 'Mayumbe Terroir', bg: '#15803D', text: '#FFFFFF' },
      { name: 'GOMA AGRI', label: 'Planteurs Goma', bg: '#D97706', text: '#FFFFFF' },
      { name: 'BUMBA', label: 'Riz de Bumba', bg: '#16A34A', text: '#FFFFFF' },
      { name: 'UVIRA', label: 'Sel Gemme Uvira', bg: '#0D9488', text: '#FFFFFF' },
      { name: 'BIO CONGO', label: 'BioCongo Nature', bg: '#65A30D', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Tubercules, Racines & Féculents',
        items: [
          { title: 'Manioc trempé', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=75', query: 'manioc' },
          { title: 'Igname sauvage', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=160&q=75', query: 'igname' },
          { title: 'Patates douces', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=75', query: 'patate+douce' },
          { title: 'Taro du Kivu', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=160&q=75', query: 'taro' },
          { title: 'Fécule pure', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'fecule' },
          { title: 'Farine banane', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=160&q=75', query: 'farine+banane' },
          { title: 'Poudre fufu', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=75', query: 'fufu' },
          { title: 'Cossettes', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'cossettes' },
        ],
      },
      {
        title: 'Céréales, Huiles & Condiments',
        items: [
          { title: 'Huile de palme', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=160&q=75', query: 'huile+palme' },
          { title: 'Piment séché', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=160&q=75', query: 'piment' },
          { title: 'Sel d’Uvira', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=160&q=75', query: 'sel' },
          { title: 'Gingembre frais', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=160&q=75', query: 'gingembre' },
          { title: 'Soja torréfié', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=75', query: 'soja' },
          { title: 'Riz blanc Bumba', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=75', query: 'riz' },
          { title: 'Poivre sauvage', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=160&q=75', query: 'poivre' },
          { title: 'Courge graines', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=160&q=75', query: 'courge' },
        ],
      },
    ],
  },
  {
    id: 'Alimentation',
    name: 'Alimentation',
    tagline: 'Produits frais, maraîchage & saveurs locales',
    icon: Apple,
    recommended: [
      { title: 'Capitaine frais', image: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=160&q=75', query: 'poisson' },
      { title: 'Tilapia du lac', image: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=160&q=75', query: 'tilapia' },
      { title: 'Mangues fraîches', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=160&q=75', query: 'mangues' },
      { title: 'Bananes plantains', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=160&q=75', query: 'bananes' },
      { title: 'Poulet fermier', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=160&q=75', query: 'poulet' },
      { title: 'Fromage de Goma', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=75', query: 'fromage' },
      { title: 'Avocats beurrés', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=160&q=75', query: 'avocat' },
      { title: 'Pain artisanal', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'pain' },
      { title: 'Lait entier frais', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=75', query: 'lait' },
      { title: 'Ananas Victoria', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=160&q=75', query: 'ananas' },
    ],
    brands: [
      { name: 'BRALIMA', label: 'Bralima RDC', bg: '#006633', text: '#FFFFFF' },
      { name: 'MARSAVCO', label: 'Marsavco Kin', bg: '#1E40AF', text: '#FFFFFF' },
      { name: 'LAIT KIVU', label: 'Laiterie du Kivu', bg: '#0284C7', text: '#FFFFFF' },
      { name: 'VICTOIRE', label: 'Pain Victoire', bg: '#D97706', text: '#FFFFFF' },
      { name: 'BRACONGO', label: 'Bracongo', bg: '#DC2626', text: '#FFFFFF' },
      { name: 'PECHE FLEUVE', label: 'Pêcheries Fleuve', bg: '#0891B2', text: '#FFFFFF' },
      { name: 'MIEL CONGO', label: 'Congo Miel Pur', bg: '#CA8A04', text: '#FFFFFF' },
      { name: 'KIN VIANDES', label: 'Boucherie Kin', bg: '#991B1B', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Poissons, Viandes & Produits Frais',
        items: [
          { title: 'Poisson fumé', image: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=160&q=75', query: 'poisson+fume' },
          { title: 'Chèvre locale', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=160&q=75', query: 'chevre' },
          { title: 'Œufs frais ferme', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=160&q=75', query: 'oeufs' },
          { title: 'Filet de bœuf', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=160&q=75', query: 'boeuf' },
          { title: 'Crevettes fleuve', image: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=160&q=75', query: 'crevettes' },
          { title: 'Poulet entier', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=160&q=75', query: 'poulet' },
          { title: 'Tilapia séché', image: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=160&q=75', query: 'tilapia+seche' },
          { title: 'Saucisses fraîches', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=160&q=75', query: 'saucisses' },
        ],
      },
      {
        title: 'Maraîchage, Légumes & Vergers',
        items: [
          { title: 'Tomates fraîches', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=160&q=75', query: 'tomate' },
          { title: 'Oignons rouges', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=160&q=75', query: 'oignon' },
          { title: 'Épinards Kivu', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=75', query: 'epinards' },
          { title: 'Piments verts', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=160&q=75', query: 'piment' },
          { title: 'Citrons verts', image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=160&q=75', query: 'citron' },
          { title: 'Goyaves sucrées', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=160&q=75', query: 'goyave' },
          { title: 'Pastèque locale', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=160&q=75', query: 'pasteque' },
          { title: 'Oranges douces', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=160&q=75', query: 'orange' },
        ],
      },
    ],
  },
  {
    id: 'High-Tech',
    name: 'High-Tech',
    tagline: 'Smartphones, informatique & énergie solaire',
    icon: Laptop,
    recommended: [
      { title: 'Smartphones 5G', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=75', query: 'smartphone' },
      { title: 'Laptops Pro', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=160&q=75', query: 'laptop' },
      { title: 'Écouteurs sans fil', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=160&q=75', query: 'ecouteurs' },
      { title: 'Smartwatch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&q=75', query: 'montre' },
      { title: 'Panneau Solaire', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'solaire' },
      { title: 'Powerbank 30k', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'powerbank' },
      { title: 'Onduleur 3kVA', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'onduleur' },
      { title: 'Tablette tactile', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=160&q=75', query: 'tablette' },
      { title: 'Batterie Gel 200Ah', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'batterie+gel' },
      { title: 'Câble 65W GaN', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'chargeur' },
    ],
    brands: [
      { name: 'SAMSUNG', label: 'Samsung Pro', bg: '#034EA2', text: '#FFFFFF' },
      { name: 'APPLE', label: 'Apple Certified', bg: '#000000', text: '#FFFFFF' },
      { name: 'TECNO', label: 'Tecno Mobile', bg: '#0080FF', text: '#FFFFFF' },
      { name: 'INFINIX', label: 'Infinix Africa', bg: '#48A742', text: '#FFFFFF' },
      { name: 'ORAIMO', label: 'Oraimo Direct', bg: '#5CB85C', text: '#FFFFFF' },
      { name: 'LENOVO', label: 'Lenovo Official', bg: '#E2231A', text: '#FFFFFF' },
      { name: 'XIAOMI', label: 'Xiaomi Store', bg: '#FF6700', text: '#FFFFFF' },
      { name: 'HUAWEI', label: 'Huawei Device', bg: '#CF0A2C', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Téléphonie & Accessoires Mobiles',
        items: [
          { title: 'Android 4G/5G', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=75', query: 'android' },
          { title: 'Coque antichoc', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'coque' },
          { title: 'Verre trempé 9D', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=75', query: 'verre+trempe' },
          { title: 'Chargeur GaN', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'chargeur' },
          { title: 'Support auto', image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=160&q=75', query: 'support+auto' },
          { title: 'Kit piéton filaire', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=160&q=75', query: 'ecouteurs' },
          { title: 'Trépied selfie', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&q=75', query: 'trepied' },
          { title: 'Carte SD 128G', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=160&q=75', query: 'carte+sd' },
        ],
      },
      {
        title: 'Énergie Solaire, Onduleurs & Batteries',
        items: [
          { title: 'Kit solaire 500W', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'kit+solaire' },
          { title: 'Régulateur MPPT', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'regulateur+mppt' },
          { title: 'Convertisseur 24V', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'convertisseur' },
          { title: 'Générateur silence', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'generateur' },
          { title: 'Lampe solaire LED', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'lampe+solaire' },
          { title: 'Batterie Lithium', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'batterie+lithium' },
          { title: 'Prise parafoudre', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'prise' },
          { title: 'Câble PV 6mm²', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'cable+solaire' },
        ],
      },
    ],
  },
  {
    id: 'Mode',
    name: 'Mode & Beauté',
    tagline: 'Wax hollandais, confection chic & accessoires',
    icon: Shirt,
    recommended: [
      { title: 'Super Wax Vlisco', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'wax' },
      { title: 'Robe Cocktail', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=160&q=75', query: 'robe' },
      { title: 'Baskets Street', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=75', query: 'sneakers' },
      { title: 'Chemise en lin', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=160&q=75', query: 'chemise' },
      { title: 'Sac en cuir', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'sac' },
      { title: 'Montre Classique', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=160&q=75', query: 'montre' },
      { title: 'Costume 3 Pièces', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=160&q=75', query: 'costume' },
      { title: 'Lunettes Soleil', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=160&q=75', query: 'lunettes' },
      { title: 'Ceinture en cuir', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=75', query: 'ceinture' },
      { title: 'Sandales chic', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=160&q=75', query: 'sandales' },
    ],
    brands: [
      { name: 'VLISCO', label: 'Vlisco Holland', bg: '#581C87', text: '#FFFFFF' },
      { name: 'WOODIN', label: 'Woodin Original', bg: '#B45309', text: '#FFFFFF' },
      { name: 'NIKE', label: 'Nike Sportswear', bg: '#111111', text: '#FFFFFF' },
      { name: 'ADIDAS', label: 'Adidas Originals', bg: '#111111', text: '#FFFFFF' },
      { name: 'KIN CHIC', label: 'Couture Kinshasa', bg: '#BE185D', text: '#FFFFFF' },
      { name: 'ZARA', label: 'Zara Fashion', bg: '#000000', text: '#FFFFFF' },
      { name: 'PUMA', label: 'Puma Street', bg: '#BA0C2F', text: '#FFFFFF' },
      { name: 'BOSS', label: 'Hugo Boss', bg: '#000000', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Tissus Nobles & Confection Wax',
        items: [
          { title: 'Wax Hollandais 6y', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'wax' },
          { title: 'Woodin Original', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'woodin' },
          { title: 'Dentelle brodée', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=160&q=75', query: 'dentelle' },
          { title: 'Pagne Kente pur', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'kente' },
          { title: 'Bazin riche', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=160&q=75', query: 'bazin' },
          { title: 'Coton imprimé', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'coton' },
          { title: 'Soie brillante', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=160&q=75', query: 'soie' },
          { title: 'Tissu Bogolan', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'bogolan' },
        ],
      },
      {
        title: 'Chaussures, Baskets & Maroquinerie',
        items: [
          { title: 'Mocassins cuir', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=160&q=75', query: 'mocassins' },
          { title: 'Sneakers montantes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=75', query: 'sneakers' },
          { title: 'Escarpins hauts', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=160&q=75', query: 'escarpins' },
          { title: 'Sac à dos cuir', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=75', query: 'sac+a+dos' },
          { title: 'Pochette soirée', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=75', query: 'pochette' },
          { title: 'Valise voyage', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=75', query: 'valise' },
          { title: 'Portefeuille pro', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=75', query: 'portefeuille' },
          { title: 'Sandales cuir', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=160&q=75', query: 'sandales' },
        ],
      },
    ],
  },
  {
    id: 'Maison',
    name: 'Maison & Électroménager',
    tagline: 'Mobilier de salon, literie & équipement cuisine',
    icon: Home,
    recommended: [
      { title: 'Canapé d’Angle', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=160&q=75', query: 'canape' },
      { title: 'Batterie Inox', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=160&q=75', query: 'cuisine' },
      { title: 'Frigo Solaire', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=160&q=75', query: 'refrigerateur' },
      { title: 'Matelas Ortho', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=160&q=75', query: 'matelas' },
      { title: 'Ventilateur Tour', image: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=160&q=75', query: 'ventilateur' },
      { title: 'Table à Manger', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=160&q=75', query: 'table' },
      { title: 'Blender Mixeur', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=160&q=75', query: 'blender' },
      { title: 'Gazinière 4 Feux', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=160&q=75', query: 'gaziniere' },
      { title: 'Micro-ondes', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=160&q=75', query: 'micro-ondes' },
      { title: 'Miroir Mural', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=160&q=75', query: 'miroir' },
    ],
    brands: [
      { name: 'LG', label: 'LG Electronics', bg: '#A50034', text: '#FFFFFF' },
      { name: 'HISENSE', label: 'Hisense Congo', bg: '#009A96', text: '#FFFFFF' },
      { name: 'MIDEA', label: 'Midea Home', bg: '#0099DA', text: '#FFFFFF' },
      { name: 'TEFAL', label: 'Tefal Cuisine', bg: '#E30613', text: '#FFFFFF' },
      { name: 'MOULINEX', label: 'Moulinex France', bg: '#E2001A', text: '#FFFFFF' },
      { name: 'PHILIPS', label: 'Philips Domestic', bg: '#0B5ED7', text: '#FFFFFF' },
      { name: 'MEUBLE KIN', label: 'Meubles Kinshasa', bg: '#854D0E', text: '#FFFFFF' },
      { name: 'BEKO', label: 'Beko Appliances', bg: '#002F6C', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Gros Électroménager & Cuisson',
        items: [
          { title: 'Congélateur coffre', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=160&q=75', query: 'congelateur' },
          { title: 'Four électrique', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=160&q=75', query: 'four' },
          { title: 'Réchaud à gaz', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=160&q=75', query: 'rechaud' },
          { title: 'Chauffe-eau 50L', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=160&q=75', query: 'chauffe-eau' },
          { title: 'Machine à laver', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=160&q=75', query: 'machine+a+laver' },
          { title: 'Hotte de cuisine', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=160&q=75', query: 'hotte' },
          { title: 'Frigo bar mini', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=160&q=75', query: 'frigo+bar' },
          { title: 'Friteuse sans huile', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=160&q=75', query: 'airfryer' },
        ],
      },
      {
        title: 'Salon, Literie & Décoration',
        items: [
          { title: 'Fauteuil velours', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=160&q=75', query: 'fauteuil' },
          { title: 'Table basse bois', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=160&q=75', query: 'table+basse' },
          { title: 'Drap satin 2P', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=160&q=75', query: 'draps' },
          { title: 'Oreiller mémoire', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=160&q=75', query: 'oreiller' },
          { title: 'Rideau occultant', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=160&q=75', query: 'rideaux' },
          { title: 'Tapis de salon', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=160&q=75', query: 'tapis' },
          { title: 'Armoire dressing', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=160&q=75', query: 'armoire' },
          { title: 'Étagère murale', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=160&q=75', query: 'etagere' },
        ],
      },
    ],
  },
  {
    id: 'Beauté & Santé',
    name: 'Beauté & Bien-être',
    tagline: 'Cosmétiques naturels, parfumerie & santé',
    icon: Sparkles,
    recommended: [
      { title: 'Karité Pur Bio', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'karite' },
      { title: 'Parfum de Grasse', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=160&q=75', query: 'parfum' },
      { title: 'Sérum Vitamine C', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'serum' },
      { title: 'Huile de Ricin', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'ricin' },
      { title: 'Rouge à Lèvres', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=160&q=75', query: 'rouge+a+levres' },
      { title: 'Tissage Naturel', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=160&q=75', query: 'perruque' },
      { title: 'Crème Corps Hydratante', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'creme' },
      { title: 'Savon Noir Pur', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'savon+noir' },
      { title: 'Gélules Zinc & Fer', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=160&q=75', query: 'vitamine' },
      { title: 'Tensiomètre Bras', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=160&q=75', query: 'tensiometre' },
    ],
    brands: [
      { name: 'NIVEA', label: 'Nivea Africa', bg: '#003277', text: '#FFFFFF' },
      { name: 'GARNIER', label: 'Garnier Paris', bg: '#55A227', text: '#FFFFFF' },
      { name: 'SHEA', label: 'Shea Moisture', bg: '#C59B27', text: '#000000' },
      { name: "L'OREAL", label: "L'Oréal Pro", bg: '#000000', text: '#FFFFFF' },
      { name: 'BIO CONGO', label: 'BioCongo Cosmétique', bg: '#16A34A', text: '#FFFFFF' },
      { name: 'CERAVE', label: 'CeraVe Skincare', bg: '#005691', text: '#FFFFFF' },
      { name: 'DOVE', label: 'Dove Beauty', bg: '#1F4E79', text: '#FFFFFF' },
      { name: 'MAYBELLINE', label: 'Maybelline NY', bg: '#E40046', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Soins Dermato, Visage & Corps',
        items: [
          { title: 'Huile de carotte', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'huile+carotte' },
          { title: 'Gel Aloe Vera', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'aloe+vera' },
          { title: 'Gommage café bio', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'gommage' },
          { title: 'Savon curcuma', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'curcuma' },
          { title: 'Masque argile', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'masque' },
          { title: 'Solaire SPF50', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'solaire' },
          { title: 'Crème anti-taches', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'anti-taches' },
          { title: 'Eau de rose pure', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=160&q=75', query: 'eau+de+rose' },
        ],
      },
      {
        title: 'Coiffure, Parfumerie & Bien-être',
        items: [
          { title: 'Mèches brésiliennes', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=160&q=75', query: 'meches' },
          { title: 'Fer à lisser pro', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=160&q=75', query: 'fer+a+lisser' },
          { title: 'Perruque lace 360', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=160&q=75', query: 'perruque' },
          { title: 'Shampoing sans sulfate', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'shampoing' },
          { title: 'Tondeuse sans fil', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=160&q=75', query: 'tondeuse' },
          { title: 'Diffuseur huiles', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=160&q=75', query: 'diffuseur' },
          { title: 'Vitamine D3 5000', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=160&q=75', query: 'vitamine+d' },
          { title: 'Tisane détox bio', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=160&q=75', query: 'tisane' },
        ],
      },
    ],
  },
  {
    id: 'Auto & Moto',
    name: 'Auto & Moto',
    tagline: 'Pièces détachées, pneumatiques & mécanique',
    icon: Car,
    recommended: [
      { title: 'Pneus Tout-Terrain', image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=160&q=75', query: 'pneus' },
      { title: 'Batterie 12V 70Ah', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'batterie+auto' },
      { title: 'Huile Moteur 15W40', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'huile+moteur' },
      { title: 'Phares LED H4', image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=160&q=75', query: 'phares' },
      { title: 'Casque Moto Intégral', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=160&q=75', query: 'casque+moto' },
      { title: 'Plaquettes de Frein', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=160&q=75', query: 'frein' },
      { title: 'Dashcam DVR HD', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=75', query: 'dashcam' },
      { title: 'Cric Hydraulique 3T', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=160&q=75', query: 'cric' },
      { title: 'Compresseur Pneu', image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=160&q=75', query: 'compresseur' },
      { title: 'Bougies Iridium', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'bougies' },
    ],
    brands: [
      { name: 'TOYOTA', label: 'Toyota Genuine', bg: '#EB0A1E', text: '#FFFFFF' },
      { name: 'TOTAL', label: 'TotalEnergies', bg: '#EE1C25', text: '#FFFFFF' },
      { name: 'MICHELIN', label: 'Michelin Pneus', bg: '#27509B', text: '#FFFFFF' },
      { name: 'BOSCH', label: 'Bosch Auto', bg: '#EA1D25', text: '#FFFFFF' },
      { name: 'YAMAHA', label: 'Yamaha Moto', bg: '#002C6C', text: '#FFFFFF' },
      { name: 'BAJAJ', label: 'Bajaj Boxer', bg: '#005DAA', text: '#FFFFFF' },
      { name: 'CASTROL', label: 'Castrol Lubricants', bg: '#00853F', text: '#FFFFFF' },
      { name: 'BRIDGE', label: 'Bridgestone', bg: '#ED1B24', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Pièces & Entretien Mécanique',
        items: [
          { title: 'Filtre à huile', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'filtre+huile' },
          { title: 'Liquide de frein', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'liquide+frein' },
          { title: 'Courroie distrib', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=160&q=75', query: 'courroie' },
          { title: 'Amortisseur gaz', image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=160&q=75', query: 'amortisseur' },
          { title: 'Disque de frein', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=160&q=75', query: 'disque+frein' },
          { title: 'Liquide refroid.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'refroidissement' },
          { title: 'Additif injecteur', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'injecteur' },
          { title: 'Filtre à air', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=160&q=75', query: 'filtre+air' },
        ],
      },
      {
        title: 'Motos, Scooters & Sécurité Routière',
        items: [
          { title: 'Chambre à air 18"', image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=160&q=75', query: 'chambre+a+air' },
          { title: 'Chaîne moto', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=160&q=75', query: 'chaine+moto' },
          { title: 'Rétroviseurs univers.', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=160&q=75', query: 'retroviseur' },
          { title: 'Gants cuir moto', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=160&q=75', query: 'gants+moto' },
          { title: 'Gilet réfléchissant', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=160&q=75', query: 'gilet' },
          { title: 'Bloque disque', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=160&q=75', query: 'antivol' },
          { title: 'Pneu arrière 3.00', image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=160&q=75', query: 'pneu+moto' },
          { title: 'Selle confort', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=160&q=75', query: 'selle' },
        ],
      },
    ],
  },
  {
    id: 'Boutique Express',
    name: 'Boutique Express',
    tagline: 'Livraison express en moins de 24h chrono',
    icon: Zap,
    recommended: [
      { title: 'Panier Frais du Jour', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=75', query: 'panier' },
      { title: 'Pack Eau 12x1.5L', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=160&q=75', query: 'eau' },
      { title: 'Câble Type-C 65W', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'cable' },
      { title: 'Pain Frais Matin', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'pain' },
      { title: 'Canettes Fraîches', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=160&q=75', query: 'boisson' },
      { title: 'Kit Premiers Secours', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=160&q=75', query: 'secours' },
      { title: 'Savons Antibactériens', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'savon' },
      { title: 'Piles AA Rechargeables', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'piles' },
      { title: 'Pack Lait UHT', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=75', query: 'lait' },
      { title: 'Clé USB 64Go', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=160&q=75', query: 'cle+usb' },
    ],
    brands: [
      { name: 'EXPRESS', label: 'WapiBei Express', bg: '#E67E22', text: '#FFFFFF' },
      { name: 'GOMA 24H', label: 'Goma Flash Direct', bg: '#10B981', text: '#FFFFFF' },
      { name: 'KIN FLASH', label: 'Kinshasa 24h Chrono', bg: '#2563EB', text: '#FFFFFF' },
      { name: 'L’SHI FAST', label: 'Express Lubumbashi', bg: '#F59E0B', text: '#FFFFFF' },
      { name: 'PHARMA 24', label: 'Urgences Pharma', bg: '#DC2626', text: '#FFFFFF' },
      { name: 'SUPER 24', label: 'SuperMarket Express', bg: '#7C3AED', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Épicerie Quotidienne & Boissons Express',
        items: [
          { title: 'Sachet riz 5kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=75', query: 'riz' },
          { title: 'Sucre blanc 1kg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'sucre' },
          { title: 'Huile table 1L', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=160&q=75', query: 'huile' },
          { title: 'Café soluble', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=160&q=75', query: 'cafe' },
          { title: 'Sardines à l’huile', image: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=160&q=75', query: 'sardines' },
          { title: 'Jus d’orange 1L', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=160&q=75', query: 'jus' },
          { title: 'Biscuits secs', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=160&q=75', query: 'biscuits' },
          { title: 'Plateau 30 œufs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=160&q=75', query: 'oeufs' },
        ],
      },
      {
        title: 'Dépannage Urgent Maison & Hygiène',
        items: [
          { title: 'Ampoule LED 12W', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'ampoule' },
          { title: 'Rallonge multiprise', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&q=75', query: 'rallonge' },
          { title: 'Ruban adhésif fort', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'adhesif' },
          { title: 'Cadenas sécurité', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=160&q=75', query: 'cadenas' },
          { title: 'Lampe torche USB', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'torche' },
          { title: 'Dentifrice famille', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&q=75', query: 'dentifrice' },
          { title: 'Papier hygiénique', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=160&q=75', query: 'papier' },
          { title: 'Savon liquide mains', image: 'https://images.unsplash.com/photo-1608248597359-2479e023477e?auto=format&fit=crop&w=160&q=75', query: 'savon' },
        ],
      },
    ],
  },
  {
    id: 'Sport & Loisirs',
    name: 'Sport & Loisirs',
    tagline: 'Football, fitness & activités plein air',
    icon: Trophy,
    recommended: [
      { title: 'Maillot Léopards RDC', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=160&q=75', query: 'maillot' },
      { title: 'Ballon Officiel Match', image: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=160&q=75', query: 'ballon' },
      { title: 'Haltères Réglables', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'halteres' },
      { title: 'Vélo Tout-Terrain', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=160&q=75', query: 'velo' },
      { title: 'Tapis de Fitness', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=160&q=75', query: 'tapis' },
      { title: 'Sac de Sport Pro', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=75', query: 'sac+sport' },
      { title: 'Corde à Sauter Lestée', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'corde' },
      { title: 'Gants Musculation', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'gants' },
      { title: 'Protège-Tibias Pro', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=160&q=75', query: 'tibias' },
      { title: 'Gourde Inox Isotherme', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=160&q=75', query: 'gourde' },
    ],
    brands: [
      { name: 'LEOPARDS', label: 'Léopards RDC Pro', bg: '#0284C7', text: '#FFFFFF' },
      { name: 'NIKE', label: 'Nike Football', bg: '#111111', text: '#FFFFFF' },
      { name: 'PUMA', label: 'Puma Teamwear', bg: '#BA0C2F', text: '#FFFFFF' },
      { name: 'ADIDAS', label: 'Adidas Performance', bg: '#111111', text: '#FFFFFF' },
      { name: 'DECATHLON', label: 'Decathlon Sport', bg: '#0082C3', text: '#FFFFFF' },
      { name: 'KIN GYM', label: 'Kin Fitness Club', bg: '#EA580C', text: '#FFFFFF' },
      { name: 'WILSON', label: 'Wilson Sports', bg: '#D50032', text: '#FFFFFF' },
      { name: 'SPALDING', label: 'Spalding Ball', bg: '#002244', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Football, Équipements & Matchs',
        items: [
          { title: 'Crampons moulés', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=75', query: 'crampons' },
          { title: 'Short Léopards', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=160&q=75', query: 'short' },
          { title: 'Chasubles équipe', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=160&q=75', query: 'chasuble' },
          { title: 'Gants gardien', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'gants+gardien' },
          { title: 'Pompe aiguille', image: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=160&q=75', query: 'pompe' },
          { title: 'Filet de but', image: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=160&q=75', query: 'filet' },
          { title: 'Sifflet arbitre', image: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=160&q=75', query: 'sifflet' },
          { title: 'Brassard capitaine', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=160&q=75', query: 'brassard' },
        ],
      },
      {
        title: 'Musculation, Cardio & Plein Air',
        items: [
          { title: 'Bandes élastiques', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'elastiques' },
          { title: 'Roue abdominale', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'abdos' },
          { title: 'Tente camping 4P', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=160&q=75', query: 'tente' },
          { title: 'Lampe frontale LED', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'frontale' },
          { title: 'Montre chronomètre', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&q=75', query: 'chrono' },
          { title: 'Sac randonnée 40L', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=75', query: 'sac+randonnee' },
          { title: 'Barre de traction', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'traction' },
          { title: 'Ceinture lombaire', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=160&q=75', query: 'ceinture+force' },
        ],
      },
    ],
  },
  {
    id: 'Services & Travaux',
    name: 'Services & Travaux',
    tagline: 'Artisans certifiés, plomberie & électricité',
    icon: Wrench,
    recommended: [
      { title: 'Kit Plomberie Pro', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'plomberie' },
      { title: 'Clé à Molette 12"', image: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97e06?auto=format&fit=crop&w=160&q=75', query: 'cle' },
      { title: 'Perceuse Visseuse', image: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97e06?auto=format&fit=crop&w=160&q=75', query: 'perceuse' },
      { title: 'Peinture Acrylique', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=160&q=75', query: 'peinture' },
      { title: 'Câble Électrique 2.5', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'cable' },
      { title: 'Tableau Disjoncteur', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'disjoncteur' },
      { title: 'Serrure Sécurité', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=160&q=75', query: 'serrure' },
      { title: 'Niveau Laser 360', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'laser' },
      { title: 'Poste à Souder Inverter', image: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97e06?auto=format&fit=crop&w=160&q=75', query: 'soudure' },
      { title: 'Échelle Télescopique', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'echelle' },
    ],
    brands: [
      { name: 'ARTISANS', label: 'Artisans Kin Certifiés', bg: '#475569', text: '#FFFFFF' },
      { name: 'ELECTRO', label: 'Électro Congo Solaire', bg: '#D97706', text: '#FFFFFF' },
      { name: 'FROID GOMA', label: 'Froid Express Goma', bg: '#0284C7', text: '#FFFFFF' },
      { name: 'BATIR RDC', label: 'Bâtir Ensemble RDC', bg: '#57534E', text: '#FFFFFF' },
      { name: 'BOSCH PRO', label: 'Bosch Professional', bg: '#005691', text: '#FFFFFF' },
      { name: 'DEWALT', label: 'DeWalt Tools', bg: '#FEB81C', text: '#000000' },
      { name: 'MAKITA', label: 'Makita Power', bg: '#00838F', text: '#FFFFFF' },
      { name: 'STANLEY', label: 'Stanley Works', bg: '#FFD100', text: '#000000' },
    ],
    subgroups: [
      {
        title: 'Plomberie, Tuyauterie & Sanitaire',
        items: [
          { title: 'Tuyau PVC pression', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'tuyau+pvc' },
          { title: 'Raccord laiton', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'raccord' },
          { title: 'Mitigeur cuisine', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'mitigeur' },
          { title: 'Colle PVC forte', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'colle+pvc' },
          { title: 'Téflon étanche', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'teflon' },
          { title: 'Siphon lavabo', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'siphon' },
          { title: 'Flotteur WC', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'flotteur' },
          { title: 'Pompe immergée', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=160&q=75', query: 'pompe' },
        ],
      },
      {
        title: 'Électricité Bâtiment & Énergie',
        items: [
          { title: 'Disjoncteur 16A', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'disjoncteur' },
          { title: 'Prise murale terre', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'prise' },
          { title: 'Interrupteur simple', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'interrupteur' },
          { title: 'Gaine annelée', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'gaine' },
          { title: 'Bornes Wago 5x', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'wago' },
          { title: 'Multimètre digital', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'multimetre' },
          { title: 'Testeur tension', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=160&q=75', query: 'testeur' },
          { title: 'Onduleur réseau', image: 'https://images.unsplash.com/photo-1558441719-7d8858e8b2bb?auto=format&fit=crop&w=160&q=75', query: 'onduleur' },
        ],
      },
    ],
  },
  {
    id: 'Bureautique',
    name: 'Bureautique & Éducation',
    tagline: 'Papeterie, impression & fournitures scolaires',
    icon: Briefcase,
    recommended: [
      { title: 'Rame Papier A4 80g', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=160&q=75', query: 'papier+a4' },
      { title: 'Imprimante Wi-Fi', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=160&q=75', query: 'imprimante' },
      { title: 'Cartouche HP Noir', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=160&q=75', query: 'toner' },
      { title: 'Chaise Ergonomique', image: 'https://images.unsplash.com/photo-1580481077195-27a36cb79805?auto=format&fit=crop&w=160&q=75', query: 'chaise+bureau' },
      { title: 'Stylos Bille Pack', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'stylos' },
      { title: 'Calculatrice Pro', image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=160&q=75', query: 'calculatrice' },
      { title: 'Classeurs à Levier', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=160&q=75', query: 'classeur' },
      { title: 'Agrafeuse Métal 50F', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'agrafeuse' },
      { title: 'Plastifieuse A4', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=160&q=75', query: 'plastifieuse' },
      { title: 'Destructeur Papier', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=160&q=75', query: 'destructeur' },
    ],
    brands: [
      { name: 'HP', label: 'HP Enterprise', bg: '#0096D6', text: '#FFFFFF' },
      { name: 'CANON', label: 'Canon Office', bg: '#BC002D', text: '#FFFFFF' },
      { name: 'DOUBLE A', label: 'Double A Paper', bg: '#004B87', text: '#FFFFFF' },
      { name: 'EPSON', label: 'Epson EcoTank', bg: '#00205B', text: '#FFFFFF' },
      { name: 'BIC', label: 'Bic Original', bg: '#EB6C00', text: '#FFFFFF' },
      { name: 'OXFORD', label: 'Oxford Cahiers', bg: '#003399', text: '#FFFFFF' },
      { name: 'MAPED', label: 'Maped Scolaire', bg: '#E30613', text: '#FFFFFF' },
      { name: 'CASIO', label: 'Casio Calcul', bg: '#003087', text: '#FFFFFF' },
    ],
    subgroups: [
      {
        title: 'Papeterie, Écriture & Scolaire',
        items: [
          { title: 'Cahier piqué 200p', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'cahier' },
          { title: 'Chemise cartonnée', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=160&q=75', query: 'chemise' },
          { title: 'Surligneurs 4 col.', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'surligneur' },
          { title: 'Marqueurs blanc', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'marqueur' },
          { title: 'Post-it bloc 100f', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'post-it' },
          { title: 'Ruban blanco', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'correcteur' },
          { title: 'Règle aluminium', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'regle' },
          { title: 'Boîte trombones', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'trombones' },
        ],
      },
      {
        title: 'Équipement Pro, Archivage & Mobilier',
        items: [
          { title: 'Bureau métal angle', image: 'https://images.unsplash.com/photo-1580481077195-27a36cb79805?auto=format&fit=crop&w=160&q=75', query: 'bureau' },
          { title: 'Caisson 3 tiroirs', image: 'https://images.unsplash.com/photo-1580481077195-27a36cb79805?auto=format&fit=crop&w=160&q=75', query: 'caisson' },
          { title: 'Lampe bureau LED', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=160&q=75', query: 'lampe+bureau' },
          { title: 'Tapis souris XL', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&q=75', query: 'tapis+souris' },
          { title: 'Support PC ventilé', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=160&q=75', query: 'support+pc' },
          { title: 'Tableau blanc mag.', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'tableau+blanc' },
          { title: 'Pochettes plastiques', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=160&q=75', query: 'pochettes' },
          { title: 'Carnet cuir note', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=160&q=75', query: 'carnet' },
        ],
      },
    ],
  },
];

export const CategoriesDropdown: React.FC = () => {
  const { t } = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('Agricole');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer au clavier (Échap) et rendre le focus au bouton déclencheur
  useEscape(isOpen, () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  });

  // Nettoyage du timeout
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Délai de grâce de 220ms pour éviter la fermeture accidentelle en déplacement diagonal (Fitts's Law)
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  // Catégorie active actuelle
  const activeDetail = useMemo(() => {
    return MEGA_CATEGORIES_CATALOG.find((cat) => cat.id === activeCategoryId) || MEGA_CATEGORIES_CATALOG[0];
  }, [activeCategoryId]);

  return (
    <div 
      className="relative shrink-0 select-none" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── BOUTON CAPSULE "TOUTES LES CATÉGORIES" STYLE ALIEXPRESS ── */}
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-[13px] tracking-tight transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/20'
            : 'bg-gray-100/90 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-[#E67E22] hover:text-white'
        }`}
      >
        <Menu className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        <span>{t('header.nav.allCategories') || 'Toutes les catégories'}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          strokeWidth={2}
        />
      </button>

      {/* ── MÉGA-MENU ÉTENDU DIRECTEMENT INSPIRÉ D'ALIEXPRESS ── */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-2 w-[1020px] xl:w-[1140px] 2xl:w-[1200px] h-[550px] bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 flex overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150"
          style={{ willChange: 'opacity, transform' }}
        >
          {/* ── COLONNE GAUCHE (RAIL DES CATÉGORIES STYLE ALIEXPRESS : ICÔNES PURES SANS BOÎTES NI FLÈCHES) ── */}
          <div className="w-[205px] xl:w-[220px] shrink-0 border-r border-gray-100 dark:border-white/8 bg-gray-50/70 dark:bg-[#171717] flex flex-col py-2 overflow-y-auto no-scrollbar">
            {MEGA_CATEGORIES_CATALOG.map((cat) => {
              const IconComp = cat.icon;
              const isActive = cat.id === activeCategoryId;

              return (
                <button
                  type="button"
                  key={cat.id}
                  onMouseEnter={() => setActiveCategoryId(cat.id)}
                  onClick={() => setActiveCategoryId(cat.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group relative flex items-center w-full text-left px-4 py-2.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-white dark:bg-[#202020] text-gray-950 dark:text-white font-bold shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/5 hover:text-gray-950 dark:hover:text-white font-normal'
                  }`}
                >
                  {/* Bordure active accentuée orange à gauche */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#E67E22]" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComp 
                      className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#E67E22] dark:text-[#F39C12]'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                      }`} 
                      strokeWidth={1.4} 
                    />
                    <span className="text-[13px] tracking-tight truncate">
                      {translateCategoryName(cat.name, t)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── PANNEAU PRINCIPAL DROIT (CONTENU RICHE STYLE ALIEXPRESS : PRODUITS DÉTOURÉS & TUILES MARQUES) ── */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar bg-white dark:bg-[#141414] space-y-5">
            
            {/* Header du rayon avec typographie affirmée & lien explorer */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/8 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                  {translateCategoryName(activeDetail.name, t)}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5">
                  {activeDetail.tagline}
                </p>
              </div>

              <Link
                href={`/products?category=${encodeURIComponent(activeDetail.id)}`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#E67E22] bg-[#E67E22]/10 hover:bg-[#E67E22] hover:text-white transition-all cursor-pointer"
              >
                <span>Tout explorer</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>

            {/* 1. SECTION "RECOMMENDED" (GRILLE HORIZONTALE DÉTOURÉE STYLE ALIEXPRESS) */}
            <div className="shrink-0">
              <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-2.5">
                {t('header.categoriesRecommended')}
              </h4>

              <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-1">
                {activeDetail.recommended.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/products?category=${encodeURIComponent(activeDetail.id)}&search=${encodeURIComponent(item.query)}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex flex-col items-center shrink-0 w-[72px] cursor-pointer"
                  >
                    <div className="relative size-14 rounded-lg bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/10 group-hover:border-[#E67E22]/50 group-hover:shadow-sm transition-all overflow-hidden flex items-center justify-center p-1">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                        sizes="56px"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#E67E22] text-center line-clamp-2 leading-tight mt-1.5 transition-colors">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. SECTION "SHOP BY BRAND" (TUILES RECTANGULAIRES COLORÉES + NOM EN DESSOUS) */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/8 shrink-0">
              <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-2.5">
                {t('header.categoriesShopByBrand')}
              </h4>

              <div className="flex items-start gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {activeDetail.brands.map((brand, idx) => (
                  <Link
                    key={idx}
                    href={`/sellers?q=${encodeURIComponent(brand.label)}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex flex-col items-center shrink-0 w-[74px] cursor-pointer"
                  >
                    <div 
                      className="w-[72px] h-[34px] rounded-md flex items-center justify-center font-black text-[10.5px] tracking-tight shadow-2xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: brand.bg, color: brand.text }}
                    >
                      <span className="truncate px-1 uppercase">{brand.name}</span>
                    </div>
                    <span className="text-[10.5px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-[#E67E22] text-center truncate max-w-[72px] mt-1 transition-colors">
                      {brand.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3 & 4. SECTIONS SOUS-CATÉGORIES VISUELLES (STYLE "CAR ELECTRONICS", ETC. ALIEXPRESS) */}
            {activeDetail.subgroups.map((group, gIdx) => (
              <div key={gIdx} className="pt-3 border-t border-gray-100 dark:border-white/8 shrink-0">
                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-2.5">
                  {group.title}
                </h4>

                <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-1">
                  {group.items.map((item, idx) => (
                    <Link
                      key={idx}
                      href={`/products?category=${encodeURIComponent(activeDetail.id)}&search=${encodeURIComponent(item.query)}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex flex-col items-center shrink-0 w-[72px] cursor-pointer"
                    >
                      <div className="relative size-14 rounded-lg bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/10 group-hover:border-[#E67E22]/50 group-hover:shadow-sm transition-all overflow-hidden flex items-center justify-center p-1">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                          sizes="56px"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#E67E22] text-center line-clamp-2 leading-tight mt-1.5 transition-colors">
                        {item.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* BANDEAU INFÉRIEUR DE RASSURANCE DISCRET */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/8 flex items-center justify-between text-[11.5px] text-gray-500 dark:text-gray-400 shrink-0">
              <span>Prix comparés en direct • Vendeurs vérifiés en RDC • Achat sécurisé</span>
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#E67E22] hover:underline"
              >
                Voir toutes les offres WapiBei →
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
