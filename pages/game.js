import Head from 'next/head'
import { useEffect, useState } from 'react';
import { supabase } from '../lib/client';
import styles from '../styles/Home.module.css'

export default function Game() {

    const [gameStarted, setGameStarted] = useState(false);
    const [actualQuestion, setActualQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [user, setUser] = useState(null);
    const [gameEnd, setGameEnd] = useState(false);
    const [winner, setWinner] = useState(null);

    const getQuestion = async (id) => {
        const { data, error } = await supabase.from(`questions`).select(`*`).eq(`id`, id);
        if (error) {
            return alert(error);
        }
        setActualQuestion(data[0]);

        if (typeof data[0] !== 'undefined') {
            getAnswers(id)
        } else setGameEnd(true);
    }

    const getAnswers = async (id) => {
        const { data, error } = await supabase.from(`answers`).select(`*`).eq(`questionId`, id);
        if (error) {
            return alert(error);
        }
        setAnswers(data);
    }

    const getUser = async () => {
        let userName = window.localStorage.getItem('user');
        const { data, error } = await supabase.from(`users`).select(`*`).eq(`name`, userName);
        if (error) {
            return alert(error);
        }
        setUser(data[0]);
    }

    const updateUserState = async () => {
        const {data, error} = await supabase.from(`users`).update({check: true}).match({name: user.name});
        if (error) {
            return alert(error);
        }
        getUser();
    }

    const sendResponse = async (correct) => {
        if (correct) {
            const {data, error} = await supabase.from(`users`).update({points: user.points + 1}).match({name: user.name});
            if (error) {
                return alert(error);
            }
        }
        updateUserState();
    }

    const getWinner = async (winnerId) => {
        const { data, error } = await supabase.from(`users`).select(`*`).eq(`id`, winnerId);
        if (error) {
            alert(error);
        }
        return data[0].name;
    }

    useEffect(() => {
        const getGameState = async () => {
            await getUser();
            const { data, error } = await supabase.from(`state`).select(`*`);
            if (error) {
                return alert(error);
            }
            setGameStarted(data[0].started);
            getQuestion(data[0].actualQuestion);
            if (data[0].winner) {
                setWinner(await getWinner(data[0].winner));
            }
        }
        getGameState();
    },[]);

    useEffect(() => {
        const stateSubscription = supabase.from(`state`).on('UPDATE', (payload) => {
            setGameStarted(payload.new.started);
            getQuestion(payload.new.actualQuestion);
            getUser();
        }).subscribe();
    }, []);

  return (
    <div>
      <Head>
        <title>Dayana's birthday</title>
        <meta name="description" content="Website created for playing on Dayana's birthday" />
        <link rel="icon" href="/cat.png" />
      </Head>

      <main className={styles.main}>
        {(gameStarted && actualQuestion && !user.check) && <h2>{actualQuestion.question}</h2>}
        {gameEnd === false ? 
            (gameStarted ? 
            <>
                {!user.check ? 
                <div>
                    <ul className={styles.lista}>
                        {answers && answers.map(answer => 
                            <li key={answer.id}>
                                <button className={styles.button} onClick={() => sendResponse(answer.correct)}>{answer.answer}</button>
                            </li>
                        )}
                    </ul>
                </div>
                : <h2>Esperando a la siguiente pregunta</h2>}
            </> : <h2>Esperando al que el juego comience</h2>)
        : 
            <>
                <h2>El ganador es {winner}</h2>
            </>}
      </main>
    </div>
  )
}
