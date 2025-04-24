import { Match } from "@/types/types"

export const LastMatch = ({ matches }: { matches: Match[] }) => {
  return (
    <table className="">
      <thead>
        <tr>
          <th >№</th>
          <th className='text-left w-1/4'>kills</th>
        </tr>
      </thead>
      <tbody>
        {matches.map(((match) => (
          <tr key={match.MatchID} className='my-4'>
            <td></td>
            <td>{match.Kills}</td>
          </tr>
        )))}
      </tbody>
    </table>
  )
}