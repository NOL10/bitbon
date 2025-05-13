import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // BTC Bonsai API endpoints
  app.get("/api/btc/price", async (req, res) => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching BTC price:", error);
      res.status(500).json({ error: "Failed to fetch Bitcoin price data" });
    }
  });

  // Bonsai settings endpoints
  app.get("/api/bonsai/settings", async (req, res) => {
    try {
      // For demo purposes, use a fixed userId
      const userId = "default-user";
      const settings = await storage.getBonsaiSettings(userId);
      
      if (!settings) {
        // Return default settings if none exist
        return res.json({
          userId,
          positiveThresholds: [10, 20, 30],
          negativeThresholds: [-10, -20, -30],
          useAverageBuyPrice: true,
          anchorPrice: null
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching bonsai settings:", error);
      res.status(500).json({ error: "Failed to fetch bonsai settings" });
    }
  });

  app.post("/api/bonsai/settings", async (req, res) => {
    try {
      const { positiveThresholds, negativeThresholds, useAverageBuyPrice, anchorPrice } = req.body;
      // For demo purposes, use a fixed userId
      const userId = "default-user";
      
      const settings = await storage.saveBonsaiSettings({
        userId,
        positiveThresholds,
        negativeThresholds,
        useAverageBuyPrice,
        anchorPrice: anchorPrice || null
      });
      
      res.json(settings);
    } catch (error) {
      console.error("Error saving bonsai settings:", error);
      res.status(500).json({ error: "Failed to save bonsai settings" });
    }
  });

  // Water and Harvest logs endpoints
  app.get("/api/bonsai/logs", async (req, res) => {
    try {
      // For demo purposes, use a fixed userId
      const userId = "default-user";
      const logs = await storage.getBonsaiLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching bonsai logs:", error);
      res.status(500).json({ error: "Failed to fetch bonsai logs" });
    }
  });

  app.post("/api/bonsai/logs", async (req, res) => {
    try {
      const { type, price, note } = req.body;
      
      if (!type || !price) {
        return res.status(400).json({ error: "Type and price are required" });
      }
      
      if (type !== "water" && type !== "harvest") {
        return res.status(400).json({ error: "Type must be 'water' or 'harvest'" });
      }
      
      // For demo purposes, use a fixed userId
      const userId = "default-user";
      
      const log = await storage.addBonsaiLog({
        userId,
        type,
        price,
        note: note || null
      });
      
      res.json(log);
    } catch (error) {
      console.error("Error adding bonsai log:", error);
      res.status(500).json({ error: "Failed to add bonsai log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
