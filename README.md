# Command Library

A powerful, native macOS command snippet manager built with Electron. This sleek desktop application helps developers and power users organize, search, and quickly access their frequently used commands, code snippets, and terminal commands.

## Features

### Instant Search and Discovery
- Lightning-fast fuzzy search across all your commands
- Real-time filtering as you type
- Keyboard-driven navigation with arrow keys
- Press Enter to instantly copy commands to clipboard
- Advanced search scoring with relevance indicators

### Smart Command Management
- Add commands with names, descriptions, and tags
- Rich text support for multi-line code snippets
- Organize with custom tags for easy categorization
- Import/export functionality for backup and sharing
- Auto-save functionality with local storage

### Powerful Keyboard Shortcuts
- `⌘+Shift+Space` - Global hotkey to show/hide the app
- `⌘+K` - Focus search from anywhere
- `⌘+N` - Add new command
- `⌘+,` - Open settings
- `↑/↓` - Navigate through commands
- `Enter` - Copy selected command
- `Esc` - Clear search or close modals

### Beautiful, Customizable Interface
- Native macOS design with translucent window effects
- Dark and light theme support
- Adjustable window transparency and blur effects
- Custom background tint colors
- Compact, distraction-free design
- Draggable title bar with status indicators

<img width="865" height="585" alt="image" src="https://github.com/user-attachments/assets/c310570a-9706-465f-976a-89802cb82799" />

- When the green dot lights up that means that it is copied to clipboard

<img width="865" height="585" alt="image" src="https://github.com/user-attachments/assets/b56a260d-eff8-4c6f-a258-57d69a8858ec" />



<img width="865" height="585" alt="image" src="https://github.com/user-attachments/assets/eebc64fb-85e4-4fb3-880f-d7c361e12a74" />






### Reliable Data Management
- Local JSON storage in your user data directory
- No cloud dependencies - your data stays private
- Import/export commands as JSON files
- Automatic data persistence

## Installation

### Download

Download the appropriate version for your Mac:

- **Intel Macs (x64)**: `Command Library-1.0.0.dmg`
- **Apple Silicon (M1/M2/M3/M4)**: `Command Library-1.0.0-arm64.dmg`

### System Requirements

- macOS 10.15 (Catalina) or later
- 100MB of available disk space

### Installation Steps

1. Download the appropriate `.dmg` file for your Mac architecture
2. Open the downloaded `.dmg` file
3. Drag Command Library to your Applications folder
4. Launch Command Library from your Applications folder

## Usage

### Getting Started

1. Launch Command Library
2. Use `⌘+K` to focus the search bar
3. Start typing to search through your commands
4. Use arrow keys to navigate and Enter to copy

### Adding Commands

1. Press `⌘+N` or click the add button
2. Fill in the command details:
   - **Name**: A descriptive name for your command
   - **Command**: The actual command or code snippet
   - **Description**: Optional description for context
   - **Tags**: Comma-separated tags for organization
3. Click "Save Command"

### Search Tips

- Use fuzzy search - type partial words to find commands
- Search works across names, commands, descriptions, and tags
- Commands are ranked by relevance score
- Recent and frequently used commands appear higher

### Customization

Access settings with `⌘+,` to customize:

- **Theme**: Switch between dark and light themes
- **Transparency**: Adjust window blur and opacity
- **Background Tint**: Choose custom background colors

### Import/Export

**Exporting Commands:**
1. Open Settings (`⌘+,`)
2. Click "Export Commands"
3. Choose save location for JSON file

**Importing Commands:**
1. Open Settings (`⌘+,`)
2. Click "Import Commands"
3. Select a valid JSON file

## Development

### Built With

- Electron 37.2.6
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap Icons
- Native macOS APIs

### Architecture

- **Frontend**: HTML/CSS/JavaScript with native macOS styling
- **Backend**: Electron main process for file operations
- **Storage**: Local JSON files in user data directory
- **Search**: Custom fuzzy search algorithm with relevance scoring

### File Structure

```
src/
├── index.html          # Main application window
├── index.css           # Styling and themes
├── script.js           # Application logic and search
└── main.js             # Electron main process
```

### Building from Source

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm start`
4. Build for production: `npm run build`

## Technical Details

### Search Algorithm

The application uses a sophisticated fuzzy search algorithm that:
- Scores matches based on multiple criteria
- Weights different fields (name, command, description, tags)
- Handles typos and partial matches
- Provides real-time highlighting of matched terms

### Performance Optimizations

- Efficient DOM rendering with minimal reflows
- Optimized search indexing
- Lazy loading of command lists
- Debounced search input handling

### Security Features

- Content Security Policy (CSP) implementation
- Local-only data storage
- No external network requests
- Secure clipboard operations

## Data Format

Commands are stored in JSON format:

```json
{
  "id": "unique-identifier",
  "name": "Command Name",
  "value": "actual command or code",
  "description": "Optional description",
  "tags": ["tag1", "tag2"],
  "createdAt": "ISO timestamp"
}
```

## Troubleshooting

### Common Issues

**App won't launch:**
- Check macOS version compatibility
- Try moving app to Applications folder
- Check system permissions

**Commands not saving:**
- Verify disk space availability
- Check application permissions
- Try restarting the application

**Global hotkey not working:**
- Check system accessibility permissions
- Verify no conflicts with other applications
- Try alternative keyboard shortcuts

### Reset Application

To reset all data and settings:
1. Quit Command Library
2. Delete: `~/Library/Application Support/Command Library/`
3. Restart the application

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, feature requests, or bug reports, please open an issue on GitHub.

## Changelog

### Version 1.0.0
- Initial release
- Universal macOS support (Intel and Apple Silicon)
- Full-featured command management
- Advanced search capabilities
- Customizable interface
- Import/export functionality


