# Proyecto: Alianza Puembo Web

Este documento contiene información clave sobre el proyecto web de Alianza Puembo, diseñado para ser utilizado por el agente Gemini para mantener el contexto a través de las sesiones.

## 1. Descripción General del Proyecto

Sitio web para la iglesia "Alianza Puembo", desarrollado con Next.js (App Router). Incluye secciones informativas, ministerios, eventos, recursos, donaciones, contacto y oración. El objetivo es proporcionar una plataforma centralizada para la comunicación y la interacción de la comunidad.

## 2. Tecnologías Clave Utilizadas

-   **Framework**: Next.js (v15.x, App Router)
-   **Librería UI**: React (v19.x)
-   **Estilizado**: Tailwind CSS
-   **Componentes UI**: shadcn/ui (basado en Radix UI)
-   **Autenticación**: Clerk (para gestión de usuarios y protección de rutas)
-   **Base de Datos**: Supabase (PostgreSQL)
    -   **Almacenamiento de Archivos**: Supabase Storage (para pósters de eventos)
-   **Calendario**: FullCalendar
-   **Animaciones**: Framer Motion
-   **Validación de Esquemas**: Zod

## 3. Comandos de Desarrollo Comunes

-   `npm install`: Instalar dependencias.
-   `npm run dev`: Iniciar el servidor de desarrollo (con Turbopack).
-   `npm run build`: Compilar el proyecto para producción.
-   `npm run start`: Iniciar el servidor de producción.
-   `npm run lint`: Ejecutar el linter.

## 4. Configuración de Supabase

-   **Tipo de Base de Datos**: PostgreSQL.
-   **Variables de Entorno**: Las credenciales de Supabase se almacenan en el archivo `.env` (no `.env.local`).
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   **Cliente Supabase**: Inicializado en `lib/supabaseClient.js`.
-   **Tablas Principales (Esquema Simplificado)**:
    -   `events`: `id`, `title`, `description`, `start_time`, `end_time`, `poster_url`, `created_at`, `user_id`.
    -   `lom_posts`: `id`, `title`, `content`, `publication_date`, `created_at`, `user_id`.
    -   `prayer_requests`: `id`, `request_text`, `is_anonymous`, `is_public`, `created_at`.
-   **Políticas de Row Level Security (RLS)**:
    -   **`events`**: Lectura pública, creación/modificación/eliminación por usuarios autenticados (admins).
    -   **`lom_posts`**: Lectura pública, creación/modificación/eliminación por el autor autenticado.
    -   **`prayer_requests`**: Creación por cualquiera. Lectura de peticiones públicas por cualquiera. Lectura/modificación/eliminación de TODAS las peticiones por usuarios autenticados (admins).

## 5. Configuración de Clerk (Autenticación)

-   **Protección de Rutas**: La ruta `/admin` y sus sub-rutas están protegidas por `middleware.ts` usando `clerkMiddleware`.
-   **Redirección Post-Inicio de Sesión**: `afterSignInUrl` en `ClerkProvider` (en `app/layout.js`) está configurado para redirigir a `/admin` después de un inicio de sesión exitoso.
-   **Botón "Admin Dashboard" en Footer**: Siempre visible, redirige a `/admin`. Si el usuario no está autenticado, inicia el flujo de inicio de sesión de Clerk y luego redirige.

## 6. Convenciones y Notas de Desarrollo

-   **Optimización de Imágenes**: Se utiliza el componente `<Image>` de `next/image` para la optimización automática de imágenes.
-   **Manejo de Formularios**: Se prefiere el uso de React 19 Actions para el manejo de formularios (ej. `app/contacto/page.js`).
-   **Animaciones**: Uso de `framer-motion` para animaciones sutiles y mejoras en la experiencia de usuario.
-   **Carga de Datos**: Los datos del calendario (`FullCalendar`) se cargan desde el servidor (Server Components) para mejorar el rendimiento inicial.
-   **Componentes UI**: Uso extensivo de componentes de `shadcn/ui` para una interfaz consistente y accesible.
