# MuUua! — Experiencia Web Interactiva & Studio CMS

> **"Tu personalidad se mezcla como un yogurt."**

Aplicación web interactiva completa para la marca **MuUua!**, compuesta por dos entornos estrictamente separados:
1. **Experiencia Pública (`/`)**: Test de personalidad sensorial donde el usuario observa cómo un vaso ilustrado de yogurt artesanal se llena capa por capa según sus respuestas, pasa por una animación de mezcla y descubre su personalidad final.
2. **Panel Administrativo Privado (`/#/studio-admin`)**: CMS y editor visual en tiempo real protegido con autenticación real, sin ningún enlace ni botón visible desde la página pública.

---

## Arquitectura del Proyecto

```text
muuua-yogurt-experience/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── supabase/
│   └── schema.sql                  # Tablas, políticas RLS y Storage Bucket
└── src/
    ├── main.tsx
    ├── App.tsx                     # Enrutamiento separado (Público vs Privado)
    ├── index.css                   # Variables CSS dinámicas y patrones de textura
    ├── types/
    │   └── experience.ts           # Modelos de datos del CMS, vaso, rutas y test
    ├── data/
    │   └── defaultConfig.ts        # Configuración inicial completa (5 personalidades)
    ├── services/
    │   ├── supabaseClient.ts       # Cliente Supabase Auth + DB + Storage
    │   ├── storageService.ts       # Persistencia en la nube, historial y subida de archivos
    │   └── quizEngine.ts           # Motor lógico de ingredientes, capas y puntuación
    ├── context/
    │   ├── AuthContext.tsx         # Autenticación y protección de sesión privada
    │   └── ExperienceContext.tsx   # Gestión de borradores, vista previa y publicación
    ├── components/
    │   ├── yogurt/
    │   │   ├── BrandLogo.tsx
    │   │   └── YogurtCupRenderer.tsx # Vaso ilustrado con capas onduladas y texturas
    │   ├── public/
    │   │   └── PublicExperience.tsx  # Pantallas 1 a 5 del recorrido del usuario
    │   └── admin/
    │       ├── AdminLogin.tsx        # Inicio de sesión privado
    │       ├── AdminDashboard.tsx    # 8 editores visuales con vista previa en vivo
    │       └── MediaUploader.tsx     # Carga de imágenes, GIFs y videos
    └── pages/
        └── AdminPortal.tsx           # Guardia de ruta protegida
```

---

## Instalación Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
4. **Acceder al panel privado:**
   Abre `http://localhost:5173/#/studio-admin` (ningún botón público lleva a esta ruta).

---

## Configuración de Persistencia Real y Seguridad (Gratis con Supabase)

Para que los cambios que publiques desde el panel administrativo se guarden en una base de datos real en la nube (y cualquier visitante los vea al instante desde su celular o computador):

1. Crea una cuenta gratuita en [Supabase](https://supabase.com) y crea un nuevo proyecto.
2. Ve a **SQL Editor**, pega todo el contenido de `supabase/schema.sql` y ejecútalo (**Run**). Esto crea:
   - La tabla `muuua_config` con **Row Level Security (RLS)**: lectura pública solo para la versión publicada y escritura restringida exclusivamente a tu usuario autenticado.
   - La tabla `muuua_versions` para restaurar versiones anteriores.
   - El bucket público `muuua-media` para alojar imágenes, GIFs y videos subidos desde tu panel.
3. Ve a **Authentication → Users → Add user** y crea tu cuenta privada de administradora (correo y contraseña).
4. Ve a **Project Settings → API** y copia tu `Project URL` y tu `anon public key` en las variables de entorno (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).

---

## Cómo Subirlo a GitHub y Desplegarlo

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "feat: experiencia interactiva MuUua! y Studio CMS privado"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/muuua-yogurt-experience.git
git push -u origin main
```
*(El archivo `.gitignore` ya protege tu `.env` para que nunca se suban credenciales al repositorio).*

### 2. Desplegar en Vercel (Recomendado) o GitHub Pages
* **En Vercel:** Importa tu repositorio de GitHub en [vercel.com](https://vercel.com), agrega tus variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en *Environment Variables* y haz clic en **Deploy**.
* **En GitHub Pages:** Ejecuta `npm run build` y publica la carpeta `dist/` (el proyecto usa `HashRouter` y `base: './'`, por lo que funciona sin errores de rutas 404 en GitHub Pages).
