import { createServiceClient } from './supabase'
import { db } from '@/server/db'
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
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        const campaign = await db.createCampaign(campaignName)
        // Use the local database's generated ID consistently
        return {
          campaign_id: campaign.campaign_id,
          campaign_name: campaign.campaign_name,
          created_at: campaign.created_at
        }
      }
      
      // Try Supabase first
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
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to local database:', supabaseError)
        // Fall back to local database if Supabase fails
        const campaign = await db.createCampaign(campaignName)
        return {
          campaign_id: campaign.campaign_id,
          campaign_name: campaign.campaign_name,
          created_at: campaign.created_at
        }
      }
      
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  static async getCampaigns(): Promise<Campaign[]> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        const campaigns = await db.getCampaignsTyped()
        // Force type compatibility
        return campaigns as any as Campaign[]
      }
      
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
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        const campaign = await db.getCampaignTyped(id)
        // Force type compatibility
        return campaign as any as Campaign | null
      }
      
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('campaign_id', id)
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

  static async deleteCampaign(id: string): Promise<void> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        return await db.deleteCampaign(id)
      }
      
      const supabase = createServiceClient()
      
      // Delete campaign content first (foreign key constraint)
      const { error: contentError } = await supabase
        .from('campaign_content_raw')
        .delete()
        .eq('campaign_id', id)
      
      if (contentError) {
        throw new Error(`Failed to delete campaign content: ${contentError.message}`)
      }
      
      // Delete campaign uploads
      const { error: uploadError } = await supabase
        .from('campaign_uploads')
        .delete()
        .eq('campaign_id', id)
      
      if (uploadError) {
        throw new Error(`Failed to delete campaign uploads: ${uploadError.message}`)
      }
      
      // Finally delete the campaign
      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('campaign_id', id)
      
      if (campaignError) {
        throw new Error(`Failed to delete campaign: ${campaignError.message}`)
      }
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  // Campaign Uploads
  static async createCampaignUpload(
    campaignId: string, 
    filename: string, 
    storedPath: string
  ): Promise<CampaignUpload> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        const upload = await db.createCampaignUpload(campaignId, filename, storedPath)
        // Ensure we use the same campaign ID that was passed in
        return {
          upload_id: upload.upload_id,
          campaign_id: campaignId, // Use the passed campaignId, not upload.campaign_id
          file_name: upload.file_name,
          stored_path: upload.stored_path,
          uploaded_at: upload.uploaded_at
        }
      }
      
      // Try Supabase first
      try {
        const supabase = createServiceClient()
        
        // Generate a unique upload ID
        const uploadId = this.generateUploadId()
        
        console.log('Inserting upload record with:', { upload_id: uploadId, campaign_id: campaignId, file_name: filename, stored_path: storedPath })
        
        const { data, error } = await supabase
          .from('campaign_uploads')
          .insert({
            upload_id: uploadId,
            campaign_id: campaignId,
            file_name: filename,  // FIXED: Changed from filename to file_name
            stored_path: storedPath
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create upload record: ${error.message}`)
        return data
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to local database:', supabaseError)
        // Fall back to local database if Supabase fails
        const upload = await db.createCampaignUpload(campaignId, filename, storedPath)
        return {
          upload_id: upload.upload_id,
          campaign_id: campaignId,
          file_name: upload.file_name,
          stored_path: upload.stored_path,
          uploaded_at: upload.uploaded_at
        }
      }
      
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  // Content Data
  static async insertContentData(contentData: Omit<CampaignContentRaw, 'id' | 'created_at'>[]): Promise<void> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        // Convert the data format to match local database
        const localContentData = contentData.map(item => ({
          campaign_id: item.campaign_id,
          campaign_name_src: item.campaign_name_src,
          content_title: item.content_title,
          content_network_name: item.content_network_name,
          impression: item.impression,
          quartile100: item.quartile100
        }))
        await db.insertCampaignContent(localContentData)
        return
      }
      
      // Try Supabase first
      try {
        const supabase = createServiceClient()
        const { error } = await supabase
          .from('campaign_content_raw')
          .insert(contentData)

        if (error) throw new Error(`Failed to insert content data: ${error.message}`)
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to local database:', supabaseError)
        // Fall back to local database if Supabase fails
        const localContentData = contentData.map(item => ({
          campaign_id: item.campaign_id,
          campaign_name_src: item.campaign_name_src,
          content_title: item.content_title,
          content_network_name: item.content_network_name,
          impression: item.impression,
          quartile100: item.quartile100
        }))
        await db.insertCampaignContent(localContentData)
      }
      
    } catch (error) {
      throw new Error(`Database service not available: ${error}`)
    }
  }

  static async getContentData(campaignId?: string): Promise<CampaignContentRaw[]> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        return await db.getContentData(campaignId)
      }
      
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
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        return db.generateAppRollup(campaignId)
      }
      
      // Try Supabase first
      try {
        const supabase = createServiceClient()
        
        // Get raw content data and calculate rollups
        let query = supabase
          .from('campaign_content_raw')
          .select('*')

        if (campaignId) {
          query = query.eq('campaign_id', campaignId)
        }

        const { data, error } = await query

        if (error) throw new Error(`Failed to fetch content data: ${error.message}`)
        
        console.log('App rollup - Raw data received:', data?.length || 0, 'rows')
        console.log('App rollup - Sample data:', data?.[0])
        
        // Calculate rollups from raw data
        const rollupMap = new Map<string, AppRollup>()
        
        for (const item of data || []) {
          const key = `${item.campaign_id}-${item.content_network_name}`
          console.log('App rollup - Processing item:', item, 'Key:', key)
          
          if (!rollupMap.has(key)) {
            rollupMap.set(key, {
              campaign_id: item.campaign_id,
              app_name: item.content_network_name,
              impressions: 0,
              completes: 0,
              avg_vcr: 0,
              content_count: 0
            })
          }
          
          const rollup = rollupMap.get(key)!
          rollup.impressions += item.impression || 0
          rollup.completes += item.quartile100 || 0
          rollup.content_count += 1
          
          console.log('App rollup - Updated rollup:', rollup)
        }
        
        // Calculate average VCR
        for (const rollup of rollupMap.values()) {
          rollup.avg_vcr = rollup.impressions > 0 ? 
            Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
        }
        
        const result = Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions)
        console.log('App rollup - Final result:', result.length, 'rows')
        
        return result
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to local database:', supabaseError)
        // Fall back to local database if Supabase fails
        return db.generateAppRollup(campaignId)
      }
      
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  static async getGenreRollup(campaignId?: string): Promise<GenreRollup[]> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        return db.generateGenreRollup(campaignId)
      }
      
      // Try Supabase first
      try {
        const supabase = createServiceClient()
        
        // Get raw content data and calculate rollups
        let query = supabase
          .from('campaign_content_raw')
          .select('*')

        if (campaignId) {
          query = query.eq('campaign_id', campaignId)
        }

        const { data, error } = await query

        if (error) throw new Error(`Failed to fetch content data: ${error.message}`)
        
        console.log('Genre rollup - Raw data received:', data?.length || 0, 'rows')
        
        // Calculate rollups from raw data (using content_network_name as genre for now)
        const rollupMap = new Map<string, GenreRollup>()
        
        for (const item of data || []) {
          const key = `${item.campaign_id}-${item.content_network_name}`
          
          if (!rollupMap.has(key)) {
            rollupMap.set(key, {
              campaign_id: item.campaign_id,
              genre_canon: item.content_network_name,
              impressions: 0,
              completes: 0,
              avg_vcr: 0,
              content_count: 0
            })
          }
          
          const rollup = rollupMap.get(key)!
          rollup.impressions += item.impression || 0
          rollup.completes += item.quartile100 || 0
          rollup.content_count += 1
        }
        
        // Calculate average VCR
        for (const rollup of rollupMap.values()) {
          rollup.avg_vcr = rollup.impressions > 0 ? 
            Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
        }
        
        const result = Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions)
        console.log('Genre rollup - Final result:', result.length, 'rows')
        
        return result
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to local database:', supabaseError)
        // Fall back to local database if Supabase fails
        return db.generateGenreRollup(campaignId)
      }
      
    } catch (error) {
      console.warn('Database service not available:', error)
      return []
    }
  }

  static async getContentRollup(campaignId?: string): Promise<ContentRollup[]> {
    try {
      // Check if we should use local database
      if (process.env.DB_ENGINE === 'local') {
        return db.generateContentRollup(campaignId)
      }
      
      // Try Supabase first
      try {
        const supabase = createServiceClient()
        
        // Get raw content data and calculate rollups
        let query = supabase
          .from('campaign_content_raw')
          .select('*')

        if (campaignId) {
          query = query.eq('campaign_id', campaignId)
        }

        const { data, error } = await query

        if (error) throw new Error(`Failed to fetch content data: ${error.message}`)
        
        console.log('Content rollup - Raw data received:', data?.length || 0, 'rows')
        
        // Calculate rollups from raw data
        const rollupMap = new Map<string, ContentRollup>()
        
        for (const item of data || []) {
          const contentKey = this.getContentKey(item.content_title || '')
          const key = `${item.campaign_id}-${contentKey}-${item.content_network_name}`
          
          if (!rollupMap.has(key)) {
            rollupMap.set(key, {
              campaign_id: item.campaign_id,
              content_key: contentKey,
              content_title: item.content_title || 'Unknown Content',
              content_network_name: item.content_network_name || 'Unknown',
              impressions: 0,
              completes: 0,
              avg_vcr: 0
            })
          }
          
          const rollup = rollupMap.get(key)!
          rollup.impressions += item.impression || 0
          rollup.completes += item.quartile100 || 0
        }
        
        // Calculate average VCR
        for (const rollup of rollupMap.values()) {
          rollup.avg_vcr = rollup.impressions > 0 ? 
            Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
        }
        
        const result = Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions)
        console.log('Content rollup - Final result:', result.length, 'rows')
        
        return result
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to local database:', supabaseError)
        // Fall back to local database if Supabase fails
        return db.generateContentRollup(campaignId)
      }
      
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

  private static getContentKey(contentTitle: string): string {
    return contentTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
