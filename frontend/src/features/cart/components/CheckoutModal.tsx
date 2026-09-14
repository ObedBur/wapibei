"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Address, AddressService } from "@/features/addresses/services/address.service";
import { useAuth } from "@/context/AuthContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  total: number;
  currency?: string;
  initialData?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  total,
  currency = "$",
  initialData = {},
}) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = React.useState<string>(initialData.address || "");

  React.useEffect(() => {
    if (isOpen && user) {
      AddressService.getAddresses()
        .then(data => {
          setAddresses(data);
          if (data.length > 0 && !selectedAddress) {
            const def = data.find(a => a.isDefault) || data[0];
            setSelectedAddress(`${def.street}, ${def.commune}, ${def.city}, ${def.province}`);
          }
        })
        .catch(err => console.error("Failed to load addresses", err));
    }
  }, [isOpen, user]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg max-h-[92dvh] bg-white dark:bg-[#1a1c1e] rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col"
          >
            {/* Header */}
            <div className="relative pt-8 pb-5 px-5 sm:pt-10 sm:pb-6 sm:px-8 text-center bg-linear-to-b from-gray-50/50 to-transparent dark:from-white/5 shrink-0">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
              <div className="mx-auto w-12 h-1 bg-[#E67E22]/20 rounded-full mb-6" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-deep-blue dark:text-white tracking-tight">
                Finalisez votre commande
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-6">
                Vos coordonnées seront envoyées au vendeur pour finaliser sur WhatsApp.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <Input
                  label="Nom et Prénom"
                  name="fullName"
                  placeholder="Ex: Jean Dupont"
                  defaultValue={initialData.fullName}
                  required
                />
                <Input
                  label="Adresse e-mail"
                  name="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  defaultValue={initialData.email}
                  required
                />
                <Input
                  label="Numéro de téléphone"
                  name="phone"
                  placeholder="06 XX XX XX XX"
                  defaultValue={initialData.phone}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between ml-1 mb-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Adresse de livraison
                    </label>
                  </div>
                  
                  {addresses.length > 0 && (
                    <div className="mb-2">
                      <select 
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-deep-blue dark:text-white outline-none focus:border-[#E67E22] transition-colors appearance-none"
                        onChange={(e) => {
                          const addr = addresses.find(a => a.id === e.target.value);
                          if (addr) {
                            setSelectedAddress(`${addr.street}, ${addr.commune}, ${addr.city}, ${addr.province}`);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Choisir dans le carnet d'adresses...</option>
                        {addresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.title} - {addr.street}, {addr.commune}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <textarea
                    name="address"
                    placeholder="Ville, commune, quartier ou point de rencontre"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-all resize-none text-deep-blue dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full min-h-14 h-auto py-4 bg-[#E67E22] hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white font-bold whitespace-normal text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                    `Envoyer la commande • ${total.toLocaleString()} ${currency}`
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-medium">
                Pas de paiement en ligne • Le vendeur vous contacte sur WhatsApp
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

