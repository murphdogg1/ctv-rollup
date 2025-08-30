import { createServiceClient } from './supabase'
import type { 
  Campaign, 
  CampaignUpload, 
  CampaignContentRaw,
  AppRollup,
  GenreRollup,
  ContentRollup
} from '@/types/database'

const supabase = createServiceClient()

export class DatabaseService {
  // Campaign Management
  static async createCampaign(campaignName: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ campaign_name: campaignName })
      .select()
      .single()

    if (error) throw new Error(`Failed to create campaign: ${error.message}`)
    return data
  }

  static async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`)
    return data || []
  }

  static async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch campaign: ${error.message}`)
    }
    return data
  }

  // Campaign Uploads
  static async createCampaignUpload(
    campaignId: string, 
    filename: string, 
    storedPath: string
  ): Promise<CampaignUpload> {
    const { data, error } = await supabase
      .from('campaign_uploads')
      .insert({
        campaign_id: campaignId,
        filename,
        stored_path: storedPath
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create upload record: ${error.message}`)
    return data
  }

  // Content Data
  static async insertContentData(contentData: Omit<CampaignContentRaw, 'id' | 'created_at'>[]): Promise<void> {
    const { error } = await supabase
      .from('campaign_content_raw')
      .insert(contentData)

    if (error) throw new Error(`Failed to insert content data: ${error.message}`)
  }

  static async getContentData(campaignId?: string): Promise<CampaignContentRaw[]> {
    let query = supabase
      .from('campaign_content_raw')
      .select('*')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch content data: ${error.message}`)
    return data || []
  }

  // Rollup Reports
  static async getAppRollup(campaignId?: string): Promise<AppRollup[]> {
    let query = supabase
      .from('rr_rollup_app')
      .select('*')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query.order('impressions', { ascending: false })

    if (error) throw new Error(`Failed to fetch app rollup: ${error.message}`)
    return data || []
  }

  static async getGenreRollup(campaignId?: string): Promise<GenreRollup[]> {
    let query = supabase
      .from('rr_rollup_genre')
      .select('*')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query.order('impressions', { ascending: false })

    if (error) throw new Error(`Failed to fetch genre rollup: ${error.message}`)
    return data || []
  }

  static async getContentRollup(campaignId?: string): Promise<ContentRollup[]> {
    let query = supabase
      .from('rr_rollup_content')
      .select('*')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query.order('impressions', { ascending: false })

    if (error) throw new Error(`Failed to fetch content rollup: ${error.message}`)
    return data || []
  }

  // Utility Methods
  static async getRowCounts() {
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
  }
}
