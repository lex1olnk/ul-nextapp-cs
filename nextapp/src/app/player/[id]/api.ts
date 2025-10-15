'use server'

export async function getPlayerMatches(id: string, ul_id: string, page: number) {
  try {
    const response = await fetch(`https://ul-backend.vercel.app/api/player/${id}/matches?ul_id=${ul_id}&page=${page}`, {
      cache: 'no-store', // Отключает кеширование
    })

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}