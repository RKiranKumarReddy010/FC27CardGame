const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function convertCsvToJson() {
  const csvPath = path.join(__dirname, '..', 'data', 'ea_fc_all_players.csv');
  const outPath = path.join(__dirname, '..', 'src', 'data', 'players.json');
  
  if (!fs.existsSync(path.dirname(outPath))) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
  }

  const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const players = [];
  let header = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!header) {
      header = line.split(',');
      continue;
    }

    // CSV format: rank,player_name,nationality,team,position,ovr,pac,sho,pas,dri,def,phy,player_url,image_url
    // Some player names or teams might contain commas if quoted, or simple split
    // Let's do a robust regex or comma parser:
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1];
      if (val === undefined) break;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      matches.push(val);
      if (regex.lastIndex >= line.length) break;
    }

    if (matches.length < 14) {
      // Fallback simple split if regex produced unexpected length
      continue;
    }

    const [
      rank, playerName, nationality, team, position,
      ovr, pac, sho, pas, dri, def, phy,
      playerUrl, imageUrl
    ] = matches;

    const ovrNum = parseInt(ovr, 10);
    const pacNum = parseInt(pac, 10);
    const shoNum = parseInt(sho, 10);
    const pasNum = parseInt(pas, 10);
    const driNum = parseInt(dri, 10);
    const defNum = parseInt(def, 10);
    const phyNum = parseInt(phy, 10);

    if (isNaN(ovrNum) || !playerName || !imageUrl) continue;

    players.push({
      id: parseInt(rank, 10) || players.length + 1,
      rank: parseInt(rank, 10) || players.length + 1,
      name: playerName.trim(),
      nationality: (nationality || '').trim(),
      team: (team || '').trim(),
      position: (position || 'ST').trim(),
      imageUrl: imageUrl.trim(),
      stats: {
        ovr: ovrNum,
        pac: isNaN(pacNum) ? 75 : pacNum,
        sho: isNaN(shoNum) ? 75 : shoNum,
        pas: isNaN(pasNum) ? 75 : pasNum,
        dri: isNaN(driNum) ? 75 : driNum,
        def: isNaN(defNum) ? 75 : defNum,
        phy: isNaN(phyNum) ? 75 : phyNum
      }
    });
  }

  console.log(`Parsed ${players.length} total valid players.`);
  
  // Sort by OVR descending, then rank ascending
  players.sort((a, b) => b.stats.ovr - a.stats.ovr || a.rank - b.rank);

  // We can save top 600 players for rich diversity and instant performance in web app
  const topPlayers = players.slice(0, 600);

  fs.writeFileSync(outPath, JSON.stringify(topPlayers, null, 2), 'utf-8');
  console.log(`Saved ${topPlayers.length} elite cards to ${outPath}`);
}

convertCsvToJson().catch(console.error);
