import { Product } from '@/types';

// PRODUCT UTILS
export const formatProductDescription = (description: string, maxLength: number = 100): string => {
  if (!description) return '';
  
  if (description.length <= maxLength) return description;
  
  return description.substring(0, maxLength) + '...';
};

export const extractKeywords = (text: string): string[] => {
  if (!text) return [];
   
  const stopWords = ['và', 'của', 'cho', 'với', 'bị', 'mà', 'là', 'các', 'những', 'này'];
  const words = text.toLowerCase()
    .split(/[,\s]+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  return [...new Set(words)];
};

export const calculateMatchScore = (product: Product, userKeywords: string[]): number => {
  if (!userKeywords.length) return 0;
  
  const productText = `${product.name} ${product.category} ${product.description} ${product.health_goal}`.toLowerCase();
  
  let matches = 0;
  userKeywords.forEach(keyword => {
    if (productText.includes(keyword.toLowerCase())) {
      matches++;
    }
  });
  
  return Math.round((matches / userKeywords.length) * 100);
};

// STRING UTILS
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, length: number): string => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// ARRAY UTILS
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// VALIDATION UTILS
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// DATE UTILS
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    năm: 31536000,
    tháng: 2592000,
    tuần: 604800,
    ngày: 86400,
    giờ: 3600,
    phút: 60,
    giây: 1,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit} trước`;
    }
  }
  
  return 'Vừa xong';
};