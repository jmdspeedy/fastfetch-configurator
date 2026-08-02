# ⚡ Fastfetch Configurator

An interactive, visual editor for building and deploying [Fastfetch](https://github.com/fastfetch-cli/fastfetch) configuration files. Stop manually editing JSONC files—drag, drop, and preview your system fetch in real-time.

![Fastfetch Configurator Logo](https://fastfetch-configurator.vercel.app/logo.svg)

## ✨ Features

- **Live Terminal Preview**: See your changes instantly in a high-fidelity terminal emulator.
- **Fastfetch 2.66 parity engine**: Preview formats, colors, alignment, and logo placement from the same document that is exported.
- **Real machine captures**: Load JSON results captured from Fastfetch on your own machine for host-specific values.
- **Drag-and-Drop Modules**: Reorder modules effortlessly with a fluid drag-and-drop interface.
- **ASCII Logo Support**: Choose from hundreds of built-in logos or upload your own image to convert to ASCII.
- **Appearance Customization**: Fine-tune colors, separators, and layout settings.
- **One-Line Deployment**: Generate a temporary install script to apply your configuration to your local machine instantly.
- **JSONC Export**: Download your `config.jsonc` file for manual management.

## 🚀 Quick Start

1.  **Visit the App**: Go to [fastfetch.jameswu.me](https://fastfetch.jameswu.me).
2.  **Customize**:
    -   Add or remove modules from the **Modules** panel.
    -   Drag modules to change their display order.
    -   Select your distribution logo or upload a custom image in **Appearance**.
    -   Adjust colors to match your terminal theme.
3.  **Deploy**:
    -   Click **Deploy Config**.
    -   Pass the security check.
    -   Choose **One-Line Install** to get a `curl` command.
    -   Run the command in your terminal to apply the settings.

The preview detects the browser's Linux, Windows, or macOS platform and uses a representative profile with the Fastfetch 2.66.0 schema/export contract. Use **Load capture** in the terminal preview after running `fastfetch --config ~/.config/fastfetch/config.jsonc --format json > fastfetch-capture.json` (the button tooltip shows the PowerShell equivalent). Native captures are normalized from Fastfetch's nested JSON values (units, display scaling, repeated devices, and camelCase fields) before rendering.

## 📄 License

This project is licensed under the MIT License.
