import Head from 'next/head'
import { useEffect, useState } from 'react';
import { supabase } from '../lib/client';
import styles from '../styles/Home.module.css'

export default function Master() {

    const [users, setUsers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [winnerId, setWinnerId] = useState(null);

    const getUsers = async () => {
        const { data, error } = await supabase.from(`users`).select(`*`);
        if (error) {
            return alert(error);
        }
        setUsers(data);
    }

    const getQuestion = async (id) => {
        const { data, error } = await supabase.from(`questions`).select(`*`).eq(`id`, id);
        if (error) {
            return alert(error);
        }
        setCurrentQuestion(data[0]);
        if (typeof currentQuestion === 'undefined') {
            console.log('finish')
            setWinner();
        }
    }

    const setWinner = async () => {
        const response = await supabase.from(`users`).select('*');
        if (response.error) {
            return alert(error);
        }
        let winnerByPoints = response.data.sort((a, b) => b.points - a.points)[0];
        const { data, error } = await supabase.from(`state`).update({ winner: winnerByPoints.id }).match({id: 1});
        setWinnerId(winnerByPoints.id);
    }

    const getCurrentQuestion = async () => {
        const { data, error } = await supabase.from(`state`).select(`*`);
        if (error) {
            return alert(error);
        }

        setGameStarted(data[0].started);

        getQuestion(data[0].actualQuestion);
    }

    const resetUsers = async () => {
        const { data, error } = await supabase.from(`users`).update({check: false}).match({check: true});
        if (error) {
            console.log(error);
            return alert(error);
        }
    }
    
    const goNextQuestion = async () => {
        const { data, error } = await supabase.from(`state`).update({actualQuestion: currentQuestion.id + 1}).match({id: 1});
        if (error) {
            return alert(error);
        }
        getCurrentQuestion();
        resetUsers();
    }

    const startGame = async () => {
        const { data, error } = await supabase.from(`state`).update({started: true}).match({id: 1});
        if (error) {
            console.log(error);
            return alert(error);
        }
        setGameStarted(true);
    }

    useEffect(() => {
        getUsers();
        getCurrentQuestion()
    },[])

    useEffect(() => {
        const userSubscription = supabase.from(`users`).on('*', (payload) => {
            getUsers();
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
        {winnerId === null ? 
        <>
            <div>
                <h2>Pregunta: {currentQuestion ? currentQuestion.question : ''}</h2>
                <ul className={styles.lista}>
                    {users && users.map(user => 
                        <li key={user.id}><b>{user.name}{user.check ? '✅' : '🧍' }</b></li>
                    )}
                </ul>
            </div>
            {!gameStarted && <button onClick={startGame} className={styles.button}>Start Game</button>}
            {typeof currentQuestion !== undefined && <button className={styles.button} onClick={goNextQuestion}>Next question</button>}
        </>
        :
        <h2>El juego ha terminado</h2>}
      </main>
    </div>
  )
}
