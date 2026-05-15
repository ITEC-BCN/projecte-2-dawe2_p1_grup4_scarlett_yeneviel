
# Internia – Plataforma de Prácticas para FP

<p align="center">
    <img src="frontend/public/logos/InterniaVerde.png " width="500">
</p>

## Visión Estratégica y Propuesta de Valor

En un contexto donde la demanda de perfiles técnicos continúa creciendo, los estudiantes de Formación Profesional siguen encontrando dificultades para acceder a prácticas profesionales y a su primera experiencia laboral. Muchas oportunidades no llegan directamente al alumnado, ya que las empresas suelen comunicarse exclusivamente con los centros educativos y no existe un canal centralizado que permita gestionar estas ofertas de forma eficiente. 

Actualmente, gran parte del proceso se realiza de forma manual: correos electrónicos, hojas compartidas o comunicaciones internas entre departamentos. Esto provoca falta de visibilidad, pérdida de oportunidades y una experiencia fragmentada tanto para estudiantes como para institutos.

## Objetivo
Internia nace para resolver este problema mediante una plataforma centralizada que conecta a estudiantes y centros educativos en torno a la gestión de prácticas profesionales. Las empresas continúan enviando sus ofertas a los institutos, pero ahora los centros pueden publicarlas, administrarlas y hacer seguimiento desde un único entorno digital.

## Actores Clave del Ecosistema
A diferencia de los portales de empleo genéricos, Internia opera bajo un modelo B2B2C donde el centro educativo es el eje del proceso:

- **Estudiantes:** Candidatos que construyen una identidad profesional digital y gestionan sus candidaturas de forma autónoma.

- **Centros Educativos (Administradores):** Actúan como orquestadores y validadores de calidad. Son los únicos encargados de publicar las ofertas remitidas por las empresas externas y de supervisar el progreso académico de los alumnos.

- **Empresas:** Proveedoras de talento que interactúan con el sistema a través del centro educativo, recibiendo perfiles cualificados sin necesidad de gestionar directamente la infraestructura de la plataforma.

## La plataforma permite:
Centralizar las ofertas de prácticas enviadas por empresas.
Facilitar al alumnado el acceso a oportunidades adaptadas a su perfil.
Gestionar candidaturas y estados de postulación.
Reducir la carga administrativa de los centros educativos.
Mejorar la comunicación y trazabilidad del proceso de selección.
Internia no sustituye el papel de los institutos; lo potencia digitalmente, convirtiéndolos en el eje de validación y publicación de oportunidades. 
Además, los estudiantes pueden construir un perfil profesional inspirado en plataformas como LinkedIn, destacando competencias técnicas, estudios, idiomas y proyectos relevantes para el entorno de la FP.

## Impacto

### Impacto social

Facilita el acceso igualitario a ofertas de prácticas.
Mejora la empleabilidad del alumnado.
Favorece la conexión entre formación y tejido empresarial local.

### Impacto organizativo

Reduce la gestión manual de ofertas y candidaturas.
Centraliza procesos dispersos en un único sistema.
Optimiza el seguimiento de estudiantes y procesos de selección.

### Impacto medioambiental

Disminuye el uso de papel y documentación física.
Reduce desplazamientos innecesarios y comunicaciones redundantes.
Digitaliza procesos administrativos tradicionalmente manuales.



## Innovación

Internia incorpora funcionalidades innovadoras orientadas a mejorar la experiencia tanto del alumnado como de los centros educativos:

- **Integración con Centros de FP:** Permite a los institutos validar perfiles, gestionar convenios.

- **Sistema de Recomendaciones:** Algoritmos que sugieren ofertas basadas en las skills del estudiante.

- **Extracción Inteligente de Datos del CV:** Mediante IA y procesamiento de documentos PDF, el sistema puede extraer automáticamente información relevante del currículum y completar el perfil del usuario. 

- **ChatBot:** El usuario puede interactuar con un asistente conversacional para buscar ofertas mediante lenguaje natural, por ejemplo: “Buscar prácticas de desarrollo web en Barcelona”.


## Funcionalidades y Roles de Usuario 

Internia implementa un sistema de permisos basado en roles para garantizar que cada usuario acceda únicamente a las funcionalidades correspondientes. 

### Perfil Estudiante
El estudiante actúa como candidato dentro de la plataforma y puede:

#### Gestión de Perfil
- Crear y editar su perfil profesional.
- Subir CV en formato PDF.
- Añadir habilidades, idiomas y enlaces externos.
- Completar información académica y tecnológica.
#### Gestión de Ofertas
- Buscar ofertas mediante filtros avanzados.
- Guardar ofertas de interés.
- Postularse directamente a vacantes publicadas.
- Consultar detalles completos de cada oferta.
#### Seguimiento
- Visualizar el estado de sus candidaturas.
- Consultar procesos activos desde un dashboard personal.

### Perfil Instituto

El instituto actúa como entidad administradora y validadora de oportunidades.

#### Gestión de Ofertas
- Crear ofertas enviadas por empresas.
- Editar y actualizar vacantes.
- Activar o desactivar publicaciones.
#### Gestión de Candidaturas
- Visualizar perfiles de estudiantes.
- Consultar habilidades y CVs.
- Cambiar estados de candidatura:
 - En proceso
 - CV leído
 - Aprobado
 - Rechazado
#### Supervisión
- Centralizar el seguimiento de selección.


## Tecnologías
- **Frontend:**
	- Vue 3
	- Vite
	- Vue Router
	- Axios
	- FontAwesome
- **Backend:**
	- Node.js
	- Express
	- PostgreSQL
	- Supabase 
	- JWT (autenticación)
	- Multer (subida de archivos)
	- Resend (envío de emails)
- **AI**
    - Groq
    - Gemini API
- **Despliegue**
	- Render(Backend)
	- Vercel(Frontend)


## Estructura del Proyecto
```
projecte-2-dawe2_p1_grup4_scarlett_yeneviel/
│
├── backend/           # API REST, lógica de negocio y conexión a BD
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── email.js
│   │   ├── supabaseClient.js
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
│
├── frontend/          # Aplicación Vue 3
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── services/
│   │   ├── composables/
│   │   └── ...
│   └── package.json
│
├── Calendario.md      # Documentación adicional
└── README.md          # Este archivo
```

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd projecte-2-dawe2_p1_grup4_scarlett_yeneviel
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
El backend corre por defecto en `http://localhost:3000`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
El frontend corre por defecto en `http://localhost:5173`.

## Variables de Entorno
Debes crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/basededatos
SECRET_JWT_KEY=clave_secreta_para_jwt
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=clave_supabase
EMAIL_API_KEY=clave_resend
URL_FRONT=http://localhost:5173
```

## Endpoints Destacados (Backend)

Algunos endpoints principales expuestos por la API REST:

- `POST   /login`                  → Login de usuario
- `POST   /estudiantes`            → Registro de estudiante
- `GET    /ofertas`                → Listar todas las ofertas
- `POST   /ofertas`                → Crear nueva oferta (empresa/admin)
- `GET    /estudiantes/:id`        → Obtener perfil de estudiante
- `PUT    /estudiantes/:id`        → Editar perfil de estudiante
- `POST   /estudiantes/:id/cv`     → Subir CV
- `GET    /estudiantes/:id/ofertas-recomendadas` → Ofertas recomendadas
- `POST   /admins`                 → Registro de administrador
- `GET    /admins`                 → Listar administradores

> Consulta el código fuente para más endpoints y detalles.

## Ejemplo de Uso

1. Un estudiante se registra, completa su perfil y sube su CV.
2. Busca ofertas filtrando por ciudad, modalidad, skills, etc.
3. Se postula a una oferta y puede ver el estado de su postulación.
4. Un administrador revisa y aprueba/rechaza usuarios y ofertas desde el panel.

## Demo



https://github.com/user-attachments/assets/3dec11a9-1db1-46d0-a8fd-026a85fd6ee7



## Desarrolladoras
- Scarlett Toala
- Yeneviel Roberts
- Silvia Serra

---

