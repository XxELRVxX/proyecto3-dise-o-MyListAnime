# proyecto3-dise-o-MyListAnime

# MyListAnime

> Plataforma web de seguimiento de anime y manga.  
> Proyecto desarrollado con React, Vite y Tailwind CSS.

---

## Funcionalidades

- Buscar anime y manga (integración con Jikan API)
- Calificar títulos con un sistema de 10 estrellas
- Agregar títulos a listas personales con estado (viendo, completado, etc.)
- Ver progreso de episodios y capítulos
- Escribir y publicar reseñas con etiquetas y advertencia de spoilers
- Rankings de anime y manga
- Modo oscuro y modo claro

---

## Tecnologías

Tecnología: React,          Versión: 18,    Uso: UI y componentes
Tecnología: Vite,           Versión: 5,     Uso: Bundler y dev server
Tecnología: Tailwind CSS,   Versión: 3,     Uso: Estilos
Tecnología: React Router,   Versión: 6,     Uso: Navegación
Tecnología: Firebase,       Versión: 10,    Uso: Autenticación y base de datos
Tecnología: Jikan API,      Versión: v4,    Uso: Datos de anime y manga

---

## Cómo correr el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/XxELRVxX/proyecto3-dise-o-MyListAnime
cd proyecto3-dise-o-MyListAnime
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase


### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/          # Header, BottomNav, Sidebar
│   ├── ui/              # Componentes reutilizables (cards, chips, barras, etc.)
│   └── modals/          # Modales (agregar a lista, reseñas)
├── context/             # Estado global (Auth, Theme, List)
├── mocks/               # Datos de prueba para desarrollo local
├── pages/               # Páginas de la app (Home, Catalog, Rankings, etc.)
└── services/            # Lógica de Firestore y API de Jikan
```

---

## Sistema de diseño

El proyecto usa el tema **Neon Night** — diseño oscuro con colores principales morado (`#ddb7ff`), cyan (`#5de6ff`) y rosa (`#ffb2b7`). Los estilos base están definidos en `src/index.css` y `tailwind.config.js`.

---

# Autor

- Esteban Rodriguez Vargas
- Aron Gonzalez Silva
- Jeanpooll Alejandro Domenech Cerdas
