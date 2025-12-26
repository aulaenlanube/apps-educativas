# EduApps: Plataforma de Aplicaciones Educativas Interactivas 🚀


**EduApps** es una plataforma web de vanguardia diseñada para transformar la educación tradicional en una experiencia digital interactiva, divertida y altamente eficiente. Centraliza una suite de aplicaciones educativas de alta calidad para estudiantes de **Educación Primaria** y **ESO**.

---

## ✨ Características Destacadas

*   **🎯 Aprendizaje Basado en el Juego (GBL):** Juegos diseñados específicamente para reforzar el currículo escolar.
*   **🤖 Integración de IA y Tecnología:** Soporte para reconocimiento de voz y visión por webcam para una inmersión total.
*   **📚 Material de Estudio Dinámico:** Sistema de glosarios interactivos para repasar conceptos antes de cada desafío.
*   **👥 Modo Multijugador:** Fomenta la competición sana con modos de 1 y 2 jugadores.
*   **📱 Diseño Premium & Responsive:** Interfaz moderna, fluida y adaptada a cualquier dispositivo mediante micro-animaciones y diseño orientado al usuario.

---

## 🎮 Aplicaciones Incluidas

### 🎡 El Rosco (Flagship Game)
Una versión digital y educativa del famoso juego de palabras, completamente personalizable y rica en funcionalidades.
*   **Variedad Absoluta:** Más de **110 archivos de datos** que cubren asignaturas como Biología, Historia, Música, Matemáticas, Física, Química, Valenciano, Francés e Inglés.
*   **Validación de Datos:** Todos los términos han sido validados algorítmicamente para garantizar que las soluciones coincidan con las letras correspondientes.
*   **Modo Webcam:** Los jugadores pueden ver su propia imagen en tiempo real dentro del rosco.
*   **Reconocimiento de Voz:** ¡Responde hablando! Incluye modo de grabación automática y reconocimiento de comandos de voz (ej: "Pasapalabra").
*   **Material de Estudio Interactivo:** Nuevo sistema de pestañas por letra para estudiar todo el vocabulario antes de empezar la partida.

### 🧩 Otras Experiencias
*   **Busca el Intruso:** Desafíos de lógica y categorización.
*   **Ordena la Historia:** Líneas del tiempo interactivas para eventos históricos.
*   **Parejas de Cartas:** Entrenamiento de memoria visual con conceptos educativos.
*   **Desafíos Matemáticos:** Sumas, restas, multiplicaciones y divisiones con progresión de dificultad.
*   **Dinosaurios & Ciencia:** Visualizadores 3D y apps de excavación selectiva.

---

## 🛠️ Stack Tecnológico

*   **Frontend:** [React.js](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) + Vanilla CSS para componentes de alta fidelidad.
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/) para transiciones suaves y dinámicas.
*   **Voz:** Web Speech API integrada para una experiencia hands-free.
*   **Iconos & UI:** [Lucide React](https://lucide.dev/), [FaIcons](https://react-icons.github.io/react-icons/) y [Radix UI](https://www.radix-ui.com/).

---

## 📂 Arquitectura de Datos

El proyecto utiliza una arquitectura basada en datos JSON, lo que permite una escalabilidad casi infinita sin tocar código fuente:
*   `public/data/primaria/[grado]/`: Archivos de configuración y vocabulario para primaria.
*   `public/data/eso/[grado]/`: Archivos de configuración y vocabulario para secundaria.
*   **Validación Automática:** Contamos con scripts de Python para asegurar la integridad de miles de registros educativos.

---

## 🚀 Instalación Local

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/aulaenlanube/apps-educativas.git
    ```
2.  **Instala dependencias:**
    ```bash
    npm install
    ```
3.  **Lanza el entorno de desarrollo:**
    ```bash
    npm run dev
    ```

---

## 🤝 Contribuciones

¿Eres educador o desarrollador? ¡EduApps es open-source! Si quieres añadir una nueva app o mejorar el contenido:
1.  Haz un **Fork** del repo.
2.  Crea tu app en `src/apps/[nombre-app]`.
3.  Añade tu contenido en JSON a la carpeta `public/data`.
4.  Registra tu app en `src/apps/appList.js`.
5.  ¡Envía un **Pull Request**!

---

> Hecho con ❤️ por **Edu Torregrosa** con la ayuda de la IA.