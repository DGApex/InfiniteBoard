---
name: tauri-env-setup
description: Automates the setup and verification of a Tauri/Rust development environment on Windows. Use this when you need to prepare a machine for building Tauri applications, ensuring all prerequisites (Node.js, Rust, C++ Build Tools) are present and correctly configured.
---

# Tauri Environment Setup

This skill helps verify and install the necessary environment tools for developing and building Tauri applications on Windows.

## Usage

### 1. Check Environment
Run the check script to verify if Node.js, Rust, Cargo, and Visual Studio C++ Build Tools are installed correctly.

```powershell
./scripts/check_env.ps1
```

### 2. Install Dependencies
If dependencies are missing, you can use the install script to attempt an automated installation via Winget, or follow the instructions provided by the check script.

```powershell
./scripts/install_deps.ps1
```

## Requirements
- **OS**: Windows
- **Shell**: PowerShell
- **Winget**: Required for automated dependency installation.

## Troubleshooting
- **Rust not found**: Ensure `rustup` directory is in your PATH. A restart is often required after installation.
- **Build Tools missing**: The check script looks for Visual Studio installations. If you used a custom path, it might not be detected but could still work. Try running `cl` in the terminal to verify.
