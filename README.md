# Open Data Studio

**Open Data Studio** is a Visual Studio Code extension designed to bring the best features of Azure Data Studio (ADS) into VS Code, purely as an open-source project. 

Our goal is to provide a comprehensive SQL development experience directly within VS Code, focusing on performance, usability, and features that developers actually need.

## 🚀 Features

### Current Features (MVP)
- **Activity Bar Integration**: Dedicated "Open Data Studio" sidebar.
- **Connection Manager**: View your database server connections.
- **Database Explorer**: Tree view navigation for Servers, Databases, and Tables.
- **Scaffolded Architecture**: Built on a modular Provider model to support multiple SQL engines in the future.

### Roadmap & Planned Features
- 🔍 **Smart Search**: Filter huge lists of tables and stored procedures instantly.
- ⚡ **Context Actions**: "Select Top 1000", "Edit Data", "Script as Create/Alter".
- 🔌 **Multi-Engine Support**: Architecture designed to support MSSQL, PostgreSQL, MySQL, and more.
- 📊 **Data Visualization**: Integrated grid results and simple charting.

## 🛠️ Installation & Development

If you want to contribute or modify the extension, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Visual Studio Code](https://code.visualstudio.com/) installed.

### Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Start-Code-Tech/Open-Data-Studio.git
    cd Open-Data-Studio
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the Extension**:
    - Press `F5` in VS Code.
    - This opens a new "Extension Development Host" window with the extension loaded.

### Project Structure
- `src/extension.ts`: The entry point where commands and providers are registered.
- `src/providers/DatabaseTreeDataProvider.ts`: Logic for the Sidebar Explorer (Server/Database tree).
- `package.json`: Manifest file defining commands, views, and activation events.

## 🤝 Contributing

We welcome contributions!
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License
[MIT](LICENSE)
