import { users, type User, type InsertUser, InsertBonsaiSettings, BonsaiSettings, InsertBonsaiLog, BonsaiLog } from "@shared/schema";

export interface IStorage {
  // User operations (for legacy compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // BTC Bonsai operations
  getBonsaiSettings(userId: string): Promise<BonsaiSettings | undefined>;
  saveBonsaiSettings(settings: InsertBonsaiSettings): Promise<BonsaiSettings>;
  getBonsaiLogs(userId: string): Promise<BonsaiLog[]>;
  addBonsaiLog(log: InsertBonsaiLog): Promise<BonsaiLog>;
  clearBonsaiLogs(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bonsaiSettings: Map<string, BonsaiSettings>;
  private bonsaiLogs: Map<string, BonsaiLog[]>;
  currentId: number;
  currentBonsaiSettingsId: number;
  currentBonsaiLogId: number;

  constructor() {
    this.users = new Map();
    this.bonsaiSettings = new Map();
    this.bonsaiLogs = new Map();
    this.currentId = 1;
    this.currentBonsaiSettingsId = 1;
    this.currentBonsaiLogId = 1;
  }

  // Legacy user operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // BTC Bonsai operations
  async getBonsaiSettings(userId: string): Promise<BonsaiSettings | undefined> {
    const settings = this.bonsaiSettings.get(userId);
    if (settings) {
      // Ensure growthFrequency is always present
      return { ...settings, growthFrequency: settings.growthFrequency ?? "day" };
    }
    return undefined;
  }

  async saveBonsaiSettings(insertSettings: InsertBonsaiSettings): Promise<BonsaiSettings> {
    console.log('saveBonsaiSettings called with:', insertSettings);
    const existing = await this.getBonsaiSettings(insertSettings.userId);
    
    if (existing) {
      // Update existing settings
      const updatedSettings: BonsaiSettings = {
        id: existing.id,
        userId: existing.userId,
        positiveThresholds: insertSettings.positiveThresholds as number[],
        negativeThresholds: insertSettings.negativeThresholds as number[],
        useAverageBuyPrice: insertSettings.useAverageBuyPrice ?? true,
        anchorPrice: insertSettings.anchorPrice ?? null,
        growthFrequency: insertSettings.growthFrequency ?? "day",
        createdAt: existing.createdAt,
        updatedAt: new Date()
      };
      
      this.bonsaiSettings.set(insertSettings.userId, updatedSettings);
      return updatedSettings;
    } else {
      // Create new settings
      const id = this.currentBonsaiSettingsId++;
      const now = new Date();
      
      const newSettings: BonsaiSettings = {
        id,
        userId: insertSettings.userId,
        positiveThresholds: insertSettings.positiveThresholds as number[],
        negativeThresholds: insertSettings.negativeThresholds as number[],
        useAverageBuyPrice: insertSettings.useAverageBuyPrice ?? true,
        anchorPrice: insertSettings.anchorPrice ?? null,
        growthFrequency: insertSettings.growthFrequency ?? "day",
        createdAt: now,
        updatedAt: now
      };
      
      this.bonsaiSettings.set(insertSettings.userId, newSettings);
      return newSettings;
    }
  }

  async getBonsaiLogs(userId: string): Promise<BonsaiLog[]> {
    return this.bonsaiLogs.get(userId) || [];
  }

  async addBonsaiLog(insertLog: InsertBonsaiLog): Promise<BonsaiLog> {
    const id = this.currentBonsaiLogId++;
    const timestamp = new Date();
    
    const newLog: BonsaiLog = {
      id,
      userId: insertLog.userId,
      type: insertLog.type,
      price: insertLog.price,
      timestamp,
      note: insertLog.note ?? null
    };
    
    // Initialize array if it doesn't exist
    if (!this.bonsaiLogs.has(insertLog.userId)) {
      this.bonsaiLogs.set(insertLog.userId, []);
    }
    
    // Add log to array
    this.bonsaiLogs.get(insertLog.userId)!.push(newLog);
    
    return newLog;
  }

  async clearBonsaiLogs(userId: string): Promise<void> {
    console.log('clearBonsaiLogs called for user:', userId);
    this.bonsaiLogs.set(userId, []);
    console.log('bonsaiLogs after clear:', this.bonsaiLogs.get(userId));
  }
}

export const storage = new MemStorage();
