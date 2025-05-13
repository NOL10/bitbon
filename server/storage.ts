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
    return this.bonsaiSettings.get(userId);
  }

  async saveBonsaiSettings(insertSettings: InsertBonsaiSettings): Promise<BonsaiSettings> {
    const existing = await this.getBonsaiSettings(insertSettings.userId);
    
    if (existing) {
      // Update existing settings
      const updatedSettings: BonsaiSettings = {
        ...existing,
        ...insertSettings,
        updatedAt: new Date(),
      };
      
      this.bonsaiSettings.set(insertSettings.userId, updatedSettings);
      return updatedSettings;
    } else {
      // Create new settings
      const id = this.currentBonsaiSettingsId++;
      const now = new Date();
      
      const newSettings: BonsaiSettings = {
        id,
        ...insertSettings,
        createdAt: now,
        updatedAt: now,
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
      ...insertLog,
      timestamp,
    };
    
    // Initialize array if it doesn't exist
    if (!this.bonsaiLogs.has(insertLog.userId)) {
      this.bonsaiLogs.set(insertLog.userId, []);
    }
    
    // Add log to array
    this.bonsaiLogs.get(insertLog.userId)!.push(newLog);
    
    return newLog;
  }
}

export const storage = new MemStorage();
