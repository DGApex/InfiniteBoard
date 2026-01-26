# Guía de Usuario - InfiniteBoard

InfiniteBoard es una aplicación de escritorio para organizar ideas en un lienzo infinito.

## Requisitos Previos

Para ejecutar la versión completa de escritorio, necesitas tener instalado:
1.  **Node.js**: [Descargar aquí](https://nodejs.org/)
2.  **Rust**: Necesario para el backend de Tauri.
    -   En Windows, descarga e instala `rustup-init.exe` desde [rustup.rs](https://rustup.rs/).
    -   Asegúrate de instalar también las "C++ Build Tools" de Visual Studio si el instalador lo solicita.

## Cómo Ejecutar (Desarrollo)

1.  Abre una terminal en la carpeta del proyecto.
2.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```
3.  Ejecuta la aplicación en modo desarrollo:
    ```bash
    npm run tauri dev
    ```
    Esto abrirá una ventana nativa de la aplicación con recarga en caliente (Hot Reload).

    > **Nota**: Si ejecutas solo `npm run dev`, se abrirá en tu navegador web, pero las funciones de Guardar/Cargar/Exportar no funcionarán porque requieren el backend de escritorio.

## Cómo Generar el Ejecutable (.exe)

Para crear el instalador final para Windows:

1.  Ejecuta el comando de build:
    ```bash
    npm run tauri build
    ```
2.  El instalador `.msi` y el ejecutable `.exe` se generarán en:
    `src-tauri/target/release/bundle/msi/` y `src-tauri/target/release/bundle/nsis/`.

## Uso de la Aplicación

-   **Lienzo**:
    -   **Zoom**: Usa la rueda del ratón (`Scroll`) para acercar y alejar.
    -   **Moverse**: Haz clic y arrastra en un área vacía para moverte por el lienzo (Pan).
    -   **Mover Objetos**: Haz clic y arrastra los objetos (Rectángulos, Círculos) para organizarlos.

-   **Barra de Herramientas**:
    -   💾 **Guardar**: Abre un diálogo para guardar el estado actual del tablero en un archivo `.json`.
    -   📂 **Cargar**: Abre un diálogo para abrir un archivo `.json` previamente guardado.
    -   🖼️ **Exportar**: Genera una imagen PNG de alta calidad con el contenido del tablero (sin la cuadrícula de fondo).
