import { createServiceClient } from './supabase'
import type { 
  Campaign, 
  CampaignUpload, 
  CampaignContentRaw,
  AppRollup,
  GenreRollup,
  ContentRollup
} from '@/types/database'

export class DatabaseService {
  // Campaign Management
  static async createCampaign(campaignName: string): Promise<Campaign> {
    try {
      const supabase = createServiceClient()
      
      // Generate a unique campaign ID
      const campaignId = this.generateCampaignId(campaignName)
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ 
          campaign_id: campaignId,
          campaign_name: campaignName 
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create campaign: ${error.message}`)
      return data
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  static async getCampaigns(): Promise<Campaign[]> {
    try {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`)
      return data || []
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  static async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch campaign: ${error.message}`)
      }
      return data
    } catch (error) {
      console.warn('Database service not available:', error)
      return null
    }
  }

  // Campaign Uploads
  static async createCampaignUpload(
    campaignId: string, 
    filename: string, 
    storedPath: string
  ): Promise<CampaignUpload> {
    try {
      const supabase = createServiceClient()
      
      // Generate a unique upload ID
      const uploadId = this.generateUploadId()
      
      const { data, error } = await supabase
        .from('campaign_uploads')
        .insert({
          upload_id: uploadId,
          campaign_id: campaignId,
          filename,
          stored_path: storedPath
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create upload record: ${error.message}`)
      return data
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  // Content Data
  static async insertContentData(contentData: Omit<CampaignContentRaw, 'id' | 'created_at'>[]): Promise<void> {
    try {
      const supabase = createServiceClient()
      const { error } = await supabase
        .from('campaign_content_raw')
        .insert(contentData)

      if (error) throw new Error(`Failed to insert content data: ${error.message}`)
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  static async getContentData(campaignId?: string): Promise<CampaignContentRaw[]> {
    try {
      const supabase = createServiceClient()
      let query = supabase
        .from('campaign_content_raw')
        .select('*')

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch content data: ${error.message}`)
      return data || []
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  // Rollup Reports
  static async getAppRollup(campaignId?: string): Promise<AppRollup[]> {
    try {
      const supabase = createServiceClient()
      let query = supabase
        .from('rr_rollup_app')
        .select('*')

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query.order('impressions', { ascending: false })

      if (error) throw new Error(`Failed to fetch app rollup: ${error.message}`)
      return data || []
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  static async getGenreRollup(campaignId?: string): Promise<GenreRollup[]> {
    try {
      const supabase = createServiceClient()
      let query = supabase
        .from('rr_rollup_genre')
        .select('*')

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query.order('impressions', { ascending: false })

      if (error) throw new Error(`Failed to fetch genre rollup: ${error.message}`)
      return data || []
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  static async getContentRollup(campaignId?: string): Promise<ContentRollup[]> {
    try {
      const supabase = createServiceClient()
      let query = supabase
        .from('rr_rollup_content')
        .select('*')

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query.order('impressions', { ascending: false })

      if (error) throw new Error(`Failed to fetch content rollup: ${error.message}`)
      return data || []
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  // Utility Methods
  static async getRowCounts() {
    try {
      const supabase = createServiceClient()
      const [campaigns, uploads, content, aliases, genres] = await Promise.all([
        this.getCampaigns(),
        supabase.from('campaign_uploads').select('id', { count: 'exact' }),
        this.getContentData(),
        supabase.from('content_aliases').select('id', { count: 'exact' }),
        supabase.from('genre_map').select('id', { count: 'exact' })
      ])

      return {
        campaigns: campaigns.length,
        campaign_uploads: uploads.count || 0,
        content_aliases: aliases.count || 0,
        genre_map: genres.count || 0
      }
    } catch (error) {
      console.warn('Database service not available:', error)
      return {
        campaigns: 0,
        campaign_uploads: 0,
        content_aliases: 0,
        genre_map: 0
      }
    }
  }

  private static generateUploadId(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private static generateCampaignId(campaignName: string): string {
    const slug = campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${slug}-${suffix}`;
  }
}
