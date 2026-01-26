# Arquitectura de Software: InfiniteBoard

Este documento define la estructura técnica, lógica y de despliegue para desarrollar un clon profesional de Miro (Moodboard Infinito) optimizado para escritorio (.exe), con soporte para control de versiones.

## 1. Concepto del Producto

InfiniteBoard es una aplicación de lienzo infinito que permite organizar ideas, imágenes y notas mediante una interfaz de arrastrar y soltar. Se enfoca en la fluidez de movimiento, persistencia local y distribución como software de escritorio tradicional.

## 2. Lógica de Programación y Conceptos Core

### A. Sistema de Coordenadas y Zoom (Canvas Engine)

*   **Viewport vs. World**: Diferenciación entre el espacio absoluto (World) y el marco visible (Viewport).
*   **Transformaciones de Matriz**: Lógica matemática para aplicar scale y translate globalmente.

### B. Serialización y Árbol de Estado

*   **JSON State**: Cada elemento posee un esquema: `id`, `type`, `x`, `y`, `width`, `height`, `zIndex`, `data`.
*   **Persistencia**: Almacenamiento asíncrono del estado en archivos locales.

### C. Lógica de Exportación

*   **Rasterización a 300 DPI**: Uso de un canvas oculto para renderizar el Bounding Box de todos los elementos y generar un archivo de imagen de alta calidad.

## 3. Catastro de Tecnologías y Paquetes

### Core de Desarrollo

*   **UI**: React.js
*   **Canvas Engine**: Konva.js / react-konva
*   **Estado**: Zustand

### Escritorio (.exe)

*   **Framework**: Tauri (Backend en Rust para máxima eficiencia).
*   **Instalador**: NSIS (Nullsoft Scriptable Install System).

### Paquetes de Soporte

*   `@tauri-apps/api`: Interacción con el sistema operativo.
*   `lucide-react`: Iconos.
*   `framer-motion`: Animaciones de UI.
*   `uuid`: Identificadores únicos.

## 4. Estructura de Proyecto

```
/infinite-board
├── .github/              # Workflows de CI/CD para generar el .exe
├── docs/                 # Documentación técnica y manual de usuario
├── public/               # Assets estáticos
├── src/                  # Código fuente de la interfaz (React)
│   ├── components/       # Componentes de UI y Canvas
│   ├── store/            # Estado global con Zustand
│   ├── hooks/            # Lógica de gestos y zoom
│   └── utils/            # Helper functions para exportación
├── src-tauri/            # Código nativo (Rust), configuración de .exe
├── .gitignore            # Archivos excluidos de Git
├── README.md             # Documentación principal del repo
├── LICENSE               # Licencia del software (ej. MIT)
└── package.json          # Dependencias y scripts
```

## 5. Instrucciones para la Implementación en Antigravity

*   **Fase 1 (Canvas)**: Configurar el Stage de Konva para manejar el zoom relativo a la posición del mouse.
*   **Fase 2 (Native)**: Implementar el puente de Tauri para abrir diálogos de "Guardar como..." en Windows.
*   **Fase 3 (Export)**: Crear la función de captura de pantalla del lienzo completo ignorando el fondo.

## 6. Automatización de Build

*   **GitHub Actions**: Compilar automáticamente el .exe en pushes a main.
*   **Crash Reporting**: Integración futura con Sentry.
*   **Auto-Update**: Sistema de entrega de parches.
