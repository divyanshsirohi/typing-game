import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WPMChart({ scores }: { scores: { wpm: number; date: string }[] }) {
    const data = {
        labels: scores.map((s) => s.date),
        datasets: [
            {
                label: 'WPM',
                data: scores.map((s) => s.wpm),
                borderColor: 'rgb(75,192,192)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.2,
            },
        ],
    };

    return (
        <div style={{ width: '100%', maxWidth: 600, margin: '2rem auto' }}>
    <h2 style={{ color: 'white', textAlign: 'center' }}>WPM Over Time</h2>
    <Line data={data} />
    </div>
);
}
