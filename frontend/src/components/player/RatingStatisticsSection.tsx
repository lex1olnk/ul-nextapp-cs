import React from "react";

export const RatingStatisticsSection = () => {
  // Data for the statistics table
  const matchData = [
    {
      date: "12 April",
      map: "Dust2",
      kda: "21 / 13 / 10",
      rating: 1.42,
      ratingPercentage: 78,
    },
    {
      date: "12 April",
      map: "Dust2",
      kda: "21 / 13 / 10",
      rating: 1.12,
      ratingPercentage: 78,
    },
    {
      date: "12 April",
      map: "Mirage",
      kda: "21 / 13 / 10",
      rating: 1.07,
      ratingPercentage: 78,
    },
    {
      date: "11 April",
      map: "Inferno",
      kda: "21 / 13 / 10",
      rating: 1.42,
      ratingPercentage: 78,
    },
    {
      date: "11 April",
      map: "Dust2",
      kda: "21 / 13 / 10",
      rating: 1.42,
      ratingPercentage: 78,
    },
    {
      date: "10 April",
      map: "Dust2",
      kda: "21 / 13 / 10",
      rating: 1.42,
      ratingPercentage: 78,
    },
  ];

  return (
    <table className="stats-table border-spacing-y-2 border-separate w-full bg-light-dark text-left pl-8 py-3.5 pr-4">
      <thead>
        <tr>
          <th>Date</th>
          <th>Map</th>
          <th>K / D / A</th>
          <th>Rating</th>
          <th>Rating%</th>
        </tr>
      </thead>
      <tbody className="">
        {matchData.map(((match, index) => (
          <tr key={index} className='my-4'>
            <td>{match.date}</td>
            <td>{match.map}</td>
            <td>{match.kda}</td>
            <td>{match.rating}</td>
            <td>{match.ratingPercentage}</td>
          </tr>
        )))}
      </tbody>
    </table>

  );
};
