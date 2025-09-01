// Import types from the main database types to ensure consistency
import type {
  Campaign,
  CampaignUpload,
  CampaignContentRaw,
  ContentAlias,
  GenreMap,
  AppRollup,
  GenreRollup,
  ContentRollup
} from '@/types/database'

// Internal storage types (these match the canonical types exactly)
type InternalCampaign = Campaign;
type InternalCampaignUpload = CampaignUpload;
type InternalCampaignContentRaw = CampaignContentRaw;
type InternalContentAlias = ContentAlias;
type InternalGenreMap = GenreMap;

// Global storage outside module scope to persist across reloads
declare global {
  var __db_campaigns: InternalCampaign[];
  var __db_campaign_uploads: InternalCampaignUpload[];
  var __db_campaign_content_raw: InternalCampaignContentRaw[];
  var __db_content_aliases: InternalContentAlias[];
  var __db_genre_map: InternalGenreMap[];
  var __db_initialized: boolean;
}

// Initialize global variables if they don't exist
if (!global.__db_campaigns) {
  global.__db_campaigns = [];
  global.__db_campaign_uploads = [];
  global.__db_campaign_content_raw = [];
  global.__db_content_aliases = [];
  global.__db_genre_map = [];
  global.__db_initialized = false;
}

class InMemoryDatabase {
  constructor() {
    // Use global storage
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      if (!global.__db_initialized) {
        console.log('Initializing campaign-agnostic database...');
        global.__db_initialized = true;
        console.log('Database initialized successfully');
      } else {
        console.log('Database already initialized, reusing existing data');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // Campaign management
  async createCampaign(campaignName: string): Promise<Campaign> {
    if (!global.__db_initialized) {
      throw new Error('Database not yet initialized');
    }
    
    const campaign_id = this.generateCampaignId(campaignName);
    const campaign: Campaign = {
      campaign_id,
      campaign_name: campaignName,
      created_at: new Date().toISOString()
    };
    global.__db_campaigns.push(campaign);
    console.log(`Created campaign: ${campaignName} with ID: ${campaign_id}`);
    return campaign;
  }

  async getCampaigns(): Promise<Campaign[]> {
    if (!global.__db_initialized) {
      return [];
    }
    console.log(`Returning ${global.__db_campaigns.length} campaigns`);
    // Create new objects to ensure type compatibility
    const campaigns = global.__db_campaigns.map(campaign => ({
      campaign_id: campaign.campaign_id,
      campaign_name: campaign.campaign_name,
      created_at: campaign.created_at
    }));
    // Explicitly cast to ensure TypeScript sees the correct type
    return campaigns as Campaign[];
  }

  // Alternative method that explicitly returns the correct type
  async getCampaignsTyped(): Promise<Campaign[]> {
    if (!global.__db_initialized) {
      return [];
    }
    console.log(`Returning ${global.__db_campaigns.length} campaigns (typed)`);
    const campaigns: Campaign[] = [];
    for (const campaign of global.__db_campaigns) {
      campaigns.push({
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        created_at: campaign.created_at
      });
    }
    return campaigns;
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    if (!global.__db_initialized) {
      return null;
    }
    const campaign = global.__db_campaigns.find(c => c.campaign_id === campaignId);
    if (!campaign) return null;
    // Create new object to ensure type compatibility
    const typedCampaign = {
      campaign_id: campaign.campaign_id,
      campaign_name: campaign.campaign_name,
      created_at: campaign.created_at
    };
    // Explicitly cast to ensure TypeScript sees the correct type
    return typedCampaign as Campaign;
  }

  // Alternative method that explicitly returns the correct type
  async getCampaignTyped(campaignId: string): Promise<Campaign | null> {
    if (!global.__db_initialized) {
      return null;
    }
    const campaign = global.__db_campaigns.find(c => c.campaign_id === campaignId);
    if (!campaign) return null;
    const typedCampaign: Campaign = {
      campaign_id: campaign.campaign_id,
      campaign_name: campaign.campaign_name,
      created_at: campaign.created_at
    };
    return typedCampaign;
  }

  // Upload management
  async createCampaignUpload(
    campaignId: string, 
    filename: string, 
    storedPath: string
  ): Promise<CampaignUpload> {
    if (!global.__db_initialized) {
      throw new Error('Database not yet initialized');
    }
    
    const upload: CampaignUpload = {
      upload_id: this.generateUploadId(),
      campaign_id: campaignId,
      file_name: filename,
      stored_path: storedPath,
      uploaded_at: new Date().toISOString()
    };
    global.__db_campaign_uploads.push(upload);
    console.log(`Created upload for campaign ${campaignId}: ${filename}`);
    return upload;
  }

  async getCampaignUploads(campaignId: string): Promise<CampaignUpload[]> {
    if (!global.__db_initialized) {
      return [];
    }
    return global.__db_campaign_uploads.filter(u => u.campaign_id === campaignId);
  }

  // Content ingestion
  async insertCampaignContent(content: CampaignContentRaw[]): Promise<number> {
    if (!global.__db_initialized) {
      return 0;
    }
    global.__db_campaign_content_raw.push(...content);
    console.log(`Inserted ${content.length} content rows for campaign ${content[0]?.campaign_id}`);
    return content.length;
  }

  // Content normalization
  async upsertContentAlias(contentTitleCanon: string, contentKey: string): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    const existing = global.__db_content_aliases.findIndex(a => a.content_title_canon === contentTitleCanon);
    if (existing >= 0) {
      global.__db_content_aliases[existing].content_key = contentKey;
    } else {
      global.__db_content_aliases.push({
        id: Math.random().toString(36).substring(2, 8),
        content_title_canon: contentTitleCanon,
        content_key: contentKey,
        created_at: new Date().toISOString()
      });
    }
  }

  async upsertGenreMap(rawGenre: string, genreCanon: string): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    const existing = global.__db_genre_map.findIndex(g => g.raw_genre === rawGenre);
    if (existing >= 0) {
      global.__db_genre_map[existing].genre_canon = genreCanon;
    } else {
      global.__db_genre_map.push({
        id: Math.random().toString(36).substring(2, 8),
        raw_genre: rawGenre,
        genre_canon: genreCanon,
        created_at: new Date().toISOString()
      });
    }
  }

  // Rollup generation with improved deduplication and "Other" threshold
  generateAppRollup(campaignId?: string): AppRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId) : 
      global.__db_campaign_content_raw;
    
    const rollupMap = new Map<string, AppRollup>();
    
    for (const content of filtered) {
      // Normalize network name: lowercase and trim for consistent grouping
      const normalizedNetworkName = content.content_network_name?.toLowerCase().trim() || 'Unknown';
      
      // Use normalized name as key to prevent case-sensitive duplicates
      const key = `${content.campaign_id}-${normalizedNetworkName}`;
      
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          app_name: content.content_network_name || 'Unknown', // Keep original name for display
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        });
      }
      
      const rollup = rollupMap.get(key)!;
      rollup.impressions += content.impression || 0;
      rollup.completes += content.quartile100 || 0;
      rollup.content_count += 1;
    }
    
    // Calculate average VCR for each network
    for (const rollup of Array.from(rollupMap.values())) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0;
    }
    
    // Separate networks into significant (>=1000) and others (<1000)
    const significantNetworks: AppRollup[] = [];
    const otherNetworks: AppRollup[] = [];
    
    for (const rollup of Array.from(rollupMap.values())) {
      if (rollup.impressions >= 1000) {
        significantNetworks.push(rollup);
      } else {
        otherNetworks.push(rollup);
      }
    }
    
    // Create "Other" category if there are low-performing networks
    if (otherNetworks.length > 0) {
      const otherRollup: AppRollup = {
        campaign_id: campaignId || 'unknown',
        app_name: 'Other',
        impressions: otherNetworks.reduce((sum, n) => sum + n.impressions, 0),
        completes: otherNetworks.reduce((sum, n) => sum + n.completes, 0),
        avg_vcr: 0,
        content_count: otherNetworks.reduce((sum, n) => sum + n.content_count, 0)
      };
      
      // Calculate VCR for "Other" category
      otherRollup.avg_vcr = otherRollup.impressions > 0 ? 
        Math.round((otherRollup.completes / otherRollup.impressions) * 100 * 100) / 100 : 0;
      
      significantNetworks.push(otherRollup);
    }
    
    // Return sorted by impressions (highest first)
    return significantNetworks.sort((a, b) => b.impressions - a.impressions);
  }

  generateGenreRollup(campaignId?: string): GenreRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId) : 
      global.__db_campaign_content_raw;
    
    const rollupMap = new Map<string, GenreRollup>();
    
    for (const content of filtered) {
      const genreCanon = this.getGenreCanon(content.content_network_name);
      const key = `${content.campaign_id}-${genreCanon}`;
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          genre_canon: genreCanon,
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        });
      }
      
      const rollup = rollupMap.get(key)!;
      rollup.impressions += content.impression || 0;
      rollup.completes += content.quartile100 || 0;
      rollup.content_count += 1;
    }
    
    // Calculate average VCR
    for (const rollup of Array.from(rollupMap.values())) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0;
    }
    
    return Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions);
  }

  generateContentRollup(campaignId?: string): ContentRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId) : 
      global.__db_campaign_content_raw;
    
    const rollupMap = new Map<string, ContentRollup>();
    
    for (const content of filtered) {
      // Handle missing content titles by using network name as fallback
      const contentTitle = content.content_title || `${content.content_network_name} - Unknown Content`;
      const contentKey = this.getContentKey(contentTitle);
      
      // Use normalized network name for consistent grouping
      const normalizedNetworkName = content.content_network_name?.toLowerCase().trim() || 'Unknown';
      const key = `${content.campaign_id}-${contentKey}-${normalizedNetworkName}`;
      
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          content_key: contentKey,
          content_title: contentTitle,
          content_network_name: content.content_network_name || 'Unknown',
          impressions: 0,
          completes: 0,
          avg_vcr: 0
        });
      }
      
      const rollup = rollupMap.get(key)!;
      rollup.impressions += content.impression || 0;
      rollup.completes += content.quartile100 || 0;
    }
    
    // Calculate average VCR
    for (const rollup of Array.from(rollupMap.values())) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0;
    }
    
    return Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions);
  }

  // Utility methods
  private generateCampaignId(campaignName: string): string {
    const slug = campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${slug}-${suffix}`;
  }

  private generateUploadId(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private getContentKey(contentTitle: string): string {
    const contentTitleCanon = contentTitle.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
    const alias = global.__db_content_aliases.find(a => a.content_title_canon === contentTitleCanon);
    return alias?.content_key || contentTitleCanon;
  }

  private getGenreCanon(rawGenre: string): string {
    const genreMap = global.__db_genre_map.find(g => g.raw_genre === rawGenre);
    return genreMap?.genre_canon || 'Unknown';
  }

  // Statistics
  getCampaignStats(campaignId: string) {
    if (!global.__db_initialized) {
      return {
        totalImpressions: 0,
        totalCompletes: 0,
        overallVcr: 0,
        mappedGenres: 0,
        totalGenres: 0,
        mappedPercentage: 0
      };
    }
    
    const filtered = global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId);
    const totalImpressions = filtered.reduce((sum, c) => sum + (c.impression || 0), 0);
    const totalCompletes = filtered.reduce((sum, c) => sum + (c.quartile100 || 0), 0);
    const overallVcr = totalImpressions > 0 ? 
      Math.round((totalCompletes / totalImpressions) * 100 * 100) / 100 : 0;
    const mappedGenres = new Set(filtered.map(c => this.getGenreCanon(c.content_network_name))).size;
    const totalGenres = filtered.length;
    const mappedPercentage = totalGenres > 0 ? 
      Math.round((mappedGenres / totalGenres) * 100) : 0;
    
    return {
      totalImpressions,
      totalCompletes,
      overallVcr,
      mappedGenres,
      totalGenres,
      mappedPercentage
    };
  }

  // Database operations (stubs for compatibility)
  async run(query: string, params: any[] = []): Promise<void> {
    if (!global.__db_initialized) {
      console.log('Database not ready, query ignored:', query);
      return;
    }
    console.log('Executing query:', query, 'with params:', params);
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    if (!global.__db_initialized) {
      console.log('Database not ready, query ignored:', query);
      return [];
    }
    console.log('Query ignored:', query);
      return [];
  }

  async exec(query: string): Promise<void> {
    if (!global.__db_initialized) {
      console.log('Database not ready, query ignored:', query);
      return;
    }
    console.log('Executing query:', query);
  }

  async close(): Promise<void> {
    global.__db_campaigns = [];
    global.__db_campaign_uploads = [];
    global.__db_campaign_content_raw = [];
    global.__db_content_aliases = [];
    global.__db_genre_map = [];
    global.__db_initialized = false;
  }

  // Additional methods for compatibility
  async deleteCampaign(campaignId: string): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    // Remove campaign content first
    global.__db_campaign_content_raw = global.__db_campaign_content_raw.filter(
      c => c.campaign_id !== campaignId
    );
    
    // Remove campaign uploads
    global.__db_campaign_uploads = global.__db_campaign_uploads.filter(
      u => u.campaign_id !== campaignId
    );
    
    // Finally remove the campaign
    global.__db_campaigns = global.__db_campaigns.filter(
      c => c.campaign_id !== campaignId
    );
    
    console.log(`Deleted campaign: ${campaignId}`);
  }

  async getContentData(campaignId?: string): Promise<CampaignContentRaw[]> {
    if (!global.__db_initialized) {
      return [];
    }
    if (campaignId) {
      return global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId);
    }
    return global.__db_campaign_content_raw;
  }
}

// Create and export a single instance
export const db = new InMemoryDatabase();
