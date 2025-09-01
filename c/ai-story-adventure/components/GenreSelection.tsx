"use client"

import { motion } from 'framer-motion';
import { Rocket, Cpu, Shield } from 'lucide-react';

interface GenreSelectionProps {
  onSelect: (genre: string) => void;
}

const genres = [
  {
    id: 'military-scifi',
    title: 'Military Sci-Fi',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-700',
    description: 'Tactical warfare in the stars'
  },
  {
    id: 'space-opera',
    title: 'Space Opera',
    icon: Rocket,
    gradient: 'from-purple-500 to-pink-700',
    description: 'Epic adventures across galaxies'
  },
  {
    id: 'tech-thriller',
    title: 'Space Tech Thriller',
    icon: Cpu,
    gradient: 'from-blue-500 to-cyan-700',
    description: 'High-stakes technological mysteries'
  }
];

export default function GenreSelection({ onSelect }: GenreSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          Choose Your Universe
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center text-gray-400 mb-12 text-lg"
        >
          Select a genre to begin your adventure
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {genres.map((genre, index) => {
            const Icon = genre.icon;
            return (
              <motion.button
                key={genre.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(genre.id)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  }}
                />
                <div className={`relative p-8 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-600 transition-all duration-300`}>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${genre.gradient} p-0.5`}>
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">{genre.title}</h3>
                  <p className="text-gray-400">{genre.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}