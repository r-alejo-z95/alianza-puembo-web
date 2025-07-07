# Proyecto: Alianza Puembo Web

Este es el sitio web oficial de la iglesia "Alianza Puembo", desarrollado para proporcionar una plataforma centralizada de comunicación e interacción con la comunidad. Incluye secciones informativas, ministerios, eventos, recursos, donaciones, contacto y oración.

## 🚀 Tecnologías Clave

El proyecto está construido utilizando las siguientes tecnologías:

-   **Framework**: Next.js (v15.x, App Router)
-   **Librería UI**: React (v19.x)
-   **Estilizado**: Tailwind CSS
-   **Componentes UI**: shadcn/ui (basado en Radix UI)
-   **Autenticación**: Supabase Auth
-   **Base de Datos**: Supabase (PostgreSQL)
-   **Almacenamiento de Archivos**: Supabase Storage
-   **Calendario**: FullCalendar
-   **Animaciones**: Framer Motion
-   **Validación de Esquemas**: Zod
-   **Supabase SSR Helpers**: `@supabase/ssr`

## ✨ Características Principales

-   **Secciones Informativas**: Conócenos (Equipo, Qué Creemos), Noticias.
-   **Ministerios**: Grupos Pequeños, Jóvenes, MAT, Misión Dignidad, Puembo Kids.
-   **Eventos**: Calendario de eventos, próximos eventos.
-   **Recursos**: LoM (Lee, ora y medita).
-   **Interacción**: Formularios de contacto y oración.
-   **Donaciones**: Información para apoyar la iglesia.
-   **Panel de Administración**: Rutas protegidas para la gestión de eventos, publicaciones LoM y peticiones de oración.

## 🛠️ Configuración y Desarrollo

### Requisitos

-   Node.js (v18.x o superior)
-   npm (o yarn/pnpm)

### Instalación

1.  Clona el repositorio (acceso restringido para miembros del equipo):
    ```bash
    git clone [URL_DEL_REPOSITORIO_PRIVADO]
    cd alianza-puembo-web
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

### Configuración de Supabase

Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase. Estas credenciales deben ser proporcionadas por el administrador del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### Ejecutar el proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:3000`.

### Comandos Adicionales

-   Compilar para producción:
    ```bash
    npm run build
    ```
-   Iniciar el servidor de producción:
    ```bash
    npm run start
    ```
-   Ejecutar el linter:
    ```bash
    npm run lint
    ```

## 🔒 Autenticación

El proyecto utiliza Supabase Auth para la gestión de usuarios. La ruta `/admin` y sus sub-rutas están protegidas y requieren autenticación. Los usuarios no autenticados son redirigidos a la página de login (`/login`).

## 📂 Estructura del Proyecto

```
alianza-puembo-web/
├── app/                 # Páginas y rutas de la aplicación (Next.js App Router)
├── components/          # Componentes React reutilizables
├── lib/                 # Utilidades, clientes Supabase, hooks, esquemas
├── public/              # Archivos estáticos (imágenes, iconos)
├── styles/              # Estilos globales y de Tailwind CSS
├── .env                 # Variables de entorno (no versionado)
├── middleware.ts        # Middleware de Next.js para protección de rutas
├── next.config.mjs      # Configuración de Next.js
├── package.json         # Dependencias y scripts del proyecto
└── tailwind.config.js   # Configuración de Tailwind CSS
```

## 🤝 Contribución

Este es un proyecto privado. Las contribuciones deben ser coordinadas con el equipo de desarrollo de la Iglesia Alianza Puembo. Por favor, sigue los estándares de código existentes y comunica cualquier cambio o mejora a través de los canales internos.

## 📄 Licencia

Este proyecto es propiedad de la Iglesia Alianza Puembo y su código es privado. No está destinado para distribución pública o uso sin autorización expresa. Todos los derechos reservados.
