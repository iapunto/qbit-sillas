// Definición de tipo para un producto
export interface Product {
  name: string;
  price: number;
  description?: string; // Hacemos la descripción opcional por si acaso
  link?: string; // Hacemos el link opcional
  image?: string; // Hacemos la imagen opcional
  brand?: string; // Añadimos la marca, la hacemos opcional por flexibilidad
}

export const productList = [
  {
    name: "Silla Ergonómica Sihoo Doro S300 - Gris",
    price: 3550000,
    link: "https://sillas.com.co/tienda/silla-sihoo-doro-s300/?attribute_color=Gris",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/s300-gris.png",
    description:
      "Reclinación antigravedad y soporte lumbar avanzado en un elegante gris.",
    brand: "Sihoo"
  },
  {
    name: "Silla Ergonómica Sihoo Doro S300 - Negro",
    price: 3465000,
    link: "https://sillas.com.co/tienda/silla-sihoo-doro-s300/?attribute_color=Negro",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/s300-negra.png",
    description:
      "Máxima comodidad y ergonomía en un diseño moderno y sofisticado.",
    brand: "Sihoo"
  },
  {
    name: "Silla de Oficina Ergonómica Sihoo M102",
    price: 683000,
    link: "https://sillas.com.co/tienda/silla-de-oficina-ergonomica-sihoo-m102/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/M102.png",
    description:
      "Ideal para largas jornadas de trabajo, con soporte ajustable.",
    brand: "Sihoo"
  },
  {
    name: "Silla Ergonómica Sihoo Presidencial Star V1",
    price: 2250000,
    link: "https://sillas.com.co/tienda/silla-sihoo-presidencial-star-v1/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/star-v1.png",
    description:
      "Diseño elegante y confort superior para el ejecutivo moderno.",
    brand: "Sihoo"
  },
  {
    name: "Silla Ergonómica Sihoo Doro C300 Pro Negra",
    price: 2650000,
    link: "https://sillas.com.co/tienda/silla-ergonomica-sihoo-doro-c300-pro?attribute_color=Negro/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/c300-negra.png",
    description:
      "Ajuste dinámico y materiales de alta calidad para una experiencia ergonómica óptima.",
    brand: "Sihoo"
  },
  {
    name: "Silla Ergonómica Sihoo Doro C300 Pro Gris",
    price: 2735000,
    link: "https://sillas.com.co/tienda/silla-ergonomica-sihoo-doro-c300-pro?attribute_color=Gris/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/c300-gris.png",
    description:
      "Ajuste dinámico y materiales de alta calidad para una experiencia ergonómica óptima.",
    brand: "Sihoo"
  },
  {
    name: "Silla Ergonómica Sihoo Ergomax M97B",
    price: 2600000,
    link: "https://sillas.com.co/tienda/silla-ergonomica-sihoo-ergomax-m97b/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/M97B.png",
    description:
      "Soporte lumbar avanzado y reposabrazos 4D para una postura perfecta.",
    brand: "Sihoo"
  },
  {
    name: "SILLA GERENCIAL DELPHI ALUMINIO",
    price: 680000,
    link: "https://sillas.com.co/tienda/silla-gerencial-delphi-aluminio/",
    image:
      "https://sillas.com.co/wp-content/uploads/2025/04/delphi-aluminio.png",
    description: "Estilo y confort para la oficina moderna.",
    brand: "Nacional"
  },
  {
    name: "SILLA GERENCIAL DELPHI BASE NEGRA",
    price: 600000,
    link: "https://sillas.com.co/tienda/silla-gerencial-delphi-base-negra/",
    image:
      "https://sillas.com.co/wp-content/uploads/2025/04/delphi-base-negra.png",
    description: "Diseño ergonómico y precio accesible.",
    brand: "Nacional"
  },
  {
    name: "SILLA GERENCIAL NEFI GRIS",
    price: 1900000,
    link: "https://sillas.com.co/tienda/silla-gerencial-nefi-gris/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/nefi-gris.png",
    description: "Elegancia y confort en un diseño sofisticado.",
    brand: "Nacional"
  },
  {
    name: "SILLA OPERATIVA DELPHI BASE NEGRA",
    price: 450000,
    link: "https://sillas.com.co/tienda/silla-operativa-delphi-base-negra/",
    image:
      "https://sillas.com.co/wp-content/uploads/2025/04/operativa-delphi-base-negra.png",
    description: "Funcionalidad y comodidad para el día a día.",
    brand: "Nacional"
  },
  {
    name: "SILLA OPERATIVA DELPHI CROMADA",
    price: 485000,
    link: "https://sillas.com.co/tienda/silla-operativa-delphi-cromada/",
    image:
      "https://sillas.com.co/wp-content/uploads/2025/04/operativa-delphi-aluminio.png",
    description: "Diseño moderno y soporte ergonómico.",
    brand: "Nacional"
  },
  {
    name: "SILLA PRESIDENCIAL MANHATTAN ECO",
    price: 1700000,
    link: "https://sillas.com.co/tienda/silla-presidencial-manhattan-eco/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/manhattan-eco.png",
    description: "Lujo y confort con materiales ecológicos.",
    brand: "Nacional"
  },
  {
    name: "SILLA PRESIDENCIAL NIZA",
    price: 465000,
    link: "https://sillas.com.co/tienda/silla-presidencial-niza/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/niza.png",
    description: "Estilo clásico y comodidad para la oficina.",
    brand: "Nacional"
  },
  {
    name: "SILLA PRESIDENCIAL OSAKA",
    price: 818678,
    link: "https://sillas.com.co/tienda/silla-presidencial-osaka/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/osaka.png",
    description: "Diseño moderno y confort superior.",
    brand: "Nacional"
  },
  {
    name: "SILLA SIHOO S50",
    price: 1850000,
    link: "https://sillas.com.co/tienda/silla-sihoo-s50/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/s50.png",
    description: "Ergonomía y estilo en una silla de alta gama.",
    brand: "Nacional"
  },
  {
    name: "SILLA THINK GERENTE NEGRA",
    price: 750000,
    link: "https://sillas.com.co/tienda/silla-think-gerente-negra/",
    image: "https://sillas.com.co/wp-content/uploads/2025/04/think.png",
    description: "Diseño elegante y soporte ergonómico para largas jornadas.",
    brand: "Nacional"
  },
];
