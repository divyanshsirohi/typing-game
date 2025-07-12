export default function Leaderboard({ scores }: { scores: { wpm: number; date: string; language: string }[] }) {
    const topScores = [...scores].sort((a, b) => b.wpm - a.wpm).slice(0, 5);

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto', color: 'white', textAlign: 'center' }}>
    <h2>🏆 Leaderboard</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 18 }}>
    <thead>
        <tr style={{ borderBottom: '1px solid white' }}>
    <th>WPM</th>
    <th>Language</th>
    <th>Time</th>
    </tr>
    </thead>
    <tbody>
    {topScores.map((score, idx) => (
            <tr key={idx}>
                <td>{score.wpm}</td>
                <td>{score.language}</td>
                <td>{score.date}</td>
                </tr>
        ))}
    </tbody>
    </table>
    </div>
);
}
