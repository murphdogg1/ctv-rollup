import { db } from '../src/server/db'

async function seed() {
  
  
  try {
    
    console.log('Seeding database with sample data...')
    
    // Insert sample bundle mappings
    await db.run(`
      INSERT INTO bundle_map (raw, app_bundle, app_name, publisher, mask_reason) VALUES
      ('com.pluto.tv', 'com.pluto.tv', 'Pluto TV', 'Pluto Inc', NULL),
      ('tv.pluto', 'com.pluto.tv', 'Pluto TV', 'Pluto Inc', 'Alternative bundle ID'),
      ('com.tubitv.app', 'com.tubitv.app', 'Tubi TV', 'Tubi Inc', NULL),
      ('tv.tubi', 'com.tubitv.app', 'Tubi TV', 'Tubi Inc', 'Alternative bundle ID'),
      ('com.plexapp.android', 'com.plexapp.android', 'Plex', 'Plex Inc', NULL),
      ('tv.plex.app', 'com.plexapp.android', 'Plex', 'Plex Inc', 'Alternative bundle ID')
    `, ['com.pluto.tv', 'com.pluto.tv', 'Pluto TV', 'Pluto Inc', null])
    
    // Insert sample genre mappings
    await db.run(`
      INSERT INTO genre_map (raw, genre_canon) VALUES
      ('action', 'Action'),
      ('comedy', 'Comedy'),
      ('drama', 'Drama'),
      ('sci-fi', 'Science Fiction'),
      ('thriller', 'Thriller'),
      ('documentary', 'Documentary'),
      ('reality', 'Reality TV'),
      ('news', 'News'),
      ('sports', 'Sports'),
      ('kids', 'Children')
    `, ['action', 'Action'])
    
    // Insert sample content aliases
    await db.run(`
      INSERT INTO content_aliases (content_title_canon, content_key) VALUES
      ('the matrix', 'matrix_1999'),
      ('matrix', 'matrix_1999'),
      ('breaking bad', 'breaking_bad_2008'),
      ('game of thrones', 'game_of_thrones_2011'),
      ('friends', 'friends_1994'),
      ('the office', 'the_office_2005')
    `, ['the matrix', 'matrix_1999'])
    
    // Insert sample raw events (simulating fragmented supply paths)
    const sampleEvents = [
      {
        event_timestamp: '2024-01-01 10:00:00',
        app_bundle_raw: 'com.pluto.tv',
        app_name_raw: 'Pluto TV',
        publisher: 'Pluto Inc',
        ssp: 'SSP1',
        dsp: 'DSP1',
        deal_id: 'DEAL001',
        exchange_path: 'SSP1->DSP1',
        impression_id: 'IMP001',
        request_id: 'REQ001',
        device_os: 'Android',
        device_make: 'Samsung',
        country: 'US',
        currency: 'USD',
        price_paid: 0.50,
        fees_total: 0.05,
        ad_pod_id: 'POD001',
        ad_break_id: 'BREAK001',
        ad_position: 1,
        content_id_raw: 'CONT001',
        content_title_raw: 'The Matrix',
        content_episode_raw: 'Episode 1',
        content_genre_raw: 'action',
        channel_name_raw: 'Action Movies',
        duration_sec: 120,
        vtr: 0.75,
        viewable: true
      },
      {
        event_timestamp: '2024-01-01 10:00:00',
        app_bundle_raw: 'tv.pluto',
        app_name_raw: 'Pluto TV',
        publisher: 'Pluto Inc',
        ssp: 'SSP2',
        dsp: 'DSP2',
        deal_id: 'DEAL002',
        exchange_path: 'SSP2->DSP2',
        impression_id: 'IMP002',
        request_id: 'REQ002',
        device_os: 'iOS',
        device_make: 'Apple',
        country: 'US',
        currency: 'USD',
        price_paid: 0.45,
        fees_total: 0.04,
        ad_pod_id: 'POD002',
        ad_break_id: 'BREAK002',
        ad_position: 1,
        content_id_raw: 'CONT001',
        content_title_raw: 'The Matrix',
        content_episode_raw: 'Episode 1',
        content_genre_raw: 'action',
        channel_name_raw: 'Action Movies',
        duration_sec: 120,
        vtr: 0.80,
        viewable: true
      }
    ]
    
    
    console.log('Sample data inserted successfully!')
    console.log('This demonstrates:')
    console.log('- Bundle mapping (com.pluto.tv vs tv.pluto)')
    console.log('- Content deduplication (same content via multiple SSPs)')
    console.log('- Genre normalization')
    console.log('- Content aliases')
    
    // Show some sample rollup data
    const appRollup = await db.all('SELECT * FROM rollup_app LIMIT 3')
    console.log('\nSample App Rollup:')
    console.log(JSON.stringify(appRollup, null, 2))
    
    const genreRollup = await db.all('SELECT * FROM rollup_genre LIMIT 3')
    console.log('\nSample Genre Rollup:')
    console.log(JSON.stringify(genreRollup, null, 2))
    
    const contentRollup = await db.all('SELECT * FROM rollup_content LIMIT 3')
    console.log('\nSample Content Rollup:')
    console.log(JSON.stringify(contentRollup, null, 2))
    
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await db.close()
  }
}

seed()
