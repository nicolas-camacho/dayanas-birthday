import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

import { supabase } from '../lib/client';

export default function Home() {

  const [user, setUser] = useState('');

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from(`users`).insert([{name: user, points: 0, master: false}]);
    console.log(data);
    if (error) {
      return alert(error);
    }
    router.push('/game');
    window.localStorage.setItem('user', user);
  }

  useEffect(() => {
    let auth = window.localStorage.getItem('user'); 
    if (auth !== null) {
      setUser(auth);
      router.push('/game');
    }
  },[])

  return (
    <div className={styles.container}>
      <Head>
        <title>Dayana&apos;s birthday</title>
        <meta name="description" content="Website created for playing on Dayana's birthday" />
        <link rel="icon" href="/cat.png" />
      </Head>

      <main className={styles.main}>
        <img alt='icon image' src='/cat.png' />
        <form className={styles.form} onSubmit={handleSubmit}>
          <input 
            className={styles.input} 
            type="text" 
            placeholder="Ingresa tu nombre" 
            value={user} 
            onChange={e => setUser(e.target.value)}>
          </input>
          <button type='submit' className={styles.button}>Entrar</button>
        </form>
      </main>
    </div>
  )
}
