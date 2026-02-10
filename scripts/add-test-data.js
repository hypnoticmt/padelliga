// scripts/add-test-data.js
// Run with: node scripts/add-test-data.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jghdutlejpmmfmfvwybd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('\n📝 Please add it to your .env.local file:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.log('\n   Find it at: https://supabase.com/dashboard/project/jghdutlejpmmfmfvwybd/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data
const regions = [
  { name: 'Oslo' },
  { name: 'Bergen' },
  { name: 'Trondheim' },
  { name: 'Stavanger' }
];

const leagues = [
  { name: 'Premier League', league_started: true },
  { name: 'Division 1', league_started: true },
  { name: 'Division 2', league_started: false },
  { name: 'Beginners League', league_started: false }
];

const teamNames = [
  'Thunder Smashers', 'Net Ninjas', 'Court Kings', 'Ace Attackers',
  'Paddle Warriors', 'Spin Masters', 'Volley Vikings', 'Smash Brothers',
  'Rally Rebels', 'Baseline Bandits', 'Drop Shot Crew', 'Lob Legends',
  'Power Players', 'Serve Slayers', 'Match Point Mavericks', 'Grand Slammers',
  'Deuce Dynamics', 'Top Spin Titans', 'Backhand Bashers', 'Forehand Fighters'
];

const firstNames = [
  'Magnus', 'Erik', 'Lars', 'Bjørn', 'Ole', 'Anders', 'Kristian', 'Henrik',
  'Ingrid', 'Sofie', 'Emma', 'Nora', 'Thea', 'Maja', 'Emilie', 'Sara',
  'Alexander', 'Jonas', 'Andreas', 'Thomas', 'Martin', 'Kristine', 'Anna', 'Maria'
];

const lastNames = [
  'Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen',
  'Jensen', 'Karlsen', 'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen', 'Hagen',
  'Johannessen', 'Andreassen', 'Jacobsen', 'Dahl', 'Jørgensen', 'Halvorsen'
];

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePlayerCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sanitizeEmail(text) {
  return text
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9.@]/g, '');
}

async function clearExistingData() {
  console.log('🧹 Clearing existing test data...');
  
  // Get all test players (with @testpadel.no emails)
  const { data: testPlayers } = await supabase
    .from('players')
    .select('user_id, email')
    .like('email', '%@testpadel.no');
  
  // Delete in correct order (respecting foreign keys)
  await supabase.from('match_sets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('team_members').delete().neq('team_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('players').delete().like('email', '%@testpadel.no');
  await supabase.from('leagues').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('regions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Delete auth users for test accounts
  if (testPlayers && testPlayers.length > 0) {
    console.log(`🗑️  Deleting ${testPlayers.length} test auth users...`);
    for (const player of testPlayers) {
      try {
        await supabase.auth.admin.deleteUser(player.user_id);
      } catch (err) {
        // Ignore errors if user doesn't exist
      }
    }
  }
  
  console.log('✅ Cleared existing data\n');
}

async function addTestData() {
  try {
    console.log('🚀 Starting test data generation...\n');

    // 1. Add regions
    console.log('📍 Adding regions...');
    const { data: regionsData, error: regionsError } = await supabase
      .from('regions')
      .insert(regions)
      .select();
    
    if (regionsError) throw regionsError;
    console.log(`✅ Added ${regionsData.length} regions\n`);

    // 2. Add leagues
    console.log('🏆 Adding leagues...');
    const { data: leaguesData, error: leaguesError } = await supabase
      .from('leagues')
      .insert(leagues)
      .select();
    
    if (leaguesError) throw leaguesError;
    console.log(`✅ Added ${leaguesData.length} leagues\n`);

    // 3. Create fake auth users and players
    console.log('👥 Generating fake players...');
    const fakePlayers = [];
    const fakeUsers = [];
    
    for (let i = 0; i < 40; i++) {
      const firstName = randomFrom(firstNames);
      const lastName = randomFrom(lastNames);
      const email = sanitizeEmail(`${firstName}.${lastName}${i}@testpadel.no`);
      const userId = generateUUID();
      
      // Create auth user
      fakeUsers.push({
        id: userId,
        email: email,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Create player profile
      fakePlayers.push({
        user_id: userId,
        name: firstName,
        surname: lastName,
        email: email,
        phone: `+47 ${Math.floor(40000000 + Math.random() * 10000000)}`,
        player_code: generatePlayerCode(),
        is_admin: false
      });
    }

    // Insert auth users using admin API
    console.log('🔐 Creating auth users...');
    const createdUserIds = [];
    for (let i = 0; i < fakeUsers.length; i++) {
      const user = fakeUsers[i];
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          name: fakePlayers[i].name,
          surname: fakePlayers[i].surname
        }
      });
      
      if (authError) {
        console.warn(`⚠️  Skipping ${user.email}: ${authError.message}`);
      } else if (authUser?.user) {
        createdUserIds.push(authUser.user.id);
        // Update the player's user_id to match the created auth user
        fakePlayers[i].user_id = authUser.user.id;
      }
    }
    console.log(`✅ Created ${createdUserIds.length} auth users\n`);

    // Now insert players with valid user_ids
    const validPlayers = fakePlayers.filter(p => 
      createdUserIds.includes(p.user_id)
    );

    console.log(`📝 Inserting ${validPlayers.length} player profiles...`);
    const { data: playersData, error: playersError} = await supabase
      .from('players')
      .upsert(validPlayers, { onConflict: 'user_id' })
      .select();
    
    if (playersError) {
      console.error('Player insert error:', playersError);
      throw playersError;
    }
    console.log(`✅ Added ${playersData?.length || 0} player profiles\n`);

    // 4. Create teams (2 teams per region per league for active leagues)
    console.log('🎾 Creating teams...');
    const teams = [];
    let teamIndex = 0;

    for (const league of leaguesData.filter(l => l.league_started)) {
      for (const region of regionsData) {
        // 2 teams per region per league
        for (let i = 0; i < 2; i++) {
          if (teamIndex < teamNames.length) {
            teams.push({
              name: teamNames[teamIndex],
              league_id: league.id,
              region_id: region.id,
              captain_id: playersData[teamIndex * 2]?.id || playersData[0].id
            });
            teamIndex++;
          }
        }
      }
    }

    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .insert(teams)
      .select();
    
    if (teamsError) throw teamsError;
    console.log(`✅ Added ${teamsData.length} teams\n`);

    // 5. Add team members (2 players per team)
    console.log('👫 Assigning players to teams...');
    const teamMembers = [];
    let playerIndex = 0;

    for (const team of teamsData) {
      // Add 2 players per team
      for (let i = 0; i < 2 && playerIndex < playersData.length; i++) {
        teamMembers.push({
          team_id: team.id,
          player_id: playersData[playerIndex].id
        });
        playerIndex++;
      }
    }

    const { error: membersError } = await supabase
      .from('team_members')
      .insert(teamMembers);
    
    if (membersError) throw membersError;
    console.log(`✅ Added ${teamMembers.length} team memberships\n`);

    // 6. Create matches for started leagues
    console.log('⚔️ Creating matches...');
    const matches = [];

    for (const league of leaguesData.filter(l => l.league_started)) {
      const leagueTeams = teamsData.filter(t => t.league_id === league.id);
      
      // Round-robin: each team plays every other team once
      for (let i = 0; i < leagueTeams.length; i++) {
        for (let j = i + 1; j < leagueTeams.length; j++) {
          const daysOffset = matches.length;
          matches.push({
            league_id: league.id,
            team1_id: leagueTeams[i].id,
            team2_id: leagueTeams[j].id,
            match_date: new Date(Date.now() - daysOffset * 24 * 60 * 60 * 1000).toISOString(),
            status: Math.random() > 0.3 ? 'Completed' : 'Scheduled'
          });
        }
      }
    }

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .insert(matches)
      .select();
    
    if (matchesError) throw matchesError;
    console.log(`✅ Added ${matchesData.length} matches\n`);

    // 7. Add match results for completed matches
    console.log('📊 Adding match results...');
    const matchSets = [];

    for (const match of matchesData.filter(m => m.status === 'Completed')) {
      const numSets = Math.random() > 0.5 ? 2 : 3; // Best of 3
      let team1Wins = 0;
      let team2Wins = 0;

      for (let setNum = 1; setNum <= numSets; setNum++) {
        let team1Score = Math.floor(6 + Math.random() * 3); // 6-8
        let team2Score;
        
        if (team1Score === 6) {
          team2Score = Math.floor(Math.random() * 5); // 0-4
        } else {
          team2Score = team1Score - 2; // Tiebreak scenarios
        }

        if (Math.random() > 0.5) {
          [team1Score, team2Score] = [team2Score, team1Score]; // Swap randomly
        }

        matchSets.push({
          match_id: match.id,
          set_number: setNum,
          team1_score: team1Score,
          team2_score: team2Score
        });

        if (team1Score > team2Score) team1Wins++;
        else team2Wins++;
      }

      // Update match with summary
      const summary = `${team1Wins}-${team2Wins}`;
      await supabase
        .from('matches')
        .update({ score_summary: summary })
        .eq('id', match.id);
    }

    if (matchSets.length > 0) {
      const { error: setsError } = await supabase
        .from('match_sets')
        .insert(matchSets);
      
      if (setsError) throw setsError;
      console.log(`✅ Added ${matchSets.length} match sets\n`);
    }

    console.log('🎉 Test data generation complete!\n');
    console.log('📈 Summary:');
    console.log(`   - ${regionsData.length} regions`);
    console.log(`   - ${leaguesData.length} leagues`);
    console.log(`   - ${playersData.length} players`);
    console.log(`   - ${teamsData.length} teams`);
    console.log(`   - ${matchesData.length} matches`);
    console.log(`   - ${matchSets.length} completed match results`);
    console.log('\n✅ All done! Check your app at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Run it
(async () => {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');

  if (shouldClear) {
    await clearExistingData();
  }

  await addTestData();
})();
