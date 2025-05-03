// src/utils/productFilter.ts

export interface Product {
  name: string;
  price: number;
  description: string;
  link: string;
  image?: string; // Opcional
}

/**
 * Filtra productos según el rango de precios o categoría.
 * @param products - Lista completa de productos.
 * @param filters - Criterios de filtrado: `maxPrice`, `minPrice`, `category`.
 * @returns Una lista de productos filtrados.
 */
export function filterProducts(
  products: Product[],
  filters: {
    maxPrice?: number;
    minPrice?: number;
    category?: "media" | "premium";
  }
): Product[] {
  return products.filter((product) => {
    const productPrice = product.price;

    // Aplicar filtro por precio máximo
    if (filters.maxPrice !== undefined && productPrice > filters.maxPrice) {
      return false;
    }

    // Aplicar filtro por precio mínimo
    if (filters.minPrice !== undefined && productPrice < filters.minPrice) {
      return false;
    }

    // Aplicar filtro por categoría
    if (filters.category === "media" && productPrice > 1000000) {
      return false;
    }

    if (filters.category === "premium" && productPrice < 4000000) {
      return false;
    }

    return true;
  });
}
