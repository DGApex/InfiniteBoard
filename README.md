# InfiniteBoard

InfiniteBoard is a professional Miro clone desktop application optimized for .exe, featuring an infinite canvas, drag-and-drop interface, and local persistence.

## Description

InfiniteBoard is designed for fluidity and performance, utilizing a React frontend with Konva for the canvas engine and Tauri (Rust) for the backend. It supports organizing ideas, images, and notes on an infinite whiteboard.

## Features

- **Infinite Canvas**: Zoom and pan support.
- **Drag & Drop**: Easily move elements.
- **Local Persistence**: Saves state to local files.
- **Export to Image**: High-quality export support.
- **Desktop Application**: Built with Tauri for native performance.

## Prerequisites

- Node.js
- Rust & Cargo (for Tauri)

## Build Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run tauri dev
    ```

3.  **Build for Production (.exe)**:
    ```bash
    npm run tauri build
    ```

## Project Structure

- `src/`: React frontend code.
- `src-tauri/`: Tauri (Rust) backend code.
- `docs/`: Documentation.
