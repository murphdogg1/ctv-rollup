import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const campaignNameOverride = formData.get('campaignName') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are allowed' },
        { status: 400 }
      )
    }

    // Generate campaign name
    const filename = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
    const campaignName = campaignNameOverride || filename

    // Create campaign in database
    const campaign = await DatabaseService.createCampaign(campaignName)

    // In Vercel/serverless environment, we don't save files locally
    // Instead, we process the data directly and store in database
    const storedPath = `virtual://${campaign.campaign_id}/${file.name}`

    // Record upload in database
    const upload = await DatabaseService.createCampaignUpload(
      campaign.campaign_id,
      file.name,
      storedPath
    )

    // Parse CSV and insert data
    const csvText = await file.text()
    const { data: csvData, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase()
    })

    if (errors.length > 0) {
      console.warn('CSV parsing warnings:', errors)
    }

    // Transform CSV data for database
    const contentData = csvData.map((row: any) => ({
      campaign_id: campaign.campaign_id,
      campaign_name_src: row['campaign name'] || null,
      content_title: row['content title'] || '',
      content_network_name: row['content network name'] || '',
      impression: parseInt(row['impression']) || 0,
      quartile100: parseInt(row['quartile100']) || 0
    }))

    // Insert content data
    await DatabaseService.insertContentData(contentData)

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.campaign_id,
        name: campaign.campaign_name
      },
      upload: {
        filename: file.name,
        storedPath: storedPath
      },
      content: {
        rowsProcessed: csvData.length,
        rowsInserted: contentData.length,
        errors: errors.length
      }
    })

  } catch (error) {
    console.error('Campaign ingestion failed:', error)
    return NextResponse.json(
      { success: false, error: `Campaign ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
