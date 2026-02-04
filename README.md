# ⚡ Fastfetch Configurator

An interactive, visual editor for building and deploying [Fastfetch](https://github.com/fastfetch-cli/fastfetch) configuration files. Stop manually editing JSONC files—drag, drop, and preview your system fetch in real-time.

![Fastfetch Configurator Logo](https://fastfetch-configurator.vercel.app/logo.svg)

## ✨ Features

- **Live Terminal Preview**: See your changes instantly in a high-fidelity terminal emulator.
- **Drag-and-Drop Modules**: Reorder modules effortlessly with a fluid drag-and-drop interface.
- **ASCII Logo Support**: Choose from hundreds of built-in logos or upload your own image to convert to ASCII.
- **Appearance Customization**: Fine-tune colors, separators, and layout settings.
- **One-Line Deployment**: Generate a temporary install script to apply your configuration to your local machine instantly.
- **JSONC Export**: Download your `config.jsonc` file for manual management.

## 🚀 Quick Start

1.  **Visit the App**: Go to [fastfetch-configurator.vercel.app](https://fastfetch-configurator.vercel.app).
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

## 🛠️ Local Development

To run the configurator locally:

```bash
# Clone the repository
git clone https://github.com/jmdspeedy/fastfetch-configurator.git

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License.
