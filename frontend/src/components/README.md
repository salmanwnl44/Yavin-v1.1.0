# Frontend Component Structure

## Component Organization

### `/src/components/ui/`
Basic reusable UI components:
- `Button.jsx` - Button with variants (primary, secondary, danger)
- `Input.jsx` - Text input with dark theme
- `Modal.jsx` - Modal dialog
- `Panel.jsx` - Container panel with optional title

### `/src/components/editor/`
Code editor related components:
- `CodeEditor.jsx` - Monaco editor wrapper (placeholder)
- `FileTree.jsx` - File explorer tree (placeholder)

### `/src/components/chat/`
AI chat interface:
- `ChatPanel.jsx` - Chat interface (placeholder)

### `/src/components/analysis/`
Code analysis display:
- `AnalysisPanel.jsx` - Analysis results panel (placeholder)

## Development Notes
- All components use Tailwind CSS for styling
- Dark theme is the default
- Components are JSX (not TypeScript)
- Redux Toolkit will be integrated for state management
