# twelve-data-mcp-server

[![smithery badge](https://smithery.ai/badge/@AlmogAdziashvili/twelve-data-mcp-server)](https://smithery.ai/server/@AlmogAdziashvili/twelve-data-mcp-server)

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
        "--apikey",
        "YOUR_TWELVE_DATA_API_KEY"
      ],
    }
  }
}
```

## Available Tools
- GetRealTimePrice
- GetTimeSeries
- GetMovingAverage
- GetRelativeStrengthIndex
- GetBollingerBands
- GetAvarageDirectionalIndex
- GetAvarageTrueRange
- GetSupportResistance

## Examples
### Current Price & Trend Analysis
<img width="400" alt="image" src="https://github.com/user-attachments/assets/b557de76-c515-4964-8a28-0089217ad8a0" />

### Basic Technical Indicators
<img width="400" alt="image" src="https://github.com/user-attachments/assets/df6e1da1-6425-4820-a9da-d3fd53a3fafe" />

### Support and Resistance Levels
<img width="400" alt="image" src="https://github.com/user-attachments/assets/4ca721f0-e11e-4a4d-8b59-e6cdd7cffbe3" />

### Volatility Analysis
<img width="400" alt="image" src="https://github.com/user-attachments/assets/f715c88c-f7b6-45ab-a559-471fc41fd19d" />

### Simple Pattern Recognition
<img width="400" alt="image" src="https://github.com/user-attachments/assets/9acdbdc7-b431-4473-9f8c-8f3aaf8249ad" />

### Comparative Analysis (Price & Volume)
<img width="400" alt="image" src="https://github.com/user-attachments/assets/b6442ee6-6f4e-47d7-bc06-7445d5d97b13" />
