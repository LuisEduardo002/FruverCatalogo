import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

/**
 * FilterSidebar (fruver) — MISMO ESQUEMA visual, pero SOLO categoría.
 * Props extra (brands, selectedBrand, etc.) se ignoran por compatibilidad.
 */
export default function FilterSidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  onResetFilters,
}) {
  const hasActiveFilters = !!selectedCategory;

  return (
    <aside className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-green-600" />
          <h3 className="font-serif text-lg font-bold text-[#111111]">Filtros</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-green-700 transition-colors hover:text-[#111111]"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Solo Categoría */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">
          Categorías
        </h4>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onSelectCategory('')}
              className={`w-full text-left text-sm py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-green-50 text-green-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todas las categorías
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => onSelectCategory(cat)}
                className={`w-full text-left text-sm py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-green-50 text-green-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
