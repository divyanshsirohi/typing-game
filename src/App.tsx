import { useEffect, useRef, useState } from 'react';
import './index.css';
import { CloudLightning } from 'lucide-react';
import { CODE_SNIPPETS } from './snippets.ts';
import WPMChart from './WPMchart.tsx';
import Leaderboard from './Leaderboard.tsx';
import './App.css';
import { Analytics } from '@vercel/analytics/react'



/**
 * Converts a multiline code string into an HTML structure of styled letter spans.
 * Each character is wrapped in a span for styling and tracking typing correctness.
 */
function formatCode(code: string): string {
    return (
        code
            .split('\n')
            .map(line =>
                `<div class="code-line">` +
                line
                    .split('')
                    .map(char => {
                        if (char === ' ') return `<span class="letter space">&nbsp;</span>`;
                        if (char === '\t') return `<span class="letter tab">&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
                        return `<span class="letter">${char}</span>`;
                    })
                    .join('') +
                `<span class="letter enter">\u21B5</span></div>`
            )
            .join('')
    );
}

function App() {
    const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'go' | ''>('');
    const [isStarted, setIsStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [wpm, setWpm] = useState<number | null>(null);
    const [scores, setScores] = useState<{ wpm: number; date: string; language: string }[]>([]);
    const gameRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number | null>(null);

    /**
     * Starts the countdown timer and calculates elapsed time.
     */
    const startTimer = () => {
        if (timerRef.current) return;
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
            const remaining = 60 - elapsed;
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current!);
                timerRef.current = null;
                gameOver();
            }
        }, 1000);
    };

    /**
     * Ends the game and calculates words per minute.
     */
    const gameOver = () => {
        const correctLetters = [...document.querySelectorAll('.letter.correct')].length;
        const wpmResult = Math.round(correctLetters / 5);
        setWpm(wpmResult);
        setIsStarted(false);

        setScores((prev) => [
            ...prev,
            { wpm: wpmResult, date: new Date().toLocaleTimeString(), language },
        ]);
    };


    /**
     * Initializes a new game with a random snippet of the selected language.
     */
    const newGame = () => {
        if (!language) return;
        const snippets = CODE_SNIPPETS.filter((s) => s.language === language);
        if (!snippets.length || !gameRef.current) return;

        const randomSnippet = snippets[Math.floor(Math.random() * snippets.length)];
        const html = formatCode(randomSnippet.code);
        gameRef.current.innerHTML = `<div>${html}</div>`;

        const firstLetter = gameRef.current.querySelector('.letter') as HTMLElement;
        if (firstLetter) firstLetter.classList.add('current');

        updateCursor();

        setTimeLeft(60);
        setWpm(null);
        setIsStarted(false);
        clearInterval(timerRef.current!);
        timerRef.current = null;
    };

    /**
     * Updates the position of the blinking cursor to the currently focused letter.
     */
    const updateCursor = () => {
        const cursor = document.getElementById('cursor');
        const refEl = document.querySelector('.letter.current') as HTMLElement;
        const wrapper = document.querySelector('.words-wrapper') as HTMLElement;

        if (cursor && refEl && wrapper) {
            const letterRect = refEl.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();

            const top = letterRect.top - wrapperRect.top;
            const left = letterRect.left - wrapperRect.left;

            cursor.style.top = `${top}px`;
            cursor.style.left = `${left}px`;
        }
    };


    /**
     * Typing event handler for comparing input with expected characters.
     * Handles tabs, enters, backspace, and printable characters.
     */
    useEffect(() => {
        // Replace your existing handleKeyDown function with this fixed version:
        const handleKeyDown = (ev: KeyboardEvent) => {
            const key = ev.key;
            const currentLetter = document.querySelector('.letter.current') as HTMLElement;

            if (!isStarted || !currentLetter) return;
            const expected = currentLetter.innerText;

            const ignoredKeys = new Set([
                'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
            ]);

            const isPrintable = key.length === 1 && !ignoredKeys.has(key);
            const isEnter = key === 'Enter';
            const isTab = key === 'Tab';
            const isBackspace = key === 'Backspace';

            // Return early if it's an ignored key (like Shift)
            if (ignoredKeys.has(key)) {
                return;
            }

            //Prevent default for all typing-related keys
            if (isPrintable || isEnter || isTab || isBackspace) {
                ev.preventDefault();
            }

            // Start timer only for actual typing actions
            if (!timerRef.current && (isPrintable || isEnter || isTab)) {
                startTimer();
            }

            // Handle backspace
            if (isBackspace) {
                const prev = currentLetter?.previousElementSibling as HTMLElement;
                if (prev) {
                    currentLetter.classList.remove('current');
                    prev.classList.add('current');
                    prev.classList.remove('correct', 'incorrect');
                    updateCursor();
                }
                return;
            }

            // Handle Enter key - both correct and incorrect cases
            if (isEnter) {
                if (currentLetter.classList.contains('enter')) {
                    // Correct Enter press
                    currentLetter.classList.add('correct');
                } else {
                    // Incorrect Enter press (pressed Enter but not on enter element)
                    currentLetter.classList.add('incorrect');
                }
                currentLetter.classList.remove('current');

                // Move to next element
                let next: HTMLElement | null = null;
                if (currentLetter.classList.contains('enter')) {
                    // Move to first letter of next line
                    next = currentLetter.parentElement?.nextElementSibling?.querySelector('.letter') as HTMLElement;
                } else {
                    // Move to next letter in same line
                    next = currentLetter.nextElementSibling as HTMLElement;
                }

                if (next) next.classList.add('current');
                updateCursor();
                return;
            }

            // Handle Tab key - both correct and incorrect cases
            if (isTab) {
                if (currentLetter.classList.contains('tab')) {
                    // Correct Tab press
                    currentLetter.classList.add('correct');
                } else {
                    // Incorrect Tab press (pressed Tab but not on tab element)
                    currentLetter.classList.add('incorrect');
                }
                currentLetter.classList.remove('current');
                const next = currentLetter.nextElementSibling as HTMLElement;
                if (next) next.classList.add('current');
                updateCursor();
                return;
            }

            // Handle printable characters
            if (isPrintable) {
                if (key === expected) {
                    currentLetter.classList.add('correct');
                } else {
                    currentLetter.classList.add('incorrect');
                }

                currentLetter.classList.remove('current');
                let next: HTMLElement | null = null;

                // Special handling for when you type a character on an "enter" element
                if (currentLetter.classList.contains('enter')) {
                    // Move to first letter of next line even though it's wrong
                    next = currentLetter.parentElement?.nextElementSibling?.querySelector('.letter') as HTMLElement;
                } else {
                    // Normal case - move to next letter
                    next = currentLetter.nextElementSibling as HTMLElement;
                }

                if (next) next.classList.add('current');
                updateCursor();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStarted]);

    useEffect(() => {
        if (language) newGame();
    }, [language]);

    // Load on mount
    useEffect(() => {
        const stored = localStorage.getItem('scores');
        if (stored) setScores(JSON.parse(stored));
    }, []);

    // Save on update
    useEffect(() => {
        localStorage.setItem('scores', JSON.stringify(scores));
    }, [scores]);


    return (
        <>
            <div className="title-banner">
                <CloudLightning className="title-icon" size={60} />
                <div className="title-text">
                    <span className="brand-glow">DivType</span>
                    <div className="sub-motto">⚡ Type code like thunder.</div>
                </div>
            </div>


            <div className="game">
                <div className="info">{wpm !== null ? `WPM: ${wpm}` : timeLeft}</div>
                <div id="buttons">
                    <button onClick={newGame}>New Game</button>
                </div>
            </div>

            <div className="lang">
                {['javascript', 'python', 'cpp', 'go'].map((lang) => (
                    <button key={lang} className="button-85" onClick={() => setLanguage(lang as any)}>
                        {lang.toUpperCase()}
                    </button>
                ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: 30, color: 'white' }}>
                Selected Language: <strong>{language}</strong>
            </p>

            <div className="words-wrapper" onClick={() => setIsStarted(true)}>
                <div
                    id="words"
                    className="words"
                    ref={gameRef}
                    style={{ filter: isStarted ? 'none' : 'blur(4px)', opacity: language ? 1 : 0 }}
                ></div>

                <div id="cursor" className="cursor"></div>

                {language && !isStarted && (
                    <div className="focus-error-centered">Click here to start</div>
                )}
            </div>

            <WPMChart scores={scores} />
            <Leaderboard scores={scores} />
            <Analytics />
        </>
    );
}

export default App;