# Development Guide

This document provides technical details for developers contributing to **Open Data Studio**.

## AI Development Transparency

**Disclaimer**: This project is developed with the assistance of **Artificial Intelligence**.

- **Human Oversight**: Every single line of code, feature, and architectural decision is reviewed, tested, and accepted by the maintainer (<a href="https://github.com/lsegecode" target="_blank">lsegecode</a>).
- **Collaboration**: The AI acts as a pair programmer, suggesting implementations and fixes, but the human developer retains full control and responsibility for the final output.
- **Transparency**: We believe in being open about our tools. AI is used to accelerate development, not to bypass understanding.

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Visual Studio Code](https://code.visualstudio.com/)

### Getting Started
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/lsegecode/Open-Data-Studio.git
    cd Open-Data-Studio
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Compile the extension**:
    Run the build script to generate the `out` folder:
    ```bash
    npm run compile
    ```
4.  **Run in Debug Mode**:
    - Open the project in VS Code.
    - Press `F5` to launch the **Extension Development Host**.

## Architecture Overview

Open Data Studio is built to be modular and extensible.

### Core Components
- **`src/extension.ts`**: The main entry point. Activates the extension and registers core commands.
- **`src/providers/`**: Contains the logic for the Sidebar and Data Providers.
    - **`DatabaseTreeDataProvider.ts`**: Implements the `vscode.TreeDataProvider` interface to render the "Connections" view.
- **`src/webview/`** (Planned/WIP): Will contain the React/HTML source for the Database Dashboard.

### Feature Flow
1.  **Activation**: The extension activates `onView:openDataExplorer` or commands like `open-data-studio.helloWorld`.
2.  **Sidebar**: The `DatabaseTreeDataProvider` populates the sidebar with mock (or real) connection data.
3.  **Dashboard**: Clicking a database triggers `openDashboard`, which launches a `WebviewPanel` communicating via specific message passing.

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---
*Built with ❤️ and 🧠 (Human + AI).*
