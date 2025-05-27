#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import { RSI, SMA, BollingerBands, ADX, ATR } from "technicalindicators";
import { findSupportResistance } from "./support-and-resistence.js";
import { Value } from "./types.js";

const server = new McpServer({
  name: "Stocks MCP",
  version: "1.0.0"
});

let TWELVEDATA_API_KEY: string | undefined = undefined;

process.argv.forEach((arg) => {
  if (arg === "--apikey") {
    TWELVEDATA_API_KEY = process.argv[process.argv.indexOf(arg) + 1];
  }
});

if (!TWELVEDATA_API_KEY) {
  console.error("Please provide the --apikey argument with your Twelve Data API key.");
  process.exit(1);
}

async function fetchPrice(symbol: string): Promise<string> {
  const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVEDATA_API_KEY}`);
  const data = (await response.json()) as { price: string, code?: string, message?: string };
  if (data.code) {
    throw new Error(`Error fetching price: ${data.message}`);
  }
  return data.price;
}

async function fetchTimeSeries(symbol: string, interval: string, outputsize: number): Promise<{ values: Value[] }> {
  const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVEDATA_API_KEY}`);
  const data = (await response.json()) as { values: Value[], code?: string, message?: string };
  if (data.code) {
    throw new Error(`Error fetching time series: ${data.message}`);
  }
  return data;
}

server.tool("GetRealTimePrice",
  "Get the real-time price of an instrument",
  { symbol: z.string() },
  async ({ symbol }) => {
    const price = await fetchPrice(symbol);
    return {
      content: [{ type: "text", text: price }]
    };
  }
);

server.tool("GetTimeSeries",
  `Get the historical time series price data of an instrument.
  try to keep the output size as small as possible.
  No need to display the entire list of values unless the user asks for it.`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    outputsize: z.number().min(1).max(1000).default(2)
  },
  async ({ symbol, interval, outputsize }) => {
    const data = await fetchTimeSeries(symbol, interval, outputsize);
    return {
      content: [{ type: "text", text: JSON.stringify(data.values) }]
    };
  }
);

server.tool("GetMovingAverage",
  `Get the moving average (MA, SMA) of an instrument`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    period: z.number().min(1).max(1000).default(20),
    outputsize: z.number().min(1).max(1000).default(1)
  },
  async ({ symbol, interval, period, outputsize }) => {
    const data = await fetchTimeSeries(symbol, interval, period + outputsize);
    const closePrices = data.values.map(value => Number(value.close));
    const sma = SMA.calculate({ period, values: closePrices, reversedInput: true });
    const results = new Array(outputsize).fill(0).map((_, i) => ({
      date: data.values[i].datetime,
      sma: sma[i]
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

server.tool("GetRelativeStrengthIndex",
  `Get the relative strength index (RSI) of an instrument`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    period: z.number().min(1).max(1000).default(14),
    outputsize: z.number().min(1).max(1000).default(1)
  },
  async ({ symbol, interval, period, outputsize }) => {
    const data = await fetchTimeSeries(symbol, interval, period + outputsize + 1);
    const closePrices = data.values.map(value => Number(value.close));
    const rsi = RSI.calculate({ period: period, values: closePrices, reversedInput: true });
    const results = new Array(outputsize).fill(0).map((_, i) => ({
      date: data.values[i].datetime,
      rsi: rsi[i]
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

server.tool("GetBollingerBands",
  `Get the bollinger bands of an instrument`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    period: z.number().min(1).max(1000).default(20),
    outputsize: z.number().min(1).max(1000).default(1)
  },
  async ({ symbol, interval, period, outputsize }) => {
    const data = await fetchTimeSeries(symbol, interval, period + outputsize);
    const closePrices = data.values.map(value => Number(value.close));
    const bollingerBands = BollingerBands.calculate({ period, values: closePrices, reversedInput: true, stdDev: 2 });
    const results = new Array(outputsize).fill(0).map((_, i) => ({
      date: data.values[i].datetime,
      bollingerBands: bollingerBands[i]
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

server.tool("GetAverageDirectionalIndex",
  `Get the average directional index (ADX) of an instrument`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    period: z.number().min(1).max(1000).default(14),
    outputsize: z.number().min(1).max(1000).default(1)
  },
  async ({ symbol, interval, period, outputsize }) => {
    const data = await fetchTimeSeries(symbol, interval, period * 2 + outputsize);
    const closePrices = data.values.map(value => Number(value.close));
    const highPrices = data.values.map(value => Number(value.high));
    const lowPrices = data.values.map(value => Number(value.low));
    const adx = ADX.calculate({ period: period, close: closePrices, high: highPrices, low: lowPrices, reversedInput: true });
    const results = new Array(outputsize).fill(0).map((_, i) => ({
      date: data.values[i].datetime,
      adx: adx[i]
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

server.tool("GetAverageTrueRange",
  `Get the average true range (ATR) of an instrument`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    period: z.number().min(1).max(1000).default(14),
    outputsize: z.number().min(1).max(1000).default(1)
  },
  async ({ symbol, interval, period, outputsize }) => {
    const data = await fetchTimeSeries(symbol, interval, period + outputsize + 1);
    const closePrices = data.values.map(value => Number(value.close));
    const highPrices = data.values.map(value => Number(value.high));
    const lowPrices = data.values.map(value => Number(value.low));
    const atr = ATR.calculate({ period: period, close: closePrices, high: highPrices, low: lowPrices, reversedInput: true });
    const results = new Array(outputsize).fill(0).map((_, i) => ({
      date: data.values[i].datetime,
      atr: atr[i]
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

server.tool("GetSupportResistance",
  `Get the support and resistance levels of an instrument.
  Period is the number of days to look back, the default is 100 days.`,
  {
    symbol: z.string(),
    interval: z.enum(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "1day", "1week", "1month"]),
    period: z.number().min(1).max(1000).default(100)
  },
  async ({ symbol, interval, period }) => {
    const data = await fetchTimeSeries(symbol, interval, period);
    const closePrices = data.values.map(value => Number(value.close)).reverse();
    const [supports, resistances] = findSupportResistance(closePrices);
    const support = supports.map(support => support[1]);
    const resistance = resistances.map(resistance => resistance[1]);
    const recentPrice = closePrices[closePrices.length - 1];
    return {
      content: [{ type: "text", text: JSON.stringify({ support, resistance, recentPrice }) }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
