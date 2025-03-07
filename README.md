# Godot Tabs Formatter

A Visual Studio Code extension that automatically converts spaces to tabs in GDScript files when saving. This ensures your GDScript files always comply with Godot's requirement to use tabs for indentation.

## Features

- **Automatic Conversion**: Automatically converts leading spaces to tabs when you save a GDScript file
- **GDScript Only**: Only processes `.gd` files, leaving all other files untouched
- **Smart Conversion**: Converts spaces to tabs based on your editor's tab size setting
- **Cursor Position Preservation**: Maintains your cursor position and selections after conversion
- **Simple to Use**: Works in the background with no manual steps required

## Why This Extension?

Godot Engine strictly requires tabs for indentation in GDScript files. However, when copying and pasting code snippets from the web, documentation, or other sources, you often get spaces instead of tabs.

This extension eliminates the frustration of seeing the error message:

```
Used space character for indentation instead of tab as used before in the file.gdscript(-1)
```

## How It Works

1. When you save a GDScript file, the extension checks for leading spaces in each line
2. It converts groups of spaces to tabs based on your editor's tab size (usually 4 spaces = 1 tab)
3. The file is saved with the proper tab indentation that Godot requires

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Godot Tabs Formatter"
4. Click Install

## Configuration

This extension comes with minimal configuration options:

- `godot-tabs-formatter.enabled`: Enable or disable the extension (default: true)
- `godot-tabs-formatter.debug`: Enable debug logging (default: false)

## Requirements

- Visual Studio Code 1.60.0 or higher
- The Godot Tools extension is recommended (but not required) for full GDScript support

## Known Issues

- Very complex selections spanning multiple indentation levels might not preserve cursor position perfectly

## Release Notes

### 0.0.1

- Initial release
- Automatic conversion of spaces to tabs in GDScript files
- Cursor position preservation

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests on the GitHub repository.

## License

GPL V3