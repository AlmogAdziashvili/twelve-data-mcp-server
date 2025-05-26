# twelve-data-mcp-server

A Model Context Protocol server that provides access to Twelve Data API.

## Usage

To use this server with the Claude Desktop app or Cursor.ai, add the following configuration to the "mcpServers" section of your configuration file:


```json
{
  "mcpServers": {
    "twelve-data": {
      "command": "npx",
      "args": [
        "-y",
        "twelve-data-mcp-server",
        "--api",
        "YOUR_TWELVE_DATA_API_KEY"
      ],
    }
  }
}
```