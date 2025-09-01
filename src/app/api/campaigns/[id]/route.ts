import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    
    // Delete the campaign and all associated data
    await DatabaseService.deleteCampaign(campaignId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Campaign deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete campaign' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const campaign = await DatabaseService.getCampaignById(campaignId)
    
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch campaign' 
      },
      { status: 500 }
    )
  }
}
