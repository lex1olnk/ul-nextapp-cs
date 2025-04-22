'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';


interface PlayerStats {
  ID: number;
  Nickname: string;
  ULRating: number;
  Matches: number;
  Kills: number;
  Deaths: number;
  Assists: number;
  Headshots: number;
  KASTScore: number;
  Damage: number;
  Exchanged: number;
  FirstDeath: number;
  FirstKill: number;
  MultiKills: number[];
  Clutches: number[];
  Rounds: number;
  KPR: number;
  DPR: number;
  Impact: number;
  ClutchScore: number;
  Rating: number;
  MatchID: number;
  Date: string;
}

const PlayersStatsPage: React.FC = () => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{"Players": PlayerStats[]}>('api/matches');
        console.log(response.data)
        setPlayers(response.data.Players);
      } catch (err) {
        setError('Error loading player statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="players-stats-container">
      <h1>Players Statistics (Last {players[0]?.Matches} Matches)</h1>
      
      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Nickname</th>
              <th>Rating</th>
              <th>Matches</th>
              <th>K/D</th>
              <th>KPR</th>
              <th>HS%</th>
              <th>KAST%</th>
              <th>Impact</th>
              <th>Clutch</th>
              <th>Multi Kills</th>
              <th>1st Kill/Death</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.ID}>
                <td className="nickname">{player.Nickname}</td>
                <td className="rating">{player.Rating.toFixed(2)}</td>
                <td>{player.Matches}</td>
                <td>{(player.Kills / player.Deaths || 0).toFixed(2)}</td>
                <td>{player.KPR.toFixed(2)}</td>
                <td>{((player.Headshots / player.Kills) * 100 || 0).toFixed(1)}%</td>
                <td>{player.KASTScore.toFixed(1)}%</td>
                <td>{player.Impact.toFixed(2)}</td>
                <td>{player.ClutchScore}</td>
                <td>
                  {player.MultiKills.slice(0, 3).join('/')}
                </td>
                <td>
                  {player.FirstKill}/{player.FirstDeath}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersStatsPage;