import { TournamentSearch } from '@/components/Select';
import api from '@/lib/api';

interface Tournament {
  id: string;
  name: string;
}

export const revalidate = 3600;

async function getTournaments() {
  try {
    const response = await api.get<{tournaments: Tournament[]}>('/api/ultournaments');
    return response.data.tournaments;
  } catch (error) {
    console.error('API Error:', error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}
/*
async function postTournament() {
  try {
    await api.post('/api/ultournaments');
  } catch (error) {
    console.error('API Error:', error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}

async function postMatches() {
  try {
    await api.post('/api/ulmatches');
  } catch (error) {
    console.error('API Error:', error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}
*/

export default async function UploadMatchesPage () {
  const tournaments = await getTournaments();

  return (
    <div>
      <div className="players-stats-container">
        <h1 className='my-8 text-center text-5xl'>ULMIX STATS</h1>
        <TournamentSearch 
          allTournaments={tournaments}
        />
      </div>
    </div>

  );
};
