# Proyecto: Alianza Puembo Web

Este documento contiene información clave sobre el proyecto web de Alianza Puembo, diseñado para ser utilizado por el agente Gemini para mantener el contexto a través de las sesiones.

## 1. Descripción General del Proyecto

Sitio web para la iglesia "Alianza Puembo", desarrollado con Next.js (App Router). Incluye secciones informativas, ministerios, eventos, recursos, donaciones, contacto y oración. El objetivo es proporcionar una plataforma centralizada para la comunicación y la interacción de la comunidad.

## 2. Tecnologías Clave Utilizadas

-   **Framework**: Next.js (v15.x, App Router)
-   **Librería UI**: React (v19.x)
-   **Estilizado**: Tailwind CSS
-   **Componentes UI**: shadcn/ui (basado en Radix UI)
-   **Autenticación**: Supabase Auth (para gestión de usuarios y protección de rutas)
-   **Base de Datos**: Supabase (PostgreSQL)
    -   **Almacenamiento de Archivos**: Supabase Storage (para pósters de eventos, bucket `event-posters`)
-   **Calendario**: FullCalendar
-   **Animaciones**: Framer Motion
-   **Validación de Esquemas**: Zod
-   **Supabase SSR Helpers**: `@supabase/ssr` (para manejo de autenticación en Server Components y Middleware)

## 3. Comandos de Desarrollo Comunes

-   `npm install`: Instalar dependencias.
-   `npm run dev`: Iniciar el servidor de desarrollo (con Turbopack).
-   `npm run build`: Compilar el proyecto para producción.
-   `npm run start`: Iniciar el servidor de producción.
-   `npm run lint`: Ejecutar el linter.

## 4. Configuración de Supabase

-   **Tipo de Base de Datos**: PostgreSQL.
-   **Variables de Entorno**: Las credenciales de Supabase se almacenan en el archivo `.env`.
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   **Clientes Supabase**: Los clientes de Supabase están organizados por entorno:
    -   `lib/supabase/client.js`: Para uso en Client Components (navegador).
    -   `lib/supabase/server.js`: Para uso en Server Components y API Routes (servidor).
    -   `lib/supabase/middleware.js`: Para uso específico en el `middleware.ts`.
-   **Tablas Principales (Esquema Simplificado)**:
    -   `events`: `id`, `title`, `description`, `start_time`, `end_time`, `poster_url`, `created_at`, `user_id`.
    -   `lom_posts`: `id`, `title`, `content`, `publication_date`, `created_at`, `user_id`, **`slug` (añadido para URLs amigables)**.
    -   `prayer_requests`: `id`, `request_text`, `is_anonymous`, `is_public`, `created_at`.
-   **Políticas de Row Level Security (RLS)**:
    -   **Tablas (`events`, `lom_posts`, `prayer_requests`)**: Las políticas están configuradas para permitir lectura pública en algunas tablas y operaciones de escritura/actualización/eliminación solo para usuarios autenticados, o para el autor del post en el caso de `lom_posts`.
    -   **Storage (`event-posters` bucket)**: 
        -   `SELECT`: Acceso de lectura público (`true`).
        -   `INSERT`, `UPDATE`, `DELETE`: Acceso solo para usuarios autenticados (`auth.role() = 'authenticated'`).

## 5. Configuración de Autenticación (Supabase Auth)

-   **Página de Login**: Implementada en `app/login/page.js`.
    -   Utiliza componentes de `shadcn/ui` para un formulario de inicio de sesión personalizado.
    -   No permite registro de usuarios ni inicio de sesión con proveedores externos (ej. Google).
    -   El botón principal utiliza el color `puembo-green`.
    -   El logo de Alianza Puembo se muestra en la página.
-   **Protección de Rutas**: La ruta `/admin` y sus sub-rutas están protegidas por `middleware.ts`.
    -   El `middleware.ts` utiliza `@supabase/ssr` para verificar la sesión del usuario.
    -   Los usuarios no autenticados son redirigidos a `/login`.
-   **Cierre de Sesión**: El botón "Cerrar Sesión" en el `AdminLayout` (`app/admin/layout.js`) redirige a la página principal (`/`) después de cerrar la sesión.

## 6. Convenciones y Notas de Desarrollo

-   **Optimización de Imágenes**: Se utiliza el componente `<Image>` de `next/image` para la optimización automática de imágenes.
-   **Manejo de Formularios**: Se prefiere el uso de `react-hook-form` y `Zod` para la gestión y validación de formularios.
-   **Animaciones**: Uso de `framer-motion` para animaciones sutiles y mejoras en la experiencia de usuario.
-   **Carga de Datos**: Los datos se cargan desde el servidor (Server Components) para mejorar el rendimiento inicial cuando sea posible.
-   **Componentes UI**: Uso extensivo de componentes de `shadcn/ui` para una interfaz consistente y accesible.
-   **Manejo de Zonas Horarias**: Las fechas y horas se convierten a UTC antes de ser guardadas en Supabase y se muestran en la hora local del usuario en los formularios para evitar desfases.
-   **Estilo de Calendario**: El calendario público (`UserCalendar`) utiliza estilos personalizados para los botones y el formato del mes, alineados con la paleta de colores de la iglesia.
-   **Tooltip de Eventos**: Al hacer hover sobre un evento en el calendario público, se muestra un tooltip de `shadcn/ui` con el título, descripción y hora de inicio del evento.

## 7. Principios de Desarrollo y Convenciones

Para mantener la simplicidad, legibilidad, escalabilidad y evitar la repetición de código, se siguen los siguientes principios:

-   **Estilos Unificados (`lib/styles.js`)**:
    -   Se centralizan las clases de Tailwind CSS más comunes y repetitivas en `lib/styles.js`.
    -   Esto incluye patrones para secciones de página (`pageSection`), contenedores de encabezado (`pageHeaderContainer`), títulos principales (`pageTitle`), descripciones de página (`pageDescription`), y títulos de secciones (`sectionTitle`, `subSectionTitle`).
    -   Se utiliza `cn` de `clsx` para combinar condicionalmente las clases de Tailwind, manteniendo la legibilidad.

-   **Componentes Reutilizables**:
    -   Se extraen bloques de UI repetidos en componentes React separados para su reutilización.
    -   Los componentes se organizan en subdirectorios `admin/` y `public/` dentro de `components/` para una mejor modularidad y claridad, reflejando su uso en el panel de administración o en las secciones públicas del sitio.
    -   Se hace uso extensivo de los componentes de `shadcn/ui` (`Card`, `Button`, `Input`, `Textarea`, `Checkbox`, `Label`, `Tooltip`, `AlertDialog`, `Table`, `Badge`) para una interfaz consistente y accesible.
    -   Componentes personalizados como `ContactForm`, `PrayerRequestForm`, `RichTextEditor`, `EventManager`, `LomManager`, y `PrayerRequestManager` encapsulan funcionalidades específicas y su UI.

-   **Estructura de Páginas Públicas Consistente**:
    -   Todas las páginas públicas (excluyendo el homepage) siguen una estructura común:
        -   Un `<section>` principal con `className={pageSection}`.
        -   Un `<div>` para el encabezado con `className={pageHeaderContainer}`.
        -   Un `<h1>` para el título principal con `className={pageTitle}`.
        -   Un `<p>` opcional para la descripción con `className={pageDescription}`.
    -   Se ha eliminado `app/root-layout-client.js` y su funcionalidad se ha integrado directamente en `app/layout.js` o en `components/public/layout/RootLayoutClient.jsx` para simplificar la estructura de layouts.

-   **Manejo de Fechas Consistente**:
    -   Las fechas se formatean de manera uniforme en toda la aplicación, utilizando `toLocaleDateString` y `toLocaleTimeString` con opciones específicas para asegurar la consistencia (ej., sin segundos, formato localizado).
    -   Se considera la zona horaria (UTC) al recuperar y mostrar fechas para evitar desfases.

-   **Uso de Fuentes**:
    -   `Merriweather` se utiliza exclusivamente para títulos principales y subtítulos de sección (`font-merriweather`).
    -   `Poppins` se utiliza para el cuerpo del texto y otros elementos de UI.

-   **Server Actions**:
    -   Se utilizan `Server Actions` para el manejo de formularios y la interacción con la base de datos, lo que mejora la seguridad y el rendimiento.

-   **Validación y Gestión de Formularios**:
    -   Se utiliza `Zod` para la definición de esquemas y la validación de datos de formularios.
    -   `react-hook-form` se emplea para la gestión del estado de los formularios y la integración con la validación de `Zod`.

## 8. Gestión de Metadatos (SEO y Redes Sociales)

Next.js (App Router) centraliza la gestión de metadatos mediante la exportación de objetos `metadata` o funciones `generateMetadata` en archivos `layout.js` y `page.js`.

### 8.1. Metadatos Globales (`app/layout.js`)

-   Define los metadatos por defecto para todo el sitio.
-   `metadataBase`: URL base del sitio para construir URLs absolutas.
-   `title`: Incluye `template` (ej. `%s | Alianza Puembo`) y `default` para títulos consistentes.
-   `description`: Descripción general del sitio.
-   `openGraph` y `twitter`: Configuración para compartir en redes sociales (imágenes, títulos, descripciones). Las imágenes referenciadas (`/brand/logo-puembo.png`) deben existir en el directorio `public/`.
-   `alternates`: Define URLs canónicas.
-   `icons`: Configuración de favicons y `apple-touch-icon`.

### 8.2. Metadatos Específicos por Página

-   **Páginas Estáticas (`page.js`):** Exportan un objeto `metadata` con `title`, `description` y `alternates.canonical` específicos para la página. Estos valores anulan o se combinan con los del layout padre.
-   **Páginas Dinámicas (`[slug]/page.js`):** Utilizan la función `generateMetadata` (que puede ser `async`) para obtener datos y construir metadatos dinámicamente. Para títulos exactos que no sigan la plantilla del layout padre, se usa `title: { absolute: '...' }`.
-   **Páginas de Administración y Login:** Se les asignan metadatos específicos con `robots: { index: false, follow: false }` para evitar su indexación por motores de búsqueda.

### 8.3. Consideraciones Importantes

-   **`'use client'` y `metadata`:** No se puede exportar `metadata` ni `generateMetadata` desde componentes marcados con `'use client'`. En estos casos, la definición de metadatos debe moverse a un archivo `layout.js` dentro del mismo segmento de ruta.
-   **`params` en Server Components:** Al acceder a `params` en funciones `generateMetadata` o Server Components, es necesario `await` el objeto `params` antes de desestructurar sus propiedades (ej. `const { slug } = await params;`).

### 8.4. Favicons Condicionales (Light/Dark Mode)

Para favicons que cambian según el tema del sistema (claro/oscuro):
-   Se requieren dos archivos `.ico` (ej. `public/favicon-light.ico` y `public/favicon-dark.ico`).
-   Las etiquetas `<link>` se añaden directamente en la sección `<head>` del `app/layout.js`, utilizando el atributo `media="(prefers-color-scheme: light)"` o `media="(prefers-color-scheme: dark)"`.
-   La propiedad `icons` del objeto `metadata` en `app/layout.js` debe ser eliminada si se usan estas etiquetas `<link>` directas.

## 9. Refactorización de la Sección LOM (Lee, Ora, Medita)

La sección LOM ha sido refactorizada para utilizar rutas dinámicas basadas en "slugs", mejorando el SEO y la experiencia de usuario.

-   **Columna `slug`:** Se añadió una columna `slug` de tipo `TEXT` a la tabla `lom_posts` en Supabase para almacenar URLs amigables.
-   **Generación Automática de `slug`:** El `LomManager` en el panel de administración ahora genera y guarda automáticamente el `slug` a partir del título del devocional al crearlo o editarlo.
-   **Páginas Dinámicas:** La ruta `/recursos/lom/[slug]/page.js` muestra devocionales individuales, permitiendo la navegación entre el devocional anterior y siguiente.
-   **Redirección de Ruta Principal:** La ruta base `/recursos/lom` ahora redirige automáticamente al devocional más reciente, asegurando que los usuarios siempre vean el contenido más actual.
-   **Formato de Título:** El título de la pestaña del navegador para los devocionales LOM sigue el formato: `Título del Devocional | Devocionales LOM | Alianza Puembo`.