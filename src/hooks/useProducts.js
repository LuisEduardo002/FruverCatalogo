import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllProducts, getCategories } from '../services/productService';
import { precioBase } from '../utils/peso';

const PAGE_SIZE = 30;
const STORAGE_KEY = 'fruver-catalog-state';

function getSavedState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * useProducts (fruver) — MISMO ESQUEMA que perfumes pero SOLO categoría.
 * Filtra por búsqueda + categoría, ordena por precio/nombre/destacados.
 */
export function useProducts(initialState = {}, initialData = null) {
  const saved = getSavedState();
  const mergedState = { ...saved, ...initialState };

  const [products, setProducts] = useState(initialData?.products || []);
  const [categories, setCategories] = useState(initialData?.categories || []);
  const [loading, setLoading] = useState(!initialData);

  const [searchTerm, setSearchTermState] = useState(mergedState.searchTerm || '');
  const [selectedCategory, setSelectedCategoryState] = useState(mergedState.selectedCategory || '');
  const [sortBy, setSortByState] = useState(mergedState.sortBy || 'featured');
  const [visibleCount, setVisibleCount] = useState(mergedState.visibleCount || PAGE_SIZE);

  useEffect(() => {
    if (initialData) {
      setProducts(initialData.products);
      setCategories(initialData.categories);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([getAllProducts(), getCategories()]).then(
      ([allProducts, cats]) => {
        setProducts(allProducts);
        setCategories(cats);
        setLoading(false);
      }
    );
  }, [initialData]);

  const setSearchTerm = useCallback((val) => {
    setSearchTermState(val);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const setSelectedCategory = useCallback((val) => {
    setSelectedCategoryState(val);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const setSortBy = useCallback((val) => {
    setSortByState(val);
    setVisibleCount(PAGE_SIZE);
  }, []);

  // Compatibilidad: el Catalog viejo llamaba estos setters. Ahora son no-op.
  const setSelectedBrand = useCallback(() => {}, []);
  const setSelectedGender = useCallback(() => {}, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          searchTerm === '' ||
          product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === '' ||
          product.categoria?.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return precioBase(a) - precioBase(b);
        if (sortBy === 'price-desc') return precioBase(b) - precioBase(a);
        if (sortBy === 'name-asc') return a.nombre.localeCompare(b.nombre);
        return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0);
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const loadMore = useCallback(() => {
    setVisibleCount((currentCount) => currentCount + PAGE_SIZE);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTermState('');
    setSelectedCategoryState('');
    setSortByState('featured');
    setVisibleCount(PAGE_SIZE);
  }, []);

  return {
    products: visibleProducts,
    totalCount: filteredProducts.length,
    visibleCount: visibleProducts.length,
    hasMore: visibleProducts.length < filteredProducts.length,
    loadMore,
    allCount: products.length,
    categories,
    brands: [],
    loading,
    searchTerm,
    selectedCategory,
    selectedBrand: '',
    selectedGender: '',
    sortBy,
    setSearchTerm,
    setSelectedCategory,
    setSelectedBrand,
    setSelectedGender,
    setSortBy,
    resetFilters,
  };
}
