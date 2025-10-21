<div align="center">

<img width="200" height="200" alt="logo" src="https://github.com/user-attachments/assets/61d5bbae-26c8-45fc-83b3-84ab2181aa77" />

# Spectral Logs

> The fastest, most elegant logging library for Node.js, TypeScript, Bun, and Deno

Spectral Logs VS Code extension is a simple and easy-to-use devtools kit for Spectral Logs usage.

Official [Website](https://ztamdev.github.io/SpectralLogs) | 
Documentation [Docs](https://ztamdev.github.io/SpectralLogs/getting-started.html) | 
Roadmap [Roadmap](https://ztamdev.github.io/SpectralLogs/roadmap.html)

</div>

## Features

- **Code Snippets** - Code snippets for all the main functions of Spectral Logs triggered with the `spec` word.
- **Configuration Generator** - A simple tool to generate your spec logger configuration, with a straightforward UI.
- **Playground** - An interactive webview inside VS Code to test and run Spectral Logs commands in real-time.

### Configuration Generator

You can use it by pressing `Ctrl + Shift + P` and then writing `Spectral Logs: Create default config`.  
It will ask you the settings available to change and generates a constant config with the chosen values.  
If the variable `config` already exists, it will prompt you to provide a custom name for the constant.

### Playground

The Playground allows you to test Spectral Logs commands interactively.  
You can use it by pressing `Ctrl + Shift + P` and then writing `Open Spectral Logs Playground`.
It provides a live console where you can write commands like:

```javascript
spec.info("Hello world!");
spec.success("This is a success message");
spec.log("Custom log", "cyan");
```

You can toggle multiline input, run commands with Enter, and clear the console with the `Clear`button.
